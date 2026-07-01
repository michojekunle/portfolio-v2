import type { ChGoal } from "./types";

export function isStreakAlive(goal: ChGoal): boolean {
  if (!goal.last_read_date) return false;
  // last_read_date is stored as a "YYYY-MM-DD" string (local date from client).
  // Compare as plain strings to avoid UTC/local timezone drift when parsing dates.
  const lastReadStr = String(goal.last_read_date).slice(0, 10);
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterdayStr = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  return lastReadStr === todayStr || lastReadStr === yesterdayStr;
}

export function goalProgressPct(readMinutesToday: number, dailyGoalMinutes: number): number {
  if (dailyGoalMinutes === 0) return 100;
  return Math.min(100, Math.round((readMinutesToday / dailyGoalMinutes) * 100));
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function estimateFinishDate(
  currentPage: number,
  totalPages: number,
  avgPagesPerSession: number,
  sessionsPerWeek: number
): Date | null {
  if (!totalPages || avgPagesPerSession === 0 || sessionsPerWeek === 0) return null;
  const pagesLeft = totalPages - currentPage;
  const sessionsLeft = Math.ceil(pagesLeft / avgPagesPerSession);
  const daysLeft = Math.ceil((sessionsLeft / sessionsPerWeek) * 7);
  const result = new Date();
  result.setDate(result.getDate() + daysLeft);
  return result;
}
