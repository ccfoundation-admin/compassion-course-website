import { useState, useEffect, useMemo } from 'react';
import { getTeamMembers, getLanguageSections, TeamMember, TeamLanguageSection } from '../services/contentService';
import { ensureTeamSuffix } from '../utils/contentUtils';
import { siteContent } from '../data/siteContent';

export const GUEST_TRAINER_SECTION = 'Guest Trainers';

export interface UseTeamDataReturn {
  guestTrainers: TeamMember[];
  regularSections: TeamLanguageSection[];
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
            staticSections.push({
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
                teamSection: sectionName,
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

  const { guestTrainers, regularSections, membersBySection } = useMemo(() => {
    // Separate guest trainers
    const guests: TeamMember[] = [];
    const regular: TeamMember[] = [];

    teamMembers.forEach((member) => {
      if (member.teamSection === GUEST_TRAINER_SECTION) {
        guests.push(member);
      } else {
        regular.push(member);
      }
    });

    guests.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Group regular members by section
    const grouped: Record<string, TeamMember[]> = {};
    regular.forEach((member) => {
      const key = member.teamSection;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(member);
    });

    // Sort within each section
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });

    // Filter and sort regular sections
    const regSections = languageSections
      .filter((s) => s.name !== GUEST_TRAINER_SECTION)
      .filter((s) => {
        const name = s.name;
        const normalized = ensureTeamSuffix(name);
        return (grouped[name]?.length > 0) || (grouped[normalized]?.length > 0);
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return {
      guestTrainers: guests,
      regularSections: regSections,
      membersBySection: grouped,
    };
  }, [teamMembers, languageSections]);

  return { guestTrainers, regularSections, membersBySection, loading, error };
}
