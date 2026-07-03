export interface PrebuiltChallenge {
  id: string;
  title: string;
  description: string;
  type: "streak" | "books" | "time" | "highlights" | "pages";
  target: number;
  duration_days: number;
  difficulty: "easy" | "medium" | "hard";
  icon: string;
  reward_badge?: string;
}

export const PREBUILT_CHALLENGES: PrebuiltChallenge[] = [
  {
    id: "seven-day-streak",
    title: "7-Day Streak",
    description: "Read every day for 7 consecutive days.",
    type: "streak",
    target: 7,
    duration_days: 7,
    difficulty: "easy",
    icon: "🔥",
    reward_badge: "streak_7",
  },
  {
    id: "book-in-a-week",
    title: "Book in a Week",
    description: "Finish one book within 7 days.",
    type: "books",
    target: 1,
    duration_days: 7,
    difficulty: "easy",
    icon: "📖",
    reward_badge: "completionist_1",
  },
  {
    id: "highlight-hunter",
    title: "Highlight Hunter",
    description: "Make 25 highlights across your books.",
    type: "highlights",
    target: 25,
    duration_days: 30,
    difficulty: "medium",
    icon: "✏️",
    reward_badge: "highlight_hero",
  },
  {
    id: "marathon-reader",
    title: "Marathon Month",
    description: "Read for at least 500 minutes this month.",
    type: "time",
    target: 500,
    duration_days: 30,
    difficulty: "medium",
    icon: "⏱️",
  },
  {
    id: "thirty-day-streak",
    title: "Iron Reader",
    description: "Read every day for 30 consecutive days.",
    type: "streak",
    target: 30,
    duration_days: 30,
    difficulty: "hard",
    icon: "💎",
    reward_badge: "streak_30",
  },
  {
    id: "five-books",
    title: "Five in Thirty",
    description: "Complete 5 books within 30 days.",
    type: "books",
    target: 5,
    duration_days: 30,
    difficulty: "hard",
    icon: "🏆",
    reward_badge: "completionist_10",
  },
  {
    id: "deep-reader",
    title: "2000 Minutes",
    description: "Accumulate 2,000 total reading minutes.",
    type: "time",
    target: 2000,
    duration_days: 90,
    difficulty: "hard",
    icon: "🌊",
  },
  {
    id: "speed-week",
    title: "Speed Week",
    description: "Read 500 pages in 7 days.",
    type: "pages",
    target: 500,
    duration_days: 7,
    difficulty: "hard",
    icon: "⚡",
    reward_badge: "speed_demon",
  },
];

export const DIFFICULTY_STYLES: Record<PrebuiltChallenge["difficulty"], { label: string; color: string; bg: string }> = {
  easy:   { label: "Easy",   color: "#16A34A", bg: "rgba(22,163,74,0.10)" },
  medium: { label: "Medium", color: "#D97706", bg: "rgba(217,119,6,0.10)" },
  hard:   { label: "Hard",   color: "#DC2626", bg: "rgba(220,38,38,0.10)" },
};
