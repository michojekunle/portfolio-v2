import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_LEVEL, LEVELS, LessonSchema, type Lesson, type Level } from "../domain/lessons";
import type { CardSchedule, CardState } from "../domain/srs";
import { toCommitment, type Commitment } from "../domain/commitment";
import type { LanguagePack } from "../domain/language";
import type { SessionSignal } from "../domain/level-up";
import { EMPTY_STREAK, type StreakState } from "../domain/streak";
import { PersistenceError } from "./errors";

/** Row shapes mirror the *_srs_sessions / spanish_daily migrations. The card text column differs per language; it is aliased to `text` on read. */
interface CardRow {
  id: string;
  text: string;
  english_meaning: string;
  notes: string | null;
  source: "lesson" | "manual" | "error";
  state: CardState;
  ease: number;
  interval_days: number;
  reps: number;
  lapses: number;
  due_at: string;
  last_reviewed_at: string | null;
}

interface StreakRow {
  current_streak: number;
  longest_streak: number;
  streak_freezes: number | null;
  last_completed_date: string | null;
  total_completions: number;
}

export interface Card {
  readonly id: string;
  readonly french: string;
  readonly english: string;
  readonly notes: string | null;
  readonly source: "lesson" | "manual" | "error";
  readonly schedule: CardSchedule;
}

export interface Profile {
  readonly level: Level;
  readonly timezone: string;
  readonly dailyMinutes: Commitment;
}

export interface NewCardInput {
  readonly french: string;
  readonly english: string;
  readonly notes?: string;
  readonly source: "lesson" | "error";
}

export interface SessionRecord {
  readonly clientSessionId: string;
  readonly sessionDate: string;
  readonly level: Level;
  readonly durationSeconds: number;
  readonly reviews: number;
  readonly reviewsRecalled: number;
  readonly newCards: number;
  readonly speakScore: number | null;
  readonly writingCorrect: boolean | null;
}

const cardColumns = (textColumn: string): string =>
  `id, text:${textColumn}, english_meaning, notes, source, state, ease, interval_days, reps, lapses, due_at, last_reviewed_at`;

function toCard(row: CardRow): Card {
  return {
    id: row.id,
    french: row.text,
    english: row.english_meaning,
    notes: row.notes,
    source: row.source,
    schedule: {
      state: row.state,
      ease: row.ease,
      intervalDays: row.interval_days,
      reps: row.reps,
      lapses: row.lapses,
      dueAt: new Date(row.due_at),
      lastReviewedAt: row.last_reviewed_at ? new Date(row.last_reviewed_at) : null,
    },
  };
}

function fail(operation: string, error: unknown): never {
  throw new PersistenceError(operation, error);
}

