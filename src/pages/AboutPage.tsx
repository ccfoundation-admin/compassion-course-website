import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import JotformPopup from '../components/JotformPopup';
import { getTeamMembers, getLanguageSections, TeamMember, TeamLanguageSection } from '../services/contentService';
import { ensureTeamSuffix } from '../utils/contentUtils';
// Firebase config check is handled via the hasFirebaseTeam flag
import { useScrollReveal } from '../hooks/useScrollReveal';
import { siteContent } from '../data/siteContent';

const JOTFORM_FORM_ID = import.meta.env.VITE_JOTFORM_FORM_ID || '260333329475357';

const { about, shared } = siteContent;

const AboutPage: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [languageSections, setLanguageSections] = useState<TeamLanguageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useScrollReveal();

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        setLoading(true);
        const [members, sections] = await Promise.all([
          getTeamMembers(),
          getLanguageSections()
        ]);
        if (!cancelled) {
          setTeamMembers(members);
          setLanguageSections(sections);
        }
      } catch (err: any) {
        console.error('Error loading team data:', err);
        if (!cancelled) setError('Failed to load team information');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);

  // Group Firebase team members by team section
  const membersBySection: { [key: string]: TeamMember[] } = {};
  teamMembers.forEach(member => {
    if (!membersBySection[member.teamSection]) {
      membersBySection[member.teamSection] = [];
    }
    membersBySection[member.teamSection].push(member);
  });

  Object.keys(membersBySection).forEach(section => {
    membersBySection[section].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  const sortedSections = languageSections
    .filter(section => {
      const normalizedName = ensureTeamSuffix(section.name);
      const hasMembers = (membersBySection[section.name] && membersBySection[section.name].length > 0) ||
                         (membersBySection[normalizedName] && membersBySection[normalizedName].length > 0);
      return hasMembers;
    })
    .map(section => section.name);

  // Use Firebase data if available, otherwise fall back to static data
  const hasFirebaseTeam = !loading && !error && sortedSections.length > 0;

  const renderBio = (bio: string | string[]): React.ReactNode => {
    if (Array.isArray(bio)) {
      return bio.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ));
    }
    const paragraphs = bio.split('\n').filter(p => p.trim());
    if (paragraphs.length > 1) {
      return paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ));
    }
    return <p>{bio}</p>;
  };

  return (
    <Layout>
      <section className="about-page">
        {/* Hero */}
        <div className="about-page-hero">
          <h1>{about.hero.heading}</h1>
          <p className="about-page-subtitle">{about.hero.subtitle}</p>
        </div>

        {/* Our Story — mission + history with images */}
        <div className="about-story reveal">
          <div className="container">
            <div className="about-story-content">
              <div className="about-story-text">
                <h2 className="about-story-tagline">{about.story.tagline}</h2>
                {about.story.paragraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
                <div className="about-story-timeline">
                  {about.story.timeline.map((item) => (
                    <div key={item.year} className="about-timeline-item">
                      <span className="about-timeline-year">{item.year}</span>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="about-story-images">
                <img
                  src="/images/video-conference.jpg"
                  alt={about.story.imageAlts[0]}
                  className="about-story-photo"
                  loading="lazy"
                />
                <img
                  src="/images/leadership-opportunities.jpg"
                  alt={about.story.imageAlts[1]}
                  className="about-story-photo"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* How You Can Help */}
        <div className="about-help reveal">
          <div className="container">
            <h2 className="section-title">{about.howYouCanHelp.title}</h2>
            <p className="section-description">{about.howYouCanHelp.description}</p>
            <div className="about-help-grid">
              {/* Card 1 — Share the Course */}
              <div className="about-help-card reveal">
                <div className="about-help-icon">
                  <i className={about.howYouCanHelp.cards[0].icon}></i>
                </div>
                <h3>{about.howYouCanHelp.cards[0].heading}</h3>
                <p>{about.howYouCanHelp.cards[0].text}</p>
                <a
                  href={about.howYouCanHelp.cards[0].linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-help-link"
                >
                  {about.howYouCanHelp.cards[0].linkText}
                </a>
              </div>

              {/* Card 2 — Spread the Word Online */}
              <div className="about-help-card reveal">
                <div className="about-help-icon">
                  <i className={about.howYouCanHelp.cards[1].icon}></i>
                </div>
                <h3>{about.howYouCanHelp.cards[1].heading}</h3>
                <p>{about.howYouCanHelp.cards[1].text}</p>
                {'socialLinks' in about.howYouCanHelp.cards[1] && (
                  <div className="about-help-social">
                    {(about.howYouCanHelp.cards[1] as any).socialLinks.map((link: any) => (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                        <i className={link.icon}></i>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Card 3 — Community Outreach */}
              <div className="about-help-card reveal">
                <div className="about-help-icon">
                  <i className={about.howYouCanHelp.cards[2].icon}></i>
                </div>
                <h3>{about.howYouCanHelp.cards[2].heading}</h3>
                <p>{about.howYouCanHelp.cards[2].text}</p>
                <a href={about.howYouCanHelp.cards[2].linkHref} className="about-help-link">
                  {'linkIcon' in about.howYouCanHelp.cards[2] && (
                    <i className={(about.howYouCanHelp.cards[2] as any).linkIcon}></i>
                  )} {about.howYouCanHelp.cards[2].linkText}
                </a>
              </div>

              {/* Card 4 — Volunteer Your Skills */}
              <div className="about-help-card reveal">
                <div className="about-help-icon">
                  <i className={about.howYouCanHelp.cards[3].icon}></i>
                </div>
                <h3>{about.howYouCanHelp.cards[3].heading}</h3>
                <p>{about.howYouCanHelp.cards[3].text}</p>
                <a href={about.howYouCanHelp.cards[3].linkHref} className="about-help-link">
                  {'linkIcon' in about.howYouCanHelp.cards[3] && (
                    <i className={(about.howYouCanHelp.cards[3] as any).linkIcon}></i>
                  )} {about.howYouCanHelp.cards[3].linkText}
                </a>
              </div>

              {/* Card 5 — Make a Donation */}
              <div className="about-help-card about-help-card--donate reveal">
                <div className="about-help-icon">
                  <i className={shared.donateCard.icon}></i>
                </div>
                <h3>{shared.donateCard.heading}</h3>
                <p>{shared.donateCard.text}</p>
                <Link to={shared.donateCard.linkHref} className="about-help-link">
                  <i className="fas fa-arrow-right"></i> {shared.donateCard.linkText}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="about-team-members">
          <div className="container">
            <h2 className="section-title">{about.team.title}</h2>
            <p className="section-description">{about.team.description}</p>

            {/* Firebase-sourced team (when available), otherwise static data */}
            {hasFirebaseTeam ? (
              sortedSections.map((sectionName) => {
                const normalizedName = ensureTeamSuffix(sectionName);
                const sectionMembers = membersBySection[sectionName] || membersBySection[normalizedName] || [];

                return (
                  <div key={sectionName} className="team-section">
                    <h2 className="team-section-title">{ensureTeamSuffix(sectionName)}</h2>
                    {sectionMembers.map((member) => (
                      <div key={member.id} className="team-member">
                        <div className="team-member-header">
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="team-member-photo"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.border = '2px solid red';
                            }}
                          />
                          <div className="team-member-info">
                            <h3>{member.name}</h3>
                            {member.role && (
                              <p className="team-role"><em>{member.role}</em></p>
                            )}
                          </div>
                        </div>
                        {renderBio(member.bio)}
                        {member.contact && (
                          <p className="team-member-contact-line">
                            <strong>{about.team.contactLabel}</strong> {member.contact}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })
            ) : (
              about.team.sections.map((section) => (
                <div key={section.section} className="team-section">
                  <h2 className="team-section-title">{section.section}</h2>
                  {section.members.map((member) => (
                    <div key={member.name} className="team-member">
                      <div className="team-member-header">
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="team-member-photo"
                          loading="lazy"
                        />
                        <div className="team-member-info">
                          <h3>{member.name}</h3>
                          <p className="team-role"><em>{member.role}</em></p>
                        </div>
                      </div>
                      {member.bio.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                      {member.contact && (
                        <p className="team-member-contact-line">
                          <strong>{about.team.contactLabel}</strong> {member.contact}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

      </section>

      {/* Contact + CTA — outside about-page so no white bg gap */}
      <section className="about-cta reveal">
        <div className="container">
          <div className="about-cta-content">
            <div className="about-cta-text">
              <h2>{about.cta.heading}</h2>
              <p>{about.cta.text}</p>
              <div className="about-cta-buttons">
                <JotformPopup
                  formId={JOTFORM_FORM_ID}
                  buttonText={about.cta.buttonPrimary}
                />
                <Link to={about.cta.linkHref} className="btn-secondary">
                  {about.cta.linkText}
                </Link>
              </div>
            </div>
            <div className="about-cta-contact">
              <h3>{about.cta.contact.heading}</h3>
              <div className="about-cta-contact-items">
                <a href={`mailto:${about.cta.contact.email}`} className="about-cta-contact-link">
                  <i className="fas fa-envelope"></i>
                  {about.cta.contact.email}
                </a>
                <span className="about-cta-contact-link">
                  <i className="fas fa-phone"></i>
                  {about.cta.contact.phone}
                </span>
              </div>
              <div className="about-cta-social">
                {about.cta.contact.socialLinks.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                    <i className={link.icon}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
