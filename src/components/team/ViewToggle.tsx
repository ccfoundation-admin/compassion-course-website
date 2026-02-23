import React from 'react';

export type ViewMode = 'card' | 'list' | 'compact';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const modes: { key: ViewMode; icon: string; label: string }[] = [
  { key: 'card', icon: 'fas fa-th-large', label: 'Card view' },
  { key: 'list', icon: 'fas fa-list', label: 'List view' },
  { key: 'compact', icon: 'fas fa-th', label: 'Compact view' },
];

const ViewToggle: React.FC<ViewToggleProps> = ({ mode, onChange }) => (
  <div className="team-view-toggle" role="group" aria-label="View mode">
    {modes.map((m) => (
      <button
        key={m.key}
        className={`team-view-btn ${mode === m.key ? 'team-view-btn--active' : ''}`}
        onClick={() => onChange(m.key)}
        aria-label={m.label}
        aria-pressed={mode === m.key}
      >
        <i className={m.icon}></i>
      </button>
    ))}
  </div>
);

export default ViewToggle;
