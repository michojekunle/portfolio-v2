import { describe, expect, it } from "vitest";
import { EMPTY_STREAK, MAX_FREEZES, applyCompletion, viewStreak, type StreakState } from "./streak";

const streak = (overrides: Partial<StreakState> = {}): StreakState => ({
  current: 5,
  longest: 5,
  freezes: 2,
  lastCompletedDate: "2026-11-19",
  totalCompletions: 5,
  ...overrides,
});

describe("applyCompletion", () => {
  it("starts a streak at 1 on the very first completion", () => {
    const result = applyCompletion(EMPTY_STREAK, "2026-11-20");
    expect(result.state.current).toBe(1);
    expect(result.state.totalCompletions).toBe(1);
    expect(result.state.lastCompletedDate).toBe("2026-11-20");
  });

  it("extends the streak on consecutive days", () => {
    const result = applyCompletion(streak(), "2026-11-20");
    expect(result.state.current).toBe(6);
    expect(result.freezesUsed).toBe(0);
  });

  it("is idempotent when the day is already completed", () => {
    const state = streak({ lastCompletedDate: "2026-11-20" });
    const result = applyCompletion(state, "2026-11-20");
    expect(result.alreadyCompleted).toBe(true);
    expect(result.state).toBe(state);
  });

  it("spends one freeze to bridge one missed day and still extends", () => {
    const result = applyCompletion(streak({ lastCompletedDate: "2026-11-18" }), "2026-11-20");
    expect(result.state.current).toBe(6);
    expect(result.freezesUsed).toBe(1);
    expect(result.state.freezes).toBe(1);
  });

  it("resets to 1 when missed days exceed available freezes", () => {
    const result = applyCompletion(streak({ lastCompletedDate: "2026-11-15", freezes: 2 }), "2026-11-20");
    expect(result.state.current).toBe(1);
    expect(result.freezesUsed).toBe(0);
    expect(result.state.freezes).toBe(2);
  });

  it("keeps the longest streak when the current one resets", () => {
    const result = applyCompletion(streak({ current: 9, longest: 9, lastCompletedDate: "2026-11-10", freezes: 0 }), "2026-11-20");
    expect(result.state.current).toBe(1);
    expect(result.state.longest).toBe(9);
  });

  it("earns a freeze at every 7th day, up to the cap", () => {
    const earned = applyCompletion(streak({ current: 6, longest: 6, freezes: 0 }), "2026-11-20");
    expect(earned.state.current).toBe(7);
    expect(earned.freezeEarned).toBe(true);
    expect(earned.state.freezes).toBe(1);

    const capped = applyCompletion(streak({ current: 6, longest: 6, freezes: MAX_FREEZES }), "2026-11-20");
    expect(capped.freezeEarned).toBe(false);
    expect(capped.state.freezes).toBe(MAX_FREEZES);
  });

  it("treats a future-dated last completion (timezone change) as already done", () => {
    const result = applyCompletion(streak({ lastCompletedDate: "2026-11-21" }), "2026-11-20");
    expect(result.alreadyCompleted).toBe(true);
  });
});

describe("viewStreak", () => {
  it("shows completed-today with no risk", () => {
    expect(viewStreak(streak({ lastCompletedDate: "2026-11-20" }), "2026-11-20")).toEqual({
      current: 5,
      completedToday: true,
      atRisk: false,
    });
  });

  it("marks yesterday's completion as at-risk today", () => {
    expect(viewStreak(streak(), "2026-11-20")).toEqual({ current: 5, completedToday: false, atRisk: true });
  });

  it("keeps the streak visible while freezes can still cover the gap", () => {
    expect(viewStreak(streak({ lastCompletedDate: "2026-11-18" }), "2026-11-20").current).toBe(5);
  });

  it("shows 0 once the gap outruns the freezes, without writing anything", () => {
    const state = streak({ lastCompletedDate: "2026-11-10", freezes: 1 });
    expect(viewStreak(state, "2026-11-20").current).toBe(0);
    expect(state.freezes).toBe(1);
  });

  it("shows 0 for a brand-new learner", () => {
    expect(viewStreak(EMPTY_STREAK, "2026-11-20")).toEqual({ current: 0, completedToday: false, atRisk: false });
  });
});
