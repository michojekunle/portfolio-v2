import { describe, expect, it } from "vitest";
import { GROUP_NUDGE_HOUR, groupNudgeMessage, isNudgeHour, isWeeklySummaryDue, nudgeStreak, summariseWeek, weeklySummaryMessage, type DigestState } from "./digests";
import type { MemberActivity } from "./groups";

// Sunday 22 Nov 2026, 19:30 UTC = 20:30 in Lagos (UTC+1).
const SUNDAY_EVENING = new Date("2026-11-22T19:30:00Z");
const base: DigestState = { timezone: "Africa/Lagos", time: "20:00", lastWeeklyOn: null, lastNudgeOn: null, lastSentOn: null };

describe("isWeeklySummaryDue", () => {
  it("is due on a Sunday at the learner's reminder hour", () => {
    expect(isWeeklySummaryDue(base, SUNDAY_EVENING)).toBe(true);
  });
  it("waits for the learner's own hour", () => {
    expect(isWeeklySummaryDue({ ...base, time: "22:00" }, SUNDAY_EVENING)).toBe(false);
  });
  it("still goes out when the hourly job ran late or missed the exact hour", () => {
    // Reminder hour 18:00, but the first run that day is at 20:30 local.
    expect(isWeeklySummaryDue({ ...base, time: "18:00" }, SUNDAY_EVENING)).toBe(true);
  });
  it("is not due on other days", () => {
    expect(isWeeklySummaryDue(base, new Date("2026-11-23T19:30:00Z"))).toBe(false);
  });
  it("goes out once a week", () => {
    expect(isWeeklySummaryDue({ ...base, lastWeeklyOn: "2026-11-22" }, SUNDAY_EVENING)).toBe(false);
  });
  it("uses the learner's time zone for 'Sunday'", () => {
    // 23:30 UTC Saturday is already Sunday 00:30 in Lagos.
    expect(isWeeklySummaryDue({ ...base, time: "00:00" }, new Date("2026-11-21T23:30:00Z"))).toBe(true);
  });
});

describe("isNudgeHour", () => {
  const at19 = new Date("2026-11-21T18:10:00Z"); // 19:10 in Lagos
  it("fires at the nudge hour", () => {
    expect(GROUP_NUDGE_HOUR).toBe(19);
    expect(isNudgeHour(base, at19)).toBe(true);
  });
  it("keeps working later in the evening if an earlier run was missed", () => {
    expect(isNudgeHour(base, SUNDAY_EVENING)).toBe(true); // 20:30 local
  });
  it("not before the nudge hour, and not late at night", () => {
    expect(isNudgeHour(base, new Date("2026-11-21T16:00:00Z"))).toBe(false); // 17:00 local
    expect(isNudgeHour(base, new Date("2026-11-21T22:30:00Z"))).toBe(false); // 23:30 local
  });
  it("only once a day, and not after the normal reminder already went out", () => {
    expect(isNudgeHour({ ...base, lastNudgeOn: "2026-11-21" }, at19)).toBe(false);
    expect(isNudgeHour({ ...base, lastSentOn: "2026-11-21" }, at19)).toBe(false);
  });
});

const member = (userId: string, completedOn: string[]): MemberActivity => ({ userId, displayName: userId, joinedOn: "2026-11-01", completedOn });

describe("nudgeStreak", () => {
  const today = "2026-11-21";
  const streakDays = ["2026-11-18", "2026-11-19", "2026-11-20"];
  it("returns the running streak for someone who hasn't finished today", () => {
    expect(nudgeStreak([member("me", streakDays), member("you", [...streakDays, today])], "me", today)).toBe(3);
  });
  it("is null once the learner has finished", () => {
    expect(nudgeStreak([member("me", [...streakDays, today]), member("you", streakDays)], "me", today)).toBeNull();
  });
  it("is null for a streak too short to matter", () => {
    expect(nudgeStreak([member("me", ["2026-11-20"]), member("you", ["2026-11-20"])], "me", today)).toBeNull();
  });
  it("is null when the learner isn't in the group", () => {
    expect(nudgeStreak([member("you", streakDays)], "me", today)).toBeNull();
  });
});

describe("weekly summary", () => {
  const sessions = [
    { sessionDate: "2026-11-16", reviews: 10, reviewsRecalled: 8, newCards: 5 },
    { sessionDate: "2026-11-17", reviews: 10, reviewsRecalled: 9, newCards: 5 },
    { sessionDate: "2026-11-17", reviews: 0, reviewsRecalled: 0, newCards: 0 },
  ];
  it("counts distinct days, not rows", () => {
    expect(summariseWeek(sessions)).toEqual({ pages: 2, reviews: 20, recalledPercent: 85, newWords: 10 });
  });
  it("has no recall rate when nothing was reviewed", () => {
    expect(summariseWeek([]).recalledPercent).toBeNull();
  });
  it("is written in the language being learned", () => {
    expect(weeklySummaryMessage("fr", summariseWeek(sessions), 4).body).toContain("2 pages");
    expect(weeklySummaryMessage("es", summariseWeek(sessions), 4).body).toContain("2 páginas");
  });
  it("handles a quiet week kindly", () => {
    expect(weeklySummaryMessage("fr", summariseWeek([]), 0).body).toContain("Pas de page");
  });
  it("uses singular forms", () => {
    expect(weeklySummaryMessage("fr", { pages: 1, reviews: 1, recalledPercent: 100, newWords: 1 }, 1).body).toContain("1 page,");
  });
});

describe("group nudge message", () => {
  it("names the streak and links into the app", () => {
    const message = groupNudgeMessage("es", 5);
    expect(message.title).toContain("5 días");
    expect(message.url).toContain("/spanish");
  });
});
