export type VideoPlatform = "youtube" | "instagram" | "tiktok";
export type VideoSection = "intro" | "featured" | "highlight";

export const VIDEO_CATEGORIES = [
  "Speaking Challenge",
  "Engineering & Systems",
  "Products & Startups",
  "Philosophy & Growth",
  "Reading & Ideas",
  "General",
] as const;

export type VideoCategory = (typeof VIDEO_CATEGORIES)[number] | (string & {});

export interface SiteVideo {
  id: string;
  platform: VideoPlatform;
  url: string;
  title: string;
  description: string | null;
  section: VideoSection;
  category: string;
  speaking_day_number?: number | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type SiteVideoInput = Pick<
  SiteVideo,
  | "platform"
  | "url"
  | "title"
  | "description"
  | "section"
  | "category"
  | "display_order"
  | "is_published"
>;
