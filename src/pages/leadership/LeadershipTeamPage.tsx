import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getTeam } from '../../services/leadershipTeamsService';
import {
  getWorkingAgreementsByTeam,
  updateWorkingAgreements,
} from '../../services/workingAgreementsService';
import type { LeadershipTeam } from '../../types/leadership';

const sectionStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  marginBottom: '24px',
};

const LeadershipTeamPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<LeadershipTeam | null>(null);
  const [agreementItems, setAgreementItems] = useState<string[]>([]);
  const [newAgreement, setNewAgreement] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingAgreements, setSavingAgreements] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getTeam(teamId),
      getWorkingAgreementsByTeam(teamId),
    ])
      .then(([t, ag]) => {
        if (cancelled) return;
        setTeam(t ?? null);
        setAgreementItems(ag?.items ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setTeam(null);
          setAgreementItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  const handleAddAgreement = async () => {
    const text = newAgreement.trim();
    if (!text || !teamId) return;
    const next = [...agreementItems, text];
    setAgreementItems(next);
    setNewAgreement('');
    setSavingAgreements(true);
    try {
      await updateWorkingAgreements(teamId, next);
    } finally {
      setSavingAgreements(false);
    }
  };

  const handleRemoveAgreement = async (index: number) => {
    if (!teamId) return;
    const next = agreementItems.filter((_, i) => i !== index);
    setAgreementItems(next);
    setSavingAgreements(true);
    try {
      await updateWorkingAgreements(teamId, next);
    } finally {
      setSavingAgreements(false);
    }
  };

  if (!teamId || (!loading && !team)) {
    return (
      <Layout>
        <div style={{ padding: '40px 20px' }}>
          <Link to="/portal/leadership" style={{ color: '#002B4D', textDecoration: 'none' }}>
            ← Back to Leadership Portal
          </Link>
          <p style={{ color: '#6b7280', marginTop: '16px' }}>Team not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <Link
          to="/portal/leadership"
          style={{ color: '#002B4D', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}
        >
          ← Back to Leadership Portal
        </Link>

        {loading ? (
          <p style={{ color: '#6b7280' }}>Loading…</p>
        ) : team ? (
          <>
            <h1 style={{ color: '#002B4D', marginBottom: '8px' }}>{team.name}</h1>
            <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '24px' }}>
              Members: {team.memberIds.length === 0 ? 'None' : `${team.memberIds.length} member(s)`}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <Link
                to={`/portal/leadership/teams/${teamId}/board`}
                style={{
                  padding: '10px 20px',
                  background: '#002B4D',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Team board
              </Link>
              <Link
                to="/whiteboards"
                style={{
                  padding: '10px 20px',
                  background: '#002B4D',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Whiteboards
              </Link>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ color: '#002B4D', marginBottom: '12px', fontSize: '1.25rem' }}>Working agreements</h2>
              <ul style={{ margin: '0 0 16px', paddingLeft: '20px', color: '#374151' }}>
                {agreementItems.map((item, i) => (
                  <li key={i} style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAgreement(i)}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={newAgreement}
                  onChange={(e) => setNewAgreement(e.target.value)}
                  placeholder="New agreement"
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAgreement()}
                />
                <button
                  type="button"
                  onClick={handleAddAgreement}
                  disabled={savingAgreements || !newAgreement.trim()}
                  style={{
                    padding: '8px 16px',
                    background: '#002B4D',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: savingAgreements ? 'not-allowed' : 'pointer',
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  );
};

export default LeadershipTeamPage;
