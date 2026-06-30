import type { BadgeId } from "./types";

export interface BadgeDef {
  id: BadgeId;
  label: string;
  description: string;
}

export const BADGE_DEFS: Record<BadgeId, BadgeDef> = {
  first_book: {
    id: "first_book",
    label: "First Chapter",
    description: "Added your first book to the library.",
  },
  night_owl: {
    id: "night_owl",
    label: "Night Owl",
    description: "Read past midnight 5 times.",
  },
  marathon: {
    id: "marathon",
    label: "Marathon",
    description: "Completed a single 2-hour reading session.",
  },
  completionist_10: {
    id: "completionist_10",
    label: "Completionist",
    description: "Finished 10 books.",
  },
  completionist_50: {
    id: "completionist_50",
    label: "Scholar",
    description: "Finished 50 books.",
  },
  streak_7: {
    id: "streak_7",
    label: "Week Warrior",
    description: "Maintained a 7-day reading streak.",
  },
  streak_30: {
    id: "streak_30",
    label: "Streak Master",
    description: "Maintained a 30-day reading streak.",
  },
  streak_100: {
    id: "streak_100",
    label: "Centurion",
    description: "Maintained a 100-day reading streak.",
  },
  speed_demon: {
    id: "speed_demon",
    label: "Speed Demon",
    description: "Logged over 1,000 minutes of total reading time.",
  },
  book_whisperer: {
    id: "book_whisperer",
    label: "Book Whisperer",
    description: "Added 50 books to your library.",
  },
};

export const BADGE_LIST = Object.values(BADGE_DEFS);

export interface AchievementCheckInput {
  total_books: number;
  finished_books: number;
  longest_streak: number;
  total_reading_time_minutes: number;
  /** Sessions that started between 23:00–04:00 */
  night_owl_sessions: number;
  /** Sessions with duration >= 7200 seconds (2 hours) */
  marathon_sessions: number;
}

type CheckFn = (input: AchievementCheckInput) => boolean;

const CHECKS: Record<BadgeId, CheckFn> = {
  first_book: (i) => i.total_books >= 1,
  night_owl: (i) => i.night_owl_sessions >= 5,
  marathon: (i) => i.marathon_sessions >= 1,
  completionist_10: (i) => i.finished_books >= 10,
  completionist_50: (i) => i.finished_books >= 50,
  streak_7: (i) => i.longest_streak >= 7,
  streak_30: (i) => i.longest_streak >= 30,
  streak_100: (i) => i.longest_streak >= 100,
  speed_demon: (i) => i.total_reading_time_minutes >= 1000,
  book_whisperer: (i) => i.total_books >= 50,
};

/**
 * Returns the badge IDs the user is newly eligible for (not already earned).
 * Pure function — no I/O.
 */
export function checkEligibleBadges(
  input: AchievementCheckInput,
  alreadyEarned: BadgeId[],
): BadgeId[] {
  const earned = new Set(alreadyEarned);
  return (Object.keys(CHECKS) as BadgeId[]).filter(
    (id) => !earned.has(id) && CHECKS[id](input),
  );
}
