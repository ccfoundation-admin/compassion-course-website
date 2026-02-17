import React, { useState, useCallback, useMemo } from 'react';
import { FaHistory } from 'react-icons/fa';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateWorkItem, createWorkItem, deleteWorkItem } from '../../services/leadershipWorkItemsService';
import { createMentionNotifications } from '../../services/notificationService';
import TaskForm, { type TaskFormPayload, type TaskFormSaveContext } from './TaskForm';
import type { LeadershipWorkItem, WorkItemStatus, WorkItemLane } from '../../types/leadership';

const COLUMNS: { id: WorkItemStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: '#f59e0b' },
  { id: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'done', label: 'Done', color: '#22c55e' },
];

const LANE_META: Record<WorkItemLane, { label: string; color: string; icon: string }> = {
  expedited: { label: 'Urgent', color: '#ef4444', icon: 'fas fa-bolt' },
  fixed_date: { label: 'Deadline', color: '#f59e0b', icon: 'fas fa-calendar-day' },
  standard: { label: 'Standard', color: '#3b82f6', icon: 'fas fa-stream' },
  intangible: { label: 'Background', color: '#8b5cf6', icon: 'fas fa-wrench' },
};

const MAX_VISIBLE_AVATARS = 3;
const DONE_PREVIEW_LIMIT = 5;

/** Get effective assignee IDs from an item */
function getItemAssigneeIds(item: LeadershipWorkItem): string[] {
  if (item.assigneeIds?.length) return item.assigneeIds;
  if (item.assigneeId) return [item.assigneeId];
  return [];
}

/** Get initials from a name: "John Doe" → "JD", "John" → "J" */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
}

/** Format a date as a short relative or absolute string */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Format duration between two dates */
function formatDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return '';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

