import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { usePermissions } from '../context/PermissionsContext';

const cardStyle: React.CSSProperties = {
  padding: '20px',
  background: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  textDecoration: 'none',
  color: '#111827',
  display: 'block',
  border: '2px solid transparent',
  transition: 'all 0.2s',
};

const LeadershipPortalPage: React.FC = () => {
  const { isAdmin } = usePermissions();
  const location = useLocation();
  const isDashboard = location.pathname === '/portal/leadership/dashboard';
  const isTeams = location.pathname === '/portal/leadership/teams';

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <Link
          to="/portal"
          style={{ color: '#002B4D', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}
        >
          ← Back to Portal
        </Link>
        <h1 style={{ color: '#002B4D', marginBottom: '10px' }}>Leadership Portal</h1>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '24px' }}>
          Tools and resources for leaders.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <Link
            to="/portal/leadership/dashboard"
            style={{
              ...cardStyle,
              borderColor: isDashboard ? '#002B4D' : 'transparent',
              maxWidth: '280px',
            }}
            onMouseEnter={(e) => {
              if (!isDashboard) {
                e.currentTarget.style.borderColor = '#002B4D';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDashboard) {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <h2 style={{ color: '#002B4D', marginBottom: '6px', fontSize: '1.1rem' }}>My Dashboard</h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
              Messages, My Teams, and My Work widgets.
            </p>
          </Link>

          <Link
            to="/portal/leadership/teams"
            style={{
              ...cardStyle,
              borderColor: isTeams ? '#002B4D' : 'transparent',
              maxWidth: '280px',
            }}
            onMouseEnter={(e) => {
              if (!isTeams) {
                e.currentTarget.style.borderColor = '#002B4D';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isTeams) {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <h2 style={{ color: '#002B4D', marginBottom: '6px', fontSize: '1.1rem' }}>Teams</h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
              Team Kanban board.
            </p>
          </Link>

          {isAdmin && (
            <Link
              to="/admin/users"
              style={{
                ...cardStyle,
                maxWidth: '280px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#002B4D';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <h2 style={{ color: '#002B4D', marginBottom: '6px', fontSize: '1.1rem' }}>User management</h2>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
                Manage portal users and roles.
              </p>
            </Link>
          )}
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ color: '#6b7280', margin: 0 }}>
            Use the links above to open My Dashboard, the Team Kanban board, or User management (admins only).
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default LeadershipPortalPage;
