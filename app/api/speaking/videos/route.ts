import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSpeakingAuth } from "@/lib/speaking/auth";

export const dynamic = "force-dynamic";

const VideoPatchSchema = z.object({
  id: z.string().uuid(),
  is_published: z.boolean().optional(),
  category: z.string().trim().min(1).max(60).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  section: z.enum(["intro", "featured", "highlight"]).optional(),
});

export async function GET(): Promise<NextResponse> {
  const auth = await requireSpeakingAuth();
  if (auth.unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("site_videos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[speaking/videos] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }

  return NextResponse.json({ videos: data ?? [] });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
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

  const parsed = VideoPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { id, ...fields } = parsed.data;
  const { data, error } = await supabase
    .from("site_videos")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[speaking/videos] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }

  // Keep linked speaking_publications.video_category aligned if category updated
  if (fields.category) {
    await supabase
      .from("speaking_publications")
      .update({ video_category: fields.category })
      .eq("site_video_id", id);
  }

  return NextResponse.json({ ok: true, video: data });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const auth = await requireSpeakingAuth();
  if (auth.unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { supabase } = auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id || !z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Valid video id is required" }, { status: 400 });
  }

  // Detach from speaking_publications first
  await supabase
    .from("speaking_publications")
    .update({ site_video_id: null, sync_to_videos: false })
    .eq("site_video_id", id);

  const { error } = await supabase.from("site_videos").delete().eq("id", id);
  if (error) {
    console.error("[speaking/videos] DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove video" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
