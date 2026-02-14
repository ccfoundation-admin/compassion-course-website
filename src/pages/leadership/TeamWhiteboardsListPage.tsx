import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { getTeam } from '../../services/leadershipTeamsService';
import { listWhiteboardsForTeam, createWhiteboard } from '../../services/whiteboardService';
import type { LeadershipTeam } from '../../types/leadership';
import type { WhiteboardMeta } from '../../services/whiteboardService';

const TeamWhiteboardsListPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [teamName, setTeamName] = useState('');
  const [boards, setBoards] = useState<WhiteboardMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyId, setCopyId] = useState<string | null>(null);
  const [team, setTeam] = useState<LeadershipTeam | null>(null);

  useEffect(() => {
    if (!teamId) return;
    setError(null);
    Promise.allSettled([getTeam(teamId), listWhiteboardsForTeam(teamId)])
      .then(([teamResult, listResult]) => {
        if (teamResult.status === 'fulfilled') {
          const t = teamResult.value;
          setTeam(t ?? null);
          setTeamName(t?.name ?? '');
        } else {
          setTeam(null);
          setTeamName('');
          setError((prev) => prev || 'Failed to load team.');
          console.error('Team whiteboards: getTeam failed', teamResult.reason);
        }
        if (listResult.status === 'fulfilled') {
          setBoards(listResult.value);
        } else {
          setBoards([]);
          setError((prev) => prev || 'Failed to load whiteboards. Check the console for details.');
          console.error('Team whiteboards: listWhiteboardsForTeam failed', listResult.reason);
        }
        if (teamResult.status === 'fulfilled' && listResult.status === 'fulfilled') {
          setError(null);
        }
      })
      .finally(() => setLoading(false));
  }, [teamId]);

  const canCreate = teamId && user?.uid && (isAdmin || (team && team.memberIds.includes(user.uid)));

  const handleCreate = async () => {
    if (!teamId || !user?.uid || !canCreate) return;
    setError(null);
    setCreating(true);
    try {
      const boardId = await createWhiteboard('Untitled whiteboard', user.uid, teamId);
      navigate(`/whiteboards/${boardId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create whiteboard');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (boardId: string) => {
    const url = `${window.location.origin}/whiteboards/${boardId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyId(boardId);
      setTimeout(() => setCopyId(null), 2000);
    });
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString(undefined, { dateStyle: 'short' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' });

  if (!teamId) {
    return (
      <Layout>
        <div style={{ padding: '40px 20px' }}>
          <Link to="/portal/leadership/teams" style={{ color: '#002B4D', textDecoration: 'none' }}>← Back</Link>
          <p style={{ color: '#6b7280', marginTop: '16px' }}>Team not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <Link
          to={`/portal/leadership/teams/${teamId}`}
          style={{ color: '#002B4D', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}
        >
          ← Back to team
        </Link>
        <h1 style={{ color: '#002B4D', marginBottom: '10px' }}>
          {teamName ? `${teamName} – Whiteboards` : 'Team whiteboards'}
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '24px' }}>
          Create and open team whiteboards. Share the link so anyone signed in can view.
        </p>

        {canCreate && (
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            style={{
              padding: '10px 20px',
              background: '#002B4D',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: creating ? 'not-allowed' : 'pointer',
              marginBottom: '24px',
            }}
          >
            {creating ? 'Creating…' : 'New Whiteboard'}
          </button>
        )}

        {error && (
          <div style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</div>
        )}

        {loading ? (
          <p style={{ color: '#6b7280' }}>Loading…</p>
        ) : boards.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No whiteboards yet. {canCreate ? 'Create one above.' : ''}</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {boards.map((board) => (
              <li
                key={board.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#002B4D' }}>{board.title}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Updated {formatDate(board.updatedAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(board.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    {copyId === board.id ? 'Copied!' : 'Copy link'}
                  </button>
                  <Link
                    to={`/whiteboards/${board.id}`}
                    style={{
                      padding: '6px 12px',
                      background: '#002B4D',
                      color: '#fff',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                    }}
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default TeamWhiteboardsListPage;
