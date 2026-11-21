import { daysBetween } from "./dates";

export const MAX_FREEZES = 2;
/** A freeze is earned each time the streak reaches a multiple of this. */
export const FREEZE_EARN_INTERVAL = 7;

export interface StreakState {
  readonly current: number;
  readonly longest: number;
  readonly freezes: number;
  readonly lastCompletedDate: string | null;
  readonly totalCompletions: number;
}

export const EMPTY_STREAK: StreakState = {
  current: 0,
  longest: 0,
  freezes: MAX_FREEZES,
  lastCompletedDate: null,
  totalCompletions: 0,
};

export interface StreakView {
  readonly current: number;
  readonly completedToday: boolean;
  /** Streak is alive but today's session is still needed to keep it. */
  readonly atRisk: boolean;
}

/**
 * What to *show* — pure read, never writes. The legacy `/today` GET consumed
 * freezes as a side effect of merely opening the page; consumption now happens
 * only when a session is actually completed.
 */
export function viewStreak(state: StreakState, today: string): StreakView {
  const last = state.lastCompletedDate;
  if (last === null) return { current: 0, completedToday: false, atRisk: false };

  const gap = Math.max(0, daysBetween(last, today));
  if (gap === 0) return { current: state.current, completedToday: true, atRisk: false };
  if (gap === 1) return { current: state.current, completedToday: false, atRisk: true };

  const missedDays = gap - 1;
  return missedDays <= state.freezes
    ? { current: state.current, completedToday: false, atRisk: true }
    : { current: 0, completedToday: false, atRisk: false };
}

export interface CompletionResult {
  readonly state: StreakState;
  readonly alreadyCompleted: boolean;
  readonly freezesUsed: number;
  readonly freezeEarned: boolean;
}

export function applyCompletion(state: StreakState, today: string): CompletionResult {
  const last = state.lastCompletedDate;

  if (last !== null && daysBetween(last, today) <= 0) {
    return { state, alreadyCompleted: true, freezesUsed: 0, freezeEarned: false };
  }

  let current = 1;
  let freezes = state.freezes;
  let freezesUsed = 0;

  if (last !== null) {
    const missedDays = daysBetween(last, today) - 1;
    if (missedDays <= 0) {
      current = state.current + 1;
    } else if (missedDays <= freezes) {
      current = state.current + 1;
      freezes -= missedDays;
      freezesUsed = missedDays;
    }
  }

  let freezeEarned = false;
  if (current % FREEZE_EARN_INTERVAL === 0 && freezes < MAX_FREEZES) {
    freezes += 1;
    freezeEarned = true;
  }

  return {
    state: {
      current,
      longest: Math.max(state.longest, current),
      freezes,
      lastCompletedDate: today,
      totalCompletions: state.totalCompletions + 1,
    },
    alreadyCompleted: false,
    freezesUsed,
    freezeEarned,
  };
}
