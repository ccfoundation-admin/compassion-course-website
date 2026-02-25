import type { WorkItemLane, WorkItemStatus } from '../types/leadership';

/**
 * Per-user board display preferences.
 * Stored in localStorage — one consolidated set of prefs
 * that applies to all teams the user views.
 */
export interface UserBoardPrefs {
  boardMode?: 'kanban' | 'scrum';
  /** Which swimlanes to show; defaults to all if unset */
  visibleLanes?: WorkItemLane[];
  /** Custom column labels; key = status id, value = display label */
  columnHeaders?: Partial<Record<WorkItemStatus, string>>;
  /** Show the backlog as a column on the main board instead of a separate tab */
  showBacklogOnBoard?: boolean;
}

const STORAGE_KEY = 'ld_board_prefs';
const DEFAULT_LANES: WorkItemLane[] = ['expedited', 'fixed_date', 'standard', 'intangible'];

const DEFAULT_PREFS: UserBoardPrefs = {
  boardMode: 'kanban',
  showBacklogOnBoard: false,
};

export function getUserBoardPrefs(): UserBoardPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<UserBoardPrefs>;

    const visibleLanes = Array.isArray(parsed.visibleLanes)
      ? (parsed.visibleLanes as WorkItemLane[])
          .filter((l) => DEFAULT_LANES.includes(l))
          .sort((a, b) => DEFAULT_LANES.indexOf(a) - DEFAULT_LANES.indexOf(b))
      : undefined;

    const columnHeaders =
      parsed.columnHeaders && typeof parsed.columnHeaders === 'object'
        ? (parsed.columnHeaders as Partial<Record<WorkItemStatus, string>>)
        : undefined;

    return {
      boardMode: parsed.boardMode === 'scrum' ? 'scrum' : 'kanban',
      visibleLanes,
      columnHeaders,
      showBacklogOnBoard: parsed.showBacklogOnBoard === true,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function setUserBoardPrefs(prefs: UserBoardPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to save board prefs:', e);
  }
}
