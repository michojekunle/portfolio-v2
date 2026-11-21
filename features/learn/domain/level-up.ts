import { LEVELS, type Level } from "./lessons";

/** What one saved session tells us about readiness. */
export interface SessionSignal {
  readonly level: Level;
  readonly reviews: number;
  readonly reviewsRecalled: number;
  readonly speakScore: number | null;
  readonly writingCorrect: boolean | null;
}

export interface LevelSuggestion {
  readonly next: Level;
  readonly recallRate: number;
  readonly sessionsAtLevel: number;
}

/**
 * Thresholds for suggesting the next level. Deliberately conservative: a
 * premature jump is the classic way people quit ("it suddenly got too hard"),
 * while staying a little long only costs a few easy days.
 */
export const LEVEL_UP_RULES = {
  /** Look at this many most-recent sessions at the current level. */
  window: 10,
  minSessions: 7,
  /** Recall needs enough reviews behind it to mean something. */
  minReviews: 40,
  minRecall: 0.85,
  /** Production must be solid too, when there's enough of it to judge. */
  minWritingSamples: 3,
  minWritingRate: 0.6,
  minSpeakSamples: 3,
  minSpeakAverage: 0.7,
} as const;

/**
 * Suggests moving up when recent sessions at the current level show strong,
 * well-evidenced recall and no weakness in speaking or writing.
 * `recent` must be newest first.
 */
export function suggestNextLevel(level: Level, recent: readonly SessionSignal[]): LevelSuggestion | null {
  const index = LEVELS.indexOf(level);
  if (index === -1 || index === LEVELS.length - 1) return null;

  const atLevel = recent.filter((s) => s.level === level).slice(0, LEVEL_UP_RULES.window);
  if (atLevel.length < LEVEL_UP_RULES.minSessions) return null;

  const reviews = atLevel.reduce((sum, s) => sum + s.reviews, 0);
  if (reviews < LEVEL_UP_RULES.minReviews) return null;
  const recallRate = atLevel.reduce((sum, s) => sum + s.reviewsRecalled, 0) / reviews;
  if (recallRate < LEVEL_UP_RULES.minRecall) return null;

  const writing = atLevel.flatMap((s) => (s.writingCorrect === null ? [] : [s.writingCorrect]));
  if (writing.length >= LEVEL_UP_RULES.minWritingSamples) {
    const rate = writing.filter(Boolean).length / writing.length;
    if (rate < LEVEL_UP_RULES.minWritingRate) return null;
  }

  const speaking = atLevel.flatMap((s) => (s.speakScore === null ? [] : [s.speakScore]));
  if (speaking.length >= LEVEL_UP_RULES.minSpeakSamples) {
    const average = speaking.reduce((sum, score) => sum + score, 0) / speaking.length;
    if (average < LEVEL_UP_RULES.minSpeakAverage) return null;
  }

  return { next: LEVELS[index + 1], recallRate, sessionsAtLevel: atLevel.length };
}
