import React from 'react';
import { TeamMember } from '../../services/contentService';

interface TeamMemberRowProps {
  member: TeamMember;
  onSelect: (member: TeamMember) => void;
}

const FALLBACK_AVATAR = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Ccircle cx=%2750%27 cy=%2735%27 r=%2720%27 fill=%27%23cbd5e1%27/%3E%3Ccircle cx=%2750%27 cy=%27100%27 r=%2735%27 fill=%27%23cbd5e1%27/%3E%3C/svg%3E';

const TeamMemberRow: React.FC<TeamMemberRowProps> = ({ member, onSelect }) => {
  const bioLine = typeof member.bio === 'string'
    ? member.bio.split('\n')[0]
    : Array.isArray(member.bio) ? member.bio[0] : '';

  return (
    <div className="team-row" onClick={() => onSelect(member)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelect(member)}>
      <img
        src={member.photo || FALLBACK_AVATAR}
        alt={member.name}
        className="team-row__photo"
        loading="lazy"
        decoding="async"
        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
      />
      <div className="team-row__info">
        <span className="team-row__name">{member.name}</span>
        {member.role && <span className="team-row__role">{member.role}</span>}
      </div>
      {bioLine && <p className="team-row__bio">{bioLine}</p>}
    </div>
  );
};

export default TeamMemberRow;
