import type { Level } from "./lessons";

/**
 * How much support a learner gets. Support is removed as it's earned, so the
 * first days are almost impossible to fail and later days stretch:
 *
 *   1 · guided   — short scene, English shown, build the sentence from tiles
 *   2 · supported — full scene, English on tap, fill the missing word
 *   3 · free     — full scene, English on tap, write your own sentence
 */
export type Stage = 1 | 2 | 3;

const LEVEL_HEAD_START: Record<Level, number> = { A1: 0, A2: 1, B1: 2, B2: 2 };

/** Sessions after which a learner moves up one stage, on top of their level's head start. */
export const STAGE_THRESHOLDS = [3, 10] as const;

export function practiceStage(level: Level, completedSessions: number): Stage {
  const earned = STAGE_THRESHOLDS.filter((threshold) => completedSessions >= threshold).length;
  const stage = 1 + LEVEL_HEAD_START[level] + earned;
  return Math.min(3, Math.max(1, stage)) as Stage;
}

export interface StageShape {
  readonly sentences: number;
  readonly newWords: number;
  readonly englishShown: boolean;
  readonly write: "tiles" | "gap" | "free";
}

export const STAGE_SHAPE: Record<Stage, StageShape> = {
  1: { sentences: 4, newWords: 3, englishShown: true, write: "tiles" },
  2: { sentences: 8, newWords: 6, englishShown: false, write: "gap" },
  3: { sentences: 8, newWords: 6, englishShown: false, write: "free" },
};

/** Sessions left before the next stage, or null at the top. Shown so progress feels concrete. */
export function sessionsToNextStage(level: Level, completedSessions: number): number | null {
  const current = practiceStage(level, completedSessions);
  if (current === 3) return null;
  const next = STAGE_THRESHOLDS.find((threshold) => threshold > completedSessions && practiceStage(level, threshold) > current);
  return next === undefined ? null : next - completedSessions;
}
