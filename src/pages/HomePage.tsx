import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from '../components/Layout';
import Globe from '../components/Globe';
import StarrySky from '../components/StarrySky';
import JotformPopup from '../components/JotformPopup';
import { useContent } from '../context/ContentContext';
import { useScrollReveal } from '../hooks/useScrollReveal';

const JOTFORM_FORM_ID = import.meta.env.VITE_JOTFORM_FORM_ID || '260333329475357';

const sampleWeeks = [
  {
    week: 1,
    title: 'What Empathy Is\u2026 and What It\u2019s Not',
    description:
      'Discover how empathy differs from common listening habits like advising, fixing, or sympathizing. Learn to create space for genuine connection instead of filling it with automatic responses.',
    practice:
      'Notice your own non-empathic patterns this week. When you catch yourself advising or fixing, pause and try: \u201CAre you feeling ___ because you need more ___?\u201D',
    story:
      'A late-night cab ride to retrieve a borrowed car becomes an unexpected lesson in presence \u2014 when a simple empathic reflection opens a Vietnam veteran\u2019s long-held grief.',
    link: '/learn-more#sample-empathy',
  },
  {
    week: 2,
    title: 'The Power of Appreciation',
    description:
      'Explore the difference between praise (designed to control) and genuine appreciation (designed to connect). Learn to express gratitude by naming what someone did and the needs it met.',
    practice:
      'Write ten things currently happening that meet your needs right now. Then share an appreciation with someone: describe what they did, how it made you feel, and which needs it met.',
    story:
      'A small act of kindness for a frightened child on a bookstore escalator turns into one of the most heartfelt \u201Cthank you\u201D moments the author has ever experienced.',
    link: '/learn-more#sample-appreciation',
  },
];

const testimonials = [
  {
    quote: 'The Compassion Course completely transformed how I approach relationships and challenges. I discovered tools I never knew I had within me.',
    name: 'Sarah Johnson',
    role: 'Marketing Executive',
  },
  {
    quote: 'In just three days, I gained clarity on what was holding me back in my career and personal life. The results have been extraordinary.',
    name: 'Michael Chen',
    role: 'Software Engineer',
  },
  {
    quote: 'The community aspect is incredible. I\'ve made lifelong connections with people who are committed to growth and making a difference.',
    name: 'Emily Rodriguez',
    role: 'Nonprofit Director',
  },
];

