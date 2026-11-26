import { describe, expect, it } from "vitest";
import {
  computeConsecutiveStreak,
  computeDayStatus,
  getDateForDayNumber,
  getDayNumberForDate,
  getLagosDateString,
  getProgrammeCalendarMonths,
  getProgrammeTimelineState,
} from "./dates";
import { CURRICULUM_DAYS } from "./curriculum";
import { createEmptySession } from "./defaults";

describe("Speaking Ledger Lagos Date Calculations", () => {
  it("maps Day 1 to Mon Nov 30, 2026 and Day 90 to Sat Feb 27, 2027", () => {
    expect(getDateForDayNumber(1)).toBe("2026-11-30");
    expect(getDateForDayNumber(30)).toBe("2026-12-29");
    expect(getDateForDayNumber(60)).toBe("2027-01-28");
    expect(getDateForDayNumber(90)).toBe("2027-02-27");
  });

  it("throws on out-of-range day numbers", () => {
    expect(() => getDateForDayNumber(0)).toThrow();
    expect(() => getDateForDayNumber(91)).toThrow();
    expect(() => getDateForDayNumber(1.5)).toThrow();
  });

  it("maps calendar dates back to Day 1..90 or null outside the window", () => {
    expect(getDayNumberForDate("2026-11-29")).toBeNull();
    expect(getDayNumberForDate("2026-11-30")).toBe(1);
    expect(getDayNumberForDate("2026-12-29")).toBe(30);
    expect(getDayNumberForDate("2027-01-28")).toBe(60);
    expect(getDayNumberForDate("2027-02-27")).toBe(90);
    expect(getDayNumberForDate("2027-02-28")).toBeNull();
  });

  it("uses Africa/Lagos (UTC+1) rather than UTC midnight", () => {
    // 2026-11-29 23:30 UTC is already 2026-11-30 00:30 in Lagos -> Day 1!
    const lagosMidnightInstant = new Date("2026-11-29T23:30:00Z");
    expect(getLagosDateString(lagosMidnightInstant)).toBe("2026-11-30");

    const state = getProgrammeTimelineState(lagosMidnightInstant);
    expect(state.programmeState).toBe("active");
    expect(state.currentDayNumber).toBe(1);
    expect(state.activeDayNumber).toBe(1);
  });

  it("handles timeline states before, during, and after the 90-day window", () => {
    const before = getProgrammeTimelineState(new Date("2026-11-26T12:00:00Z"));
    expect(before.programmeState).toBe("before");
    expect(before.currentDayNumber).toBeNull();
    expect(before.activeDayNumber).toBe(1);
    expect(before.daysUntilStart).toBe(4);

    const endDay = getProgrammeTimelineState(new Date("2027-02-27T12:00:00Z"));
    expect(endDay.programmeState).toBe("active");
    expect(endDay.currentDayNumber).toBe(90);

    const after = getProgrammeTimelineState(new Date("2027-02-28T12:00:00Z"));
    expect(after.programmeState).toBe("completed");
    expect(after.currentDayNumber).toBeNull();
    expect(after.activeDayNumber).toBe(90);
  });

  it("covers all 90 days across 4 calendar months without shifting dates", () => {
    const months = getProgrammeCalendarMonths();
    expect(months.map((m) => m.key)).toEqual([
      "2026-11",
      "2026-12",
      "2027-01",
      "2027-02",
    ]);
    const assignedDays = months
      .flatMap((m) => m.cells)
      .filter((c) => c.curriculumDayNumber !== null)
      .map((c) => c.curriculumDayNumber);
    expect(assignedDays).toHaveLength(90);
    expect(assignedDays[0]).toBe(1);
    expect(assignedDays[89]).toBe(90);
  });
});

describe("Speaking Ledger Completion & Streak Logic", () => {
  it("never marks a past day complete automatically just because the date passed", () => {
    expect(computeDayStatus("2026-11-30", "2026-12-02", undefined)).toBe("missed");
    expect(computeDayStatus("2026-12-02", "2026-12-02", undefined)).toBe("today");
    expect(computeDayStatus("2026-12-03", "2026-12-02", undefined)).toBe("upcoming");
  });

  it("distinguishes in_progress, completed, and practice_only statuses", () => {
    const inProgress = {
      ...createEmptySession(1),
      premPoint: "A clear point",
      status: "in_progress" as const,
    };
    expect(computeDayStatus("2026-11-30", "2026-12-02", inProgress)).toBe(
      "in_progress"
    );

    const completed = {
      ...createEmptySession(1),
      status: "completed" as const,
      practiceOnly: false,
    };
    expect(computeDayStatus("2026-11-30", "2026-12-02", completed)).toBe(
      "completed"
    );

    const practiceOnly = {
      ...createEmptySession(1),
      status: "completed" as const,
      practiceOnly: true,
    };
    expect(computeDayStatus("2026-11-30", "2026-12-02", practiceOnly)).toBe(
      "practice_only"
    );
  });

  it("computes consecutive streaks accurately", () => {
    const sessions = {
      1: { ...createEmptySession(1), status: "completed" as const },
      2: { ...createEmptySession(2), status: "completed" as const },
      3: { ...createEmptySession(3), status: "completed" as const },
    };

    // Today is Day 4 (2026-12-03), not yet completed -> preserves 3-day streak from Days 1..3
    expect(computeConsecutiveStreak(CURRICULUM_DAYS, sessions, "2026-12-03")).toBe(3);

    // Today is Day 5 (2026-12-04), Day 4 was missed -> streak is 0
    expect(computeConsecutiveStreak(CURRICULUM_DAYS, sessions, "2026-12-04")).toBe(0);

    // Today is Day 3 (2026-12-02), Day 3 completed -> streak is 3
    expect(computeConsecutiveStreak(CURRICULUM_DAYS, sessions, "2026-12-02")).toBe(3);
  });
});
