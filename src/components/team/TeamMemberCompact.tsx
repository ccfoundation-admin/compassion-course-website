import React from 'react';
import { TeamMember } from '../../services/contentService';
import { highlightMatch } from './highlightMatch';

interface TeamMemberCompactProps {
  member: TeamMember;
  onSelect: (member: TeamMember) => void;
  searchQuery?: string;
}

const FALLBACK_AVATAR = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Ccircle cx=%2750%27 cy=%2735%27 r=%2720%27 fill=%27%23cbd5e1%27/%3E%3Ccircle cx=%2750%27 cy=%27100%27 r=%2735%27 fill=%27%23cbd5e1%27/%3E%3C/svg%3E';

const TeamMemberCompact: React.FC<TeamMemberCompactProps> = ({ member, onSelect, searchQuery = '' }) => (
  <div className="team-compact" onClick={() => onSelect(member)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelect(member)} title={member.name}>
    <img
      src={member.photo || FALLBACK_AVATAR}
      alt={member.name}
      className="team-compact__photo"
      loading="lazy"
      decoding="async"
      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
    />
    <div className="team-compact__overlay">
      <span className="team-compact__name">{highlightMatch(member.name, searchQuery)}</span>
    </div>
  </div>
);

export default TeamMemberCompact;
