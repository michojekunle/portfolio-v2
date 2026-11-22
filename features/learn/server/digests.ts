/**
 * Opt-in extras that ride on the hourly job: the Sunday weekly summary email
 * and the group-streak nudge. Orchestration over injected dependencies, like
 * reminders, so it's testable without push, email or a database.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { localDateString } from "../domain/dates";
import {
  groupNudgeMessage,
  isNudgeHour,
  isWeeklySummaryDue,
  nudgeStreak,
  summariseWeek,
  weeklySummaryMessage,
  type DigestMessage,
  type DigestState,
  type WeekSession,
} from "../domain/digests";
import type { MemberActivity } from "../domain/groups";
import { EMPTY_STREAK, viewStreak } from "../domain/streak";
import { GROUP_STREAK_MAX_DAYS } from "../domain/groups";
import type { LanguageId } from "../domain/language";
import { PersistenceError } from "./errors";
import { fetchAll } from "./paged";
import type { ReminderJobDeps, ReminderRow } from "./reminders";

export interface DigestJobDeps {
  readonly now: () => Date;
  readonly listActive: () => Promise<readonly ReminderRow[]>;
  readonly weekSessions: (userId: string, language: LanguageId, sinceDate: string) => Promise<readonly WeekSession[]>;
  /** The streak as the app shows it for `today` (the learner's local date). */
  readonly currentStreak: (userId: string, language: LanguageId, today: string) => Promise<number>;
  readonly lastCompletedOn: ReminderJobDeps["lastCompletedOn"];
  /** For each learner, the members of their group in that language (learners with no group are absent). */
  readonly groupsFor: (language: LanguageId, userIds: readonly string[]) => Promise<ReadonlyMap<string, readonly MemberActivity[]>>;
  readonly sendPush: ReminderJobDeps["sendPush"];
  readonly sendEmail: ReminderJobDeps["sendEmail"];
  readonly markWeekly: (userId: string, language: LanguageId, localDate: string) => Promise<void>;
  readonly markNudge: (userId: string, language: LanguageId, localDate: string) => Promise<void>;
  readonly clearPush: ReminderJobDeps["clearPush"];
}

export interface DigestResult {
  readonly weekly: { readonly due: number; readonly sent: number; readonly failed: number };
  readonly nudges: { readonly due: number; readonly sent: number; readonly failed: number };
}

const stateOf = (row: ReminderRow): DigestState => ({
  timezone: row.timezone,
  time: row.reminder_time,
  lastWeeklyOn: row.last_weekly_on,
  lastNudgeOn: row.last_nudge_on,
  lastSentOn: row.last_sent_on,
});

function safely<T>(row: ReminderRow, check: () => T, fallback: T): T {
  try {
    return check();
  } catch (error) {
    // A bad stored time zone shouldn't stop everyone else's mail.
    console.error(`[learn/digests] unreadable settings (${row.language})`, error instanceof Error ? error.message : error);
    return fallback;
  }
}

/** The message already went out; if remembering that fails, say so loudly but don't call the send a failure. */
async function recordSent(kind: string, row: ReminderRow, mark: () => Promise<void>): Promise<void> {
  try {
    await mark();
  } catch (error) {
    console.error(`[learn/digests] ${kind} was sent but could not be recorded (${row.language}); it may be sent again if the job re-runs this hour`, error instanceof Error ? error.message : error);
  }
}

