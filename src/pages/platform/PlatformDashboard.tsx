import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import Layout from '../../components/Layout';
import { PermissionId } from '../../types/permissions';

const CARD_STYLE = {
  padding: '30px',
  background: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  textDecoration: 'none',
  color: '#111827',
  display: 'block' as const,
  border: '2px solid transparent',
  transition: 'all 0.2s',
};

const PLATFORM_CARDS: { to: string; permissionId: PermissionId; title: string; description: string }[] = [
  { to: '/platform/communities', permissionId: 'communities', title: 'Communities', description: 'Join communities, participate in discussions, and connect with others.' },
  { to: '/platform/courses', permissionId: 'courses', title: 'Courses', description: 'Browse and enroll in courses to expand your knowledge.' },
  { to: '/platform/webcasts', permissionId: 'webcasts', title: 'Webcasts', description: 'Join live webcasts with real-time translation support.' },
  { to: '/platform/resources', permissionId: 'member_hub', title: 'Member Hub', description: 'Videos, whiteboards, Meet, Docs, and Drive shared with your email.' },
  { to: '/platform/whiteboards', permissionId: 'whiteboards', title: 'Whiteboards', description: 'Create whiteboards, draw lines, add sticky notes, and share by email.' },
  { to: '/platform/profile', permissionId: 'profile', title: 'My Profile', description: 'Manage your profile and account settings.' },
];

type CardItem = { to: string; permissionId: string; title: string; description: string };

const PARTICIPANTS_CARD: CardItem = {
  to: '/platform/resources',
  permissionId: 'participants',
  title: 'Participants',
  description: 'Videos, whiteboards, Meet, Docs, and Drive shared with your email.',
};

const PlatformDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission, loading, role, isAdmin } = usePermissions();

  const baseCards = PLATFORM_CARDS.filter((card) => {
    if (card.permissionId === 'member_hub') {
      return (isAdmin || role === 'leader') && hasPermission(card.permissionId);
    }
    return hasPermission(card.permissionId);
  });
  const visibleCards: CardItem[] = role === 'participant' ? [...baseCards, PARTICIPANTS_CARD] : baseCards;

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ marginBottom: '30px', color: '#002B4D' }}>
          Welcome to the Platform
        </h1>
        <p style={{ marginBottom: '40px', color: '#6b7280', fontSize: '18px' }}>
          Hello, {user?.email}. Explore communities, courses, and webcasts.
        </p>

        {loading ? (
          <p style={{ color: '#6b7280' }}>Loading...</p>
        ) : visibleCards.length === 0 ? (
          <p style={{ color: '#6b7280' }}>
            You don&apos;t have access to any platform features. Contact an administrator if you need access.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}>
            {visibleCards.map((card) => (
              <Link
                key={card.permissionId}
                to={card.to}
                style={CARD_STYLE}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#002B4D';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <h2 style={{ color: '#002B4D', marginBottom: '10px' }}>{card.title}</h2>
                <p style={{ color: '#6b7280' }}>{card.description}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PlatformDashboard;
