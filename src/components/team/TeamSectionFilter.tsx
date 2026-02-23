import React from 'react';
import { TeamLanguageSection } from '../../services/contentService';
import { ensureTeamSuffix } from '../../utils/contentUtils';

interface TeamSectionFilterProps {
  sections: TeamLanguageSection[];
  active: string | null;
  onChange: (sectionName: string | null) => void;
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
        const name = section.name;
        const normalized = ensureTeamSuffix(name);
        const count = (membersBySection[name]?.length ?? 0) + (name !== normalized ? (membersBySection[normalized]?.length ?? 0) : 0);
        return (
          <button
            key={name}
            className={`team-filter-pill ${active === name ? 'team-filter-pill--active' : ''}`}
            onClick={() => onChange(name)}
            role="tab"
            aria-selected={active === name}
          >
            {name} <span className="team-filter-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TeamSectionFilter;
