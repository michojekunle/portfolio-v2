export type BookTheme =
  | "diary"
  | "sideways"
  | "sellcrazy"
  | "sellsold"
  | "custom";

export type ContentType =
  | "article"
  | "thread"
  | "carousel"
  | "tiktok"
  | "caption";

export type ContentStatus = "draft" | "published";

export type AIProvider = "groq" | "gemini" | "auto";

export interface BBBook {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_url: string | null;
  insights: string[];
  theme: BookTheme;
  genres: string[];
  rating: number | null;
  read_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BBContent {
  id: string;
  user_id: string;
  book_id: string;
  content_type: ContentType;
  platform: string;
  title: string;
  content: string;
  metadata: ContentMetadata;
  status: ContentStatus;
  published_url: string | null;
  regenerate_count: number;
  created_at: string;
  updated_at: string;
}

export interface ContentMetadata {
  seo_keywords?: string[];
  meta_description?: string;
  word_count?: number;
  estimated_read_time?: number;
  slide_count?: number;
  tweet_count?: number;
}

export interface BBSettings {
  id: string;
  user_id: string;
  website_url: string;
  default_theme: BookTheme;
  default_platforms: string[];
  ai_provider: AIProvider;
  default_tone: string;
  default_word_count: number;
  seo_keywords: string[];
  newsletter_cta: string;
  created_at: string;
  updated_at: string;
}

export interface BBBookWithContent extends BBBook {
  content_count: number;
}

export interface GenerateRequest {
  book_id: string;
  content_type: ContentType;
  platform?: string;
  tone?: string;
  word_count?: number;
  seo_keywords?: string[];
  custom_instructions?: string;
}

export interface GenerateResponse {
  content: string;
  metadata: ContentMetadata;
}

export interface BookThemeConfig {
  label: string;
  bg: string;
  accent: string;
  text: string;
}
