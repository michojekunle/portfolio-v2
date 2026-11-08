import type { BadgeId } from "./types";

export interface BadgeDef {
  id: BadgeId;
  label: string;
  description: string;
}

export const BADGE_DEFS: Record<BadgeId, BadgeDef> = {
  // Milestones
  first_book: {
    id: "first_book",
    label: "First Chapter",
    description: "Added your first book to the library.",
  },
  completionist_1: {
    id: "completionist_1",
    label: "Finisher",
    description: "Finished your first book.",
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
  book_whisperer: {
    id: "book_whisperer",
    label: "Book Whisperer",
    description: "Added 50 books to your library.",
  },
  // Streaks
  streak_3: {
    id: "streak_3",
    label: "Hat Trick",
    description: "Maintained a 3-day reading streak.",
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
  // Sessions
  night_owl: {
    id: "night_owl",
    label: "Night Owl",
    description: "Read past midnight 5 times.",
  },
  early_bird: {
    id: "early_bird",
    label: "Early Bird",
    description: "Started 3 reading sessions before 7am.",
  },
  marathon: {
    id: "marathon",
    label: "Marathon",
    description: "Completed a single 2-hour reading session.",
  },
  speed_reader: {
    id: "speed_reader",
    label: "Speed Reader",
    description: "Read 100+ pages in a single session.",
  },
  // Engagement
  highlight_hero: {
    id: "highlight_hero",
    label: "Highlight Hero",
    description: "Made 25 highlights across your books.",
  },
  note_keeper: {
    id: "note_keeper",
    label: "Note Keeper",
    description: "Added 10 notes across your books.",
  },
  flashcard_master: {
    id: "flashcard_master",
    label: "Flashcard Master",
    description: "Completed 50 flashcard reviews.",
  },
  ai_explorer: {
    id: "ai_explorer",
    label: "AI Explorer",
    description: "Sent 10 messages to the AI book assistant.",
  },
  // Depth
  polymath: {
    id: "polymath",
    label: "Polymath",
    description: "Read books across 3 or more distinct genres.",
  },
  deep_reader: {
    id: "deep_reader",
    label: "Deep Reader",
    description: "Logged over 5,000 minutes of total reading time.",
  },
  speed_demon: {
    id: "speed_demon",
    label: "Speed Demon",
    description: "Logged over 1,000 minutes of total reading time.",
  },
};

export const BADGE_LIST = Object.values(BADGE_DEFS);

export interface AchievementCheckInput {
  total_books: number;
  finished_books: number;
  longest_streak: number;
  total_reading_time_minutes: number;
  night_owl_sessions: number;
  early_bird_sessions: number;
  marathon_sessions: number;
  speed_reader_sessions: number;
  highlight_count: number;
  note_count: number;
  flashcard_reviews: number;
  ai_message_count: number;
  distinct_genres: number;
}

type CheckFn = (input: AchievementCheckInput) => boolean;

const CHECKS: Record<BadgeId, CheckFn> = {
  first_book: (i) => i.total_books >= 1,
  completionist_1: (i) => i.finished_books >= 1,
  completionist_10: (i) => i.finished_books >= 10,
  completionist_50: (i) => i.finished_books >= 50,
  book_whisperer: (i) => i.total_books >= 50,
  streak_3: (i) => i.longest_streak >= 3,
  streak_7: (i) => i.longest_streak >= 7,
  streak_30: (i) => i.longest_streak >= 30,
  streak_100: (i) => i.longest_streak >= 100,
  night_owl: (i) => i.night_owl_sessions >= 5,
  early_bird: (i) => i.early_bird_sessions >= 3,
  marathon: (i) => i.marathon_sessions >= 1,
  speed_reader: (i) => i.speed_reader_sessions >= 1,
  highlight_hero: (i) => i.highlight_count >= 25,
  note_keeper: (i) => i.note_count >= 10,
  flashcard_master: (i) => i.flashcard_reviews >= 50,
  ai_explorer: (i) => i.ai_message_count >= 10,
  polymath: (i) => i.distinct_genres >= 3,
  deep_reader: (i) => i.total_reading_time_minutes >= 5000,
  speed_demon: (i) => i.total_reading_time_minutes >= 1000,
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
