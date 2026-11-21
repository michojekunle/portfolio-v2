import { describe, expect, it, vi } from "vitest";
import { runReminderJob, type ReminderJobDeps } from "./reminders";

const NOW = new Date("2026-11-21T17:30:00Z"); // 18:30 Lagos
const sub = { endpoint: "https://fcm.googleapis.com/fcm/send/abc", keys: { p256dh: "p256dh-key-value", auth: "auth-key" } };
const row = (overrides: Partial<Awaited<ReturnType<ReminderJobDeps["listEnabled"]>>[number]> = {}) => ({
  user_id: "user-1",
  language: "fr" as const,
  enabled: true,
  reminder_time: "18:00",
  timezone: "Africa/Lagos",
  email: false,
  push_subscription: sub,
  last_sent_on: null,
  ...overrides,
});

function deps(rows: ReturnType<typeof row>[], overrides: Partial<ReminderJobDeps> = {}): ReminderJobDeps & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    now: () => NOW,
    listEnabled: async () => rows,
    lastCompletedOn: async () => null,
    sendPush: vi.fn(async () => {
      calls.push("push");
      return "sent" as const;
    }),
    sendEmail: vi.fn(async () => {
      calls.push("email");
    }),
    markSent: vi.fn(async (_u, _l, date) => {
      calls.push(`mark:${date}`);
    }),
    clearPush: vi.fn(async () => {
      calls.push("clear");
    }),
    ...overrides,
  };
}

describe("runReminderJob", () => {
  it("sends a due reminder and records the local date", async () => {
    const d = deps([row()]);
    expect(await runReminderJob(d)).toEqual({ checked: 1, sent: 1, failed: 0 });
    expect(d.calls).toEqual(["push", "mark:2026-11-21"]);
  });

  it("skips learners who already finished today's page", async () => {
    const d = deps([row()], { lastCompletedOn: async () => "2026-11-21" });
    expect((await runReminderJob(d)).sent).toBe(0);
    expect(d.calls).toEqual([]);
  });

  it("removes a push subscription the browser has revoked", async () => {
    const d = deps([row()], { sendPush: vi.fn(async () => "gone" as const) });
    await runReminderJob(d);
    expect(d.calls).toEqual(["clear"]);
  });

  it("falls back to email when asked, and keeps going when one learner fails", async () => {
    const failing = row({ user_id: "broken" });
    const emailOnly = row({ user_id: "user-2", push_subscription: null, email: true, language: "es" });
    const d = deps([failing, emailOnly], {
      lastCompletedOn: async (userId) => {
        if (userId === "broken") throw new Error("db down");
        return null;
      },
    });
    expect(await runReminderJob(d)).toEqual({ checked: 2, sent: 1, failed: 1 });
    expect(d.calls).toEqual(["email", "mark:2026-11-21"]);
  });
});
