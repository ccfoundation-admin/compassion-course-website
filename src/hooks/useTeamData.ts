import { useState, useEffect, useMemo } from 'react';
import { getTeamMembers, getLanguageSections, TeamMember, TeamLanguageSection } from '../services/contentService';
import { ensureTeamSuffix } from '../utils/contentUtils';
import { siteContent } from '../data/siteContent';

export const GUEST_TRAINER_SECTION = 'Guest Trainers';

export interface UseTeamDataReturn {
  guestTrainers: TeamMember[];
  regularSections: TeamLanguageSection[];
  allSections: TeamLanguageSection[];
  membersBySection: Record<string, TeamMember[]>;
  loading: boolean;
  error: string | null;
}

export function useTeamData(): UseTeamDataReturn {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [languageSections, setLanguageSections] = useState<TeamLanguageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        const [members, sections] = await Promise.all([
          getTeamMembers(),
          getLanguageSections(),
        ]);
        if (!cancelled) {
          setTeamMembers(members);
          setLanguageSections(sections);
        }
      } catch (err: any) {
        console.error('Error loading team data:', err);
        if (!cancelled) {
          setError('Failed to load team information');
          // Fall back to static data from siteContent
          const staticMembers: TeamMember[] = [];
          const staticSections: TeamLanguageSection[] = [];

          siteContent.about.team.sections.forEach((section, sIdx) => {
            const sectionName = section.title;
            const sectionId = `static-${sIdx}`;
            staticSections.push({
              id: sectionId,
              name: sectionName,
              order: sIdx,
              isActive: true,
            });
            section.members.forEach((member, mIdx) => {
              staticMembers.push({
                name: member.name,
                role: member.role,
                bio: Array.isArray(member.bio) ? member.bio.join('\n') : member.bio,
                photo: member.photo,
                contact: member.contact,
                teamSection: sectionId,
                order: mIdx,
                isActive: true,
              });
            });
          });

          setTeamMembers(staticMembers);
          setLanguageSections(staticSections);
          setError(null); // Clear error since we have fallback data
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);

  const { guestTrainers, regularSections, allSections, membersBySection } = useMemo(() => {
    // Build lookup maps: name → ID and ID → name
    const nameToId = new Map<string, string>();
    const idToSection = new Map<string, TeamLanguageSection>();
    languageSections.forEach((s) => {
      if (!s.id) return;
      nameToId.set(s.name, s.id);
      nameToId.set(ensureTeamSuffix(s.name), s.id);
      idToSection.set(s.id, s);
    });

    const validIds = new Set(languageSections.map((s) => s.id).filter(Boolean));

    // Sort by explicit order first, then fall back to createdAt
    const sortMembers = (a: TeamMember, b: TeamMember) => {
      const aOrder = a.order ?? Infinity;
      const bOrder = b.order ?? Infinity;
      if (aOrder !== bOrder) return aOrder - bOrder;
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return aTime - bTime;
    };

    // Resolve each member's teamSection to a section ID
    const resolveSectionKey = (member: TeamMember): string => {
      const val = member.teamSection;
      // Already a valid section ID
      if (validIds.has(val)) return val;
      // Legacy: teamSection is a name string — try exact match
      if (nameToId.has(val)) return nameToId.get(val)!;
      // Try with "Team" suffix added (e.g., "Guest Trainers" → "Guest Trainers Team")
      const withSuffix = ensureTeamSuffix(val);
      if (nameToId.has(withSuffix)) return nameToId.get(withSuffix)!;
      // Try case-insensitive / fuzzy match for edge cases like "ItalianTeam" → "Italian Team"
      for (const [name, id] of nameToId.entries()) {
        if (name.toLowerCase().replace(/\s+/g, '') === val.toLowerCase().replace(/\s+/g, '')) {
          return id;
        }
      }
      // Unresolvable — use as-is (will show in an "unknown" group)
      return val;
    };

    // Find Guest Trainers section by name to get its ID
    const guestSection = languageSections.find((s) => s.name === GUEST_TRAINER_SECTION);
    const guestSectionId = guestSection?.id;

    // Separate guest trainers
    const guests: TeamMember[] = [];
    teamMembers.forEach((member) => {
      const key = resolveSectionKey(member);
      if (key === guestSectionId || member.teamSection === GUEST_TRAINER_SECTION) {
        guests.push(member);
      }
    });
    guests.sort(sortMembers);

    // Group ALL members by resolved section ID
    const grouped: Record<string, TeamMember[]> = {};
    teamMembers.forEach((member) => {
      const key = resolveSectionKey(member);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(member);
    });

    // Sort within each section
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort(sortMembers);
    });

    // Find orphaned members (grouped under keys that aren't valid section IDs)
    // and consolidate them into a single "unassigned" group
    const UNASSIGNED_ID = '__unassigned__';
    const orphanKeys: string[] = [];
    Object.keys(grouped).forEach((key) => {
      if (!validIds.has(key)) {
        orphanKeys.push(key);
      }
    });
    if (orphanKeys.length > 0) {
      const orphanedMembers: TeamMember[] = [];
      orphanKeys.forEach((key) => {
        orphanedMembers.push(...grouped[key]);
        delete grouped[key]; // Remove the orphan group
      });
      // Deduplicate by member ID
      const seen = new Set<string>();
      const deduped = orphanedMembers.filter((m) => {
        const key = m.id || m.name;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (deduped.length > 0) {
        grouped[UNASSIGNED_ID] = deduped;
      }
    }

    // Regular sections (excluding guest trainers), only those with members
    const regSections = languageSections
      .filter((s) => s.name !== GUEST_TRAINER_SECTION)
      .filter((s) => s.id && (grouped[s.id]?.length ?? 0) > 0)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // All sections with members, guest trainers first
    const allSects: TeamLanguageSection[] = languageSections
      .filter((s) => s.id && (grouped[s.id]?.length ?? 0) > 0)
      .sort((a, b) => {
        if (a.name === GUEST_TRAINER_SECTION) return -1;
        if (b.name === GUEST_TRAINER_SECTION) return 1;
        return (a.order ?? 0) - (b.order ?? 0);
      });

    // Append unassigned section at the end if orphans exist
    if (grouped[UNASSIGNED_ID]?.length > 0) {
      allSects.push({
        id: UNASSIGNED_ID,
        name: 'Needs Reassignment',
        order: 9999,
        isActive: true,
      });
    }

    return {
      guestTrainers: guests,
      regularSections: regSections,
      allSections: allSects,
      membersBySection: grouped,
    };
  }, [teamMembers, languageSections]);

  return { guestTrainers, regularSections, allSections, membersBySection, loading, error };
}