function sevenDaysBefore(localDate: string): string {
  const d = new Date(`${localDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 6);
  return d.toISOString().slice(0, 10);
}

export async function runDigestJob(deps: DigestJobDeps): Promise<DigestResult> {
  const now = deps.now();
  const rows = await deps.listActive();
  const weekly = { due: 0, sent: 0, failed: 0 };
  const nudges = { due: 0, sent: 0, failed: 0 };

  // ── Weekly summary: email, Sundays at the learner's hour ──
  for (const row of rows.filter((r) => r.weekly_summary && safely(r, () => isWeeklySummaryDue(stateOf(r), now), false))) {
    weekly.due += 1;
    try {
      const today = localDateString(row.timezone, now);
      const [sessions, streak] = await Promise.all([deps.weekSessions(row.user_id, row.language, sevenDaysBefore(today)), deps.currentStreak(row.user_id, row.language, today)]);
      const message = weeklySummaryMessage(row.language, summariseWeek(sessions), streak);
      if ((await deps.sendEmail(row.user_id, message)) === "sent") {
        weekly.sent += 1;
        await recordSent("weekly", row, () => deps.markWeekly(row.user_id, row.language, today));
      }
    } catch (error) {
      weekly.failed += 1;
      console.error(`[learn/digests] weekly summary failed (${row.language})`, error instanceof Error ? error.message : error);
    }
  }

  // ── Group nudge: at 19:00 local, only to people still missing today in a streaking group ──
  const atNudgeHour = rows.filter((r) => r.group_nudges && safely(r, () => isNudgeHour(stateOf(r), now), false));
  for (const language of [...new Set(atNudgeHour.map((r) => r.language))]) {
    const group = atNudgeHour.filter((r) => r.language === language);
    const ids = group.map((r) => r.user_id);
    let completed: ReadonlyMap<string, string>;
    let groups: ReadonlyMap<string, readonly MemberActivity[]>;
    try {
      [completed, groups] = await Promise.all([deps.lastCompletedOn(language, ids), deps.groupsFor(language, ids)]);
    } catch (error) {
      nudges.failed += group.length;
      console.error(`[learn/digests] couldn't read group data (${language})`, error instanceof Error ? error.message : error);
      continue;
    }

    for (const row of group) {
      try {
        const today = localDateString(row.timezone, now);
        if (completed.get(row.user_id) === today) continue;
        const members = groups.get(row.user_id);
        const streak = members ? nudgeStreak(members, row.user_id, today) : null;
        if (streak === null) continue;
        nudges.due += 1;

        const message: DigestMessage = groupNudgeMessage(row.language, streak);
        let delivered = false;
        if (row.push_subscription) {
          const outcome = await deps.sendPush(row.push_subscription, message);
          if (outcome === "gone") await deps.clearPush(row.user_id, row.language);
          else if (outcome === "sent") delivered = true;
        }
        if (row.email && (await deps.sendEmail(row.user_id, message)) === "sent") delivered = true;
        if (delivered) {
          nudges.sent += 1;
          await recordSent("nudge", row, () => deps.markNudge(row.user_id, row.language, today));
        }
      } catch (error) {
        nudges.failed += 1;
        console.error(`[learn/digests] nudge failed (${row.language})`, error instanceof Error ? error.message : error);
      }
    }
  }

  return { weekly, nudges };
}

// ── Supabase wiring (service role) ──────────────────────────────────────

const TABLES: Record<LanguageId, { readonly sessions: string; readonly streaks: string }> = {
  fr: { sessions: "french_sessions", streaks: "french_user_streaks" },
  es: { sessions: "spanish_sessions", streaks: "spanish_user_streaks" },
};

function fail(operation: string, cause: unknown): never {
  throw new PersistenceError(operation, cause);
}

