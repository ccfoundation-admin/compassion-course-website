import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import JotformPopup from '../components/JotformPopup';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { siteContent } from '../data/siteContent';

const JOTFORM_FORM_ID = import.meta.env.VITE_JOTFORM_FORM_ID || '260333329475357';

const { volunteer } = siteContent;

const VolunteerPage: React.FC = () => {
  useScrollReveal();

  return (
    <Layout>
      {/* Hero */}
      <section className="volunteer-hero">
        <div className="volunteer-hero-overlay"></div>
        <div className="container volunteer-hero-content">
          <span className="volunteer-hero-eyebrow">{volunteer.hero.eyebrow}</span>
          <h1 className="volunteer-hero-heading">{volunteer.hero.heading}</h1>
          <p className="volunteer-hero-description">{volunteer.hero.description}</p>
        </div>
      </section>

      {/* Ways to Help */}
      <section className="volunteer-ways reveal">
        <div className="container">
          <h2 className="section-title">{volunteer.waysToHelp.title}</h2>
          <p className="volunteer-ways-subtitle">{volunteer.waysToHelp.subtitle}</p>
          <div className="volunteer-ways-grid">

            {/* Card 1 — Share with Friends */}
            <div className="volunteer-card reveal">
              <div className="volunteer-card-accent"></div>
              <span className="volunteer-card-eyebrow">{volunteer.waysToHelp.cards[0].eyebrow}</span>
              <h3>{volunteer.waysToHelp.cards[0].heading}</h3>
              <p>{volunteer.waysToHelp.cards[0].text}</p>
              <div className="volunteer-card-action">
                <span className="volunteer-link-box">
                  <i className="fas fa-link"></i>
                  {volunteer.waysToHelp.cards[0].linkUrl}
                </span>
                <p className="volunteer-card-note">{volunteer.waysToHelp.cards[0].note}</p>
              </div>
            </div>

            {/* Card 2 — Share on Social Media */}
            <div className="volunteer-card reveal">
              <div className="volunteer-card-accent"></div>
              <span className="volunteer-card-eyebrow">{volunteer.waysToHelp.cards[1].eyebrow}</span>
              <h3>{volunteer.waysToHelp.cards[1].heading}</h3>
              <p>{volunteer.waysToHelp.cards[1].text}</p>
              {'socialLinks' in volunteer.waysToHelp.cards[1] && (
                <div className="volunteer-social-links">
                  {(volunteer.waysToHelp.cards[1] as any).socialLinks.map((link: any) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="volunteer-social-btn"
                      aria-label={link.label}
                    >
                      <i className={link.icon}></i>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Card 3 — Post a Flyer */}
            <div className="volunteer-card reveal">
              <div className="volunteer-card-accent"></div>
              <span className="volunteer-card-eyebrow">{volunteer.waysToHelp.cards[2].eyebrow}</span>
              <h3>{volunteer.waysToHelp.cards[2].heading}</h3>
              <p>{volunteer.waysToHelp.cards[2].text}</p>
              {'flyerUrl' in volunteer.waysToHelp.cards[2] && (
                <div className="volunteer-card-action">
                  <a
                    href={(volunteer.waysToHelp.cards[2] as any).flyerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="volunteer-flyer-btn"
                  >
                    <i className="fas fa-image"></i> {(volunteer.waysToHelp.cards[2] as any).flyerButtonText}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Growth Message */}
      <section className="volunteer-growth reveal">
        <div className="container">
          <div className="volunteer-growth-inner">
            <div className="volunteer-growth-icon">
              <i className={volunteer.growthMessage.icon}></i>
            </div>
            <h2>{volunteer.growthMessage.heading}</h2>
            <p className="volunteer-growth-lead">{volunteer.growthMessage.leadText}</p>
            <div className="volunteer-growth-video">
              <video controls preload="metadata">
                <source src={volunteer.growthMessage.videoSrc} type="video/mp4" />
              </video>
            </div>
            <div className="volunteer-growth-cards">
              {volunteer.growthMessage.cards.map((card) => (
                <div key={card.bold} className="volunteer-growth-card">
                  <i className={card.icon}></i>
                  <div>
                    <strong>{card.bold}</strong>
                    <p>{card.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact + CTA */}
      <section className="volunteer-cta reveal">
        <div className="container">
          <div className="volunteer-cta-inner">
            <div className="volunteer-cta-text">
              <h2>{volunteer.cta.heading}</h2>
              <p>{volunteer.cta.para}</p>
              <p className="volunteer-cta-gratitude">
                {volunteer.cta.gratitude}<br />
                <strong>{volunteer.cta.gratitudeTeam}</strong>
              </p>
              <div className="volunteer-contact-info">
                <a href={`mailto:${volunteer.cta.email}`} className="volunteer-contact-item">
                  <i className="fas fa-envelope"></i>
                  {volunteer.cta.email}
                </a>
                <a href={volunteer.cta.phoneHref} className="volunteer-contact-item">
                  <i className="fas fa-phone"></i>
                  {volunteer.cta.phone}
                </a>
              </div>
            </div>
            <div className="volunteer-cta-register">
              <h3>{volunteer.cta.registerBox.heading}</h3>
              <p>{volunteer.cta.registerBox.text}</p>
              <JotformPopup
                formId={JOTFORM_FORM_ID}
                buttonText={volunteer.cta.registerBox.buttonText}
              />
              <Link to={volunteer.cta.registerBox.linkHref} className="volunteer-learn-link">
                {volunteer.cta.registerBox.linkText} <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default VolunteerPage;
