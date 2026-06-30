import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const SessionSchema = z.object({
  book_id: z.string().uuid(),
  duration_seconds: z.number().int().min(1).max(86400),
  pages_read: z.number().int().min(0).optional(),
  local_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { book_id, duration_seconds, pages_read = 0, local_date } = parsed.data;

  // Verify ownership
  const { data: book } = await supabase
    .from("ch_books")
    .select("id")
    .eq("id", book_id)
    .eq("user_id", user.id)
    .single();

  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const now = new Date();
  const startedAt = new Date(now.getTime() - duration_seconds * 1000).toISOString();
  const todayStr = local_date || now.toISOString().split("T")[0];

  const [sessionResult] = await Promise.all([
    supabase.from("ch_sessions").insert({
      user_id: user.id,
      book_id,
      started_at: startedAt,
      ended_at: now.toISOString(),
      duration_seconds,
      pages_read,
    }),
    supabase
      .from("ch_books")
      .update({ status: "reading", updated_at: now.toISOString() })
      .eq("id", book_id)
      .eq("user_id", user.id)
      .eq("status", "unread"), // only auto-advance from unread
  ]);

  if (sessionResult.error) {
    console.error("[chapterly/session] insert error:", sessionResult.error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }

  // Update streak — maybeSingle() returns null (not an error) when no goal row exists yet
  const { data: goal } = await supabase
    .from("ch_goals")
    .select("streak_count, longest_streak, last_read_date")
    .eq("user_id", user.id)
    .maybeSingle();

  const lastRead = (goal?.last_read_date as string | null) ?? null;

  // Safe DST timezone calendar date subtraction
  let yesterdayStr = "";
  if (local_date) {
    const parts = local_date.split("-").map(Number);
    if (parts[0] && parts[1] && parts[2]) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      d.setDate(d.getDate() - 1);
      yesterdayStr = d.toLocaleDateString("en-CA");
    }
  }
  if (!yesterdayStr) {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    yesterdayStr = d.toISOString().split("T")[0];
  }

  let newStreak = (goal?.streak_count as number) ?? 0;
  if (lastRead === todayStr) {
    // already logged today — no change
  } else if (lastRead === yesterdayStr) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max((goal?.longest_streak as number) ?? 0, newStreak);

  if (goal) {
    await supabase
      .from("ch_goals")
      .update({ streak_count: newStreak, longest_streak: newLongest, last_read_date: todayStr })
      .eq("user_id", user.id);
  } else {
    // First session ever — create the goal row with streak bootstrapped
    await supabase
      .from("ch_goals")
      .insert({ user_id: user.id, streak_count: newStreak, longest_streak: newLongest, last_read_date: todayStr });
  }

  return NextResponse.json({ ok: true });
}
