import { describe, expect, it } from "vitest";
import { suggestNextLevel, type SessionSignal } from "./level-up";

const session = (overrides: Partial<SessionSignal> = {}): SessionSignal => ({
  level: "A2",
  reviews: 8,
  reviewsRecalled: 8,
  speakScore: 0.85,
  writingCorrect: true,
  ...overrides,
});

const many = (n: number, overrides: Partial<SessionSignal> = {}): SessionSignal[] => Array.from({ length: n }, () => session(overrides));

describe("suggestNextLevel", () => {
  it("suggests the next level after strong, well-evidenced sessions", () => {
    expect(suggestNextLevel("A2", many(8))).toEqual({ next: "B1", recallRate: 1, sessionsAtLevel: 8 });
  });

  it("waits until there are enough sessions at this level", () => {
    expect(suggestNextLevel("A2", many(6))).toBeNull();
  });

  it("ignores sessions done at a previous level", () => {
    expect(suggestNextLevel("A2", [...many(4), ...many(6, { level: "A1" })])).toBeNull();
  });

  it("needs enough reviews for the recall rate to mean anything", () => {
    expect(suggestNextLevel("A2", many(8, { reviews: 3, reviewsRecalled: 3 }))).toBeNull();
  });

  it("holds back when recall is below 85%", () => {
    expect(suggestNextLevel("A2", many(8, { reviews: 10, reviewsRecalled: 8 }))).toBeNull();
  });

  it("holds back when writing is weak, even with perfect recall", () => {
    const sessions = [...many(4, { writingCorrect: false }), ...many(4, { writingCorrect: true })];
    expect(suggestNextLevel("A2", sessions)).toBeNull();
  });

  it("holds back when speaking scores are low", () => {
    expect(suggestNextLevel("A2", many(8, { speakScore: 0.5 }))).toBeNull();
  });

  it("doesn't penalise skipped speaking or writing", () => {
    expect(suggestNextLevel("A2", many(8, { speakScore: null, writingCorrect: null }))?.next).toBe("B1");
  });

  it("only looks at the most recent window", () => {
    // Newest first: 10 strong recent sessions outweigh an old weak patch.
    const sessions = [...many(10), ...many(10, { reviews: 10, reviewsRecalled: 2 })];
    expect(suggestNextLevel("A2", sessions)?.next).toBe("B1");
  });

  it("never suggests past B2", () => {
    expect(suggestNextLevel("B2", many(10, { level: "B2" }))).toBeNull();
  });
});
