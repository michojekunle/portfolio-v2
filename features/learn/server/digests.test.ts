import { describe, expect, it, vi } from "vitest";
import { runDigestJob, type DigestJobDeps } from "./digests";
import type { ReminderRow } from "./reminders";
import type { MemberActivity } from "../domain/groups";

const sub = { endpoint: "https://push.example/abc", keys: { p256dh: "p", auth: "a" } };
const row = (overrides: Partial<ReminderRow> = {}): ReminderRow => ({
  user_id: "me",
  language: "fr",
  enabled: false,
  reminder_time: "20:00",
  timezone: "Africa/Lagos",
  email: false,
  push_subscription: null,
  last_sent_on: null,
  weekly_summary: false,
  last_weekly_on: null,
  group_nudges: false,
  last_nudge_on: null,
  ...overrides,
});

const SUNDAY_8PM = new Date("2026-11-22T19:30:00Z"); // Sunday 20:30 in Lagos
const SATURDAY_7PM = new Date("2026-11-21T18:10:00Z"); // Saturday 19:10 in Lagos
const member = (userId: string, completedOn: string[]): MemberActivity => ({ userId, displayName: userId, joinedOn: "2026-11-01", completedOn });
const streak = ["2026-11-18", "2026-11-19", "2026-11-20"];

function deps(rows: ReminderRow[], now: Date, overrides: Partial<DigestJobDeps> = {}): DigestJobDeps & { sent: string[] } {
  const sent: string[] = [];
  return {
    sent,
    now: () => now,
    listActive: async () => rows,
    weekSessions: async () => [{ sessionDate: "2026-11-20", reviews: 10, reviewsRecalled: 9, newCards: 5 }],
    currentStreak: async () => 4,
    lastCompletedOn: async () => new Map(),
    groupsFor: async () => new Map([["me", [member("me", streak), member("you", [...streak, "2026-11-21"])]]]),
    sendPush: vi.fn(async (_s, m) => {
      sent.push(`push:${m.title}`);
      return "sent" as const;
    }),
    sendEmail: vi.fn(async (_u, m) => {
      sent.push(`email:${m.title}`);
      return "sent" as const;
    }),
    markWeekly: vi.fn(async () => undefined),
    markNudge: vi.fn(async () => undefined),
    clearPush: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("runDigestJob weekly summary", () => {
  it("emails the summary on Sunday to learners who opted in, and records it", async () => {
    const d = deps([row({ weekly_summary: true })], SUNDAY_8PM);
    const result = await runDigestJob(d);
    expect(result.weekly).toEqual({ due: 1, sent: 1, failed: 0 });
    expect(d.sent).toEqual(["email:Ta semaine en français"]);
    expect(d.markWeekly).toHaveBeenCalledWith("me", "fr", "2026-11-22");
  });

  it("sends nothing to learners who didn't opt in", async () => {
    const d = deps([row({ enabled: true })], SUNDAY_8PM);
    expect((await runDigestJob(d)).weekly.due).toBe(0);
  });

  it("doesn't record it as sent when email isn't configured", async () => {
    const d = deps([row({ weekly_summary: true })], SUNDAY_8PM, { sendEmail: vi.fn(async () => "skipped" as const) });
    expect((await runDigestJob(d)).weekly.sent).toBe(0);
    expect(d.markWeekly).not.toHaveBeenCalled();
  });

  it("passes the learner's local date so the streak matches what the app shows", async () => {
    const currentStreak = vi.fn(async () => 4);
    await runDigestJob(deps([row({ weekly_summary: true })], SUNDAY_8PM, { currentStreak }));
    expect(currentStreak).toHaveBeenCalledWith("me", "fr", "2026-11-22");
  });

  it("still counts the email as sent if remembering it fails afterwards", async () => {
    const d = deps([row({ weekly_summary: true })], SUNDAY_8PM, {
      markWeekly: vi.fn(async () => {
        throw new Error("db down");
      }),
    });
    expect((await runDigestJob(d)).weekly).toEqual({ due: 1, sent: 1, failed: 0 });
  });

  it("keeps going when one learner fails", async () => {
    const rows = [row({ user_id: "broken", weekly_summary: true }), row({ user_id: "ok", weekly_summary: true })];
    const d = deps(rows, SUNDAY_8PM, {
      weekSessions: async (userId) => {
        if (userId === "broken") throw new Error("db down");
        return [];
      },
    });
    expect((await runDigestJob(d)).weekly).toEqual({ due: 2, sent: 1, failed: 1 });
  });
});

describe("runDigestJob group nudges", () => {
  const nudgeRow = (overrides: Partial<ReminderRow> = {}) => row({ group_nudges: true, push_subscription: sub, ...overrides });

  it("nudges someone still missing today in a streaking group", async () => {
    const d = deps([nudgeRow()], SATURDAY_7PM);
    const result = await runDigestJob(d);
    expect(result.nudges).toEqual({ due: 1, sent: 1, failed: 0 });
    expect(d.sent[0]).toContain("3 jours");
    expect(d.markNudge).toHaveBeenCalledWith("me", "fr", "2026-11-21");
  });

  it("doesn't nudge someone who already finished today", async () => {
    const d = deps([nudgeRow()], SATURDAY_7PM, { lastCompletedOn: async () => new Map([["me", "2026-11-21"]]) });
    expect((await runDigestJob(d)).nudges.due).toBe(0);
  });

  it("doesn't nudge learners with no group", async () => {
    const d = deps([nudgeRow()], SATURDAY_7PM, { groupsFor: async () => new Map() });
    expect((await runDigestJob(d)).nudges.due).toBe(0);
  });

  it("doesn't nudge before the nudge hour", async () => {
    expect((await runDigestJob(deps([nudgeRow()], new Date("2026-11-21T14:00:00Z")))).nudges.due).toBe(0);
  });

  it("removes a revoked push subscription and doesn't count it as sent", async () => {
    const d = deps([nudgeRow()], SATURDAY_7PM, { sendPush: vi.fn(async () => "gone" as const) });
    const result = await runDigestJob(d);
    expect(result.nudges.sent).toBe(0);
    expect(d.clearPush).toHaveBeenCalledWith("me", "fr");
  });

  it("counts the whole language as failed when group data can't be read", async () => {
    const d = deps([nudgeRow()], SATURDAY_7PM, {
      groupsFor: async () => {
        throw new Error("db down");
      },
    });
    expect((await runDigestJob(d)).nudges.failed).toBe(1);
  });
});
