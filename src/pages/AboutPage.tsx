import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import JotformPopup from '../components/JotformPopup';
import { getTeamMembers, getLanguageSections, TeamMember, TeamLanguageSection } from '../services/contentService';
import { ensureTeamSuffix } from '../utils/contentUtils';
// Firebase config check is handled via the hasFirebaseTeam flag
import { useScrollReveal } from '../hooks/useScrollReveal';

const JOTFORM_FORM_ID = import.meta.env.VITE_JOTFORM_FORM_ID || '260333329475357';

/* ── Static team data from compassioncourse.org/team-members ────────── */

interface StaticTeamMember {
  name: string;
  role: string;
  photo: string;
  bio: string[];
  contact?: string;
}

interface StaticTeamSection {
  section: string;
  members: StaticTeamMember[];
}

const staticTeamData: StaticTeamSection[] = [
  {
    section: 'English Team',
    members: [
      {
        name: 'Thom Bond',
        role: 'Compassion Course Author and Lead Trainer, Founder and Director of Education of NYCNVC',
        photo: '/Team/ThomBond.png',
        bio: [
          'Thom brings 29 years of human potential experience and training experience to his work as an Internationally Certified NVC Trainer. His passion and knowledge of Nonviolent Communication (NVC) combine to create a practical, understandable, humorous, and potentially profound approach for learning and integrating the skills of peacemaking. He is described as concise, inspiring, sincere and optimistic, applying transformational and spiritual ideas and sensibilities to real-life situations. Many of his students become active facilitators, trainers and practitioners.',
          'As a trainer, speaker, mediator, and coach, Thom has taught tens of thousands of clients, participants, readers and listeners Nonviolent Communication. He has been published or featured in The New York Times, New York Magazine, Yoga Magazine.',
          'He is a founder and the Director of Education for The New York Center for Nonviolent Communication (NYCNVC), the creator of The Compassion Course, a member of the Communications Coordination Committee for the United Nations and a CNVC IIT trainer.',
        ],
        contact: 'thombond@nycnvc.org',
      },
      {
        name: 'Antonio Espinoza',
        role: 'Compassion Course Spanish Team Leader, Assistant Director, NYCNVC',
        photo: '/Team/AntonioEspinoza.png',
        bio: [
          "As an Assistant Director at NYCNVC Antonio's communication and outreach work has played a major role in our mission of sharing NVC around the world.",
          'Antonio is currently a Discovery Weekend Facilitator, Integration Program Graduate, Leadership Program participant and a principle member of the Spanish Translation and Coordination team for The Compassion Course Online.',
          "Antonio's ability to both learn and practice NVC serves as a model and as an inspiration for all those who work with him.",
        ],
        contact: 'antonio@nycnvc.org',
      },
      {
        name: 'Doreen Poulin',
        role: 'Compassion Course Assistant Coordinator, Assistant Facilitator, NYCNVC',
        photo: '/Team/DoreenPoulin.png',
        bio: [
          'Doreen dedicated much of her life to helping people of all ages communicate more effectively in her career as a speech-language pathologist in hospital, private, and special education settings.',
          'The desire to improve her own communication skills brought her to NYCNVC in 2013. She completed the NYCNVC Integration Program, and has gone on to facilitate multiple weekend programs, and co-facilitate NYCNVC Practice Groups.',
          "Since February 2019, she has been a Core Team member and a Course Coordinator for the Compassion Course. Her value for purpose and meaning are met with her involvement in the development and coordination of NYCNVC programs and her role as Thom's executive assistant.",
          'Doreen sees that as she continues to practice living with needs-based consciousness, her ability to connect to herself and others, to find understanding and acceptance, and to communicate authentically brings more harmony into her life. Sharing this way of living with others brings her hope for more peace on earth, one empathetic interaction at a time.',
        ],
        contact: 'doreen@nycnvc.net',
      },
    ],
  },
  {
    section: 'German Team',
    members: [
      {
        name: 'Gabriele Vana',
        role: 'German Language Translation Team Leader, Lead Facilitator',
        photo: '/Team/GabrieleVana.png',
        bio: [
          'Gabriele has been studying Nonviolent Communication intensely since 2006. Her teachers have been Gabriel G\u00f6\u00dfnitzer (Austria), Nada Ignjatovic-Savic (Serbia), Robert Gonzales (USA), John Kinyon (USA), Thom Bond (USA), Gina Lawrie (GB), Jeff Brown (USA), Wes Taylor (USA).',
          'She has been giving public talks and facilitating workshops and practice groups since 2009. Gabriele holds a high value for connection to the life-serving energy and loves inner and outer peace.',
          'She is very excited about contributing to the Compassion Online Course that enables so many people all over the world to have access to hearing and learning more about the idea of compassion.',
        ],
        contact: 'betreuung@mitgefuehl-als-weg.co',
      },
      {
        name: 'Sabine Bends',
        role: 'German Language Translation Team Primary Proofreader',
        photo: '/Team/SabineBends.png',
        bio: [
          'Translator, student of The Work of Byron Katie and Nonviolent Communication. The question she constantly asks herself: What would Love do? She wishes to live from her heart and to others in every moment.',
          'Sabine finds that the Compassion Online Course speaks exactly to these issues. The easy to follow guidelines through the basic concepts, the stories of everyday life and the vast variety of practices and exercises offer a wonderful framework to cultivate a loving attitude and encourage people to see for themselves what it is like to live and connect from the heart in every moment.',
        ],
        contact: 'betreuung@mitgefuehl-als-weg.com',
      },
    ],
  },
  {
    section: 'Arabic Team',
    members: [
      {
        name: 'Shahinaz El Hennawi',
        role: 'Compassion Course Arabic Team Leader, Assistant Facilitator',
        photo: '/Team/ShahinazElHennawi.png',
        bio: [
          'Shahinaz el Hennawi is a co-active coach from the Coaching Training Institute \u2013 USA. She has over ten years experience in projects related to peacebuilding. She is an active peacemaker through programs and her leadership of groups and circles.',
          'Shahinaz has studied and worked in USA, Europe, Asia and Central America. She holds undergraduate and graduate degrees from the University for Peace.',
          'Shahinaz discovered NVC in 2010 during her time in Austria. She found it to be such an enriching experience, she decided to take her learning forward and integrate it in her life and home country Egypt. In New York she created a partnership with Thom Bond and NYCNVC to bring NVC to the Arab speaking World.',
        ],
        contact: 'arabic_coordinator@nycnvc.org',
      },
      {
        name: 'Dina Ali',
        role: 'Compassion Course Arabic Team Translator, Assistant Facilitator',
        photo: '/Team/DinaAli.png',
        bio: [
          'Dina Ali is a Website Editor in French, Arabic and English at the Bibliotheca Alexandrina since 2008, and a Translator since 2005.',
          'Together with Shahinaz El-Hennawi, they launched "Shams Women" to spread love and compassion, and support individuals in their path to self-development and inner peace. She is now part of The Compassion Course Arabic Translation Team, dedicated to bring NVC to Egypt and other Arabic speaking neighbors.',
        ],
        contact: 'arabic_coordinator@nycnvc.org',
      },
      {
        name: 'Kholoud Said',
        role: 'Compassion Course Arabic Team Translator',
        photo: '/Team/KholoudSaid.png',
        bio: [
          'Kholoud Said works as Website Editor at the Bibliotheca Alexandrina, and a Translator, Researcher, and Civil Society Trainer and Consultant. She has a BA in English Literature and is currently pursuing her MA in Comparative Literature.',
          'With the Egyptian Revolution, Kholoud noticed the danger of polarization and became part of a group to study Marshall Rosenberg\'s Nonviolent Communication, and try to apply its concepts in daily life.',
        ],
        contact: 'arabic_coordinator@nycnvc.org',
      },
      {
        name: 'Yasmine Arafa',
        role: 'Compassion Course Arabic Team Translator',
        photo: '/Team/YasmineArafa.png',
        bio: [
          'Yasmine Arafa has a law degree (LLB) from the University of Alexandria, Egypt. As the research associate of the vice rector, University for Peace, she has taken part in projects as a researcher and evaluation consultant working in academic and field research as well as multinational conflict resolution and peace studies projects.',
        ],
        contact: 'arabic_coordinator@nycnvc.org',
      },
    ],
  },
  {
    section: 'Spanish Team',
    members: [
      {
        name: 'Celeste De Vita',
        role: 'Compassion Course Spanish Team Lead Translator',
        photo: '/Team/CelesteDeVita.png',
        bio: [
          'Celeste hails from Argentina and serves as the lead translator for El Curso de Compasion. She discovered NVC in 2013, when she attended a practice group. In 2014 she got her Psychology degree in UBA (Universidad de Buenos Aires).',
          'Since she finished the Compassion Course, her wish to give back something for the precious tools she had learned, moved her to offer her help as a translator to create the Spanish Compassion Course.',
        ],
        contact: 'celeste.devita@gmail.com',
      },
      {
        name: 'Ang\u00e9lica Maeireizo Tokeshi',
        role: 'Compassion Course Spanish Primary Proofreader',
        photo: '/Team/AngelicaMaeireizoTokeshi.png',
        bio: [
          'Ang\u00e9lica has been joyfully volunteering her time as a proofreader of the Spanish translation for the Compassion Course. She discovered NVC in 2012. She has more than 10 years of lecturing and introducing Biophilic Architecture and researching on Mindful Urbanism.',
          'She has also facilitated Restorative Justice & Forgiveness Workshops in her birthplace of Lima, Peru.',
        ],
      },
    ],
  },
  {
    section: 'Turkish Team',
    members: [
      {
        name: 'Mustafa T\u00fcl\u00fc',
        role: 'Facilitator and Tech Support',
        photo: '/Team/MustafaTulu.png',
        bio: [
          'Besides facilitating, Mustafa handles the technical side of the Compassion Course, such as the website and preparation and delivery of e-mails. He comes from a technical background with a computer engineering degree and is a PMP certified project manager.',
          'He met nonviolent communication in 2015, received introductory training in 2017 and had the distinct chance to learn from the late Robert Gonzales in the EURO LIFE program. The Compassion Course became a resource he joined immediately and was very impressed by its content and setting.',
        ],
      },
      {
        name: 'Nihal Artar',
        role: 'Facilitator and Translator',
        photo: '/Team/NihalArtar.png',
        bio: [
          'Nihal studied Communication Sciences at university. Her interest in Nonviolent Communication started by participating in circles between 2015\u201317. She attended the Compassion Course 3 times.',
          'In addition to organizing the course in Turkish with Mustafa, they also organize Compassion Course Practice meetings as an appendix to the course. Their learning community is growing day by day with course and practice meetups.',
        ],
      },
    ],
  },
  {
    section: 'Portuguese Team',
    members: [
      {
        name: 'Leticia Penteado',
        role: 'Lead Translator / Facilitator',
        photo: '/Team/LeticiaPenteado.png',
        bio: [
          'Graduated in Law and Education, with a postgraduate degree in Transpersonal Psychology. Since 2010, Leticia has been facilitating conversations using NVC, Mediation, Restorative Justice, and other paths to connection. Co-founder of Conex\u00e3o Emp\u00e1tica, Festival da Empatia and Comunidade Colar, and co-author of the Applied NVC method.',
          'Leticia has been enthusiastically following the Compassion Course since 2016 \u2014 first as a student, then as a group facilitator and, finally, as part of the Portuguese team as lead translator.',
        ],
        contact: 'conexaoempatica@gmail.com',
      },
      {
        name: 'Diana de Hollanda',
        role: 'Facilitator',
        photo: '/Team/DianadeHollanda.png',
        bio: [
          'Author of a poetry book and a novel. Certified Meditation, Compassion and Mindfulness Teacher by the MMTCP (University of California, Berkeley). Diana has been following the Compassion Course since 2017; she is a facilitator and a member of the Portuguese team, mainly proofreading and preparing the texts.',
          'She is also cofounder of Comunidade Enra\u00edza, which combines Mindfulness, Meditation and NVC practices.',
        ],
        contact: 'escritadoinsight@gmail.com',
      },
      {
        name: 'Igor Savitsky',
        role: 'Tech Support',
        photo: '/Team/IgorSavitsky.png',
        bio: [
          'Igor works as a federal attorney. Graduated in Law and Computer Engineering. Co-founder of Conex\u00e3o Emp\u00e1tica and co-author of the Applied NVC Method.',
          'Igor took the Compassion Course for the first time in 2019 and collaborates with the Portuguese team as "the tech guy."',
        ],
        contact: 'conexaoempatica@gmail.com',
      },
    ],
  },
  {
    section: 'Polish Team',
    members: [
      {
        name: 'Adam Kusio',
        role: 'Coordinator of the Polish Edition',
        photo: '/Team/AdamKusio.png',
        bio: [
          'He has 18 years of corporate experience. He is a trainer, mediator and facilitator of Restorative Circles. He facilitates practice groups and individual sessions.',
          'Fascinated with the clarity and precision of presenting key notions of nonviolence and the practical character of the course, he organized the Polish edition in 2019. He led three year-long practice groups around the course material.',
        ],
        contact: 'kontakt@praktykawspolczucia.pl',
      },
      {
        name: 'Agnes Kowalski',
        role: 'Editor and Proofreader',
        photo: '/Team/AgnesKowalski.png',
        bio: [
          "She came across Marshall B. Rosenberg's NVC for the first time when her son was two. After she came across M. Rosenberg's idea, nothing was the same. After eight years this process is still in progress.",
          'Agnes is very happy that she can contribute to the Polish edition of the course with her editing and proofreading skills.',
        ],
        contact: 'agnes.kowalski@gmail.com',
      },
      {
        name: 'Magdalena Maci\u0144ska',
        role: 'Translator',
        photo: '/Team/MagdalenaMacinska.png',
        bio: [
          'She is a translator and interpreter of English and French into Polish. In 2019, Marie Miyashiro\'s book "The Empathy Factor" was published in her translation.',
          'Through Nonviolent Communication she got fascinated with the practice of empathy and deep listening. She joined the team translating the course material into Polish.',
        ],
        contact: 'm.macinska@interia.pl',
      },
    ],
  },
  {
    section: 'Netherlands Team',
    members: [
      {
        name: 'Sara Nuytemans',
        role: 'Translator, Trainer, Supervisor and Coordinator of the Dutch Course',
        photo: '/Team/SaraNuytemans.png',
        bio: [
          "In 2012 Sara read Marshall Rosenberg's book Nonviolent Communication and a lot of things fell into place. In 2016 she participated in Thom Bond's online course that deepened her practice. She wanted to translate this course and share it with the Dutch-speaking world.",
          'The online course Mededogen Als Weg is the result. In addition, she gives offline basic NVC courses and practices hypnotherapy.',
        ],
      },
    ],
  },
];

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
          <h1>About the Compassion Course</h1>
          <p className="about-page-subtitle">
            Peace Education for Everyone, Everywhere, All at Once.
          </p>
        </div>

        {/* Our Story — mission + history with images */}
        <div className="about-story reveal">
          <div className="container">
            <div className="about-story-content">
              <div className="about-story-text">
                <h2 className="about-story-tagline">Be Part of Something Beautiful</h2>
                <p>
                  The Compassion Course Online is a year-long journey in peace education, created by
                  Thom Bond and supported by the New York Center for Nonviolent Communication (NYCNVC),
                  a United Nations Civil Society Organization. Our mission is to make the skills of
                  compassionate living available to anyone, regardless of time and money constraints.
                </p>
                <p>
                  What began in 2011 as a weekly email sharing the tools of compassionate communication
                  has grown into a vibrant global community. Today, The Compassion Course is available in
                  almost every major populated area on earth, on every side of every conflict, in native
                  languages &mdash; a single, universal learning and teaching community.
                </p>
                <p>
                  The course draws on three traditions: Marshall Rosenberg's Nonviolent Communication,
                  Werner Erhard's transformational approach, and Albert Ellis's cognitive techniques &mdash;
                  a unique combination you won't find elsewhere.
                </p>
                <div className="about-story-timeline">
                  <div className="about-timeline-item">
                    <span className="about-timeline-year">2002</span>
                    <p>Thom Bond discovers Nonviolent Communication</p>
                  </div>
                  <div className="about-timeline-item">
                    <span className="about-timeline-year">2003</span>
                    <p>NYCNVC co-founded with Nellie Bright</p>
                  </div>
                  <div className="about-timeline-item">
                    <span className="about-timeline-year">2011</span>
                    <p>The Compassion Course Online is born</p>
                  </div>
                  <div className="about-timeline-item">
                    <span className="about-timeline-year">Today</span>
                    <p>50,000+ registrations across 120+ countries in 20 languages</p>
                  </div>
                </div>
              </div>
              <div className="about-story-images">
                <img
                  src="/images/video-conference.jpg"
                  alt="Compassion Course monthly video conference with participants"
                  className="about-story-photo"
                  loading="lazy"
                />
                <img
                  src="/images/leadership-opportunities.jpg"
                  alt="Group discussion at a Compassion Course workshop"
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
            <h2 className="section-title">How You Can Help</h2>
            <p className="section-description">
              The Compassion Course has grown primarily because participants tell others about it.
              Here are some ways you can support the mission.
            </p>
            <div className="about-help-grid">
              <div className="about-help-card reveal">
                <div className="about-help-icon">
                  <i className="fas fa-share-alt"></i>
                </div>
                <h3>Share the Course</h3>
                <p>
                  Personal recommendations are the number one way new participants discover the course.
                  Share the invitation link with friends, family, and colleagues:
                </p>
                <a
                  href="https://compassioncourse.org/invitation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-help-link"
                >
                  compassioncourse.org/invitation
                </a>
              </div>
              <div className="about-help-card reveal">
                <div className="about-help-icon">
                  <i className="fas fa-hashtag"></i>
                </div>
                <h3>Spread the Word Online</h3>
                <p>
                  Follow and share posts from our social media channels. Pre-sized images with
                  course quotes are available for Facebook, Instagram, and Twitter.
                </p>
                <div className="about-help-social">
                  <a href="https://www.facebook.com/compassioncourseonline/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="https://www.instagram.com/compassioncourse/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="https://twitter.com/compassioncours/" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <i className="fab fa-twitter"></i>
                  </a>
                </div>
              </div>
              <div className="about-help-card reveal">
                <div className="about-help-icon">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <h3>Community Outreach</h3>
                <p>
                  Post a flyer on community bulletin boards at libraries, yoga studios, meditation
                  centers, universities, and workplaces. Printable flyers are available from our team.
                </p>
                <a href="mailto:coursecoordinator@nycnvc.org?subject=Flyer%20Request" className="about-help-link">
                  <i className="fas fa-envelope"></i> coursecoordinator@nycnvc.org
                </a>
              </div>
              <div className="about-help-card reveal">
                <div className="about-help-icon">
                  <i className="fas fa-hand-holding-heart"></i>
                </div>
                <h3>Volunteer Your Skills</h3>
                <p>
                  Help with translation, facilitation, tech support, or community organizing. The
                  course runs entirely on the generosity of volunteers around the world.
                </p>
                <a href="mailto:coursecoordinator@nycnvc.org?subject=Volunteer%20Inquiry" className="about-help-link">
                  <i className="fas fa-envelope"></i> coursecoordinator@nycnvc.org
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="about-team-members">
          <div className="container">
            <h2 className="section-title">Meet the Team</h2>
            <p className="section-description">
              The Compassion Course is translated, facilitated, and supported by dedicated
              volunteer teams across 8 language communities around the world.
            </p>

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
                            <strong>Contact:</strong> {member.contact}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })
            ) : (
              staticTeamData.map((section) => (
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
                          <strong>Contact:</strong> {member.contact}
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
              <h2>Get Involved</h2>
              <p>
                Registration opens March 1st, 2026. The next Compassion Course begins June 24th, 2026.
                Join 50,000+ people who have taken this journey toward more compassionate living.
              </p>
              <div className="about-cta-buttons">
                <JotformPopup
                  formId={JOTFORM_FORM_ID}
                  buttonText="Register for the Course"
                />
                <Link to="/learn-more" className="btn-secondary">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="about-cta-contact">
              <h3>Questions?</h3>
              <div className="about-cta-contact-items">
                <a href="mailto:coursecoordinator@nycnvc.org" className="about-cta-contact-link">
                  <i className="fas fa-envelope"></i>
                  coursecoordinator@nycnvc.org
                </a>
                <span className="about-cta-contact-link">
                  <i className="fas fa-phone"></i>
                  (646) 201-9226
                </span>
              </div>
              <div className="about-cta-social">
                <a href="https://www.facebook.com/compassioncourseonline/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://www.instagram.com/compassioncourse/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://twitter.com/compassioncours/" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
