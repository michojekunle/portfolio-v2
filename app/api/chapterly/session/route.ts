import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const SessionSchema = z.object({
  book_id: z.string().uuid(),
  duration_seconds: z.number().int().min(1).max(86400),
  pages_read: z.number().int().min(0).optional(),
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

  const { book_id, duration_seconds, pages_read = 0 } = parsed.data;

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
  const todayStr = now.toISOString().split("T")[0];

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

  // Update streak in goals
  const { data: goal } = await supabase
    .from("ch_goals")
    .select("streak_count, longest_streak, last_read_date")
    .eq("user_id", user.id)
    .single();

  if (goal) {
    const lastRead = goal.last_read_date as string | null;
    const yesterday = new Date(now.getTime() - 86_400_000).toISOString().split("T")[0];

    let newStreak = goal.streak_count as number;
    if (lastRead === todayStr) {
      // already logged today — no change
    } else if (lastRead === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    const newLongest = Math.max((goal.longest_streak as number) ?? 0, newStreak);

    await supabase
      .from("ch_goals")
      .update({ streak_count: newStreak, longest_streak: newLongest, last_read_date: todayStr })
      .eq("user_id", user.id);
  }

  return NextResponse.json({ ok: true });
}
