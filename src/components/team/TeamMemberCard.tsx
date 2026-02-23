import React from 'react';
import { TeamMember } from '../../services/contentService';

interface TeamMemberCardProps {
  member: TeamMember;
  onSelect: (member: TeamMember) => void;
}

const FALLBACK_AVATAR = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Ccircle cx=%2750%27 cy=%2735%27 r=%2720%27 fill=%27%23cbd5e1%27/%3E%3Ccircle cx=%2750%27 cy=%27100%27 r=%2735%27 fill=%27%23cbd5e1%27/%3E%3C/svg%3E';

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onSelect }) => {
  const bioPreview = typeof member.bio === 'string'
    ? member.bio.split('\n')[0]
    : Array.isArray(member.bio) ? member.bio[0] : '';

  return (
    <div className="team-card" onClick={() => onSelect(member)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelect(member)}>
      <div className="team-card__photo-wrap">
        <img
          src={member.photo || FALLBACK_AVATAR}
          alt={member.name}
          className="team-card__photo"
          loading="lazy"
          decoding="async"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
        />
      </div>
      <h3 className="team-card__name">{member.name}</h3>
      {member.role && <p className="team-card__role">{member.role}</p>}
      {bioPreview && <p className="team-card__bio">{bioPreview}</p>}
      <span className="team-card__more">Read more</span>
    </div>
  );
};

export default TeamMemberCard;