const HomePage: React.FC = () => {
  const { getContent } = useContent();
  const chatbotContainerRef = useRef<HTMLDivElement>(null);
  const heroLogoRef = useRef<HTMLImageElement>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useScrollReveal();

  // Observe hero logo visibility and dispatch event for Navigation
  useEffect(() => {
    const el = heroLogoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        window.dispatchEvent(
          new CustomEvent('hero-logo-visibility', {
            detail: { visible: entry.isIntersecting },
          })
        );
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Load ElevenLabs chatbot script
  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
    if (existingScript || !chatbotContainerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    script.setAttribute('data-elevenlabs-chatbot', 'true');
    script.onload = () => {
      if (chatbotContainerRef.current) {
        chatbotContainerRef.current.innerHTML = '';
        const chatbotElement = document.createElement('elevenlabs-convai');
        chatbotElement.setAttribute('agent-id', 'agent_0301kaf26r60eqkr3x8qe2v8wdq0');
        // chatbotElement.setAttribute('variant', 'tiny');
        // chatbotElement.setAttribute('override-text-only', 'true');
        chatbotContainerRef.current.appendChild(chatbotElement);
      }
    };
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
      if (scriptToRemove) scriptToRemove.remove();
      if (chatbotContainerRef.current) chatbotContainerRef.current.innerHTML = '';
    };
  }, []);

  return (
    <Layout>
      {/* Hero Section — Globe + Title */}
      <section className="hero">
        <StarrySky />
        <div className="hero-grid">
          <div className="hero-text">
            <p className="hero-eyebrow">
              {getContent('hero', 'subtitle', 'Changing lives in over 120 Countries')}
            </p>
            <div className="hero-brand">
              <img
                ref={heroLogoRef}
                src="/logo_heart.png"
                alt="The Compassion Course"
                className="hero-logo"
              />
              <div className="hero-brand-text">
                <h1 className="hero-heading">The<br />Compassion<br />Course</h1>
                <span id="hero-subtitle">with <a href="https://thombond.com/">Thom Bond</a></span>
              </div>
            </div>
            <p className="hero-description">
              {getContent('hero-stats', 'stat1-description',
                'An internationally recognized personal growth and development community with more than 30,000 participants worldwide.'
              )}
            </p>
            <div className="hero-buttons">
              <Link to="/learn-more" className="btn-primary">
                {getContent('hero', 'ctaPrimary', 'Learn More')}
              </Link>
              <JotformPopup
                formId={JOTFORM_FORM_ID}
                buttonText={getContent('hero', 'ctaSecondary', 'Register Now')}
              />
            </div>
          </div>
          <div className="hero-globe">
            <Globe />
          </div>
        </div>
      </section>

      {/* Why Peace Education Matters */}
      <section className="home-impact reveal">
        <div className="container">
          <h2 className="section-title">Why Peace Education Matters</h2>
          <div className="home-impact-content">
            <div className="home-impact-text">
              <h3 className="home-impact-subhead">It Has Been Proven to Work</h3>
              <p>
                This course provides the practical "how to" of creating more understanding,
                empathy, and compassion in our daily lives. The course starts with foundational
                concepts and practices that help us understand what engenders compassion and what
                blocks it, and as the year progresses, we work with more advanced practices that
                help us effectively bring more compassion into our everyday lives.
              </p>
              <h3 className="home-impact-subhead">Be Part of a Growing, Global Community</h3>
              <p>
                What began as a weekly email to share the tools of compassionate communication
                has grown into a vibrant community of tens of thousands around the world. Today,
                The Compassion Course is available in almost every major populated area on earth,
                on every side of every conflict, in native languages &mdash; a single, universal
                learning and teaching community.
              </p>
            </div>
            <div className="home-impact-image">
              <img
                src="/images/how-it-works-video.jpg"
                alt="The Compassion Course — how it works"
                loading="lazy"
              />
            </div>
          </div>
          <div className="home-impact-stats">
            <div className="home-impact-stat">
              <div className="home-impact-stat-number">14</div>
              <div className="home-impact-stat-label">Years Running</div>
            </div>
            <div className="home-impact-stat">
              <div className="home-impact-stat-number">50,000+</div>
              <div className="home-impact-stat-label">Registrations</div>
            </div>
            <div className="home-impact-stat">
              <div className="home-impact-stat-number">120+</div>
              <div className="home-impact-stat-label">Countries</div>
            </div>
            <div className="home-impact-stat">
              <div className="home-impact-stat-number">20</div>
              <div className="home-impact-stat-label">Languages</div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="home-outcomes reveal">
        <div className="container">
          <div className="home-outcomes-inner">
            <div className="home-outcomes-text">
              <h2 className="section-title" style={{ textAlign: 'left' }}>What You'll Learn</h2>
              <div className="home-outcomes-grid">
                <div className="home-outcomes-item reveal">
                  <i className="fas fa-check-circle home-outcomes-icon"></i>
                  <span>Develop awareness of feelings in yourself and others</span>
                </div>
                <div className="home-outcomes-item reveal">
                  <i className="fas fa-check-circle home-outcomes-icon"></i>
                  <span>Identify and articulate universal human needs</span>
                </div>
                <div className="home-outcomes-item reveal">
                  <i className="fas fa-check-circle home-outcomes-icon"></i>
                  <span>Navigate conflict using "needs awareness"</span>
                </div>
                <div className="home-outcomes-item reveal">
                  <i className="fas fa-check-circle home-outcomes-icon"></i>
                  <span>Use self-empathy for clearer decision making</span>
                </div>
                <div className="home-outcomes-item reveal">
                  <i className="fas fa-check-circle home-outcomes-icon"></i>
                  <span>Recognize and overcome judgment and criticism</span>
                </div>
                <div className="home-outcomes-item reveal">
                  <i className="fas fa-check-circle home-outcomes-icon"></i>
                  <span>Build a personal self-empathy and empathy support system</span>
                </div>
                <div className="home-outcomes-item reveal">
                  <i className="fas fa-check-circle home-outcomes-icon"></i>
                  <span>Have your needs expressed and understood</span>
                </div>
                <div className="home-outcomes-item reveal">
                  <i className="fas fa-check-circle home-outcomes-icon"></i>
                  <span>Create constructive dialogues with conflict resolution tools</span>
                </div>
                <div className="home-outcomes-item reveal">
                  <i className="fas fa-check-circle home-outcomes-icon"></i>
                  <span>Increase alignment between your values and actions</span>
                </div>
                <div className="home-outcomes-item reveal">
                  <i className="fas fa-check-circle home-outcomes-icon"></i>
                  <span>Join the Global Compassion Network community</span>
                </div>
                <div className="home-outcomes-item reveal">
                  <i className="fas fa-check-circle home-outcomes-icon"></i>
                  <span>Access "Mentor," the AI Compassion Mentor</span>
                </div>
              </div>
            </div>
            <div className="home-outcomes-image">
              <img
                src="/images/thom-conference.jpg"
                alt="Thom Bond leading a Compassion Course conference"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sample the Course */}
      <section className="home-sample reveal">
        <div className="container">
          <h2 className="section-title">Sample the Course</h2>
          <p className="section-description">
            Get a feel for how each weekly lesson works. Every message includes a concept,
            a real story, and a practice you can try right away.
          </p>
          <div className="home-sample-grid">
            {sampleWeeks.map((sample) => (
              <div key={sample.week} className="home-sample-card reveal">
                <div className="home-sample-week">Sample Week {sample.week}</div>
                <h3>{sample.title}</h3>
                <p className="home-sample-description">{sample.description}</p>
                <div className="home-sample-detail">
                  <div className="home-sample-detail-item">
                    <i className="fas fa-book-open"></i>
                    <div>
                      <strong>The Story</strong>
                      <p>{sample.story}</p>
                    </div>
                  </div>
                  <div className="home-sample-detail-item">
                    <i className="fas fa-hands"></i>
                    <div>
                      <strong>The Practice</strong>
                      <p>{sample.practice}</p>
                    </div>
                  </div>
                </div>
                <Link to={sample.link} className="home-sample-link">
                  Read the full sample <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="social-proof reveal">
        <div className="container">
          <div className="social-proof-inner">
            <div className="social-proof-quote-mark">&ldquo;</div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="social-proof-content"
              >
                <p className="social-proof-quote">
                  {testimonials[currentTestimonial].quote}
                </p>
                <div className="social-proof-author">
                  <span className="social-proof-name">{testimonials[currentTestimonial].name}</span>
                  <span className="social-proof-role">{testimonials[currentTestimonial].role}</span>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="social-proof-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`social-proof-dot ${i === currentTestimonial ? 'active' : ''}`}
                  onClick={() => setCurrentTestimonial(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Course Includes */}
      <section className="home-components reveal">
        <div className="container">
          <h2 className="section-title">The Course Includes</h2>
          <p className="section-description">
            Everything you need for a full year of guided learning, practice, and community support.
          </p>
          <div className="home-components-grid">
            <div className="value-card reveal reveal-delay-1">
              <div className="value-icon">
                <i className="fas fa-envelope-open-text"></i>
              </div>
              <h3>52 Weekly Messages</h3>
              <p>
                A new lesson every Wednesday at noon ET &mdash; each one with a concept to learn,
                a real story that illustrates it, and a practice to integrate into daily life.
                Over 50 concepts and differentiations covering self-empathy, empathy, anger,
                beliefs, dialogue, appreciation, and more.
              </p>
              <Link to="/learn-more#peek-inside" className="value-card-link">
                See the first 10 weeks <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="value-card reveal reveal-delay-2">
              <div className="value-icon">
                <i className="fas fa-video"></i>
              </div>
              <h3>12 Monthly Conferences</h3>
              <p>
                Live 90-minute Zoom sessions with Thom Bond and guest trainers from around
                the globe, every second Monday of the month. Interactive Q&amp;A, group practice,
                and deeper exploration. All sessions are recorded and accessible anytime.
              </p>
              <Link to="/learn-more#about-thom" className="value-card-link">
                Meet Thom Bond <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="value-card reveal reveal-delay-3">
              <div className="value-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Global Compassion Network</h3>
              <p>
                The upgraded online community where participants connect worldwide &mdash;
                discussion groups, empathy buddies, practice partners, mentors, empathy
                caf&eacute;s, and specialized groups for parenting, relationships, workplace
                issues, and more.
              </p>
              <Link to="/learn-more#options-extras" className="value-card-link">
                See community options <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="value-card reveal reveal-delay-1">
              <div className="value-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h3>Special Training Sessions</h3>
              <p>
                Intermediate and advanced sessions offered at critical points in the course.
                An Empathy session and a Working with Anger session &mdash; designed to help
                participants successfully integrate these skills into daily life.
              </p>
              <Link to="/learn-more#what-makes-different" className="value-card-link">
                What makes this different <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="value-card reveal reveal-delay-2">
              <div className="value-icon">
                <i className="fas fa-star"></i>
              </div>
              <h3>Options &amp; Extras</h3>
              <p>
                Practice groups led by certified facilitators, an optional Certificate of
                Completion with progress tracking and journaling, one-on-one mentoring with
                alumni, and an Empathy Buddy Network for year-round support.
              </p>
              <Link to="/learn-more#options-extras" className="value-card-link">
                Explore options &amp; extras <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            <div className="value-card reveal reveal-delay-3">
              <div className="value-icon">
                <i className="fas fa-award"></i>
              </div>
              <h3>Leadership Opportunities</h3>
              <p>
                Alumni can join the Organizer/Facilitator Community to lead practice groups
                worldwide, or join the Mentor Community to guide newer participants &mdash;
                deepening their own practice while giving back.
              </p>
              <Link to="/learn-more#how-it-works" className="value-card-link">
                How the course works <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Available Worldwide */}
      <section className="home-languages reveal">
        <div className="container">
          <h2 className="section-title">Available in 20 Languages</h2>
          <p className="section-description">
            The Compassion Course is translated and facilitated by dedicated teams around the world,
            each with their own monthly conferences in their native language.
          </p>
          <div className="home-languages-grid">
            {([
              { en: 'English', native: 'English' },
              { en: 'German', native: 'Deutsch', url: 'https://www.mitgefuehl-als-weg.com/' },
              { en: 'Spanish', native: 'Español', url: 'https://www.elcursodecompasion.org/' },
              { en: 'Arabic', native: 'عربى', url: 'https://www.altarahum.com/' },
              { en: 'Turkish', native: 'Türkçe', url: 'http://www.sefkatkursu.org/' },
              { en: 'Portuguese', native: 'Português', url: 'https://www.cursodacompaixao.com.br' },
              { en: 'Polish', native: 'Polski', url: 'https://praktykawspolczucia.pl/' },
              { en: 'Dutch', native: 'Nederlands', url: 'http://cursus.compassiecursus.nl' },
              { en: 'Finnish', native: 'Suomi', url: 'https://www.kuukorento.fi/fi/tuote/24421369-thom-bond-myttunnon-kirja' },
              { en: 'French', native: 'Français', url: 'https://coursdecompassion.fr' },
              { en: 'Italian', native: 'Italiano', url: 'https://www.compassioncourse.it' },
              { en: 'Greek', native: 'Ελληνικά', url: 'https://www.cco.gr/' },
              { en: 'Romanian', native: 'Română', url: 'https://comunicarenonviolenta.ro/curs-compasiune-online/' },
              { en: 'Hebrew', native: 'עברית', url: 'https://www.compassioncommunity.cc/' },
              { en: 'Russian', native: 'Русский', url: 'https://nycnvc.wufoo.com/forms/sd7yd1b0g4vi2z/' },
              { en: 'Chinese', native: '中文', url: 'https://nycnvc.wufoo.com/forms/s4bymh30l5keb3/' },
              { en: 'Japanese', native: '日本語' },
              { en: 'Korean', native: '한국어' },
              { en: 'Hindi', native: 'हिन्दी', url: 'https://nycnvc.wufoo.com/forms/sbe2la00nka1p1/' },
              { en: 'Swedish', native: 'Svenska' },
            ] as { en: string; native: string; url?: string }[]).map((lang) =>
              lang.url ? (
                <a
                  key={lang.en}
                  href={lang.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-language-tag home-language-tag--link"
                  title={`${lang.en} — ${lang.native}`}
                >
                  <span className="home-language-native">{lang.native}</span>
                  <span className="home-language-en">{lang.en}</span>
                </a>
              ) : (
                <span key={lang.en} className="home-language-tag" title={lang.en}>
                  <span className="home-language-native">{lang.native}</span>
                  <span className="home-language-en">{lang.en}</span>
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="register" className="cta reveal">
        <div className="container">
          <div className="cta-content">
            <h2>Registration Opens March 1st, 2026</h2>
            <p>
              The next Compassion Course begins June 24th, 2026. Join 50,000+ people
              who have taken this journey toward more compassionate living.
            </p>
            <div className="cta-buttons">
              <JotformPopup
                formId={JOTFORM_FORM_ID}
                buttonText="Register for the Course"
              />
              <Link to="/learn-more" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ElevenLabs Chatbot Widget - scaled to ~67% */}
      <div ref={chatbotContainerRef} className="chatbot-widget-container" />
    </Layout>
  );
};

export default HomePage;
