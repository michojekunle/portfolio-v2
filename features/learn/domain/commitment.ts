/**
 * How much time a learner commits to each day, and what that honestly buys.
 *
 * Grounding: the US Foreign Service Institute puts French at roughly 600–750
 * classroom hours to professional fluency. 15 min/day is ~90 h/year, so the
 * goals below are deliberately modest; they are estimates, never promises.
 */

export const COMMITMENTS = [15, 30, 60] as const;
export type Commitment = (typeof COMMITMENTS)[number];
export const DEFAULT_COMMITMENT: Commitment = 15;

export function toCommitment(minutes: number | null | undefined): Commitment {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes)) return DEFAULT_COMMITMENT;
  // Nearest supported option, so legacy values (e.g. 12) still land sensibly.
  return COMMITMENTS.reduce((best, option) => (Math.abs(option - minutes) < Math.abs(best - minutes) ? option : best), DEFAULT_COMMITMENT);
}

export interface Milestone {
  readonly months: 3 | 6 | 12;
  readonly level: string;
  readonly canDo: string;
}

export const GOALS: Record<Commitment, readonly Milestone[]> = {
  15: [
    { months: 3, level: "A1", canDo: "greet, order, introduce yourself, read simple signs" },
    { months: 6, level: "A1+", canDo: "short everyday exchanges, read short messages" },
    { months: 12, level: "A2", canDo: "handle errands and small talk, write a short note" },
  ],
  30: [
    { months: 3, level: "A1+", canDo: "short everyday exchanges, read short messages" },
    { months: 6, level: "A2", canDo: "handle errands and small talk, write a short note" },
    { months: 12, level: "B1", canDo: "get by in conversation, follow clear speech, write a simple email" },
  ],
  60: [
    { months: 3, level: "A2", canDo: "handle errands and small talk, write a short note" },
    { months: 6, level: "B1", canDo: "get by in conversation, follow clear speech, write a simple email" },
    { months: 12, level: "B1+/B2", canDo: "talk about most topics, follow films with effort, write clearly" },
  ],
};

/** Extra steps unlocked by committing more time. The core page is the same for everyone. */
export interface CommitmentSteps {
  readonly listen: boolean;
  readonly dictation: boolean;
}

export const COMMITMENT_STEPS: Record<Commitment, CommitmentSteps> = {
  15: { listen: false, dictation: false },
  30: { listen: true, dictation: false },
  60: { listen: true, dictation: true },
};
