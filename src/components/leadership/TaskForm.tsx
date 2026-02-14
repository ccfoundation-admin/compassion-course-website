import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { LeadershipWorkItem, WorkItemStatus, WorkItemLane, WorkItemComment } from '../../types/leadership';

const STATUS_OPTIONS: { value: WorkItemStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'Planned work' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const LANE_OPTIONS: { value: WorkItemLane; label: string }[] = [
  { value: 'expedited', label: 'Expedited' },
  { value: 'fixed_date', label: 'Fixed Date' },
  { value: 'standard', label: 'Standard' },
  { value: 'intangible', label: 'Intangible' },
];

const ESTIMATE_OPTIONS = [0.5, 1, 1.5, 2];

export type TaskFormPayload = {
  title: string;
  description?: string;
  status: WorkItemStatus;
  lane: WorkItemLane;
  estimate?: number;
  blocked: boolean;
  assigneeId?: string;
  teamId?: string;
  comments?: WorkItemComment[];
};

export interface TaskFormProps {
  mode: 'create' | 'edit';
  initialItem?: LeadershipWorkItem | null;
  defaultLane?: WorkItemLane;
  teamId?: string;
  teamMemberIds?: string[];
  memberLabels?: Record<string, string>;
  onSave: (data: TaskFormPayload) => void;
  onCancel: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
};
const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '4px',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#374151',
};

export const TaskForm: React.FC<TaskFormProps> = ({
  mode,
  initialItem,
  defaultLane = 'standard',
  teamId,
  teamMemberIds = [],
  memberLabels = {},
  onSave,
  onCancel,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<WorkItemStatus>('backlog');
  const [lane, setLane] = useState<WorkItemLane>(defaultLane);
  const [estimate, setEstimate] = useState<number | ''>('');
  const [blocked, setBlocked] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  const [comments, setComments] = useState<WorkItemComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialItem) {
      setTitle(initialItem.title);
      setDescription(initialItem.description ?? '');
      setStatus(initialItem.status);
      setLane(initialItem.lane ?? 'standard');
      setEstimate(initialItem.estimate ?? '');
      setBlocked(initialItem.blocked ?? false);
      setAssigneeId(initialItem.assigneeId ?? '');
      setComments(initialItem.comments ?? []);
    } else {
      setTitle('');
      setDescription('');
      setStatus('backlog');
      setLane(defaultLane);
      setEstimate('');
      setBlocked(false);
      setAssigneeId('');
      setComments([]);
    }
  }, [mode, initialItem, defaultLane]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        lane,
        estimate: estimate === '' ? undefined : Number(estimate),
        blocked,
        assigneeId: assigneeId || undefined,
        teamId,
        comments: comments.length > 0 ? comments : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const addComment = () => {
    const text = newCommentText.trim();
    if (!text || !user) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        userId: user.uid,
        userName: user.displayName || user.email || undefined,
        text,
        createdAt: new Date(),
      },
    ]);
    setNewCommentText('');
  };

  const uniqueId = mode === 'edit' && initialItem ? initialItem.id : '—';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '520px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: '#002B4D', marginBottom: '20px', fontSize: '1.25rem' }}>
          {mode === 'create' ? 'Create Task' : 'Edit Task'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Unique ID</label>
            <input type="text" value={uniqueId} readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Type</label>
            <input type="text" value="Task" readOnly style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Name *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Task name"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Comments</label>
            {comments.length > 0 && (
              <ul style={{ margin: '0 0 8px', paddingLeft: '20px', fontSize: '0.875rem', color: '#374151' }}>
                {comments.map((c) => (
                  <li key={c.id} style={{ marginBottom: '4px' }}>
                    <strong>{c.userName || c.userId}</strong> ({c.createdAt.toLocaleString()}): {c.text}
                  </li>
                ))}
              </ul>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add a comment"
                style={inputStyle}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addComment())}
              />
              <button type="button" onClick={addComment} disabled={!user} style={{ padding: '8px 14px', background: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: user ? 'pointer' : 'not-allowed', fontSize: '14px' }}>
                Add comment
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as WorkItemStatus)} style={inputStyle}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Lane</label>
            <select value={lane} onChange={(e) => setLane(e.target.value as WorkItemLane)} style={inputStyle}>
              {LANE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Estimate (days)</label>
            <select
              value={estimate}
              onChange={(e) => setEstimate(e.target.value === '' ? '' : Number(e.target.value))}
              style={inputStyle}
            >
              <option value="">—</option>
              {ESTIMATE_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="task-form-blocked"
              checked={blocked}
              onChange={(e) => setBlocked(e.target.checked)}
            />
            <label htmlFor="task-form-blocked" style={{ ...labelStyle, marginBottom: 0 }}>Blocked</label>
          </div>

          {teamMemberIds.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Assignee</label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} style={inputStyle}>
                <option value="">No assignee</option>
                {teamMemberIds.map((id) => (
                  <option key={id} value={id}>{memberLabels[id] || id}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
