import { createClient } from "@/lib/supabase/server";
import type {
  ChAchievement,
  ChBook,
  ChBookWithStats,
  ChGoal,
  ChHighlight,
  ChNote,
  ChSession,
  ReadingStats,
  FREE_BOOK_LIMIT,
} from "./types";

// Re-export the constant so callers can import from here
export { FREE_BOOK_LIMIT } from "./types";

// ── Books ────────────────────────────────────────────────────

export async function getUserBooks(): Promise<ChBookWithStats[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("ch_books")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (!data) return [];

  // Attach aggregate stats via a separate count query per book
  // (Supabase doesn't do left-join aggregates in one call without a view)
  const bookIds = data.map((b) => b.id as string);

  const [highlightCounts, noteCounts, sessionAgg] = await Promise.all([
    supabase
      .from("ch_highlights")
      .select("book_id")
      .in("book_id", bookIds)
      .then(({ data: h }) => {
        const map: Record<string, number> = {};
        h?.forEach((r) => { map[r.book_id] = (map[r.book_id] ?? 0) + 1; });
        return map;
      }),
    supabase
      .from("ch_notes")
      .select("book_id")
      .in("book_id", bookIds)
      .then(({ data: n }) => {
        const map: Record<string, number> = {};
        n?.forEach((r) => { map[r.book_id] = (map[r.book_id] ?? 0) + 1; });
        return map;
      }),
    supabase
      .from("ch_sessions")
      .select("book_id, duration_seconds")
      .in("book_id", bookIds)
      .then(({ data: s }) => {
        const timeMap: Record<string, number> = {};
        const countMap: Record<string, number> = {};
        s?.forEach((r) => {
          timeMap[r.book_id] = (timeMap[r.book_id] ?? 0) + (r.duration_seconds ?? 0);
          countMap[r.book_id] = (countMap[r.book_id] ?? 0) + 1;
        });
        return { timeMap, countMap };
      }),
  ]);

  return data.map((b) => ({
    ...(b as ChBook),
    total_reading_time_minutes: Math.round((sessionAgg.timeMap[b.id] ?? 0) / 60),
    highlight_count: highlightCounts[b.id] ?? 0,
    note_count: noteCounts[b.id] ?? 0,
    session_count: sessionAgg.countMap[b.id] ?? 0,
  }));
}

export async function getBook(bookId: string): Promise<ChBook | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("ch_books")
    .select("*")
    .eq("id", bookId)
    .eq("user_id", user.id)
    .single();

  return data as ChBook | null;
}

export async function getUserBookCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("ch_books")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return count ?? 0;
}

// ── Goals & Streak ───────────────────────────────────────────

export async function getOrCreateGoal(): Promise<ChGoal | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("ch_goals")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (existing) return existing as ChGoal;

  const { data: created } = await supabase
    .from("ch_goals")
    .insert({ user_id: user.id })
    .select()
    .single();

  return created as ChGoal | null;
}

// ── Reading Stats ────────────────────────────────────────────

export async function getReadingStats(): Promise<ReadingStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const empty: ReadingStats = {
    total_books: 0,
    finished_books: 0,
    total_reading_time_minutes: 0,
    total_pages_read: 0,
    avg_reading_speed_wpm: 0,
    current_streak: 0,
    longest_streak: 0,
    books_this_year: 0,
    reading_time_today: 0,
    reading_time_this_week: 0,
  };

  if (!user) return empty;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

  // Fetch sessions once with started_at included; derive today/week subsets in JS
  // to avoid 3 separate ch_sessions scans per page load.
  const [books, goal, sessions, booksYear] = await Promise.all([
    supabase.from("ch_books").select("id, status", { count: "exact" }).eq("user_id", user.id),
    supabase.from("ch_goals").select("*").eq("user_id", user.id).single(),
    supabase.from("ch_sessions").select("started_at, duration_seconds, pages_read").eq("user_id", user.id),
    supabase.from("ch_books").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "finished").gte("updated_at", startOfYear),
  ]);

  const allSessions = sessions.data ?? [];
  const totalSeconds = allSessions.reduce((s, r) => s + (r.duration_seconds ?? 0), 0);
  const todaySeconds = allSessions
    .filter((r) => (r.started_at as string) >= startOfDay)
    .reduce((s, r) => s + (r.duration_seconds ?? 0), 0);
  const weekSeconds = allSessions
    .filter((r) => (r.started_at as string) >= startOfWeek)
    .reduce((s, r) => s + (r.duration_seconds ?? 0), 0);
  const totalPages = allSessions.reduce((s, r) => s + (r.pages_read ?? 0), 0);
  const finishedBooks = books.data?.filter((b) => b.status === "finished").length ?? 0;

  const g = goal.data as ChGoal | null;

  return {
    total_books: books.count ?? 0,
    finished_books: finishedBooks,
    total_reading_time_minutes: Math.round(totalSeconds / 60),
    total_pages_read: totalPages,
    avg_reading_speed_wpm: 0,
    current_streak: g?.streak_count ?? 0,
    longest_streak: g?.longest_streak ?? 0,
    books_this_year: booksYear.count ?? 0,
    reading_time_today: Math.round(todaySeconds / 60),
    reading_time_this_week: Math.round(weekSeconds / 60),
  };
}

// ── Highlights ───────────────────────────────────────────────

export async function getBookHighlights(bookId: string): Promise<ChHighlight[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("ch_highlights")
    .select("*")
    .eq("book_id", bookId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  return (data ?? []) as ChHighlight[];
}

// ── Notes ────────────────────────────────────────────────────

export async function getBookNotes(bookId: string): Promise<ChNote[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("ch_notes")
    .select("*")
    .eq("book_id", bookId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  return (data ?? []) as ChNote[];
}

// ── Heatmap (last 53 weeks of reading activity) ──────────────

/**
 * Returns a map of "YYYY-MM-DD" → minutes read on that day
 * covering the last 53 weeks (one full GitHub-style heatmap year).
 */
export async function getHeatmapData(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const since = new Date(Date.now() - 53 * 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("ch_sessions")
    .select("started_at, duration_seconds")
    .eq("user_id", user.id)
    .gte("started_at", since);

  const map: Record<string, number> = {};
  (data ?? []).forEach((s) => {
    const day = (s.started_at as string).split("T")[0];
    map[day] = (map[day] ?? 0) + Math.round(((s.duration_seconds as number) ?? 0) / 60);
  });

  return map;
}

// ── Achievements ──────────────────────────────────────────────

export async function getUserAchievements(): Promise<ChAchievement[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("ch_achievements")
    .select("*")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: true });

  return (data ?? []) as ChAchievement[];
}

// ── Recent sessions for today ─────────────────────────────────

export async function getTodaySessions(): Promise<ChSession[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("ch_sessions")
    .select("*")
    .eq("user_id", user.id)
    .gte("started_at", startOfDay.toISOString())
    .order("started_at", { ascending: false });

  return (data ?? []) as ChSession[];
}
