import { createClient } from "@/lib/supabase/server";
import type { SiteVideo } from "./types";

export { extractYoutubeId, getYoutubeThumbnail } from "./youtube";

function normalizeVideo(row: Record<string, unknown>): SiteVideo {
  return {
    id: String(row.id ?? ""),
    platform: row.platform as SiteVideo["platform"],
    url: String(row.url ?? ""),
    title: String(row.title ?? ""),
    description: (row.description as string | null) ?? null,
    section: (row.section as SiteVideo["section"]) || "highlight",
    category:
      typeof row.category === "string" && row.category.trim()
        ? row.category
        : "General",
    speaking_day_number:
      row.speaking_day_number != null ? Number(row.speaking_day_number) : null,
    display_order: Number(row.display_order ?? 0),
    is_published: row.is_published !== undefined ? Boolean(row.is_published) : true,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

async function getPublishedBySection(
  section: SiteVideo["section"],
  limit?: number
): Promise<SiteVideo[]> {
  const supabase = await createClient();
  let query = supabase
    .from("site_videos")
    .select("*")
    .eq("section", section)
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error(`[videos] failed to load section=${section}:`, error);
    return [];
  }
  return (data ?? []).map((row) => normalizeVideo(row as Record<string, unknown>));
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

export interface HighlightVideosPage {
  videos: SiteVideo[];
  total: number;
  hasMore: boolean;
}

export async function getHighlightVideosPage(options?: {
  category?: string;
  offset?: number;
  limit?: number;
}): Promise<HighlightVideosPage> {
  const category = options?.category?.trim() || "all";
  const offset = Math.max(0, options?.offset ?? 0);
  const limit = Math.min(24, Math.max(1, options?.limit ?? 6));

  const supabase = await createClient();
  let query = supabase
    .from("site_videos")
    .select("*", { count: "exact" })
    .eq("section", "highlight")
    .eq("is_published", true);

  if (category !== "all") {
    query = query.eq("category", category);
  }

  const { data, count, error } = await query
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[videos] failed paginated query:", error);
    return { videos: [], total: 0, hasMore: false };
  }

  const videos = (data ?? []).map((row) =>
    normalizeVideo(row as Record<string, unknown>)
  );
  const total = count ?? videos.length;
  return {
    videos,
    total,
    hasMore: offset + videos.length < total,
  };
}

export async function getHighlightVideoCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_videos")
    .select("category")
    .eq("section", "highlight")
    .eq("is_published", true);

  if (error || !data) {
    return [];
  }

  const seen = new Set<string>();
  for (const row of data as Array<{ category?: string | null }>) {
    const cat = row.category?.trim() || "General";
    seen.add(cat);
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}
