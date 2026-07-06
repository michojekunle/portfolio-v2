export type VideoPlatform = "youtube" | "instagram" | "tiktok";
export type VideoSection = "intro" | "featured" | "highlight";

export interface SiteVideo {
  id: string;
  platform: VideoPlatform;
  url: string;
  title: string;
  description: string | null;
  section: VideoSection;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type SiteVideoInput = Pick<
  SiteVideo,
  "platform" | "url" | "title" | "description" | "section" | "display_order" | "is_published"
>;
