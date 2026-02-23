import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useTeamData } from '../hooks/useTeamData';
import { TeamMember } from '../services/contentService';
import ViewToggle, { ViewMode } from '../components/team/ViewToggle';
import TeamSectionFilter from '../components/team/TeamSectionFilter';
import GuestTrainerSection from '../components/team/GuestTrainerSection';
import TeamGrid from '../components/team/TeamGrid';
import TeamMemberModal from '../components/team/TeamMemberModal';
import { siteContent } from '../data/siteContent';

const { about } = siteContent;

const AboutPage: React.FC = () => {
  const { guestTrainers, regularSections, membersBySection, loading } = useTeamData();
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useScrollReveal();

  return (
    <Layout>
      <section className="team-page">
        {/* Page Header */}
        <div className="team-page-header">
          <div className="container">
            <h1 className="team-page-title">{about.team.title}</h1>
            <p className="team-page-description">{about.team.description}</p>
          </div>
        </div>

        {/* Guest Trainers — Highlighted */}
        <GuestTrainerSection trainers={guestTrainers} onSelect={setSelectedMember} />

        {/* Controls */}
        <div className="team-controls">
          <div className="container">
            <div className="team-controls-inner">
              <div className="team-controls-left">
                <ViewToggle mode={viewMode} onChange={setViewMode} />
                <div className="team-search">
                  <i className="fas fa-search team-search-icon"></i>
                  <input
                    type="text"
                    className="team-search-input"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="team-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
              <TeamSectionFilter
                sections={regularSections}
                active={activeSection}
                onChange={setActiveSection}
                membersBySection={membersBySection}
              />
            </div>
          </div>
        </div>

        {/* Team Grid */}
        <div className="team-content">
          <div className="container">
            {loading ? (
              <div className="team-loading">
                <div className="team-spinner" />
                <p>Loading team members...</p>
              </div>
            ) : (
              <TeamGrid
                sections={regularSections}
                membersBySection={membersBySection}
                viewMode={viewMode}
                activeSection={activeSection}
                searchQuery={searchQuery}
                onSelectMember={setSelectedMember}
              />
            )}
          </div>
        </div>

        {/* Member Detail Modal */}
        {selectedMember && (
          <TeamMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
        )}
      </section>
    </Layout>
  );
};

export default AboutPage;