/* ─── Card content (shared by card + drag overlay) ─── */
function CardContent({
  item,
  memberLabels,
  memberAvatars,
  isDone,
}: {
  item: LeadershipWorkItem;
  memberLabels: Record<string, string>;
  memberAvatars: Record<string, string>;
  isDone?: boolean;
}) {
  const ids = getItemAssigneeIds(item);
  const [showOverflow, setShowOverflow] = useState(false);
  const visibleIds = ids.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = ids.length - MAX_VISIBLE_AVATARS;
  const laneMeta = item.lane && item.lane !== 'standard' ? LANE_META[item.lane] : null;

  return (
    <>
      {/* Priority indicator — only show for non-standard lanes */}
      {laneMeta && (
        <div className="ld-board-card-priority" style={{ color: laneMeta.color }}>
          <i className={laneMeta.icon} style={{ fontSize: '0.6rem' }}></i>
          <span>{laneMeta.label}</span>
        </div>
      )}
      <div className="ld-board-card-title">{item.title}</div>
      {item.description && (
        <div className="ld-board-card-desc">
          {item.description.length > 80 ? item.description.slice(0, 80) + '…' : item.description}
        </div>
      )}
      {ids.length > 0 && (
        <div className="ld-board-card-assignees">
          <div className="ld-board-card-avatar-stack">
            {visibleIds.map((id, i) => (
              memberAvatars[id] ? (
                <img key={id} src={memberAvatars[id]} alt="" className="ld-board-card-avatar" style={{ zIndex: visibleIds.length - i }} title={memberLabels[id] || id} />
              ) : (
                <span key={id} className="ld-board-card-avatar-initial" style={{ zIndex: visibleIds.length - i }} title={memberLabels[id] || id}>
                  {getInitials(memberLabels[id] || '?')}
                </span>
              )
            ))}
            {overflowCount > 0 && (
              <span
                className="ld-board-card-avatar-overflow"
                style={{ zIndex: 0 }}
                onMouseEnter={() => setShowOverflow(true)}
                onMouseLeave={() => setShowOverflow(false)}
                onClick={(e) => { e.stopPropagation(); setShowOverflow((v) => !v); }}
              >
                +{overflowCount}
              </span>
            )}
          </div>
          {ids.length === 1 && (
            <span className="ld-board-card-assignee-name">{memberLabels[ids[0]] || ids[0]}</span>
          )}
          {showOverflow && overflowCount > 0 && (
            <div className="ld-board-card-overflow-tooltip">
              {ids.slice(MAX_VISIBLE_AVATARS).map((id) => (
                <div key={id} className="ld-board-card-overflow-row">
                  {memberAvatars[id] ? (
                    <img src={memberAvatars[id]} alt="" className="ld-board-card-overflow-avatar" />
                  ) : (
                    <span className="ld-board-card-overflow-initial">
                      {getInitials(memberLabels[id] || '?')}
                    </span>
                  )}
                  <span>{memberLabels[id] || id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Done timestamp — inside the card */}
      {isDone && (
        <div className="ld-board-card-timestamp">
          {item.completedAt ? (
            <>
              Done {formatRelativeDate(item.completedAt instanceof Date ? item.completedAt : new Date(item.completedAt))}
              {item.startedAt && item.completedAt && (
                <span className="ld-board-card-duration">
                  {' · '}{formatDuration(
                    item.startedAt instanceof Date ? item.startedAt : new Date(item.startedAt),
                    item.completedAt instanceof Date ? item.completedAt : new Date(item.completedAt)
                  )} in progress
                </span>
              )}
            </>
          ) : (
            <>Done {formatRelativeDate(item.updatedAt instanceof Date ? item.updatedAt : new Date(item.updatedAt))}</>
          )}
        </div>
      )}
    </>
  );
}

/* ─── Sortable card ─── */
function SortableCard({
  item,
  memberLabels,
  memberAvatars,
  isDone,
  onEdit,
}: {
  item: LeadershipWorkItem;
  memberLabels: Record<string, string>;
  memberAvatars: Record<string, string>;
  isDone?: boolean;
  onEdit: (item: LeadershipWorkItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { item, type: 'card' },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none',
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => { e.stopPropagation(); onEdit(item); }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onEdit(item)}
    >
      <div className={`ld-board-card ${isDragging ? 'ld-board-card--dragging' : ''}`}>
        <CardContent item={item} memberLabels={memberLabels} memberAvatars={memberAvatars} isDone={isDone} />
      </div>
    </div>
  );
}

/* ─── Droppable + sortable column ─── */
function BoardColumn({
  column,
  items,
  memberLabels,
  memberAvatars,
  onEditItem,
  onAddItem,
  showHistory,
  onToggleHistory,
}: {
  column: (typeof COLUMNS)[0];
  items: LeadershipWorkItem[];
  memberLabels: Record<string, string>;
  memberAvatars: Record<string, string>;
  onEditItem: (item: LeadershipWorkItem) => void;
  onAddItem: () => void;
  showHistory?: boolean;
  onToggleHistory?: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: 'column', status: column.id },
  });

  const isDone = column.id === 'done';
  const totalCount = items.length;

  const sortedItems = useMemo(() => {
    if (!isDone) return items;
    return [...items].sort((a, b) => {
      const aTime = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
      const bTime = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
      return bTime - aTime;
    });
  }, [items, isDone]);

  const visibleItems = isDone && !showHistory
    ? sortedItems.slice(0, DONE_PREVIEW_LIMIT)
    : sortedItems;
  const hiddenCount = isDone ? totalCount - DONE_PREVIEW_LIMIT : 0;

  const itemIds = useMemo(() => visibleItems.map((item) => item.id), [visibleItems]);

  return (
    <div
      ref={setNodeRef}
      className={`ld-board-cell ${isOver ? 'ld-board-cell--over' : ''}`}
    >
      <div className="ld-board-col-bar" style={{ background: column.color }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 className="ld-board-col-title" style={{ margin: 0 }}>
          {column.label}
          <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.85rem', marginLeft: '6px' }}>
            ({totalCount})
          </span>
        </h3>
      </div>
      {column.id === 'todo' && (
        <button type="button" className="ld-board-add-btn" onClick={onAddItem}>
          + Add task
        </button>
      )}
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {visibleItems.length === 0 && (
          <p className="ld-board-empty-col">
            {isOver ? 'Drop here' : 'No tasks'}
          </p>
        )}
        {visibleItems.map((item) => (
          <SortableCard
            key={item.id}
            item={item}
            memberLabels={memberLabels}
            memberAvatars={memberAvatars}
            isDone={isDone}
            onEdit={onEditItem}
          />
        ))}
      </SortableContext>
      {isDone && hiddenCount > 0 && (
        <button
          type="button"
          className="ld-board-history-btn"
          onClick={onToggleHistory}
        >
          <FaHistory style={{ fontSize: '0.75rem' }} />
          {showHistory ? 'Show recent only' : `View history (${hiddenCount} more)`}
        </button>
      )}
    </div>
  );
}

/** Find which column an item ID belongs to */
function findColumnForItem(
  itemId: string,
  columns: { id: WorkItemStatus }[],
  items: LeadershipWorkItem[]
): WorkItemStatus | null {
  const item = items.find((w) => w.id === itemId);
  if (!item) return null;
  if (columns.some((c) => c.id === item.status)) return item.status;
  return null;
}

/* ─── Main board tab ─── */
interface BoardTabViewProps {
  teamId: string;
  workItems: LeadershipWorkItem[];
  memberIds: string[];
  memberLabels: Record<string, string>;
  memberAvatars?: Record<string, string>;
  boardSettings: {
    visibleLanes?: WorkItemLane[];
    columnHeaders?: Partial<Record<WorkItemStatus, string>>;
  } | null;
  boardMissingError: boolean;
  onRefresh: () => void;
  onQuietRefresh?: () => void;
}

const BoardTabView: React.FC<BoardTabViewProps> = ({
  teamId,
  workItems,
  memberIds,
  memberLabels,
  memberAvatars = {},
  boardSettings,
  boardMissingError,
  onRefresh,
  onQuietRefresh,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<LeadershipWorkItem | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDoneHistory, setShowDoneHistory] = useState(false);

  const [optimisticItems, setOptimisticItems] = useState<LeadershipWorkItem[] | null>(null);
  const displayItems = optimisticItems ?? workItems;

  React.useEffect(() => {
    setOptimisticItems(null);
  }, [workItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const handleDragOver = useCallback((e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;

    const activeItemId = active.id as string;
    const overId = over.id as string;

    // Determine target column
    let targetStatus: WorkItemStatus | null = null;
    if (overId.startsWith('column-')) {
      targetStatus = overId.replace('column-', '') as WorkItemStatus;
    } else {
      // Hovering over another card — find its column
      targetStatus = findColumnForItem(overId, COLUMNS, optimisticItems ?? workItems);
    }

    if (!targetStatus) return;

    const currentItems = optimisticItems ?? workItems;
    const item = currentItems.find((w) => w.id === activeItemId);
    if (!item || item.status === targetStatus) return;

    // Move item to new column optimistically
    setOptimisticItems(
      currentItems.map((w) =>
        w.id === activeItemId ? { ...w, status: targetStatus! } : w
      )
    );
  }, [workItems, optimisticItems]);

  const handleDragEnd = useCallback(async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) {
      setOptimisticItems(null);
      return;
    }

    const activeItemId = active.id as string;
    const overId = over.id as string;

    // Determine final target column
    let targetStatus: WorkItemStatus | null = null;
    if (overId.startsWith('column-')) {
      targetStatus = overId.replace('column-', '') as WorkItemStatus;
    } else {
      targetStatus = findColumnForItem(overId, COLUMNS, optimisticItems ?? workItems);
    }

    if (!targetStatus || !COLUMNS.some((c) => c.id === targetStatus)) {
      setOptimisticItems(null);
      return;
    }

    const currentItems = optimisticItems ?? workItems;
    const item = currentItems.find((w) => w.id === activeItemId);
    if (!item) {
      setOptimisticItems(null);
      return;
    }

    // Handle reordering within same column
    if (item.status === targetStatus && overId !== `column-${targetStatus}`) {
      const columnItems = currentItems.filter((w) => w.status === targetStatus);
      const oldIndex = columnItems.findIndex((w) => w.id === activeItemId);
      const newIndex = columnItems.findIndex((w) => w.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(columnItems, oldIndex, newIndex);
        const otherItems = currentItems.filter((w) => w.status !== targetStatus);
        setOptimisticItems([...otherItems, ...reordered]);
      }
    }

    // Always persist status change if it differs from original
    const originalItem = workItems.find((w) => w.id === activeItemId);
    if (originalItem && originalItem.status !== targetStatus) {
      try {
        await updateWorkItem(activeItemId, { status: targetStatus });
        if (onQuietRefresh) onQuietRefresh();
      } catch (err) {
        console.error(err);
        setOptimisticItems(null);
      }
    } else {
      // No status change — just clear optimistic after a tick
      setTimeout(() => setOptimisticItems(null), 50);
    }
  }, [workItems, optimisticItems, onQuietRefresh]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOptimisticItems(null);
  }, []);

  const handleCreateSave = async (data: TaskFormPayload, context?: TaskFormSaveContext) => {
    setSaveError(null);
    try {
      const created = await createWorkItem({
        title: data.title,
        description: data.description,
        teamId,
        status: data.status,
        lane: data.lane,
        estimate: data.estimate,
        assigneeIds: data.assigneeIds,
        assigneeId: data.assigneeId,
        comments: data.comments,
      });
      if (context?.newCommentsWithMentions?.length) {
        for (const c of context.newCommentsWithMentions) {
          if (c.mentionedUserIds?.length) {
            await createMentionNotifications(created.id, data.title, teamId, c.id, c.text, c.userId, c.userName || '', c.mentionedUserIds);
          }
        }
      }
      setShowCreateForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  const handleEditSave = async (data: TaskFormPayload, context?: TaskFormSaveContext) => {
    if (!editingItem) return;
    setSaveError(null);
    try {
      await updateWorkItem(editingItem.id, {
        title: data.title,
        description: data.description,
        status: data.status,
        lane: data.lane,
        estimate: data.estimate,
        assigneeIds: data.assigneeIds,
        assigneeId: data.assigneeId,
        comments: data.comments,
      });
      if (context?.newCommentsWithMentions?.length) {
        for (const c of context.newCommentsWithMentions) {
          if (c.mentionedUserIds?.length) {
            await createMentionNotifications(editingItem.id, data.title, teamId, c.id, c.text, c.userId, c.userName || '', c.mentionedUserIds);
          }
        }
      }
      setEditingItem(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deleteWorkItem(itemId);
      setEditingItem(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      setSaveError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const effectiveColumns = COLUMNS.map((c) => ({
    ...c,
    label: (boardSettings?.columnHeaders?.[c.id]?.trim() || c.label) as string,
  }));

  const itemsForColumn = (status: WorkItemStatus) =>
    displayItems.filter((w) => w.status === status);

  const activeItem = activeId ? displayItems.find((w) => w.id === activeId) : null;
  const backlogCount = displayItems.filter((w) => w.status === 'backlog').length;

  if (boardMissingError) {
    return (
      <div className="ld-board-error">
        <strong>Board not configured</strong>
        <p style={{ margin: '8px 0 0', fontSize: '0.95rem' }}>
          This team doesn't have a board set up yet. Try creating a new team using the "+ Create Team" button, which automatically creates a board.
        </p>
      </div>
    );
  }

  return (
    <>
      {backlogCount > 0 && (
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '12px' }}>
          {backlogCount} task{backlogCount !== 1 ? 's' : ''} in backlog — use the Team tab to move them onto the board.
        </p>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="ld-board-columns">
          {effectiveColumns.map((col) => (
            <BoardColumn
              key={col.id}
              column={col}
              items={itemsForColumn(col.id)}
              memberLabels={memberLabels}
              memberAvatars={memberAvatars}
              onEditItem={setEditingItem}
              onAddItem={() => setShowCreateForm(true)}
              showHistory={col.id === 'done' ? showDoneHistory : undefined}
              onToggleHistory={col.id === 'done' ? () => setShowDoneHistory((v) => !v) : undefined}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <div className="ld-drag-overlay">
              <CardContent item={activeItem} memberLabels={memberLabels} memberAvatars={memberAvatars ?? {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showCreateForm && (
        <>
          {saveError && <p style={{ color: '#dc2626', marginBottom: '16px' }}>{saveError}</p>}
          <TaskForm
            mode="create"
            teamId={teamId}
            teamMemberIds={memberIds}
            memberLabels={memberLabels}
            memberAvatars={memberAvatars}
            onSave={handleCreateSave}
            onCancel={() => { setShowCreateForm(false); setSaveError(null); }}
          />
        </>
      )}
      {editingItem && (
        <>
          {saveError && <p style={{ color: '#dc2626', marginBottom: '16px' }}>{saveError}</p>}
          <TaskForm
            mode="edit"
            initialItem={editingItem}
            teamId={teamId}
            teamMemberIds={memberIds}
            memberLabels={memberLabels}
            memberAvatars={memberAvatars}
            onSave={handleEditSave}
            onCancel={() => { setEditingItem(null); setSaveError(null); }}
            onDelete={handleDelete}
          />
        </>
      )}
    </>
  );
};

export default BoardTabView;