export function createRepository(db: SupabaseClient, pack: LanguagePack) {
  const t = pack.tables;
  const CARD_COLUMNS = cardColumns(t.cardText);
  return {
    async getProfile(userId: string): Promise<Profile | null> {
      const { data, error } = await db
        .from(t.profiles)
        .select("level, timezone, daily_minutes")
        .eq("user_id", userId)
        .maybeSingle<{ level: string; timezone: string; daily_minutes: number | null }>();
      if (error) fail("getProfile", error);
      if (!data) return null;
      const level = (LEVELS as readonly string[]).includes(data.level) ? (data.level as Level) : DEFAULT_LEVEL;
      return { level, timezone: data.timezone, dailyMinutes: toCommitment(data.daily_minutes) };
    },

    async upsertProfile(userId: string, profile: Profile): Promise<void> {
      const { error } = await db.from(t.profiles).upsert(
        {
          user_id: userId,
          level: profile.level,
          timezone: profile.timezone,
          daily_minutes: profile.dailyMinutes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (error) fail("upsertProfile", error);
    },

    async getStreak(userId: string): Promise<StreakState> {
      const { data, error } = await db
        .from(t.streaks)
        .select("current_streak, longest_streak, streak_freezes, last_completed_date, total_completions")
        .eq("user_id", userId)
        .maybeSingle<StreakRow>();
      if (error) fail("getStreak", error);
      if (!data) return EMPTY_STREAK;
      return {
        current: data.current_streak,
        longest: data.longest_streak,
        freezes: data.streak_freezes ?? EMPTY_STREAK.freezes,
        lastCompletedDate: data.last_completed_date,
        totalCompletions: data.total_completions,
      };
    },

    async saveStreak(userId: string, streak: StreakState): Promise<void> {
      const { error } = await db.from(t.streaks).upsert(
        {
          user_id: userId,
          current_streak: streak.current,
          longest_streak: streak.longest,
          streak_freezes: streak.freezes,
          last_completed_date: streak.lastCompletedDate,
          total_completions: streak.totalCompletions,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (error) fail("saveStreak", error);
    },

    async listDueCards(userId: string, dueBefore: Date, limit: number): Promise<Card[]> {
      const { data, error } = await db
        .from(t.cards)
        .select(CARD_COLUMNS)
        .eq("user_id", userId)
        .lte("due_at", dueBefore.toISOString())
        .order("due_at", { ascending: true })
        .limit(limit)
        .returns<CardRow[]>();
      if (error) fail("listDueCards", error);
      return (data ?? []).map(toCard);
    },

    async countDueCards(userId: string, dueBefore: Date): Promise<number> {
      const { count, error } = await db
        .from(t.cards)
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .lte("due_at", dueBefore.toISOString());
      if (error) fail("countDueCards", error);
      return count ?? 0;
    },

    async getCardsByIds(userId: string, ids: readonly string[]): Promise<Card[]> {
      if (ids.length === 0) return [];
      const { data, error } = await db
        .from(t.cards)
        .select(CARD_COLUMNS)
        .eq("user_id", userId)
        .in("id", [...ids])
        .returns<CardRow[]>();
      if (error) fail("getCardsByIds", error);
      return (data ?? []).map(toCard);
    },

    async updateCardSchedules(userId: string, updates: readonly { id: string; schedule: CardSchedule }[]): Promise<void> {
      const results = await Promise.all(
        updates.map(({ id, schedule }) =>
          db
            .from(t.cards)
            .update({
              state: schedule.state,
              ease: schedule.ease,
              interval_days: schedule.intervalDays,
              reps: schedule.reps,
              lapses: schedule.lapses,
              due_at: schedule.dueAt.toISOString(),
              last_reviewed_at: schedule.lastReviewedAt?.toISOString() ?? null,
            })
            .eq("id", id)
            .eq("user_id", userId)
        )
      );
      const failed = results.find((result) => result.error);
      if (failed?.error) fail("updateCardSchedules", failed.error);
    },

    /** Inserts only brand-new words — an existing card's progress is never reset. */
    async addNewCards(userId: string, cards: readonly NewCardInput[], schedule: CardSchedule): Promise<void> {
      if (cards.length === 0) return;
      const rows = cards.map((card) => ({
        user_id: userId,
        [t.cardText]: card.french,
        english_meaning: card.english,
        notes: card.notes ?? null,
        source: card.source,
        state: schedule.state,
        ease: schedule.ease,
        interval_days: schedule.intervalDays,
        due_at: schedule.dueAt.toISOString(),
      }));
      const { error } = await db
        .from(t.cards)
        .upsert(rows, { onConflict: `user_id,${t.cardText}`, ignoreDuplicates: true });
      if (error) fail("addNewCards", error);
    },

    async getLesson(userId: string, lessonDate: string): Promise<Lesson | null> {
      const { data, error } = await db
        .from(t.lessons)
        .select("content")
        .eq("user_id", userId)
        .eq("lesson_date", lessonDate)
        .maybeSingle<{ content: unknown }>();
      if (error) fail("getLesson", error);
      if (!data) return null;
      const parsed = LessonSchema.safeParse(data.content);
      return parsed.success ? parsed.data : null;
    },

    async saveLesson(userId: string, lessonDate: string, lesson: Lesson): Promise<void> {
      const { error } = await db
        .from(t.lessons)
        .upsert(
          { user_id: userId, lesson_date: lessonDate, level: lesson.level, content: lesson },
          { onConflict: "user_id,lesson_date", ignoreDuplicates: true }
        );
      if (error) fail("saveLesson", error);
    },

    async hasSession(userId: string, clientSessionId: string): Promise<boolean> {
      const { count, error } = await db
        .from(t.sessions)
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("client_session_id", clientSessionId);
      if (error) fail("hasSession", error);
      return (count ?? 0) > 0;
    },

    /** Newest first; only the fields the level-up rule reads. */
    async listRecentSessions(userId: string, limit: number): Promise<SessionSignal[]> {
      const { data, error } = await db
        .from(t.sessions)
        .select("level, reviews, reviews_recalled, speak_score, writing_correct")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) fail("listRecentSessions", error);
      const rows = (data ?? []) as {
        level: string;
        reviews: number;
        reviews_recalled: number;
        speak_score: number | null;
        writing_correct: boolean | null;
      }[];
      return rows.flatMap((row) => {
        const level = LEVELS.find((candidate) => candidate === row.level);
        if (!level) return [];
        return [{ level, reviews: row.reviews, reviewsRecalled: row.reviews_recalled, speakScore: row.speak_score, writingCorrect: row.writing_correct }];
      });
    },

    async insertSession(userId: string, record: SessionRecord): Promise<void> {
      const { error } = await db.from(t.sessions).insert({
        user_id: userId,
        client_session_id: record.clientSessionId,
        session_date: record.sessionDate,
        level: record.level,
        duration_seconds: record.durationSeconds,
        reviews: record.reviews,
        reviews_recalled: record.reviewsRecalled,
        new_cards: record.newCards,
        speak_score: record.speakScore,
        writing_correct: record.writingCorrect,
      });
      if (error) fail("insertSession", error);
    },

    /**
     * The reminder cron (api/french/trigger) decides "did they practise today?"
     * from french_logs. Keep writing one row per completed day so reminders
     * stop the moment a session is finished. Languages without reminders skip it.
     */
    async insertCompletionLog(userId: string): Promise<void> {
      if (!t.completionLog) return;
      const { error } = await db.from(t.completionLog).insert({ user_id: userId, type: "speaking" });
      if (error) fail("insertCompletionLog", error);
    },
  };
}

export type LearnRepository = ReturnType<typeof createRepository>;
