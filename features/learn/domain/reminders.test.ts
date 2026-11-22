import { describe, expect, it } from "vitest";
import { isReminderDue } from "./reminders";

// 18:30 in Lagos (UTC+1) on 21 Nov 2026.
const now = new Date("2026-11-21T17:30:00Z");
const base = { time: "18:00", timezone: "Africa/Lagos", lastSentOn: null, lastCompletedOn: null };

describe("isReminderDue", () => {
  it("fires at the learner's local hour", () => {
    expect(isReminderDue(base, now)).toBe(true);
  });

  it("uses the learner's time zone, not the server's", () => {
    expect(isReminderDue({ ...base, timezone: "America/New_York" }, now)).toBe(false); // 12:30 there
    expect(isReminderDue({ ...base, time: "12:00", timezone: "America/New_York" }, now)).toBe(true);
  });

  it("stays quiet once today's page is done", () => {
    expect(isReminderDue({ ...base, lastCompletedOn: "2026-11-21" }, now)).toBe(false);
    expect(isReminderDue({ ...base, lastCompletedOn: "2026-11-20" }, now)).toBe(true);
  });

  it("sends at most one reminder per local day", () => {
    expect(isReminderDue({ ...base, lastSentOn: "2026-11-21" }, now)).toBe(false);
  });

  it("counts a group-streak nudge sent today as today's notification", () => {
    expect(isReminderDue({ ...base, lastNudgeOn: "2026-11-21" }, now)).toBe(false);
    expect(isReminderDue({ ...base, lastNudgeOn: "2026-11-20" }, now)).toBe(true);
  });

  it("ignores malformed times", () => {
    expect(isReminderDue({ ...base, time: "25:00" }, now)).toBe(false);
    expect(isReminderDue({ ...base, time: "soon" }, now)).toBe(false);
  });
});
