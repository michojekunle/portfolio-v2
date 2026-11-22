/**
 * Daily reminders: per-learner settings (user-scoped, RLS) and the hourly job
 * (service role). The job is pure orchestration over injected dependencies so
 * it is testable without push services, email or a database.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LanguageId } from "../domain/language";
import { localDateString } from "../domain/dates";
import { isReminderDue } from "../domain/reminders";
import type { PushSubscriptionInput, ReminderUpdate } from "../domain/schemas";
import { PersistenceError } from "./errors";
import { fetchAll } from "./paged";

export interface ReminderSettings {
  readonly time: string | null;
  readonly email: boolean;
  readonly push: boolean;
  /** Opt-in Sunday email with the week's numbers. */
  readonly weeklySummary: boolean;
  /** Opt-in nudge when the learner's group streak is at risk tonight. */
  readonly groupNudges: boolean;
}

export interface ReminderRow {
  user_id: string;
  language: LanguageId;
  enabled: boolean;
  reminder_time: string;
  timezone: string;
  email: boolean;
  push_subscription: PushSubscriptionInput | null;
  last_sent_on: string | null;
  weekly_summary: boolean;
  last_weekly_on: string | null;
  group_nudges: boolean;
  last_nudge_on: string | null;
}

function fail(operation: string, cause: unknown): never {
  throw new PersistenceError(operation, cause);
}

// ── Learner settings (user-scoped client; RLS limits to own rows) ─────────

export async function getReminder(db: SupabaseClient, userId: string, language: LanguageId): Promise<ReminderSettings> {
  const { data, error } = await db
    .from("learn_reminders")
    .select("enabled, reminder_time, email, push_subscription, weekly_summary, group_nudges")
    .eq("user_id", userId)
    .eq("language", language)
    .maybeSingle<Pick<ReminderRow, "enabled" | "reminder_time" | "email" | "push_subscription" | "weekly_summary" | "group_nudges">>();
  if (error) fail("getReminder", error);
  if (!data) return { time: null, email: false, push: false, weeklySummary: false, groupNudges: false };
  return {
    time: data.enabled ? data.reminder_time : null,
    email: data.email,
    push: data.push_subscription !== null,
    weeklySummary: data.weekly_summary,
    groupNudges: data.group_nudges,
  };
}

export async function saveReminder(db: SupabaseClient, userId: string, language: LanguageId, update: ReminderUpdate): Promise<ReminderSettings> {
  const row: Record<string, unknown> = {
    user_id: userId,
    language,
    enabled: update.time !== null,
    timezone: update.timezone,
    email: update.email,
    updated_at: new Date().toISOString(),
  };
  if (update.time !== null) row.reminder_time = update.time;
  if (update.push !== undefined) row.push_subscription = update.push;
  if (update.weeklySummary !== undefined) row.weekly_summary = update.weeklySummary;
  if (update.groupNudges !== undefined) row.group_nudges = update.groupNudges;
  const { error } = await db.from("learn_reminders").upsert(row, { onConflict: "user_id,language" });
  if (error) fail("saveReminder", error);
  return getReminder(db, userId, language);
}

// ── Hourly job ────────────────────────────────────────────────────────────

export interface ReminderMessage {
  readonly language: LanguageId;
  readonly title: string;
  readonly body: string;
  readonly url: string;
}

export interface ReminderJobDeps {
  readonly now: () => Date;
  /** Every learner with a reminder, weekly summary or nudge switched on; the jobs pick what's due. */
  readonly listActive: () => Promise<readonly ReminderRow[]>;
  /** Local date of each learner's last finished page in that language (learners with none are absent). */
  readonly lastCompletedOn: (language: LanguageId, userIds: readonly string[]) => Promise<ReadonlyMap<string, string>>;
  /** "gone" when the browser unsubscribed (HTTP 404/410), so the row can be cleaned; "skipped" when push isn't configured. */
  readonly sendPush: (subscription: PushSubscriptionInput, message: ReminderMessage) => Promise<"sent" | "gone" | "skipped">;
  /** "skipped" when email isn't configured, so nothing is marked as sent. */
  readonly sendEmail: (userId: string, message: ReminderMessage) => Promise<"sent" | "skipped">;
  readonly markSent: (userId: string, language: LanguageId, localDate: string) => Promise<void>;
  readonly clearPush: (userId: string, language: LanguageId) => Promise<void>;
}

export const REMINDER_COPY: Record<LanguageId, ReminderMessage> = {
  fr: { language: "fr", title: "Ta page de français t'attend", body: "Dix minutes, et ta série continue. On y va ?", url: "/french?start=1&source=reminder" },
  es: { language: "es", title: "Tu página de español te espera", body: "Diez minutos y tu racha sigue. ¿Empezamos?", url: "/spanish?start=1&source=reminder" },
};

