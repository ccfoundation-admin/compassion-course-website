import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import JotformPopup from '../components/JotformPopup';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { siteContent } from '../data/siteContent';

const JOTFORM_FORM_ID = import.meta.env.VITE_JOTFORM_FORM_ID || '260333329475357';

const { learnMore } = siteContent;

const LearnMorePage: React.FC = () => {
  useScrollReveal();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <Layout>
      {/* Hero Section — with image background */}
      <section className="learn-hero">
        <img
          src="/images/different-friends-sunset.jpg"
          alt={learnMore.hero.imageAlt}
          className="learn-hero-bg"
        />
        <div className="learn-hero-overlay" />
        <div className="learn-hero-content">
          <div className="learn-hero-inner">
            <p className="learn-hero-eyebrow">{learnMore.hero.eyebrow}</p>
            <h1 className="learn-hero-heading">{learnMore.hero.heading}</h1>
            <p className="learn-hero-description">{learnMore.hero.description}</p>
            <div className="learn-hero-buttons">
              <JotformPopup
                formId={JOTFORM_FORM_ID}
                buttonText={learnMore.hero.buttonPrimary}
              />
              <a href={learnMore.hero.buttonSecondaryHref} className="btn-secondary">
                {learnMore.hero.buttonSecondary}
              </a>
            </div>
          </div>
          <div className="learn-stats-grid">
            {learnMore.hero.stats.map((stat) => (
              <div key={stat.label} className="learn-stat-card">
                <div className="learn-stat-number">{stat.number}</div>
                <div className="learn-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Origin Story — timeline + image */}
      <section className="learn-origin reveal">
        <div className="container">
          <h2 className="section-title">{learnMore.origin.title}</h2>
          <div className="learn-origin-inner">
            <div className="learn-origin-image">
              <video controls preload="metadata" poster="/images/origin-conversation.jpg">
                <source src={learnMore.origin.videoSrc} type="video/mp4" />
              </video>
            </div>
            <div className="learn-origin-timeline">
              {learnMore.origin.timeline.map((item) => (
                <div key={item.year} className="learn-origin-year">
                  <span className="learn-origin-year-num">{item.year}</span>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="learn-how reveal">
        <div className="container">
          <div className="learn-how-intro">
            <div className="learn-how-intro-text">
              <h2 className="section-title" style={{ textAlign: 'left' }}>{learnMore.howItWorks.title}</h2>
              <p className="section-description" style={{ textAlign: 'left', maxWidth: 'none' }}>
                {learnMore.howItWorks.description}
              </p>
            </div>
            <div className="learn-how-intro-image">
              <img
                src="/images/how-friends-laughing.jpg"
                alt={learnMore.howItWorks.imageAlt}
                loading="lazy"
              />
            </div>
          </div>

          <div className="learn-how-steps">
            {learnMore.howItWorks.steps.map((step) => (
              <div
                key={step.number}
                className="learn-how-step-card reveal"
              >
                <div className="learn-how-step-number">{step.number}</div>
                <div className="learn-how-step-icon">
                  <i className={step.icon}></i>
                </div>
                <h3>{step.heading}</h3>
                <p>{step.text}</p>
                {'concepts' in step && (
                  <div className="learn-concepts-grid">
                    {(step as any).concepts.map((concept: { icon: string; label: string }) => (
                      <div key={concept.label} className="learn-concept-tag">
                        <i className={concept.icon}></i>
                        <span>{concept.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Strip — community & kindness imagery */}
      <section className="learn-photo-strip">
        <div className="learn-photo-strip-inner">
          {learnMore.photoStrip.images.map((img) => (
            <div key={img.src} className="learn-photo-strip-item">
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* A Peek Inside the Course */}
      <section id="peek-inside" className="learn-peek reveal">
        <div className="container">
          <div className="learn-peek-header">
            <div className="learn-peek-header-text">
              <h2 className="section-title" style={{ textAlign: 'left' }}>{learnMore.peekInside.title}</h2>
              <p className="section-description" style={{ textAlign: 'left', maxWidth: 'none' }}>
                {learnMore.peekInside.description}
              </p>
            </div>
            <div className="learn-peek-header-image">
              <img
                src="/images/peek-reflection.jpg"
                alt={learnMore.peekInside.imageAlt}
                loading="lazy"
              />
            </div>
          </div>
          <div className="learn-peek-columns">
            <div className="learn-peek-col">
              <h3 className="learn-peek-col-title">{learnMore.peekInside.col1Title}</h3>
              <div className="learn-peek-list">
                {learnMore.peekInside.weeklyTopics.map((topic) => (
                  <div key={topic.week} className="learn-peek-item">
                    <span className="learn-peek-week">{topic.week}</span>
                    <span className="learn-peek-title">{topic.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="learn-peek-col">
              <h3 className="learn-peek-col-title">{learnMore.peekInside.col2Title}</h3>
              <div className="learn-peek-topic-tags">
                {learnMore.peekInside.topicTags.map((tag) => (
                  <span key={tag} className="learn-peek-tag">{tag}</span>
                ))}
              </div>
              <p className="learn-peek-more">{learnMore.peekInside.moreText}</p>
              <div className="learn-peek-sample-links">
                {learnMore.peekInside.sampleLinks.map((link) => (
                  <a key={link.href} href={link.href} className="learn-peek-sample-link">
                    <i className={link.icon}></i> {link.text}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Week 1 — Empathy */}
      <section id="sample-empathy" className="learn-sample reveal">
        <div className="container">
          <div className="learn-sample-header">
            <span className="learn-sample-badge">{learnMore.sampleEmpathy.badge}</span>
            <h2 className="section-title">{learnMore.sampleEmpathy.title}</h2>
          </div>
          <div className="learn-sample-body">
            <div className="learn-sample-concept">
              <h3><i className="fas fa-lightbulb"></i> {learnMore.sampleEmpathy.concept.heading}</h3>
              {learnMore.sampleEmpathy.concept.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <div className="learn-sample-story">
              <h3><i className="fas fa-book-open"></i> {learnMore.sampleEmpathy.story.heading}</h3>
              <p>{learnMore.sampleEmpathy.story.text}</p>
            </div>
            <div className="learn-sample-practice">
              <h3><i className="fas fa-hands"></i> {learnMore.sampleEmpathy.practicesHeading}</h3>
              <div className="learn-sample-practice-list">
                {learnMore.sampleEmpathy.practices.map((practice) => (
                  <div key={practice.heading} className="learn-sample-practice-item">
                    <strong>{practice.heading}</strong>
                    <p>{practice.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Week 2 — Appreciation */}
      <section id="sample-appreciation" className="learn-sample learn-sample--alt reveal">
        <div className="container">
          <div className="learn-sample-header">
            <span className="learn-sample-badge">{learnMore.sampleAppreciation.badge}</span>
            <h2 className="section-title">{learnMore.sampleAppreciation.title}</h2>
          </div>
          <div className="learn-sample-body">
            <div className="learn-sample-concept">
              <h3><i className="fas fa-lightbulb"></i> {learnMore.sampleAppreciation.concept.heading}</h3>
              {learnMore.sampleAppreciation.concept.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <div className="learn-sample-story">
              <h3><i className="fas fa-book-open"></i> {learnMore.sampleAppreciation.story.heading}</h3>
              <p>{learnMore.sampleAppreciation.story.text}</p>
            </div>
            <div className="learn-sample-practice">
              <h3><i className="fas fa-hands"></i> {learnMore.sampleAppreciation.practicesHeading}</h3>
              <div className="learn-sample-practice-list">
                {learnMore.sampleAppreciation.practices.map((practice) => (
                  <div key={practice.heading} className="learn-sample-practice-item">
                    <strong>{practice.heading}</strong>
                    <p>{practice.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes This Different */}
      <section id="what-makes-different" className="learn-different reveal">
        <div className="container">
          <h2 className="section-title">{learnMore.whatMakesDifferent.heading}</h2>
          <p className="section-description">{learnMore.whatMakesDifferent.subtitle}</p>
          <div className="learn-different-video">
            <video controls preload="metadata" poster="/images/hero-community.jpg">
              <source src={learnMore.whatMakesDifferent.videoSrc} type="video/mp4" />
            </video>
          </div>
          <div className="learn-different-grid">
            {learnMore.whatMakesDifferent.cards.map((card) => (
              <div key={card.heading} className="learn-different-card reveal">
                <div className="learn-different-icon">
                  <i className={card.icon}></i>
                </div>
                <h3>{card.heading}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Options & Extras */}
      <section id="options-extras" className="learn-options reveal">
        <div className="container">
          <h2 className="section-title">{learnMore.optionsExtras.title}</h2>
          <p className="section-description">{learnMore.optionsExtras.description}</p>
          <div className="learn-options-list">
            {learnMore.optionsExtras.items.map((item) => (
              <div key={item.heading} className="learn-options-item reveal">
                <div className="learn-options-item-icon">
                  <i className={item.icon}></i>
                </div>
                <div className="learn-options-item-body">
                  <h3>{item.heading}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Thom Bond — with photo */}
      <section id="about-thom" className="learn-founder reveal">
        <div className="container">
          <div className="learn-founder-inner">
            <div className="learn-founder-photo-side">
              <div className="learn-founder-photo-wrapper">
                <img
                  src="/Team/ThomBond.png"
                  alt={learnMore.founder.imageAlt}
                  className="learn-founder-photo"
                  loading="lazy"
                />
              </div>
              <div className="learn-founder-quote-card">
                <div className="learn-founder-quote-mark">&ldquo;</div>
                <p className="learn-founder-quote-text">{learnMore.founder.quote}</p>
                <span className="learn-founder-quote-attr">{learnMore.founder.quoteAttribution}</span>
              </div>
            </div>
            <div className="learn-founder-text">
              <h2 className="section-title" style={{ textAlign: 'left' }}>{learnMore.founder.title}</h2>
              {learnMore.founder.bio.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="learn-faq reveal">
        <div className="container">
          <h2 className="section-title">{learnMore.faq.title}</h2>
          <div className="learn-faq-list">
            {learnMore.faq.items.map((faq, index) => (
              <div
                key={index}
                className={`learn-faq-item ${openFaq === index ? 'learn-faq-item--open' : ''}`}
              >
                <button
                  type="button"
                  className="learn-faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                >
                  <span>{faq.question}</span>
                  <i className={`fas fa-chevron-down learn-faq-chevron ${openFaq === index ? 'learn-faq-chevron--open' : ''}`}></i>
                </button>
                <div
                  className="learn-faq-answer"
                  style={{
                    maxHeight: openFaq === index ? '300px' : '0',
                    opacity: openFaq === index ? 1 : 0,
                  }}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta reveal">
        <div className="container">
          <div className="cta-content">
            <h2>{learnMore.cta.heading}</h2>
            <p>{learnMore.cta.text}</p>
            <div className="cta-buttons">
              <JotformPopup
                formId={JOTFORM_FORM_ID}
                buttonText={learnMore.cta.buttonPrimary}
              />
              <Link to={learnMore.cta.linkHref} className="btn-secondary">
                {learnMore.cta.linkText}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LearnMorePage;
