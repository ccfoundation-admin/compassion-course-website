import React from 'react';
import { TeamMember } from '../../services/contentService';

interface GuestTrainerSectionProps {
  trainers: TeamMember[];
  onSelect: (member: TeamMember) => void;
}

const FALLBACK_AVATAR = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Ccircle cx=%2750%27 cy=%2735%27 r=%2720%27 fill=%27%23cbd5e1%27/%3E%3Ccircle cx=%2750%27 cy=%27100%27 r=%2735%27 fill=%27%23cbd5e1%27/%3E%3C/svg%3E';

const GuestTrainerSection: React.FC<GuestTrainerSectionProps> = ({ trainers, onSelect }) => {
  if (trainers.length === 0) return null;

  return (
    <section className="guest-trainers">
      <div className="container">
        <h2 className="guest-trainers__title">
          <i className="fas fa-star"></i> Guest Trainers
        </h2>
        <div className="guest-trainers__grid">
          {trainers.map((trainer) => (
            <div
              key={trainer.id ?? trainer.name}
              className="guest-trainer-card"
              onClick={() => onSelect(trainer)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(trainer)}
            >
              <img
                src={trainer.photo || FALLBACK_AVATAR}
                alt={trainer.name}
                className="guest-trainer-card__photo"
                loading="lazy"
                decoding="async"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
              />
              <h3 className="guest-trainer-card__name">{trainer.name}</h3>
              {trainer.role && <p className="guest-trainer-card__role">{trainer.role}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuestTrainerSection;
