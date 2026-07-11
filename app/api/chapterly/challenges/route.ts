import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const CreateChallengeSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(300).optional(),
  type: z.enum(["streak", "books", "time", "highlights", "pages"]),
  target: z.number().int().positive().max(10000),
  duration_days: z.number().int().min(1).max(365),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

// GET — fetch all user challenges (custom) + their entries
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [challenges, entries] = await Promise.all([
    supabase
      .from("ch_challenges")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("ch_challenge_entries")
      .select("*")
      .eq("user_id", user.id),
  ]);

  return NextResponse.json({
    challenges: challenges.data ?? [],
    entries: entries.data ?? [],
  });
}

// POST — create a new custom challenge
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateChallengeSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", details: parsed.error.flatten() }, { status: 422 });
  }

  const { title, description, type, target, duration_days, difficulty } = parsed.data;
  const ends_at = new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("ch_challenges")
    .insert({
      user_id: user.id,
      title,
      description: description ?? null,
      type,
      target,
      duration_days,
      difficulty,
      ends_at,
    })
    .select()
    .single();

  if (error) {
    console.error("[challenges] create error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  // Auto-join the challenge on creation
  await supabase.from("ch_challenge_entries").insert({
    user_id: user.id,
    challenge_id: (data as { id: string }).id,
    progress: 0,
  });

  return NextResponse.json({ challenge: data }, { status: 201 });
}

// PATCH — join a prebuilt challenge (by challenge_ref) or update progress
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { action: "join" | "leave"; challenge_ref?: string; challenge_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, challenge_ref, challenge_id } = body;

  if (action === "join") {
    if (!challenge_ref && !challenge_id) {
      return NextResponse.json({ error: "Missing challenge reference" }, { status: 400 });
    }
    const { error } = await supabase.from("ch_challenge_entries").upsert({
      user_id: user.id,
      ...(challenge_ref ? { challenge_ref } : {}),
      ...(challenge_id ? { challenge_id } : {}),
      progress: 0,
    }, { onConflict: challenge_ref ? "user_id,challenge_ref" : "user_id,challenge_id" });

    if (error) {
      console.error("[challenges] join error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "leave") {
    let query = supabase.from("ch_challenge_entries").delete().eq("user_id", user.id);
    if (challenge_ref) {
      query = query.eq("challenge_ref", challenge_ref) as typeof query;
    } else if (challenge_id) {
      query = query.eq("challenge_id", challenge_id) as typeof query;
    } else {
      return NextResponse.json({ error: "Missing challenge reference" }, { status: 400 });
    }
    const { error } = await query;
    if (error) {
      console.error("[challenges] leave error:", error);
      return NextResponse.json({ error: "Failed to leave challenge" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
