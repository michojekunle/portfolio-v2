import { describe, expect, it } from "vitest";
import {
  DEFAULT_EASE,
  KNOWN_INTERVAL_DAYS,
  markKnown,
  practiseAgain,
  LEARNING_STEP_MINUTES,
  MAX_EASE,
  MIN_EASE,
  gradeCard,
  isRecalled,
  newCardSchedule,
  type CardSchedule,
} from "./srs";

const NOW = new Date("2026-11-20T10:00:00.000Z");
const DAY_MS = 86_400_000;

const reviewCard = (overrides: Partial<CardSchedule> = {}): CardSchedule => ({
  state: "review",
  ease: DEFAULT_EASE,
  intervalDays: 6,
  reps: 3,
  lapses: 0,
  dueAt: NOW,
  lastReviewedAt: null,
  ...overrides,
});

describe("newCardSchedule", () => {
  it("schedules the first test for tomorrow, not today", () => {
    const card = newCardSchedule(NOW);
    expect(card.state).toBe("learning");
    expect(card.dueAt.getTime() - NOW.getTime()).toBe(DAY_MS);
  });
});

describe("gradeCard — unlearned cards", () => {
  it("graduates to a 1-day review on 'good'", () => {
    const next = gradeCard(newCardSchedule(NOW), "good", NOW);
    expect(next.state).toBe("review");
    expect(next.intervalDays).toBe(1);
    expect(next.dueAt.getTime() - NOW.getTime()).toBe(DAY_MS);
  });

  it("graduates to a 3-day review and raises ease on 'easy'", () => {
    const next = gradeCard(newCardSchedule(NOW), "easy", NOW);
    expect(next.intervalDays).toBe(3);
    expect(next.ease).toBeGreaterThan(DEFAULT_EASE);
  });

  it("keeps the card in learning with a short step on 'again' and 'hard'", () => {
    for (const grade of ["again", "hard"] as const) {
      const next = gradeCard(newCardSchedule(NOW), grade, NOW);
      expect(next.state).toBe("learning");
      expect(next.dueAt.getTime() - NOW.getTime()).toBe(LEARNING_STEP_MINUTES * 60_000);
    }
  });
});

describe("gradeCard — review cards", () => {
  it("multiplies the interval by ease on 'good'", () => {
    const next = gradeCard(reviewCard({ intervalDays: 6 }), "good", NOW);
    expect(next.intervalDays).toBe(15);
    expect(next.reps).toBe(4);
  });

  it("always grows the interval by at least one day on 'good' and 'easy'", () => {
    const tiny = reviewCard({ intervalDays: 1, ease: MIN_EASE });
    expect(gradeCard(tiny, "good", NOW).intervalDays).toBeGreaterThanOrEqual(2);
    expect(gradeCard(tiny, "easy", NOW).intervalDays).toBeGreaterThanOrEqual(2);
  });

  it("never shrinks the interval on 'hard'", () => {
    const next = gradeCard(reviewCard({ intervalDays: 10 }), "hard", NOW);
    expect(next.intervalDays).toBeGreaterThanOrEqual(10);
    expect(next.ease).toBeLessThan(DEFAULT_EASE);
  });

  it("records a lapse, drops ease, and re-enters learning on 'again'", () => {
    const next = gradeCard(reviewCard({ lapses: 1 }), "again", NOW);
    expect(next.state).toBe("learning");
    expect(next.lapses).toBe(2);
    expect(next.ease).toBeCloseTo(DEFAULT_EASE - 0.2);
    expect(next.intervalDays).toBe(0);
  });

  it("never lets ease fall below the floor", () => {
    let card = reviewCard({ ease: 1.35 });
    for (let i = 0; i < 5; i += 1) card = gradeCard(card, "again", NOW);
    expect(card.ease).toBe(MIN_EASE);
  });

  it("never lets ease exceed the ceiling", () => {
    let card = reviewCard({ ease: 2.95 });
    for (let i = 0; i < 5; i += 1) card = gradeCard(card, "easy", NOW);
    expect(card.ease).toBe(MAX_EASE);
  });

  it("does not mutate the input card", () => {
    const card = reviewCard();
    const snapshot = { ...card };
    gradeCard(card, "good", NOW);
    expect(card).toEqual(snapshot);
  });
});

describe("isRecalled", () => {
  it("treats only 'again' as a failed recall", () => {
    expect(isRecalled("again")).toBe(false);
    expect(isRecalled("hard")).toBe(true);
    expect(isRecalled("good")).toBe(true);
    expect(isRecalled("easy")).toBe(true);
  });
});

describe("word list actions", () => {
  const now = new Date("2026-11-21T10:00:00Z");
  const card = { state: "learning" as const, ease: 2.1, intervalDays: 3, reps: 4, lapses: 1, dueAt: now, lastReviewedAt: null };

  it("markKnown pushes a word ~6 months out and keeps its history", () => {
    const known = markKnown(card, now);
    expect(known.state).toBe("review");
    expect(known.intervalDays).toBe(KNOWN_INTERVAL_DAYS);
    expect(known.dueAt.getTime() - now.getTime()).toBe(KNOWN_INTERVAL_DAYS * 86_400_000);
    expect(known.reps).toBe(4);
    expect(known.lapses).toBe(1);
    expect(known.ease).toBeGreaterThanOrEqual(2.5);
  });

  it("markKnown never shortens a longer interval", () => {
    expect(markKnown({ ...card, intervalDays: 400 }, now).intervalDays).toBe(400);
  });

  it("practiseAgain makes it due right now as a learning card", () => {
    const again = practiseAgain({ ...card, state: "review", intervalDays: 60 }, now);
    expect(again).toMatchObject({ state: "learning", intervalDays: 0, dueAt: now, reps: 4, lapses: 1 });
  });
});
