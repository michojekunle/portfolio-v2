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

export interface ReminderSettings {
  readonly time: string | null;
  readonly email: boolean;
  readonly push: boolean;
}

interface ReminderRow {
  user_id: string;
  language: LanguageId;
  enabled: boolean;
  reminder_time: string;
  timezone: string;
  email: boolean;
  push_subscription: PushSubscriptionInput | null;
  last_sent_on: string | null;
}

function fail(operation: string, cause: unknown): never {
  throw new PersistenceError(`Database operation failed: ${operation}`, { cause });
}

// ── Learner settings (user-scoped client; RLS limits to own rows) ─────────

export async function getReminder(db: SupabaseClient, userId: string, language: LanguageId): Promise<ReminderSettings> {
  const { data, error } = await db
    .from("learn_reminders")
    .select("enabled, reminder_time, email, push_subscription")
    .eq("user_id", userId)
    .eq("language", language)
    .maybeSingle<Pick<ReminderRow, "enabled" | "reminder_time" | "email" | "push_subscription">>();
  if (error) fail("getReminder", error);
  if (!data) return { time: null, email: false, push: false };
  return { time: data.enabled ? data.reminder_time : null, email: data.email, push: data.push_subscription !== null };
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
  readonly listEnabled: () => Promise<readonly ReminderRow[]>;
  /** Local date of the learner's last finished page in that language, or null. */
  readonly lastCompletedOn: (userId: string, language: LanguageId) => Promise<string | null>;
  /** Resolves "gone" when the browser unsubscribed (HTTP 404/410), so the row can be cleaned. */
  readonly sendPush: (subscription: PushSubscriptionInput, message: ReminderMessage) => Promise<"sent" | "gone">;
  readonly sendEmail: (userId: string, message: ReminderMessage) => Promise<void>;
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

/** Sends every reminder that is due right now. One learner's failure never stops the rest. */
export async function runReminderJob(deps: ReminderJobDeps): Promise<ReminderJobResult> {
  const now = deps.now();
  const rows = await deps.listEnabled();
  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const lastCompletedOn = await deps.lastCompletedOn(row.user_id, row.language);
      const due = isReminderDue({ time: row.reminder_time, timezone: row.timezone, lastSentOn: row.last_sent_on, lastCompletedOn }, now);
      if (!due) continue;

      const message = REMINDER_COPY[row.language];
      let delivered = false;
      if (row.push_subscription) {
        const outcome = await deps.sendPush(row.push_subscription, message);
        if (outcome === "gone") await deps.clearPush(row.user_id, row.language);
        else delivered = true;
      }
      if (row.email) {
        await deps.sendEmail(row.user_id, message);
        delivered = true;
      }
      if (delivered) {
        await deps.markSent(row.user_id, row.language, localDateString(row.timezone, now));
        sent += 1;
      }
    } catch (error) {
      failed += 1;
      console.error(`[learn/reminders] failed for one learner (${row.language})`, error instanceof Error ? error.message : error);
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
    listEnabled: async () => {
      const { data, error } = await admin.from("learn_reminders").select("*").eq("enabled", true).returns<ReminderRow[]>();
      if (error) fail("listEnabledReminders", error);
      return data ?? [];
    },
    lastCompletedOn: async (userId, language) => {
      const { data, error } = await admin
        .from(streakTable[language])
        .select("last_completed_date")
        .eq("user_id", userId)
        .maybeSingle<{ last_completed_date: string | null }>();
      if (error) fail("lastCompletedOn", error);
      return data?.last_completed_date ?? null;
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
