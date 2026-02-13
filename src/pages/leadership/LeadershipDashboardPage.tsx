import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { listRecentMessages } from '../../services/leadershipMessagesService';
import { listTeamsForUser, listTeams } from '../../services/leadershipTeamsService';
import { listWorkItemsForUser } from '../../services/leadershipWorkItemsService';
import type { LeadershipMessage } from '../../types/leadership';
import type { LeadershipTeam } from '../../types/leadership';
import type { LeadershipWorkItem } from '../../types/leadership';

const widgetStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const cardTitleStyle: React.CSSProperties = {
  color: '#111827',
  marginBottom: '12px',
  fontSize: '1rem',
  fontWeight: 700,
};

const linkStyle: React.CSSProperties = {
  color: '#002B4D',
  textDecoration: 'underline',
  fontWeight: 500,
};

const secondaryTextStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '0.875rem',
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  color: '#374151',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
};

const LeadershipDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<LeadershipMessage[]>([]);
  const [teams, setTeams] = useState<LeadershipTeam[]>([]);
  const [allTeams, setAllTeams] = useState<LeadershipTeam[]>([]);
  const [workItems, setWorkItems] = useState<LeadershipWorkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      listRecentMessages(10),
      listTeamsForUser(user.uid),
      listTeams(),
      listWorkItemsForUser(user.uid),
    ])
      .then(([msgList, teamList, allTeamList, itemList]) => {
        if (!cancelled) {
          setMessages(msgList);
          setTeams(teamList);
          setAllTeams(allTeamList);
          setWorkItems(itemList);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMessages([]);
          setTeams([]);
          setAllTeams([]);
          setWorkItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const teamNameById = React.useMemo(() => {
    const m = new Map<string, string>();
    allTeams.forEach((t) => m.set(t.id, t.name));
    return m;
  }, [allTeams]);

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <Link
          to="/portal/leadership"
          style={{ color: '#002B4D', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}
        >
          ← Back to Leadership Portal
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 style={{ color: '#002B4D', margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>My Dashboard</h1>
          <button type="button" style={buttonStyle} onClick={() => {}}>
            Customize dashboard
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#6b7280' }}>Loading...</p>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '24px',
              }}
            >
              <div style={widgetStyle}>
                <h2 style={cardTitleStyle}>Blocked tasks</h2>
                <p style={{ ...secondaryTextStyle, margin: 0 }}>No blocked tasks.</p>
              </div>

              <div style={widgetStyle}>
                <h2 style={cardTitleStyle}>Messages</h2>
                {messages.length === 0 ? (
                  <p style={{ ...secondaryTextStyle, margin: 0 }}>No mentions yet.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {messages.slice(0, 5).map((m) => (
                      <li key={m.id} style={{ padding: '6px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                          {m.text.slice(0, 80)}
                          {m.text.length > 80 ? '…' : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={widgetStyle}>
                <h2 style={cardTitleStyle}>My Items</h2>
                {workItems.length === 0 ? (
                  <p style={{ ...secondaryTextStyle, margin: 0 }}>No work items assigned to you.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {workItems.slice(0, 8).map((w) => {
                      const teamName = w.teamId ? teamNameById.get(w.teamId) : null;
                      const subtitle = teamName
                        ? `Task · ${teamName}`
                        : `Work item · ${w.status.replace('_', ' ')}`;
                      const targetUrl = w.teamId
                        ? `/portal/leadership/teams/${w.teamId}/board`
                        : '/portal/leadership/teams';
                      return (
                        <li key={w.id} style={{ padding: '6px 0', borderBottom: '1px solid #e5e7eb' }}>
                          <Link to={targetUrl} style={linkStyle}>
                            {w.title}
                          </Link>
                          <span style={{ ...secondaryTextStyle, marginLeft: '6px' }}>
                            ({subtitle})
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {workItems.length > 0 && (
                  <Link
                    to="/portal/leadership/teams"
                    style={{ ...linkStyle, display: 'inline-block', marginTop: '12px', fontSize: '0.875rem' }}
                  >
                    View on board →
                  </Link>
                )}
              </div>
            </div>

            <div style={widgetStyle}>
              <h2 style={cardTitleStyle}>My Teams</h2>
              {teams.length === 0 ? (
                <p style={{ ...secondaryTextStyle, margin: 0 }}>No teams yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {teams.map((t) => (
                    <li key={t.id} style={{ padding: '6px 0' }}>
                      <Link to={`/portal/leadership/teams/${t.id}`} style={linkStyle}>
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/portal/leadership/teams" style={{ ...buttonStyle, marginTop: '16px' }}>
                View all teams
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default LeadershipDashboardPage;
