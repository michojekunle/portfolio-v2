import type { ChGoal } from "./types";

export function isStreakAlive(goal: ChGoal): boolean {
  if (!goal.last_read_date) return false;
  
  const lastReadStr = String(goal.last_read_date).slice(0, 10);

  // Client side (browser) uses the device's actual local timezone
  if (typeof window !== "undefined") {
    const fmt = (d: Date): string => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86_400_000);
    return lastReadStr === fmt(today) || lastReadStr === fmt(yesterday);
  }

  // Server side (Next.js SSR / API) fallback using UTC matching or a 38-hour timestamp grace period
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterdayStr = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  
  if (lastReadStr === todayStr || lastReadStr === yesterdayStr) {
    return true;
  }

  const lastReadMs = Date.parse(`${lastReadStr}T00:00:00.000Z`);
  if (isNaN(lastReadMs)) return false;

  const diffMs = now.getTime() - lastReadMs;
  // 38-hour window covers Day N's local reading and up to 14 hours timezone shift (UTC-12 to UTC+14)
  return diffMs >= 0 && diffMs <= 38 * 60 * 60 * 1000;
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
