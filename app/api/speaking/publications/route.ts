import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSpeakingAuth } from "@/lib/speaking/auth";
import { getCurriculumDay } from "@/lib/speaking/curriculum";
import {
  isVideoEmbedPlatform,
  validatePlatformUrl,
} from "@/lib/videos/validation";

export const dynamic = "force-dynamic";

const PubItemSchema = z.object({
  platform: z.enum(["instagram", "tiktok", "x", "youtube", "website"]),
  published: z.boolean(),
  url: z.string().max(2000).default(""),
  caption: z.string().max(5000).default(""),
  publishedAt: z.string().nullable().optional(),
  notes: z.string().max(2000).default(""),
  videoCategory: z.string().trim().min(1).max(60).default("Speaking Challenge"),
  syncToVideos: z.boolean().default(true),
  siteVideoId: z.string().uuid().nullable().optional(),
});

const PublicationsPutSchema = z.object({
  dayNumber: z.number().int().min(1).max(90),
  publications: z.array(PubItemSchema).min(1).max(5),
});

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const auth = await requireSpeakingAuth();
  if (auth.unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { supabase } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PublicationsPutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { dayNumber, publications } = parsed.data;
  const day = getCurriculumDay(dayNumber);
  const nowIso = new Date().toISOString();

  // Enforce valid URLs (required when published OR whenever a non-empty URL is provided).
  const normalizedUrls = new Map<string, string>();
  for (const item of publications) {
    const trimmed = item.url.trim();
    if (!trimmed && !item.published) {
      normalizedUrls.set(item.platform, "");
      continue;
    }

    const verdict = validatePlatformUrl(item.platform, trimmed);
    if (!verdict.ok) {
      return NextResponse.json(
        { error: `${item.platform.toUpperCase()}: ${verdict.error}` },
        { status: 400 }
      );
    }
    normalizedUrls.set(item.platform, verdict.normalizedUrl);
  }

  // Sync valid video URLs directly with site_videos (/videos page)
  const resolvedSiteVideoIds = new Map<string, string | null>();
  for (const item of publications) {
    const cleanUrl = normalizedUrls.get(item.platform) ?? "";
    if (!isVideoEmbedPlatform(item.platform)) {
      resolvedSiteVideoIds.set(item.platform, null);
      continue;
    }

    const shouldSync = Boolean(cleanUrl && item.published && item.syncToVideos);
    if (shouldSync) {
      const title = day ? `Day ${dayNumber}: ${day.topic}` : `Speaking Day ${dayNumber}`;
      const description =
        item.caption.trim() ||
        day?.description ||
        `Day ${dayNumber} of 90 Days of Speaking`;

      if (item.siteVideoId) {
        const { data: updated, error: updErr } = await supabase
          .from("site_videos")
          .update({
            platform: item.platform,
            url: cleanUrl,
            title,
            description,
            category: item.videoCategory,
            speaking_day_number: dayNumber,
            updated_at: nowIso,
          })
          .eq("id", item.siteVideoId)
          .select("id")
          .maybeSingle();

        if (!updErr && updated?.id) {
          resolvedSiteVideoIds.set(item.platform, String(updated.id));
          continue;
        }
      }

      // Check for existing synced video for the same day+platform so we never duplicate
      const { data: existingMatch } = await supabase
        .from("site_videos")
        .select("id")
        .eq("speaking_day_number", dayNumber)
        .eq("platform", item.platform)
        .maybeSingle();

      if (existingMatch?.id) {
        await supabase
          .from("site_videos")
          .update({
            url: cleanUrl,
            title,
            description,
            category: item.videoCategory,
            is_published: true,
            updated_at: nowIso,
          })
          .eq("id", existingMatch.id);
        resolvedSiteVideoIds.set(item.platform, String(existingMatch.id));
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from("site_videos")
          .insert([
            {
              platform: item.platform,
              url: cleanUrl,
              title,
              description,
              section: "highlight",
              category: item.videoCategory,
              speaking_day_number: dayNumber,
              display_order: dayNumber,
              is_published: true,
            },
          ])
          .select("id")
          .single();

        if (insErr) {
          console.error("[speaking/publications] site_videos insert error:", insErr);
          return NextResponse.json(
            { error: "Could not sync video to /videos" },
            { status: 500 }
          );
        }
        resolvedSiteVideoIds.set(item.platform, String(inserted.id));
      }
    } else if (item.siteVideoId && !item.syncToVideos) {
      // Owner explicitly disabled /videos sync for this platform
      await supabase.from("site_videos").delete().eq("id", item.siteVideoId);
      resolvedSiteVideoIds.set(item.platform, null);
    } else {
      resolvedSiteVideoIds.set(item.platform, item.siteVideoId ?? null);
    }
  }

  const rows = publications.map((p) => ({
    day_number: dayNumber,
    platform: p.platform,
    published: p.published,
    url: normalizedUrls.get(p.platform) ?? p.url.trim(),
    caption: p.caption,
    published_at: p.published ? p.publishedAt || nowIso : null,
    notes: p.notes,
    video_category: p.videoCategory,
    sync_to_videos: p.syncToVideos,
    site_video_id: resolvedSiteVideoIds.get(p.platform) ?? null,
    updated_at: nowIso,
  }));

  const { data, error } = await supabase
    .from("speaking_publications")
    .upsert(rows, { onConflict: "day_number,platform" })
    .select();

  if (error) {
    console.error("[speaking/publications] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to save publications" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, publications: data });
}
