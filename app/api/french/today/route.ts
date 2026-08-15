/**
 * GET /api/french/today
 * Returns all of today's generated challenges + completion status + streak.
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

    // Fetch all challenges for today and streak in parallel
    const [challengesResult, streakResult] = await Promise.all([
      supabase
        .from("french_challenges")
        .select("*")
        .eq("challenge_date", today)
        .order("created_at", { ascending: true }),
      supabase.from("french_streaks").select("*").eq("id", 1).single(),
    ]);

    const challenges = challengesResult.data ?? [];
    const streak = streakResult.data;

    // Fetch completion logs for today's challenges
    const challengeIds = challenges.map((c) => c.id);
    let completedIds: string[] = [];

    if (challengeIds.length > 0) {
      const { data: logs } = await supabase
        .from("french_logs")
        .select("challenge_id")
        .in("challenge_id", challengeIds);

      if (logs) {
        completedIds = logs.map((l) => l.challenge_id).filter(Boolean);
      }
    }

    const completedToday =
      completedIds.length > 0 || streak?.last_completed_date === today;

    // Active challenge is the latest one generated or the first uncompleted one
    const activeChallenge =
      challenges.find((c) => !completedIds.includes(c.id)) ??
      challenges[challenges.length - 1] ??
      null;

    return NextResponse.json({
      challenges,
      activeChallenge,
      completedIds,
      generationCount: challenges.length,
      maxAllowed: 5,
      streak,
      completedToday,
    });
  } catch (err) {
    console.error("[french/today] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
