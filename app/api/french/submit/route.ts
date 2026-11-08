/**
 * POST /api/french/submit
 * Logs a completed challenge and updates the user's personal streak.
 * Supports multi-user isolation & Streak Freezes (consumes 1 freeze if a day was missed).
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

    // 1. Insert completion log with user_id
    const { error: logError } = await supabase.from("french_logs").insert({
      user_id: user.id,
      challenge_id,
      type,
      proof_text: proof_text ?? null,
      proof_url: proof_url ?? null,
    });

    if (logError) {
      console.error("[french/submit] Log insert error:", logError);
      return NextResponse.json({ error: "Failed to log completion" }, { status: 500 });
    }

    // 2. Fetch current streak data for this user
    const today = new Date().toISOString().split("T")[0];

    const { data: streak } = await supabase
      .from("french_user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentStreak = streak?.current_streak ?? 0;
    const freezesCount = streak?.streak_freezes ?? 2;
    const lastDate = streak?.last_completed_date ?? null;

    let newStreak = currentStreak;
    let newFreezes = freezesCount;
    let usedFreeze = false;

    if (lastDate) {
      const d1 = new Date(lastDate);
      const d2 = new Date(today);
      const utc1 = Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate());
      const utc2 = Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate());
      const daysDiff = Math.floor((utc2 - utc1) / (24 * 60 * 60 * 1000));

      if (daysDiff === 0) {
        // Already completed today
        return NextResponse.json({ ok: true, streak: streak ?? { current_streak: 1, longest_streak: 1, streak_freezes: 2, total_completions: 1, last_completed_date: today } });
      } else if (daysDiff === 1) {
        // Consecutive completion
        newStreak += 1;
      } else {
        // Missed days
        const missedDays = daysDiff - 1;
        if (newFreezes >= missedDays) {
          newFreezes -= missedDays;
          newStreak += 1;
          usedFreeze = true;
        } else {
          newStreak = 1; // Streak resets
        }
      }
    } else {
      newStreak = 1; // First completion ever
    }

    const newLongest = Math.max(streak?.longest_streak ?? 0, newStreak);
    const totalCompletions = (streak?.total_completions ?? 0) + 1;

    const updatedStreak = {
      user_id: user.id,
      current_streak: newStreak,
      longest_streak: newLongest,
      streak_freezes: newFreezes,
      last_completed_date: today,
      total_completions: totalCompletions,
      updated_at: new Date().toISOString(),
    };

    const { error: streakUpdateError } = await supabase
      .from("french_user_streaks")
      .upsert(updatedStreak, { onConflict: "user_id" });

    if (streakUpdateError) {
      console.error("[french/submit] Streak update error:", streakUpdateError);
    }

    return NextResponse.json({
      ok: true,
      usedFreeze,
      streak: {
        current_streak: newStreak,
        longest_streak: newLongest,
        streak_freezes: newFreezes,
        total_completions: totalCompletions,
        last_completed_date: today,
      },
    });
  } catch (err) {
    console.error("[french/submit] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
