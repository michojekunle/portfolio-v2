/**
 * GET /api/french/today
 * Returns today's challenge + current streak + whether it's already been completed today.
 * Called by the /french page on load.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(): Promise<Response> {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Fetch challenge and streak in parallel
    const [challengeResult, streakResult] = await Promise.all([
      supabase
        .from("french_challenges")
        .select("*")
        .eq("challenge_date", today)
        .maybeSingle(),
      supabase.from("french_streaks").select("*").eq("id", 1).single(),
    ]);

    const challenge = challengeResult.data;
    const streak = streakResult.data;

    // Check if today's challenge was already completed.
    // We do this only if a challenge exists (need the id).
    let completedToday = false;
    if (challenge?.id) {
      const { data: log } = await supabase
        .from("french_logs")
        .select("id")
        .eq("challenge_id", challenge.id)
        .maybeSingle();
      completedToday = !!log;
    } else if (streak?.last_completed_date === today) {
      // Fallback: if somehow a log was submitted without a challenge row
      completedToday = true;
    }

    return NextResponse.json({
      challenge,
      streak,
      completedToday,
    });
  } catch (err) {
    console.error("[french/today] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
