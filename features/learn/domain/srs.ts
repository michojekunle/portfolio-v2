/**
 * Spaced-repetition scheduler (SM-2 family, 4 grades).
 *
 * Deliberately dependency-free and pure: every function takes `now` instead of
 * reading the clock, so scheduling is deterministic and unit-testable.
 * FSRS would need fewer reviews at equal retention, but its gain over a tuned
 * SM-2 variant is modest for a deck this small — upgrade only once real review
 * logs exist to fit parameters against.
 */

export type Grade = "again" | "hard" | "good" | "easy";
export type CardState = "new" | "learning" | "review";

export interface CardSchedule {
  readonly state: CardState;
  readonly ease: number;
  readonly intervalDays: number;
  readonly reps: number;
  readonly lapses: number;
  readonly dueAt: Date;
  readonly lastReviewedAt: Date | null;
}

export const MIN_EASE = 1.3;
export const MAX_EASE = 3.0;
export const DEFAULT_EASE = 2.5;
export const LEARNING_STEP_MINUTES = 10;

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

const clampEase = (ease: number): number => Math.min(MAX_EASE, Math.max(MIN_EASE, ease));
const addMinutes = (from: Date, minutes: number): Date => new Date(from.getTime() + minutes * MINUTE_MS);
const addDays = (from: Date, days: number): Date => new Date(from.getTime() + days * DAY_MS);

/** A word the learner just met in today's lesson: first test is tomorrow. */
export function newCardSchedule(now: Date): CardSchedule {
  return {
    state: "learning",
    ease: DEFAULT_EASE,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
    dueAt: addDays(now, 1),
    lastReviewedAt: null,
  };
}

function gradeUnlearned(card: CardSchedule, grade: Grade, now: Date): CardSchedule {
  if (grade === "again" || grade === "hard") {
    return { ...card, state: "learning", dueAt: addMinutes(now, LEARNING_STEP_MINUTES), lastReviewedAt: now };
  }
  if (grade === "good") {
    return { ...card, state: "review", intervalDays: 1, reps: card.reps + 1, dueAt: addDays(now, 1), lastReviewedAt: now };
  }
  return {
    ...card,
    state: "review",
    intervalDays: 3,
    ease: clampEase(card.ease + 0.15),
    reps: card.reps + 1,
    dueAt: addDays(now, 3),
    lastReviewedAt: now,
  };
}

function gradeReview(card: CardSchedule, grade: Grade, now: Date): CardSchedule {
  const previous = Math.max(1, card.intervalDays);

  switch (grade) {
    case "again":
      return {
        ...card,
        state: "learning",
        ease: clampEase(card.ease - 0.2),
        intervalDays: 0,
        lapses: card.lapses + 1,
        dueAt: addMinutes(now, LEARNING_STEP_MINUTES),
        lastReviewedAt: now,
      };
    case "hard": {
      const intervalDays = Math.max(previous, Math.round(previous * 1.2));
      return {
        ...card,
        ease: clampEase(card.ease - 0.15),
        intervalDays,
        reps: card.reps + 1,
        dueAt: addDays(now, intervalDays),
        lastReviewedAt: now,
      };
    }
    case "good": {
      const intervalDays = Math.max(previous + 1, Math.round(previous * card.ease));
      return { ...card, intervalDays, reps: card.reps + 1, dueAt: addDays(now, intervalDays), lastReviewedAt: now };
    }
    case "easy": {
      const intervalDays = Math.max(previous + 1, Math.round(previous * card.ease * 1.3));
      return {
        ...card,
        ease: clampEase(card.ease + 0.15),
        intervalDays,
        reps: card.reps + 1,
        dueAt: addDays(now, intervalDays),
        lastReviewedAt: now,
      };
    }
  }
}

export function gradeCard(card: CardSchedule, grade: Grade, now: Date): CardSchedule {
  return card.state === "review" ? gradeReview(card, grade, now) : gradeUnlearned(card, grade, now);
}

/** "Again" is the only grade that counts as a failed recall. */
export function isRecalled(grade: Grade): boolean {
  return grade !== "again";
}
