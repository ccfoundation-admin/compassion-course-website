import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { getWhiteboard, updateWhiteboard, createWhiteboardWithId } from '../services/whiteboardService';
import { ExcalidrawShell } from '../components/whiteboard/ExcalidrawShell';
import type { ExcalidrawAPI } from '../components/whiteboard/ExcalidrawShell';

function normalizeInitialData(canvasState: { elements?: unknown[]; appState?: Record<string, unknown> } | undefined) {
  const elements = Array.isArray(canvasState?.elements) ? canvasState.elements : [];
  const appState = canvasState?.appState && typeof canvasState.appState === 'object' && !Array.isArray(canvasState.appState)
    ? { ...canvasState.appState }
    : {};
  if (appState.collaborators != null && !Array.isArray(appState.collaborators)) {
    appState.collaborators = [];
  }
  return { elements, appState };
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed';
type SaveTrigger = 'none' | 'auto' | 'manual';

const WhiteboardEditorPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [board, setBoard] = useState<Awaited<ReturnType<typeof getWhiteboard>>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaveTrigger, setLastSaveTrigger] = useState<SaveTrigger>('none');
  const [linkCopied, setLinkCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const excalidrawApiRef = useRef<ExcalidrawAPI | null>(null);
  const suppressChangeRef = useRef(true);

  const isAdminKnown = !authLoading;
  const canWrite = isLoaded && isAdminKnown && isAdmin === true;

  useEffect(() => {
    if (!boardId || !isAdminKnown) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSaveStatus('idle');
    setDirty(false);
    setIsLoaded(false);
    suppressChangeRef.current = true;

    getWhiteboard(boardId)
      .then(async (doc) => {
        if (cancelled) return;
        if (!doc && isAdmin && user?.uid) {
          await createWhiteboardWithId(boardId, 'Untitled whiteboard', user.uid);
          const created = await getWhiteboard(boardId);
          if (cancelled) return;
          doc = created;
        }
        if (!doc) {
          setError('Whiteboard not found.');
          return;
        }
        setBoard(doc);
        setTitle(doc.title);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load whiteboard');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [boardId, isAdminKnown, isAdmin, user?.uid]);

  useEffect(() => {
    if (loading || !board) return;
    const t = setTimeout(() => {
      suppressChangeRef.current = false;
      setIsLoaded(true);
    }, 2500);
    return () => clearTimeout(t);
  }, [loading, board]);

  const persistState = useCallback(
    async (trigger: 'auto' | 'manual') => {
      if (!board || !boardId || !excalidrawApiRef.current || !canWrite || !dirty) return;
      setLastSaveTrigger(trigger);
      setSaveStatus('saving');
      try {
        const api = excalidrawApiRef.current;
        const elements = api.getSceneElements();
        const appState = api.getAppState();
        await updateWhiteboard(boardId, {
          canvasState: { elements: [...elements], appState: { ...appState } },
        });
        setSaveStatus('saved');
        setDirty(false);
      } catch (e: unknown) {
        const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: unknown }).code) : '';
        const message = e instanceof Error ? e.message : String(e);
        console.error('[Whiteboard] save failed: code=%s message=%s', code, message);
        setSaveStatus('failed');
      }
    },
    [board, boardId, canWrite, dirty]
  );

  const handleChange = useCallback(() => {
    if (suppressChangeRef.current || !isLoaded) return;
    if (!canWrite) return;
    setDirty(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      persistState('auto');
    }, 1000);
  }, [canWrite, isLoaded, persistState]);

  const handleSaveClick = useCallback(() => {
    if (!canWrite || !dirty) return;
    persistState('manual');
  }, [canWrite, dirty, persistState]);

  const handleTitleBlur = useCallback(() => {
    if (!canWrite || !boardId || title === (board?.title ?? '')) return;
    updateWhiteboard(boardId, { title }).catch(() => {});
  }, [canWrite, boardId, title, board?.title]);

  const handleCopyShareableLink = useCallback(() => {
    if (!boardId) return;
    const url = `${window.location.origin}/whiteboards/${boardId}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [boardId]);

  if (!boardId) {
    return (
      <Layout>
        <div style={{ padding: '40px 20px' }}>
          <Link to="/whiteboards" style={{ color: '#002B4D', textDecoration: 'none' }}>← Back to Whiteboards</Link>
          <p style={{ color: '#6b7280', marginTop: '16px' }}>No board specified.</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '40px 20px' }}>
          <p style={{ color: '#6b7280' }}>Loading…</p>
        </div>
      </Layout>
    );
  }

  if (error || !board) {
    return (
      <Layout>
        <div style={{ padding: '40px 20px' }}>
          <Link to="/whiteboards" style={{ color: '#002B4D', textDecoration: 'none' }}>← Back to Whiteboards</Link>
          <p style={{ color: '#dc2626', marginTop: '16px' }}>{error ?? 'Whiteboard not found.'}</p>
        </div>
      </Layout>
    );
  }

  const initialData = normalizeInitialData(board.canvasState);

  return (
    <Layout>
      <div style={{ padding: '16px 20px', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/whiteboards" style={{ color: '#002B4D', textDecoration: 'none', fontWeight: 500 }}>
            ← Back to Whiteboards
          </Link>
          {canWrite ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Whiteboard title"
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '1rem',
              }}
            />
          ) : (
            <span style={{ fontWeight: 600, color: '#002B4D' }}>{board.title}</span>
          )}
          <button
            type="button"
            onClick={handleCopyShareableLink}
            style={{
              padding: '6px 12px',
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            {linkCopied ? 'Link copied!' : 'Copy shareable link'}
          </button>
          {canWrite && (
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={!dirty || saveStatus === 'saving'}
              style={{
                padding: '6px 12px',
                background: '#002B4D',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: !dirty || saveStatus === 'saving' ? 'not-allowed' : 'pointer',
              }}
            >
              Save
            </button>
          )}
          {canWrite && (
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {saveStatus === 'saving' && 'Saving…'}
              {saveStatus === 'saved' && 'Saved'}
            </span>
          )}
        </div>
      </div>
      <div style={{ height: 'calc(100vh - 120px)', minHeight: '400px' }}>
        <ExcalidrawShell
          initialData={initialData}
          viewModeEnabled={!canWrite}
          onReady={(api) => {
            excalidrawApiRef.current = api;
          }}
          onChange={handleChange}
        />
      </div>
    </Layout>
  );
};

export default WhiteboardEditorPage;
