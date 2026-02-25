import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission to backend/Firebase
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout>
      <section className="contact-page">
        <div className="container">
          <div className="contact-layout">

            {/* Left: contact info */}
            <div className="contact-info-side">
              <div className="contact-info-block">
                <div className="contact-info-icon">
                  <i className="fas fa-envelope" />
                </div>
                <div>
                  <h3>Email Us</h3>
                  <a href="mailto:coursecoordinator@nycnvc.org">coursecoordinator@nycnvc.org</a>
                </div>
              </div>

              <div className="contact-info-block">
                <div className="contact-info-icon">
                  <i className="fas fa-phone" />
                </div>
                <div>
                  <h3>Call Us</h3>
                  <a href="tel:+16462019226">(646) 201-9226</a>
                </div>
              </div>

              <div className="contact-info-block">
                <div className="contact-info-icon">
                  <i className="fas fa-map-marker-alt" />
                </div>
                <div>
                  <h3>Our Office</h3>
                  <p>
                    NYCNVC<br />
                    645 Gardnertown Road<br />
                    Newburgh, NY 12550
                  </p>
                </div>
              </div>

              {/* FAQ hint */}
              <div className="contact-faq-hint">
                <i className="fas fa-lightbulb" />
                <span>
                  Check our <Link to="/learn-more#faq">FAQ</Link> — your question may already
                  be answered there.
                </span>
              </div>

              {/* Happy cat mascot */}
              <div className="contact-cat">
                <div className="contact-cat-bubble">We'd love to hear from you!</div>
                <img src="/images/happy_cat.jpg" alt="Happy cat" className="contact-cat-img" />
              </div>
            </div>

            {/* Right: form */}
            <div className="contact-form-wrap">
              <h2>Send a Message</h2>
              <p className="contact-form-intro">
                All fields marked with <span className="contact-required">*</span> are required.
              </p>

              {submitted ? (
                <div className="contact-success">
                  <i className="fas fa-check-circle" />
                  <div>
                    <strong>Message sent!</strong>
                    <p>Thank you for reaching out. We'll get back to you shortly.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="contact-form-group">
                    <label htmlFor="email">Email <span className="contact-required">*</span></label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="contact-form-group">
                    <label htmlFor="subject">Subject <span className="contact-required">*</span></label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is this regarding?"
                    />
                  </div>
                  <div className="contact-form-group">
                    <label htmlFor="message">Message <span className="contact-required">*</span></label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us how we can help..."
                      rows={6}
                    />
                  </div>
                  <button type="submit" className="btn-primary contact-submit-btn">
                    <i className="fas fa-paper-plane" /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
