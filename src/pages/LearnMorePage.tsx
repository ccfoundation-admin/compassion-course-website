import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import JotformPopup from '../components/JotformPopup';
import { useScrollReveal } from '../hooks/useScrollReveal';

const JOTFORM_FORM_ID = import.meta.env.VITE_JOTFORM_FORM_ID || '260333329475357';

const weeklyTopics = [
  { week: 1, title: 'Everything We Do, We Do to Meet a Need' },
  { week: 2, title: 'Most of Us Were Taught Something Else' },
  { week: 3, title: 'We Are All Equipped with Onboard Need Radar' },
  { week: 4, title: "What's the Big Deal with Needs?" },
  { week: 5, title: 'Empathy, the Breath of Compassion' },
  { week: 6, title: 'Hidden Judgments' },
  { week: 7, title: 'More About Feelings' },
  { week: 8, title: 'The Wisdom Inside the Judgment' },
  { week: 9, title: 'Why Is This So Bleeping Hard?' },
  { week: 10, title: "What Empathy Is... and What It's Not" },
];

const faqs = [
  {
    question: 'When does the course start and when does registration open?',
    answer: 'The Compassion Course is offered once a year. It begins each June and runs for 52 consecutive weeks. Registration opens March 1st and closes the second Wednesday of July every year.',
  },
  {
    question: 'How does the course work?',
    answer: 'You\u2019ll receive a welcome email before launch with everything you need to get started. Each Wednesday at noon Eastern Time, a new lesson is delivered directly to your email inbox for 52 weeks. Monthly 90-minute live conferences are hosted by Thom Bond on the second Monday of each month at 12 PM ET via Zoom. You also get access to the Global Compassion Network \u2014 the online community hub with forums, practice groups, mentors, and resources.',
  },
  {
    question: 'How much time does it take each week?',
    answer: 'Each Wednesday lesson takes about 15\u201320 minutes to read. The real learning happens through brief practice moments woven into your everyday life \u2014 conversations, reactions, quiet reflections. No extra time block required. The course is ungraded, so you can participate at whatever level fits your schedule and energy.',
  },
  {
    question: 'Who teaches the course?',
    answer: 'Thom Bond wrote the Compassion Course and leads the monthly conferences. He brings over 20 years of experience studying and teaching compassionate communication, and co-founded the New York Center for Nonviolent Communication (NYCNVC), a United Nations Civil Society Organization.',
  },
  {
    question: 'Do I need any prior experience with NVC?',
    answer: 'Not at all. The course starts from the ground up and builds gradually over 52 weeks. Whether you\'ve never heard of Nonviolent Communication or you\'ve been practicing for years, the weekly rhythm meets you where you are.',
  },
  {
    question: 'What if I fall behind on weekly lessons?',
    answer: 'All 52 lessons and conference recordings remain accessible throughout the year. There are no deadlines or grades. Many participants revisit earlier lessons as their understanding deepens \u2014 the course is designed for exactly that.',
  },
  {
    question: 'When are the monthly conferences, and are they recorded?',
    answer: 'Monthly conferences take place on the second Monday of each month at 12:00 PM Eastern Time via Zoom (video or phone). All conferences are recorded and made available to all participants \u2014 you can access recordings at any time throughout the course via the weekly message links.',
  },
  {
    question: 'Can I communicate with other participants?',
    answer: 'Yes! Participants receive an invitation to join the Global Compassion Network, the private online community. There you\u2019ll find discussion forums, practice groups, empathy buddies, mentors, and specialized groups for parenting, relationships, workplace issues, and more.',
  },
  {
    question: 'Is the Global Compassion Network required?',
    answer: 'No, joining the Global Compassion Network is not required. However, it provides access to recordings, practice groups, mentors, discussion forums, and the empathy buddy directory \u2014 so it is highly recommended.',
  },
  {
    question: 'Is the course available in other languages?',
    answer: 'Yes. The Compassion Course is translated and facilitated in 20 languages including Arabic, German, Spanish, Turkish, Portuguese, Polish, Dutch, Italian, and Finnish. Each language community has its own dedicated team and monthly conferences.',
  },
  {
    question: 'Is there a certification option?',
    answer: 'Yes. You can earn a Certificate of Completion by tracking your weekly progress and keeping a private online journal throughout the year. Attending monthly conferences can also count toward CNVC certification hours \u2014 up to 18 hours from 12 calls. Organizer/Facilitator Track participants may earn additional hours. We recommend confirming with your assessor.',
  },
  {
    question: 'What is the cost? Is financial help available?',
    answer: 'Tuition is announced each March 1st when registration opens. Accessibility is a founding value of the course \u2014 the course is available to everyone regardless of ability to pay, and alternative payment options are available so that cost is never a barrier to participation.',
  },
  {
    question: 'How are refunds and cancellations handled?',
    answer: 'Full refunds are available if you cancel 7 or more days before the course start date, minus a $30 coordination fee. Cancellations within 7 days of the start or during the course receive no refund but a credit toward a future training. For questions, contact coursecoordinator@nycnvc.org or call (646) 201-9226.',
  },
];

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
          alt="Group of friends sitting together with arms around each other looking out at the view"
          className="learn-hero-bg"
        />
        <div className="learn-hero-overlay" />
        <div className="learn-hero-content">
          <div className="learn-hero-inner">
            <p className="learn-hero-eyebrow">A Year-Long Journey in Compassion</p>
            <h1 className="learn-hero-heading">
              52 Weeks That Change How You<br />
              Relate to Yourself and Others
            </h1>
            <p className="learn-hero-description">
              Since 2011, The Compassion Course has guided over 50,000 people across
              120+ countries through a practical, week-by-week path to deeper empathy,
              honest communication, and real connection — built on the work of
              Marshall Rosenberg and Nonviolent Communication.
            </p>
            <div className="learn-hero-buttons">
              <JotformPopup
                formId={JOTFORM_FORM_ID}
                buttonText="Register Now"
              />
              <a href="#how-it-works" className="btn-secondary">
                See How It Works
              </a>
            </div>
          </div>
          <div className="learn-stats-grid">
            <div className="learn-stat-card">
              <div className="learn-stat-number">50,000+</div>
              <div className="learn-stat-label">People Have Taken the Course</div>
            </div>
            <div className="learn-stat-card">
              <div className="learn-stat-number">120+</div>
              <div className="learn-stat-label">Countries Represented</div>
            </div>
            <div className="learn-stat-card">
              <div className="learn-stat-number">20</div>
              <div className="learn-stat-label">Languages Available</div>
            </div>
            <div className="learn-stat-card">
              <div className="learn-stat-number">14</div>
              <div className="learn-stat-label">Years Running</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Origin Story — timeline + image */}
      <section className="learn-origin reveal">
        <div className="container">
          <h2 className="section-title">How It All Began</h2>
          <div className="learn-origin-inner">
            <div className="learn-origin-image">
              <img
                src="/images/origin-conversation.jpg"
                alt="Two people sharing a warm conversation over tea"
                loading="lazy"
              />
            </div>
            <div className="learn-origin-timeline">
              <div className="learn-origin-year">
                <span className="learn-origin-year-num">2002</span>
                <p>Thom Bond discovers Marshall Rosenberg's <em>Nonviolent Communication</em> and sees a human-oriented technology that changes everything.</p>
              </div>
              <div className="learn-origin-year">
                <span className="learn-origin-year-num">2003</span>
                <p>He closes his engineering firm, studies with Rosenberg, and co-founds the New York Center for Nonviolent Communication.</p>
              </div>
              <div className="learn-origin-year">
                <span className="learn-origin-year-num">2011</span>
                <p>The Compassion Course Online is born — one concept, one story, one practice per week, delivered by email for a full year.</p>
              </div>
              <div className="learn-origin-year">
                <span className="learn-origin-year-num">Today</span>
                <p>A global community spanning 120+ countries, 20 languages, with 50,000+ alumni and growing every year.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="learn-how reveal">
        <div className="container">
          <div className="learn-how-intro">
            <div className="learn-how-intro-text">
              <h2 className="section-title" style={{ textAlign: 'left' }}>How the Course Works</h2>
              <p className="section-description" style={{ textAlign: 'left', maxWidth: 'none' }}>
                No classrooms, no rigid schedules. The Compassion Course fits
                into the life you already have.
              </p>
            </div>
            <div className="learn-how-intro-image">
              <img
                src="/images/how-friends-laughing.jpg"
                alt="Group of friends laughing and enjoying time together"
                loading="lazy"
              />
            </div>
          </div>

          <div className="learn-how-steps">
            <div className="learn-how-step-card reveal">
              <div className="learn-how-step-number">1</div>
              <div className="learn-how-step-icon">
                <i className="fas fa-envelope-open-text"></i>
              </div>
              <h3>52 Wednesday Lessons</h3>
              <p>
                Starting in June, a new message is published via email every
                Wednesday at noon ET for 52 consecutive weeks. Each installment
                provides a concept to learn, a real story illustrating it, and
                practices for integrating it into daily life &mdash; plus links to
                previous weeks, videos, exercises, and supplementary resources.
                Over the year, you&rsquo;ll explore over 50 concepts covering
                self-empathy, empathy, emotional triggers, anger, beliefs,
                dialogue, appreciation, requests, and more.
              </p>
            </div>

            <div className="learn-how-step-card reveal">
              <div className="learn-how-step-number">2</div>
              <div className="learn-how-step-icon">
                <i className="fas fa-video"></i>
              </div>
              <h3>12 Monthly Conferences</h3>
              <p>
                Thom Bond, along with guest trainers from around the globe,
                hosts 12 monthly 90-minute conferences via Zoom on the second
                Monday of each month. Each session includes interactive Q&amp;A,
                group practice, and deeper exploration of the material.
                Conferences are also hosted in other languages by affiliated
                course leaders. All sessions are recorded and accessible at
                any time throughout the course.
              </p>
            </div>

            <div className="learn-how-step-card reveal">
              <div className="learn-how-step-number">3</div>
              <div className="learn-how-step-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Global Compassion Network</h3>
              <p>
                The online community where participants connect from around the
                globe. Ask questions, discuss course material, share successes
                and challenges. Access specialized discussion groups covering
                parenting, relationships, empathy skills, self-compassion, and
                workplace issues. Find practice groups, mentors, empathy buddies,
                practice partners, and empathy caf&eacute;s and circles. Create a
                personalized profile with credentials and connect with the
                worldwide community.
              </p>
            </div>

            <div className="learn-how-step-card reveal">
              <div className="learn-how-step-number">4</div>
              <div className="learn-how-step-icon">
                <i className="fas fa-robot"></i>
              </div>
              <h3>AI Compassion Mentor</h3>
              <p>
                Between lessons and calls, the digital AI Mentor is available
                anytime &mdash; trained on the full course material to help you work
                through real situations, practice skills, and stay on track.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Strip — community & kindness imagery */}
      <section className="learn-photo-strip">
        <div className="learn-photo-strip-inner">
          <div className="learn-photo-strip-item">
            <img
              src="/images/strip-grandparent.jpg"
              alt="Grandmother and grandchild smiling together"
              loading="lazy"
            />
          </div>
          <div className="learn-photo-strip-item">
            <img
              src="/images/strip-friends-diverse.jpg"
              alt="Diverse friends laughing together outdoors"
              loading="lazy"
            />
          </div>
          <div className="learn-photo-strip-item">
            <img
              src="/images/strip-woman-dog.jpg"
              alt="Woman smiling with her dog in a park"
              loading="lazy"
            />
          </div>
          <div className="learn-photo-strip-item">
            <img
              src="/images/strip-volunteers.jpg"
              alt="Volunteers smiling while working together"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* A Peek Inside the Course */}
      <section id="peek-inside" className="learn-peek reveal">
        <div className="container">
          <div className="learn-peek-header">
            <div className="learn-peek-header-text">
              <h2 className="section-title" style={{ textAlign: 'left' }}>A Peek Inside the Course</h2>
              <p className="section-description" style={{ textAlign: 'left', maxWidth: 'none' }}>
                The 52-week journey is built on one core idea: <strong>everything
                we do, we do to meet a need.</strong> Each week builds on the
                last, gradually shifting how you see yourself, others, and
                conflict itself.
              </p>
            </div>
            <div className="learn-peek-header-image">
              <img
                src="/images/peek-reflection.jpg"
                alt="Woman reflecting peacefully by a window with a book"
                loading="lazy"
              />
            </div>
          </div>
          <div className="learn-peek-columns">
            <div className="learn-peek-col">
              <h3 className="learn-peek-col-title">First 10 Weeks</h3>
              <div className="learn-peek-list">
                {weeklyTopics.map((topic) => (
                  <div key={topic.week} className="learn-peek-item">
                    <span className="learn-peek-week">{topic.week}</span>
                    <span className="learn-peek-title">{topic.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="learn-peek-col">
              <h3 className="learn-peek-col-title">Then You'll Explore</h3>
              <div className="learn-peek-topic-tags">
                <span className="learn-peek-tag">Boundaries</span>
                <span className="learn-peek-tag">Making Requests</span>
                <span className="learn-peek-tag">Anger &amp; Triggers</span>
                <span className="learn-peek-tag">Shame &amp; Guilt</span>
                <span className="learn-peek-tag">Observation vs. Evaluation</span>
                <span className="learn-peek-tag">Beliefs &amp; Thought Patterns</span>
                <span className="learn-peek-tag">Conflict Resolution</span>
                <span className="learn-peek-tag">Power Dynamics</span>
                <span className="learn-peek-tag">Appreciation</span>
                <span className="learn-peek-tag">Apologies</span>
                <span className="learn-peek-tag">Vulnerability</span>
                <span className="learn-peek-tag">Living with Compassion</span>
              </div>
              <p className="learn-peek-more">
                50+ concepts and differentiations across 52 weeks &mdash; each one
                practiced in real life, not just understood in theory.
              </p>
              <div className="learn-peek-sample-links">
                <a href="#sample-empathy" className="learn-peek-sample-link">
                  <i className="fas fa-file-alt"></i> Read Sample Week 1: Empathy
                </a>
                <a href="#sample-appreciation" className="learn-peek-sample-link">
                  <i className="fas fa-file-alt"></i> Read Sample Week 2: Appreciation
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Week 1 — Empathy */}
      <section id="sample-empathy" className="learn-sample reveal">
        <div className="container">
          <div className="learn-sample-header">
            <span className="learn-sample-badge">Sample Week 1</span>
            <h2 className="section-title">What Empathy Is&hellip; and What It&rsquo;s Not</h2>
          </div>
          <div className="learn-sample-body">
            <div className="learn-sample-concept">
              <h3><i className="fas fa-lightbulb"></i> The Concept</h3>
              <p>
                Most of us were taught to listen by formulating responses or solving problems
                rather than creating genuine connection. Empathy is different &mdash; it&rsquo;s the
                exploration of our human experience, our feelings, our needs, our life energy
                trying to emerge and guide us. It requires presence and curiosity about
                another&rsquo;s experience, rather than habits that fill the space instead of
                opening it up.
              </p>
              <p>
                The lesson identifies eight common non-empathic response patterns: comparing
                and one-upping, educating and advising, discounting, fixing and counseling,
                sympathizing, data gathering and interrogating, explaining and defending,
                and analyzing. Recognizing these habits is the first step toward real empathic
                listening.
              </p>
            </div>
            <div className="learn-sample-story">
              <h3><i className="fas fa-book-open"></i> The Story: &ldquo;The Car, the Clubs and the Cab Driver&rdquo;</h3>
              <p>
                A late-night cab ride to retrieve a borrowed car becomes an unexpected
                lesson in presence. When the driver mentions seeing the USS Intrepid, it
                triggers memories of his Vietnam service. Through non-directive listening
                and gentle empathic reflection, a space opens for the driver&rsquo;s long-held
                grief about returning home to hostility. The encounter ends with both men
                shaking hands &mdash; a moment of genuine human connection through the simple
                act of being truly heard.
              </p>
            </div>
            <div className="learn-sample-practice">
              <h3><i className="fas fa-hands"></i> The Practices</h3>
              <div className="learn-sample-practice-list">
                <div className="learn-sample-practice-item">
                  <strong>Practice 1 &mdash; Increase Your Awareness</strong>
                  <p>
                    Notice your own non-empathic communication patterns this week. When you
                    catch yourself advising, fixing, or sympathizing, pause and imagine an
                    empathic alternative using the feelings and needs lists.
                  </p>
                </div>
                <div className="learn-sample-practice-item">
                  <strong>Practice 2 &mdash; The Empathy/Non-Empathy Game</strong>
                  <p>
                    Working with a partner, one person shares a statement needing empathy.
                    The partner responds first with non-empathic patterns, then repeats with
                    an empathic response: &ldquo;Are you feeling ___ because you need more ___?&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Week 2 — Appreciation */}
      <section id="sample-appreciation" className="learn-sample learn-sample--alt reveal">
        <div className="container">
          <div className="learn-sample-header">
            <span className="learn-sample-badge">Sample Week 2</span>
            <h2 className="section-title">The Power of Appreciation</h2>
          </div>
          <div className="learn-sample-body">
            <div className="learn-sample-concept">
              <h3><i className="fas fa-lightbulb"></i> The Concept</h3>
              <p>
                There&rsquo;s a fundamental difference between praise and appreciation. Praise
                (&ldquo;good boy,&rdquo; &ldquo;nice job&rdquo;) is designed to control behavior
                through conditional approval. Authentic appreciation creates connection
                &mdash; it acknowledges what someone did and recognizes the value received,
                without attaching judgment.
              </p>
              <p>
                By connecting feelings to met needs, we begin to recognize the abundant
                &ldquo;metness&rdquo; constantly occurring in our lives &mdash; from bodily functions to
                environmental support to meaningful work. This practice of living in
                appreciation transforms our perspective and deepens satisfaction.
              </p>
            </div>
            <div className="learn-sample-story">
              <h3><i className="fas fa-book-open"></i> The Story: &ldquo;A Moving Experience&rdquo;</h3>
              <p>
                At a Barnes &amp; Noble bookstore, a father juggling purchases and a stroller
                attempts the escalator while his three-year-old son freezes at the top,
                unable to follow. A small act of kindness &mdash; helping the frightened child
                onto the moving stairs &mdash; becomes a profoundly meaningful exchange. The
                boy&rsquo;s look of relief and heartfelt &ldquo;thank you&rdquo; demonstrate what genuine
                appreciation feels like when we&rsquo;re fully present to receive it.
              </p>
            </div>
            <div className="learn-sample-practice">
              <h3><i className="fas fa-hands"></i> The Practices</h3>
              <div className="learn-sample-practice-list">
                <div className="learn-sample-practice-item">
                  <strong>Practice 1 &mdash; Awareness Check-In</strong>
                  <p>
                    Write a list of ten to twenty things currently happening and needs being
                    met right now (breathing/air, reading/learning, sitting/security). Notice
                    how this awareness affects your feelings.
                  </p>
                </div>
                <div className="learn-sample-practice-item">
                  <strong>Practice 2 &mdash; Appreciate Yourself</strong>
                  <p>
                    Write three ways you contribute to your own life. Identify the needs these
                    meet. Look in the mirror and say &ldquo;Thank you.&rdquo; (This practice is difficult
                    without smiling.)
                  </p>
                </div>
                <div className="learn-sample-practice-item">
                  <strong>Practice 3 &mdash; Share an Appreciation</strong>
                  <p>
                    Identify something someone said or did that met your needs. Describe what
                    happened, how it made you feel, and which needs were met. Share it in
                    person, by phone, email, or card.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes This Different */}
      <section id="what-makes-different" className="learn-different reveal">
        <div className="container">
          <div className="learn-different-hero">
            <img
              src="/images/hero-community.jpg"
              alt="Golden sunrise over misty green hills"
              loading="lazy"
            />
            <div className="learn-different-hero-overlay">
              <h2>What Makes This Different</h2>
              <p>
                This isn't a weekend workshop that fades by Monday.
                It's a year of gradual, real change.
              </p>
            </div>
          </div>
          <div className="learn-different-grid">
            <div className="learn-different-card reveal">
              <div className="learn-different-icon">
                <i className="fas fa-calendar-week"></i>
              </div>
              <h3>52 Weeks, Not 2 Days</h3>
              <p>
                Real change takes practice. The weekly rhythm gives concepts
                time to become habits — integrated into your actual life,
                not just understood in theory.
              </p>
            </div>
            <div className="learn-different-card reveal">
              <div className="learn-different-icon">
                <i className="fas fa-layer-group"></i>
              </div>
              <h3>Three Traditions Combined</h3>
              <p>
                Draws on Marshall Rosenberg's NVC, Werner Erhard's
                transformational approach, and Albert Ellis's cognitive
                techniques — a combination you won't find elsewhere.
              </p>
            </div>
            <div className="learn-different-card reveal">
              <div className="learn-different-icon">
                <i className="fas fa-globe-americas"></i>
              </div>
              <h3>Truly Global Access</h3>
              <p>
                Available in 20 languages with dedicated teams of translators
                and facilitators. Financial accessibility is a founding value —
                cost is never meant to be a barrier.
              </p>
            </div>
            <div className="learn-different-card reveal">
              <div className="learn-different-icon">
                <i className="fas fa-hands-helping"></i>
              </div>
              <h3>Community, Not Isolation</h3>
              <p>
                Empathy buddies, practice groups, mentors, monthly live
                sessions — you're not learning alone. The relationships
                you build are part of the transformation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Options & Extras */}
      <section id="options-extras" className="learn-options reveal">
        <div className="container">
          <h2 className="section-title">Options &amp; Extras</h2>
          <p className="section-description">
            Enhance your Compassion Course experience with additional resources and community support.
          </p>
          <div className="learn-options-list">
            <div className="learn-options-item reveal">
              <div className="learn-options-item-icon">
                <i className="fas fa-user-friends"></i>
              </div>
              <div className="learn-options-item-body">
                <h3>Practice Groups</h3>
                <p>
                  Join an online or in-person practice group led by certified
                  Organizer/Facilitators who receive ongoing guidance throughout
                  the course.
                </p>
              </div>
            </div>
            <div className="learn-options-item reveal">
              <div className="learn-options-item-icon">
                <i className="fas fa-certificate"></i>
              </div>
              <div className="learn-options-item-body">
                <h3>Certificate of Completion</h3>
                <p>
                  An optional track with added structure — track weekly progress,
                  keep a private journal, and receive faculty verification.
                </p>
              </div>
            </div>
            <div className="learn-options-item reveal">
              <div className="learn-options-item-icon">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <div className="learn-options-item-body">
                <h3>Mentoring Program</h3>
                <p>
                  Connect with alumni mentors via the Mentor Directory. Find someone
                  whose schedule, experience, and approach fit your needs.
                </p>
              </div>
            </div>
            <div className="learn-options-item reveal">
              <div className="learn-options-item-icon">
                <i className="fas fa-heart"></i>
              </div>
              <div className="learn-options-item-body">
                <h3>Empathy Support</h3>
                <p>
                  Monthly Empathy Caf&eacute;s, Empathy Circles with a 6-week training
                  program, and an Empathy Buddy Network for year-round practice.
                </p>
              </div>
            </div>
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
                  alt="Thom Bond, founder of The Compassion Course"
                  className="learn-founder-photo"
                  loading="lazy"
                />
              </div>
              <div className="learn-founder-quote-card">
                <div className="learn-founder-quote-mark">&ldquo;</div>
                <p className="learn-founder-quote-text">
                  My way of making the skills of compassionate living available
                  to anyone, regardless of time and money constraints.
                </p>
                <span className="learn-founder-quote-attr">&mdash; Thom Bond, on creating the course</span>
              </div>
            </div>
            <div className="learn-founder-text">
              <h2 className="section-title" style={{ textAlign: 'left' }}>Meet Thom Bond</h2>
              <p>
                Thom Bond spent the first half of his career as an environmental
                engineer — developing energy-auditing software, microprocessor-based
                building controls, and LED lighting products. He was good at it.
                But in 2002, when he encountered Marshall Rosenberg's work on
                Nonviolent Communication, he saw a different kind of technology —
                one oriented around people instead of buildings.
              </p>
              <p>
                He closed his engineering firm to study and teach with Rosenberg
                full-time. In 2003, Thom and Nellie Bright co-founded the
                New York Center for Nonviolent Communication (NYCNVC), now a
                United Nations Civil Society Organization. In 2011, he created
                The Compassion Course Online to bring these skills to anyone in
                the world.
              </p>
              <p>
                Today, Thom leads monthly live conferences for participants,
                trains Organizer/Facilitators who run local practice groups
                worldwide, and continues developing new tools like the COMPASS
                Companions digital guides for conflict resolution.
              </p>
              <p>
                He is the author of <em>The Compassion Book: Lessons from The
                Compassion Course</em> and serves on the Advisory Board for the
                Communications Coordination Committee for the United Nations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="learn-faq reveal">
        <div className="container">
          <h2 className="section-title">Common Questions</h2>
          <div className="learn-faq-list">
            {faqs.map((faq, index) => (
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
            <h2>Registration Opens March 1st</h2>
            <p>
              The next Compassion Course begins in June. Join 50,000+ people
              who have taken this journey toward more compassionate living.
            </p>
            <div className="cta-buttons">
              <JotformPopup
                formId={JOTFORM_FORM_ID}
                buttonText="Register for the Course"
              />
              <Link to="/about" className="btn-secondary">
                Meet the Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LearnMorePage;
