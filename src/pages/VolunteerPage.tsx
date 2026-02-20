import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import JotformPopup from '../components/JotformPopup';
import { useScrollReveal } from '../hooks/useScrollReveal';

const JOTFORM_FORM_ID = import.meta.env.VITE_JOTFORM_FORM_ID || '260333329475357';

const VolunteerPage: React.FC = () => {
  useScrollReveal();

  return (
    <Layout>
      {/* Hero */}
      <section className="volunteer-hero">
        <div className="volunteer-hero-overlay"></div>
        <div className="container volunteer-hero-content">
          <span className="volunteer-hero-eyebrow">Get Involved</span>
          <h1 className="volunteer-hero-heading">Help Spread Compassion</h1>
          <p className="volunteer-hero-description">
            Our ability to offer this course to anyone in the world is sustained by
            participants telling others about it and community members helping each
            other integrate this work.
          </p>
        </div>
      </section>

      {/* Ways to Help */}
      <section className="volunteer-ways reveal">
        <div className="container">
          <h2 className="section-title">Things You Can Do</h2>
          <p className="volunteer-ways-subtitle">
            Every small action helps grow a more compassionate world.
          </p>
          <div className="volunteer-ways-grid">

            <div className="volunteer-card reveal">
              <div className="volunteer-card-accent"></div>
              <span className="volunteer-card-eyebrow">Step 1</span>
              <h3>Share with Friends &amp; Family</h3>
              <p>
                It makes a big difference when someone who doesn&rsquo;t know about
                the course hears about it from someone they know. Share our invitation
                link with friends, a list-serv, or an online group you belong to.
              </p>
              <div className="volunteer-card-action">
                <span className="volunteer-link-box">
                  <i className="fas fa-link"></i>
                  compassioncourse.org/invitation
                </span>
                <p className="volunteer-card-note">
                  We created this page specifically for people you want to invite, so
                  you don&rsquo;t have to do much of the talking.
                </p>
              </div>
            </div>

            <div className="volunteer-card reveal">
              <div className="volunteer-card-accent"></div>
              <span className="volunteer-card-eyebrow">Step 2</span>
              <h3>Share on Social Media</h3>
              <p>
                Many people who wouldn&rsquo;t usually hear about the course find out
                through social media. Share pictures with quotes that we&rsquo;ve already
                prepared &mdash; information about the course travels far and wide.
              </p>
              <div className="volunteer-social-links">
                <a
                  href="https://www.facebook.com/TheCompassionCourse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="volunteer-social-btn"
                  aria-label="Share on Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="https://www.instagram.com/thecompassioncourse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="volunteer-social-btn"
                  aria-label="Share on Instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://twitter.com/CompassCourse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="volunteer-social-btn"
                  aria-label="Share on Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>

            <div className="volunteer-card reveal">
              <div className="volunteer-card-accent"></div>
              <span className="volunteer-card-eyebrow">Step 3</span>
              <h3>Post a Flyer in Your Community</h3>
              <p>
                Have a local bulletin board where people might be interested? Print
                and post our flyer in coffee shops, libraries, community centers, yoga
                studios, and other gathering places.
              </p>
              <div className="volunteer-card-action">
                <a
                  href="https://www.dropbox.com/scl/fo/r5w86cmm9e2vhi360dqzn/AL5G65VmhBVhMZU6uHSAnb4?dl=0&e=1&preview=CCO-2025.png&rlkey=j7jhp6n0fkokku7r799j1s03q"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="volunteer-flyer-btn"
                >
                  <i className="fas fa-image"></i> View &amp; Download the Flyer
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Message */}
      <section className="volunteer-growth reveal">
        <div className="container">
          <div className="volunteer-growth-inner">
            <div className="volunteer-growth-icon">
              <i className="fas fa-seedling"></i>
            </div>
            <h2>How the Course Grows</h2>
            <p className="volunteer-growth-lead">
              As we watched the course grow over the past years, it has become very
              clear that our ability to offer this course to anyone in the world is
              sustained by two things:
            </p>
            <div className="volunteer-growth-cards">
              <div className="volunteer-growth-card">
                <i className="fas fa-users"></i>
                <div>
                  <strong>Participants telling others about it.</strong>
                  <p>
                    Whether via Facebook, email, on the phone or at the dinner table,
                    our participants are the greatest single source of new registrations
                    and a continuously growing community.
                  </p>
                </div>
              </div>
              <div className="volunteer-growth-card">
                <i className="fas fa-hands-helping"></i>
                <div>
                  <strong>Community members helping each other.</strong>
                  <p>
                    Globally through our course message boards and conferences, and
                    locally through self-organized practice and study groups.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact + CTA */}
      <section className="volunteer-cta reveal">
        <div className="container">
          <div className="volunteer-cta-inner">
            <div className="volunteer-cta-text">
              <h2>Questions? Want to Get Involved?</h2>
              <p>
                If you have any questions or would like to contact us for any reason,
                we welcome your communication.
              </p>
              <p className="volunteer-cta-gratitude">
                With warmth and gratitude,<br />
                <strong>The Compassion Course Team</strong>
              </p>
              <div className="volunteer-contact-info">
                <a href="mailto:coursecoordinator@nycnvc.org" className="volunteer-contact-item">
                  <i className="fas fa-envelope"></i>
                  coursecoordinator@nycnvc.org
                </a>
                <a href="tel:+16462019226" className="volunteer-contact-item">
                  <i className="fas fa-phone"></i>
                  (646) 201-9226
                </a>
              </div>
            </div>
            <div className="volunteer-cta-register">
              <h3>Not Yet Registered?</h3>
              <p>Join 50,000+ people who have taken this journey toward more compassionate living.</p>
              <JotformPopup
                formId={JOTFORM_FORM_ID}
                buttonText="Register for the Course"
              />
              <Link to="/learn-more" className="volunteer-learn-link">
                Learn more about the course <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default VolunteerPage;
