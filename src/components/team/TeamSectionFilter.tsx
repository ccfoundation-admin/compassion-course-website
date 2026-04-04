import React from 'react';
import { TeamLanguageSection } from '../../services/contentService';

interface TeamSectionFilterProps {
  sections: TeamLanguageSection[];
  active: string | null;
  onChange: (sectionId: string | null) => void;
  membersBySection: Record<string, any[]>;
}

const TeamSectionFilter: React.FC<TeamSectionFilterProps> = ({
  sections,
  active,
  onChange,
  membersBySection,
}) => {
  const totalMembers = Object.values(membersBySection).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="team-section-filter" role="tablist" aria-label="Filter by team">
      <button
        className={`team-filter-pill ${active === null ? 'team-filter-pill--active' : ''}`}
        onClick={() => onChange(null)}
        role="tab"
        aria-selected={active === null}
      >
        All <span className="team-filter-count">{totalMembers}</span>
      </button>
      {sections.map((section) => {
        const sectionId = section.id || '';
        const count = membersBySection[sectionId]?.length ?? 0;
        return (
          <button
            key={sectionId}
            className={`team-filter-pill ${active === sectionId ? 'team-filter-pill--active' : ''}`}
            onClick={() => onChange(sectionId)}
            role="tab"
            aria-selected={active === sectionId}
          >
            {section.name} <span className="team-filter-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TeamSectionFilter;
