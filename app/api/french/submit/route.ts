/**
 * POST /api/french/submit
 * Logs a completed challenge and updates the streak.
 * Supports Streak Freezes (consumes 1 freeze if a day was missed).
 * Body: { challenge_id, type, proof_text?, proof_url? }
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request): Promise<Response> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to submit challenge completions." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      challenge_id: string;
      type: "speaking" | "writing" | "reading";
      proof_text?: string;
      proof_url?: string;
    };

    const { challenge_id, type, proof_text, proof_url } = body;

    if (!challenge_id || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert completion log
    const { error: logError } = await supabase.from("french_logs").insert({
      challenge_id,
      type,
      proof_text: proof_text ?? null,
      proof_url: proof_url ?? null,
    });

    if (logError) {
      console.error("[french/submit] Log insert error:", logError);
      return NextResponse.json({ error: "Failed to log completion" }, { status: 500 });
    }

    // 2. Fetch current streak data
    const today = new Date().toISOString().split("T")[0];

    const { data: streak, error: streakReadError } = await supabase
      .from("french_streaks")
      .select("*")
      .eq("id", 1)
      .single();

    if (streakReadError || !streak) {
      console.error("[french/submit] Streak read error:", streakReadError);
      return NextResponse.json({ ok: true, streak: null });
    }

    const lastDate = streak.last_completed_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = streak.current_streak ?? 0;
    let freezesCount = streak.streak_freezes ?? 2;
    let usedFreeze = false;

    // Streak Calculation & Freeze logic
    if (lastDate === today) {
      // Already completed today
      return NextResponse.json({ ok: true, streak });
    } else if (!lastDate || lastDate === yesterdayStr) {
      // Consecutive completion
      newStreak += 1;
    } else {
      // Missed a day — check if a Streak Freeze is available
      if (freezesCount > 0) {
        freezesCount -= 1;
        newStreak += 1; // Freeze saved the streak!
        usedFreeze = true;
      } else {
        newStreak = 1; // Streak resets
      }
    }

    const newLongest = Math.max(streak.longest_streak ?? 0, newStreak);
    const totalCompletions = (streak.total_completions ?? 0) + 1;

    const { error: streakUpdateError } = await supabase
      .from("french_streaks")
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        streak_freezes: freezesCount,
        last_completed_date: today,
        total_completions: totalCompletions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (streakUpdateError) {
      console.error("[french/submit] Streak update error:", streakUpdateError);
    }

    return NextResponse.json({
      ok: true,
      usedFreeze,
      streak: {
        current_streak: newStreak,
        longest_streak: newLongest,
        streak_freezes: freezesCount,
        total_completions: totalCompletions,
        last_completed_date: today,
      },
    });
  } catch (err) {
    console.error("[french/submit] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