export interface ReminderJobResult {
  readonly checked: number;
  readonly sent: number;
  readonly failed: number;
}

function dueIgnoringCompletion(row: ReminderRow, now: Date): boolean {
  try {
    return isReminderDue({ time: row.reminder_time, timezone: row.timezone, lastSentOn: row.last_sent_on, lastCompletedOn: null, lastNudgeOn: row.last_nudge_on }, now);
  } catch (error) {
    // A bad stored timezone shouldn't stop everyone else's reminders.
    console.error(`[learn/reminders] unreadable reminder settings (${row.language})`, error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Sends every reminder that is due right now. One learner's failure never stops the rest.
 * Only ~1/24 of learners are at their reminder hour, so the cheap time checks run first and
 * "did they already finish today?" is fetched in one query per language for those few.
 */
export async function runReminderJob(deps: ReminderJobDeps): Promise<ReminderJobResult> {
  const now = deps.now();
  const rows = await deps.listActive();
  const candidates = rows.filter((row) => row.enabled && dueIgnoringCompletion(row, now));
  let sent = 0;
  let failed = 0;

  const languages = [...new Set(candidates.map((row) => row.language))];
  for (const language of languages) {
    const group = candidates.filter((row) => row.language === language);
    let completed: ReadonlyMap<string, string>;
    try {
      completed = await deps.lastCompletedOn(language, group.map((row) => row.user_id));
    } catch (error) {
      failed += group.length;
      console.error(`[learn/reminders] couldn't read progress (${language})`, error instanceof Error ? error.message : error);
      continue;
    }

    for (const row of group) {
      try {
        if (completed.get(row.user_id) === localDateString(row.timezone, now)) continue;

        const message = REMINDER_COPY[row.language];
        let delivered = false;
        if (row.push_subscription) {
          const outcome = await deps.sendPush(row.push_subscription, message);
          if (outcome === "gone") await deps.clearPush(row.user_id, row.language);
          else if (outcome === "sent") delivered = true;
        }
        if (row.email && (await deps.sendEmail(row.user_id, message)) === "sent") delivered = true;
        if (delivered) {
          sent += 1;
          try {
            await deps.markSent(row.user_id, row.language, localDateString(row.timezone, now));
          } catch (error) {
            // Already delivered: don't report a failed send, but flag the missing record.
            console.error(`[learn/reminders] sent but could not be recorded (${row.language})`, error instanceof Error ? error.message : error);
          }
        }
      } catch (error) {
        failed += 1;
        console.error(`[learn/reminders] failed for one learner (${row.language})`, error instanceof Error ? error.message : error);
      }
    }
  }
  return { checked: rows.length, sent, failed };
}

/** Wires the job to Supabase (service role). Push and email senders are passed in by the route. */
export function supabaseReminderDeps(
  admin: SupabaseClient,
  senders: Pick<ReminderJobDeps, "sendPush" | "sendEmail">
): ReminderJobDeps {
  const streakTable: Record<LanguageId, string> = { fr: "french_user_streaks", es: "spanish_user_streaks" };
  return {
    now: () => new Date(),
    // Paged: a plain select stops at 1000 rows and would silently drop everyone after that.
    listActive: () =>
      fetchAll<ReminderRow>("listActiveReminders", (from, to) =>
        admin
          .from("learn_reminders")
          .select("*")
          .or("enabled.eq.true,weekly_summary.eq.true,group_nudges.eq.true")
          .order("user_id")
          .order("language")
          .range(from, to)
          .returns<ReminderRow[]>()
      ),
    lastCompletedOn: async (language, userIds) => {
      const result = new Map<string, string>();
      // Chunked so a big hour never builds an oversized URL.
      for (let i = 0; i < userIds.length; i += 200) {
        const { data, error } = await admin
          .from(streakTable[language])
          .select("user_id, last_completed_date")
          .in("user_id", userIds.slice(i, i + 200))
          .returns<{ user_id: string; last_completed_date: string | null }[]>();
        if (error) fail("lastCompletedOn", error);
        for (const row of data ?? []) if (row.last_completed_date) result.set(row.user_id, row.last_completed_date);
      }
      return result;
    },

    markSent: async (userId, language, localDate) => {
      const { error } = await admin.from("learn_reminders").update({ last_sent_on: localDate }).eq("user_id", userId).eq("language", language);
      if (error) fail("markReminderSent", error);
    },
    clearPush: async (userId, language) => {
      const { error } = await admin.from("learn_reminders").update({ push_subscription: null }).eq("user_id", userId).eq("language", language);
      if (error) fail("clearReminderPush", error);
    },
    ...senders,
  };
}

/** A learner's sign-in email, for email reminders (service role). */
export async function learnerEmail(admin: SupabaseClient, userId: string): Promise<string | null> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error) fail("learnerEmail", error);
  return data.user?.email ?? null;
}
