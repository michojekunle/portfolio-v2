export type ReadingStatus = "unread" | "reading" | "finished" | "abandoned" | "on_hold";

export type FileFormat = "pdf" | "epub" | "docx" | "txt" | "md" | "html" | "azw3" | "mobi" | "fb2" | "cbz" | "other";

export type HighlightColor = "yellow" | "green" | "blue" | "pink";

export const HIGHLIGHT_COLORS: { id: HighlightColor; bg: string; ring: string }[] = [
  { id: "yellow", bg: "#FEF08A", ring: "#CA8A04" },
  { id: "green", bg: "#BBF7D0", ring: "#16A34A" },
  { id: "blue", bg: "#BFDBFE", ring: "#1D4ED8" },
  { id: "pink", bg: "#FBCFE8", ring: "#9D174D" },
];

export type PlanTier = "free" | "pro";

export const FREE_BOOK_LIMIT = 3;

export interface ChBook {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  file_url: string;
  file_format: FileFormat;
  file_size_bytes: number;
  total_pages: number | null;
  current_page: number;
  progress_pct: number;
  status: ReadingStatus;
  genres: string[];
  tags: string[];
  rating: number | null;
  description: string | null;
  language: string;
  published_year: number | null;
  is_private: boolean;
  metadata: ChBookMetadata | null;
  created_at: string;
  updated_at: string;
}

export interface ChBookMetadata {
  isbn?: string;
  publisher?: string;
  chapter_count?: number;
  last_chapter_title?: string;
  open_library_id?: string;
}

export interface ChSession {
  id: string;
  user_id: string;
  book_id: string;
  started_at: string;
  ended_at: string;
  pages_read: number;
  duration_seconds: number;
  chapter_title: string | null;
}

export interface ChHighlight {
  id: string;
  user_id: string;
  book_id: string;
  page_number: number | null;
  cfi_range: string | null;
  text: string;
  color: HighlightColor;
  note: string | null;
  is_flashcard: boolean;
  flashcard_due_at: string | null;
  created_at: string;
}

export interface ChNote {
  id: string;
  user_id: string;
  book_id: string;
  chapter_ref: string | null;
  chapter_title: string | null;
  content_md: string;
  created_at: string;
  updated_at: string;
}

export interface RecommendedBookPlanItem {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_url: string;
  category: string;
  read_time_minutes: number;
  is_added: boolean;
}

export interface ChGoal {
  id: string;
  user_id: string;
  daily_minutes: number;
  annual_books: number;
  streak_count: number;
  longest_streak: number;
  streak_freeze_count: number;
  streak_freeze_until: string | null;
  onboarded: boolean;
  learning_plan: RecommendedBookPlanItem[];
  last_read_date: string | null;
  created_at: string;
  updated_at: string;
}

export type BadgeId =
  // Milestones
  | "first_book"
  | "completionist_1"
  | "completionist_10"
  | "completionist_50"
  | "book_whisperer"
  // Streaks
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "streak_100"
  // Sessions
  | "night_owl"
  | "early_bird"
  | "marathon"
  | "speed_reader"
  // Engagement
  | "highlight_hero"
  | "note_keeper"
  | "flashcard_master"
  | "ai_explorer"
  // Depth
  | "polymath"
  | "deep_reader"
  | "speed_demon";

export interface ChAchievement {
  id: string;
  user_id: string;
  badge_id: BadgeId;
  earned_at: string;
}

export interface ChChatMessage {
  id: string;
  user_id: string;
  book_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChFlashcard {
  id: string;
  user_id: string;
  highlight_id: string;
  book_id: string;
  front: string;
  back: string | null;
  due_at: string;
  interval_days: number;
  ease_factor: number;
  review_count: number;
  created_at: string;
}

export interface ChBookWithStats extends ChBook {
  total_reading_time_minutes: number;
  highlight_count: number;
  note_count: number;
  session_count: number;
}

export interface UploadBookRequest {
  title: string;
  author?: string;
  file: File;
}

export interface UploadBookResult {
  book_id: string;
  file_url: string;
  file_format: FileFormat;
  total_pages: number | null;
}

export interface ReadingStats {
  total_books: number;
  finished_books: number;
  total_reading_time_minutes: number;
  total_pages_read: number;
  avg_reading_speed_wpm: number;
  current_streak: number;
  longest_streak: number;
  books_this_year: number;
  reading_time_today: number;
  reading_time_this_week: number;
}
