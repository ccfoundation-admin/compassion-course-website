import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AnimatedText from '../components/AnimatedText';
import { useContent } from '../context/ContentContext';
import { renderHTML } from '../utils/contentUtils';

const HomePage: React.FC = () => {
  const { getContent } = useContent();
  const heroSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Initialize hero background image
    const heroSection = heroSectionRef.current;
    if (!heroSection) return;

    // Test if image loads
    const img = new Image();
    img.onload = function() {
      console.log('Hero background image loaded successfully');
      heroSection.classList.add('with-bg');
    };
    img.onerror = function() {
      console.error('Failed to load hero background image');
      // Keep the gradient background as fallback
    };
    img.src = '/hero-background.jpg';

    // Fallback: add class after a delay even if image doesn't load
    const fallbackTimeout = setTimeout(() => {
      if (!heroSection.classList.contains('with-bg')) {
        heroSection.classList.add('with-bg');
      }
    }, 2000);

    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, []);

  // Load ElevenLabs chatbot script
  useEffect(() => {
    // Check if script is already loaded
    if (document.querySelector('script[data-elevenlabs-chatbot]')) {
      return;
    }

    // ============================================
    // ELEVENLABS CHATBOT CONFIGURATION
    // ============================================
    // Replace the configuration below with your actual ElevenLabs embed code
    // You can find this in your ElevenLabs dashboard under your Conversational AI agent
    
    // Option 1: If your embed code is a script URL with attributes
    // Uncomment and update these lines with your values:
    /*
    const script = document.createElement('script');
    script.src = 'YOUR_ELEVENLABS_SCRIPT_URL_HERE';
    script.setAttribute('data-conversational-ai-id', 'YOUR_AGENT_ID_HERE');
    script.setAttribute('data-elevenlabs-chatbot', 'true');
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    */

    // Option 2: If your embed code includes inline initialization
    // You can add it here or create a separate function to initialize the widget
    // Example:
    /*
    const initElevenLabsChatbot = () => {
      // Paste your ElevenLabs initialization code here
      // This might include window.elevenlabs or similar global object initialization
    };
    initElevenLabsChatbot();
    */

    // Option 3: If you have a complete script tag from ElevenLabs
    // You can use dangerouslySetInnerHTML or create the script element with all attributes
    // Make sure to include all data attributes and configuration from your embed code

    // Cleanup function
    return () => {
      const existingScript = document.querySelector('script[data-elevenlabs-chatbot]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section id="home" className="hero" ref={heroSectionRef}>
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              {getContent('hero', 'title', 'Discover The Compassion Course')}
            </h1>
            <p className="hero-subtitle">
              {getContent('hero', 'subtitle', 'Changing lives in over 120 Countries')}
            </p>
            <AnimatedText />

            <div className="hero-buttons">
              <a href="#learn-more" className="btn-primary">
                {getContent('hero', 'ctaPrimary', 'Learn More About The Course')}
              </a>
              <a href="#introduction" className="btn-secondary">
                {getContent('hero', 'ctaSecondary', 'Watch an Interactive Introduction')}
              </a>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <h3>{getContent('hero-stats', 'stat1-title', 'Global Leader')}</h3>
              <p dangerouslySetInnerHTML={renderHTML(
                getContent('hero-stats', 'stat1-description', 
                  'Compassion Course is an internationally recognized personal and professional growth, training, and development company with a community of more than 30,000 participants.')
              )} />
            </div>
            <div className="stat-item">
              <h3>{getContent('hero-stats', 'stat2-title', 'Leading-Edge Methodology')}</h3>
              <p dangerouslySetInnerHTML={renderHTML(
                getContent('hero-stats', 'stat2-description',
                  'Our industry-leading approach enables people to both produce extraordinary results and enhance the quality of their lives through our proprietary technology.')
              )} />
            </div>
            <div className="stat-item">
              <h3>{getContent('hero-stats', 'stat3-title', 'Individualized Impact')}</h3>
              <p dangerouslySetInnerHTML={renderHTML(
                getContent('hero-stats', 'stat3-description',
                  'Designed to make a unique difference for each participant, independent surveys show <em>"94% of participants agree The Compassion Course made a profound and lasting difference in their lives."</em>')
              )} />
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="programs">
        <div className="container">
          <h2 className="section-title">
            {getContent('programs', 'title', 'After The Compassion Course - A World of Possibilities')}
          </h2>
          <p className="section-description" dangerouslySetInnerHTML={renderHTML(
            getContent('programs', 'description',
              'Discover a world of possibilities where you continue to expand your power, effectiveness, and self-expression; where you can make a difference; or where you can participate with our Global Community – delivered in various formats and all designed to empower you to impact what you care about most.')
          )} />
          
          <div className="programs-grid">
            <div className="program-card">
              <div className="program-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3>Advanced Programs</h3>
              <p>From in-depth weekend courses to weekly seminars, from one-on-one coaching to powerful on-demand content, we deliver a large range of offerings that will have you realize what matters most to you.</p>
              <a href="#advanced" className="program-link">Explore Advanced Programs</a>
            </div>

            <div className="program-card">
              <div className="program-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>The Community</h3>
              <p>Participate in one or all of the networks that make up the rich and diverse Compassion Course Community – engage in unique, powerful and fun conversations in areas that interest you.</p>
              <a href="#community" className="program-link">Join the Community</a>
            </div>

            <div className="program-card">
              <div className="program-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Make a Difference</h3>
              <p>Through our industry leading training, the Compassion Course Training Academy powerfully expands your ability to be a leader and make a difference in the lives of others.</p>
              <a href="#training" className="program-link">Learn About Training</a>
            </div>

            <div className="program-card">
              <div className="program-icon">
                <i className="fas fa-building"></i>
              </div>
              <h3>Corporate Programs</h3>
              <p>Discover why thousands of businesses encourage their employees to attend our public programs to cause breakthroughs in their individual performance.</p>
              <a href="#corporate" className="program-link">Corporate Solutions</a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <h2 className="section-title">
            {getContent('testimonials', 'title', 'What People Say')}
          </h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The Compassion Course completely transformed how I approach relationships and challenges. I discovered tools I never knew I had within me."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <span>Marketing Executive</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"In just three days, I gained clarity on what was holding me back in my career and personal life. The results have been extraordinary."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Michael Chen</h4>
                  <span>Software Engineer</span>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The community aspect is incredible. I've made lifelong connections with people who are committed to growth and making a difference."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Emily Rodriguez</h4>
                  <span>Nonprofit Director</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compass Companion Section */}
      <section id="compass-companion" className="compass-companion">
        <div className="container">
          <div className="compass-companion-content">
            <a 
              href="https://www.compass-companions.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="compass-companion-link"
            >
              Compass Companion
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>{getContent('about', 'title', 'About the Compassion Course')}</h2>
              <p dangerouslySetInnerHTML={renderHTML(
                getContent('about', 'description',
                  'Changing Lives for 14 Years, with more than 30,000 Participants, in over 120 Countries, in 20 Languages.')
              )} />
              <div className="about-stats">
                <div className="stat">
                  <h3>{getContent('about', 'stat1-value', '30,000+')}</h3>
                  <p>{getContent('about', 'stat1-label', 'Participants')}</p>
                </div>
                <div className="stat">
                  <h3>{getContent('about', 'stat2-value', '120+')}</h3>
                  <p>{getContent('about', 'stat2-label', 'Countries')}</p>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="team-photo-grid-main" id="team-photo-grid-main">
                {/* Team photos will be loaded here */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="register" className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>{getContent('cta', 'title', 'Ready to Transform Your Life?')}</h2>
            <p dangerouslySetInnerHTML={renderHTML(
              getContent('cta', 'description',
                'Join thousands of others who have discovered their potential through the Compassion Course.')
            )} />
            <div className="cta-buttons">
              <a href="#schedule" className="btn-primary">
                {getContent('cta', 'buttonPrimary', 'Check out our Course Schedule')}
              </a>
              <Link to="/contact" className="btn-secondary">
                {getContent('cta', 'buttonSecondary', 'Contact Us Today')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ElevenLabs Chatbot Placeholder - Replace with actual embed code when available */}
      <div
        id="elevenlabs-chatbot-container"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          cursor: 'pointer'
        }}
        onClick={() => {
          alert('Chatbot placeholder - ElevenLabs code will be added here');
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
          }}
        >
          <i 
            className="fas fa-comments" 
            style={{
              color: '#ffffff',
              fontSize: '24px'
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
