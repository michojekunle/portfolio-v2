/**
 * GET /api/french/today
 * Returns today's challenges + user-specific streak + completion status.
 * Supports multi-user isolation.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(): Promise<Response> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    // 1. Fetch today's generated challenges
    const { data: challenges } = await supabase
      .from("french_challenges")
      .select("*")
      .eq("challenge_date", today)
      .order("created_at", { ascending: true });

    const todayChallenges = challenges ?? [];
    const challengeIds = todayChallenges.map((c) => c.id);

    let completedIds: string[] = [];
    let streak: {
      current_streak: number;
      longest_streak: number;
      streak_freezes: number;
      total_completions: number;
      last_completed_date: string | null;
    } = {
      current_streak: 0,
      longest_streak: 0,
      streak_freezes: 2,
      total_completions: 0,
      last_completed_date: null,
    };

    if (user) {
      // 2. Fetch user's personal streak
      const { data: userStreak } = await supabase
        .from("french_user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userStreak) {
        streak = {
          current_streak: userStreak.current_streak ?? 0,
          longest_streak: userStreak.longest_streak ?? 0,
          streak_freezes: userStreak.streak_freezes ?? 2,
          total_completions: userStreak.total_completions ?? 0,
          last_completed_date: userStreak.last_completed_date ?? null,
        };
      } else {
        // Check legacy singleton streak for backwards compatibility
        const { data: legacyStreak } = await supabase
          .from("french_streaks")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (legacyStreak) {
          streak = {
            current_streak: legacyStreak.current_streak ?? 0,
            longest_streak: legacyStreak.longest_streak ?? 0,
            streak_freezes: legacyStreak.streak_freezes ?? 2,
            total_completions: legacyStreak.total_completions ?? 0,
            last_completed_date: legacyStreak.last_completed_date ?? null,
          };
        }
      }

      // 3. Fetch user's completed logs for today
      if (challengeIds.length > 0) {
        const { data: logs } = await supabase
          .from("french_logs")
          .select("challenge_id")
          .eq("user_id", user.id)
          .in("challenge_id", challengeIds);

        if (logs) {
          completedIds = logs.map((l) => l.challenge_id).filter(Boolean);
        }
      }
    }

    const completedToday =
      completedIds.length > 0 || streak.last_completed_date === today;

    // Active challenge is the first uncompleted one or the latest generated
    const activeChallenge =
      todayChallenges.find((c) => !completedIds.includes(c.id)) ??
      todayChallenges[todayChallenges.length - 1] ??
      null;

    return NextResponse.json({
      challenges: todayChallenges,
      activeChallenge,
      completedIds,
      generationCount: todayChallenges.length,
      maxAllowed: 5,
      streak,
      completedToday,
    });
  } catch (err) {
    console.error("[french/today] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
