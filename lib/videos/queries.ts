import { createClient } from "@/lib/supabase/server";
import type { SiteVideo } from "./types";

export { extractYoutubeId, getYoutubeThumbnail } from "./youtube";

async function getPublishedBySection(section: SiteVideo["section"], limit?: number): Promise<SiteVideo[]> {
  const supabase = await createClient();
  let query = supabase
    .from("site_videos")
    .select("*")
    .eq("section", section)
    .eq("is_published", true)
    .order("display_order", { ascending: true });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error(`[videos] failed to load section=${section}:`, error);
    return [];
  }
  return data ?? [];
}

export async function getIntroVideo(): Promise<SiteVideo | null> {
  const rows = await getPublishedBySection("intro", 1);
  return rows[0] ?? null;
}

export async function getFeaturedVideos(limit = 2): Promise<SiteVideo[]> {
  return getPublishedBySection("featured", limit);
}

export async function getHighlightVideos(limit = 12): Promise<SiteVideo[]> {
  return getPublishedBySection("highlight", limit);
}