const chunk = <T>(items: readonly T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

export function supabaseDigestDeps(
  admin: SupabaseClient,
  base: Pick<ReminderJobDeps, "listActive" | "lastCompletedOn" | "sendPush" | "sendEmail" | "clearPush">
): DigestJobDeps {
  return {
    now: () => new Date(),
    ...base,
    weekSessions: async (userId, language, sinceDate) => {
      const { data, error } = await admin
        .from(TABLES[language].sessions)
        .select("session_date, reviews, reviews_recalled, new_cards")
        .eq("user_id", userId)
        .gte("session_date", sinceDate)
        .returns<{ session_date: string; reviews: number; reviews_recalled: number; new_cards: number }[]>();
      if (error) fail("weekSessions", error);
      return (data ?? []).map((r) => ({ sessionDate: r.session_date, reviews: r.reviews, reviewsRecalled: r.reviews_recalled, newCards: r.new_cards }));
    },
    // The stored number only changes on completion; viewStreak applies lapses and freezes exactly as the app does.
    currentStreak: async (userId, language, today) => {
      const { data, error } = await admin
        .from(TABLES[language].streaks)
        .select("current_streak, longest_streak, streak_freezes, last_completed_date, total_completions")
        .eq("user_id", userId)
        .maybeSingle<{ current_streak: number; longest_streak: number; streak_freezes: number | null; last_completed_date: string | null; total_completions: number }>();
      if (error) fail("currentStreak", error);
      if (!data) return 0;
      return viewStreak(
        { current: data.current_streak, longest: data.longest_streak, freezes: data.streak_freezes ?? EMPTY_STREAK.freezes, lastCompletedDate: data.last_completed_date, totalCompletions: data.total_completions },
        today
      ).current;
    },
    groupsFor: async (language, userIds) => {
      const result = new Map<string, MemberActivity[]>();
      for (const ids of chunk(userIds, 100)) {
        // Which group each learner is in for this language.
        const { data: mine, error: mineError } = await admin
          .from("learn_group_members")
          .select("user_id, group_id, learn_groups!inner(language)")
          .in("user_id", ids)
          .eq("learn_groups.language", language)
          .returns<{ user_id: string; group_id: string }[]>();
        if (mineError) fail("groupsFor.mine", mineError);
        const groupIds = [...new Set((mine ?? []).map((m) => m.group_id))];
        if (groupIds.length === 0) continue;

        const { data: members, error: membersError } = await admin
          .from("learn_group_members")
          .select("group_id, user_id, display_name, joined_at")
          .in("group_id", groupIds)
          .returns<{ group_id: string; user_id: string; display_name: string; joined_at: string }[]>();
        if (membersError) fail("groupsFor.members", membersError);

        const memberIds = [...new Set((members ?? []).map((m) => m.user_id))];
        const since = new Date(Date.now() - (GROUP_STREAK_MAX_DAYS + 2) * 86_400_000).toISOString().slice(0, 10);
        const doneBy = new Map<string, Set<string>>();
        for (const memberChunk of chunk(memberIds, 25)) {
          const sessions = await fetchAll<{ user_id: string; session_date: string }>("groupsFor.sessions", (from, to) =>
            admin
              .from(TABLES[language].sessions)
              .select("user_id, session_date")
              .in("user_id", memberChunk)
              .gte("session_date", since)
              .order("user_id")
              .order("session_date")
              .order("id")
              .range(from, to)
              .returns<{ user_id: string; session_date: string }[]>()
          );
          for (const s of sessions) {
            const set = doneBy.get(s.user_id) ?? new Set<string>();
            set.add(s.session_date);
            doneBy.set(s.user_id, set);
          }
        }

        const byGroup = new Map<string, MemberActivity[]>();
        for (const m of members ?? []) {
          const list = byGroup.get(m.group_id) ?? [];
          list.push({ userId: m.user_id, displayName: m.display_name, joinedOn: m.joined_at.slice(0, 10), completedOn: [...(doneBy.get(m.user_id) ?? [])] });
          byGroup.set(m.group_id, list);
        }
        for (const m of mine ?? []) {
          const list = byGroup.get(m.group_id);
          if (list) result.set(m.user_id, list);
        }
      }
      return result;
    },
    markWeekly: async (userId, language, localDate) => {
      const { error } = await admin.from("learn_reminders").update({ last_weekly_on: localDate }).eq("user_id", userId).eq("language", language);
      if (error) fail("markWeekly", error);
    },
    markNudge: async (userId, language, localDate) => {
      const { error } = await admin.from("learn_reminders").update({ last_nudge_on: localDate }).eq("user_id", userId).eq("language", language);
      if (error) fail("markNudge", error);
    },
  };
}
