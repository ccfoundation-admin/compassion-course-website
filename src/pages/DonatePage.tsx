import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import FluidGradient from '../components/FluidGradient';
import { siteContent } from '../data/siteContent';

const { donate } = siteContent;

const DonatePage: React.FC = () => {
  return (
    <Layout>
      <section className="donate-page">
        <FluidGradient />

        <div className="donate-page-inner">
          <span className="donate-hero-eyebrow">{donate.hero.eyebrow}</span>
          <h1 className="donate-hero-heading">{donate.hero.heading}</h1>
          <p className="donate-hero-description">{donate.hero.description}</p>
          <a
            href={donate.hero.buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="donate-btn"
          >
            <i className="fab fa-paypal"></i> {donate.hero.buttonText}
          </a>
          <div className="donate-page-footer">
            {donate.hero.footerLinks.map((link, i) => (
              <React.Fragment key={link.href}>
                {i > 0 && <span className="donate-page-sep">&middot;</span>}
                <Link to={link.href}>{link.text}</Link>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DonatePage;
