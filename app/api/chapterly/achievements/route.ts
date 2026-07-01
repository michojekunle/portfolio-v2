import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkEligibleBadges } from "@/lib/chapterly/achievements";
import type { BadgeId } from "@/lib/chapterly/types";

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("ch_achievements")
    .select("*")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: true });

  if (error) {
    console.error("[achievements] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }

  return NextResponse.json({ achievements: data ?? [] });
}

export async function POST(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [booksResult, goalResult, allSessionsResult, alreadyEarnedResult] =
    await Promise.all([
      supabase.from("ch_books").select("id, status").eq("user_id", user.id),
      supabase
        .from("ch_goals")
        .select("longest_streak")
        .eq("user_id", user.id)
        .single(),
      // Only fetch the two columns we aggregate — avoids unbounded row payloads
      // for users with many sessions.
      supabase
        .from("ch_sessions")
        .select("started_at, duration_seconds")
        .eq("user_id", user.id),
      supabase.from("ch_achievements").select("badge_id").eq("user_id", user.id),
    ]);

  // Surface DB errors rather than silently treating failures as empty data
  if (booksResult.error) {
    console.error("[achievements] books query error:", booksResult.error);
    return NextResponse.json({ error: "Failed to check achievements" }, { status: 500 });
  }
  if (allSessionsResult.error) {
    console.error("[achievements] sessions query error:", allSessionsResult.error);
    return NextResponse.json({ error: "Failed to check achievements" }, { status: 500 });
  }

  const books = booksResult.data;
  const sessions = allSessionsResult.data;

  const nightOwlCount = sessions.filter((s) => {
    // Sessions are stored in UTC; compare UTC hours so users in any timezone
    // are judged by their wall-clock time (stored as UTC from the client).
    const hour = new Date(s.started_at as string).getUTCHours();
    return hour >= 23 || hour < 4;
  }).length;

  const marathonCount = sessions.filter(
    (s) => (s.duration_seconds as number) >= 7200,
  ).length;

  const totalMinutes = sessions.reduce(
    (sum, s) => sum + Math.round(((s.duration_seconds as number) ?? 0) / 60),
    0,
  );

  const input = {
    total_books: books.length,
    finished_books: books.filter((b) => b.status === "finished").length,
    longest_streak: (goalResult.data?.longest_streak as number) ?? 0,
    total_reading_time_minutes: totalMinutes,
    night_owl_sessions: nightOwlCount,
    marathon_sessions: marathonCount,
  };

  const alreadyEarned = (alreadyEarnedResult.data ?? []).map(
    (a) => a.badge_id as BadgeId,
  );
  const newBadges = checkEligibleBadges(input, alreadyEarned);

  if (newBadges.length > 0) {
    // upsert with ignoreDuplicates handles concurrent POST races cleanly —
    // concurrent calls may both compute the same newBadges, and the second
    // upsert will no-op on the unique(user_id, badge_id) constraint.
    const { error } = await supabase.from("ch_achievements").upsert(
      newBadges.map((badge_id) => ({
        user_id: user.id,
        badge_id,
        earned_at: new Date().toISOString(),
      })),
      { onConflict: "user_id,badge_id", ignoreDuplicates: true },
    );
    if (error) {
      console.error("[achievements] upsert error:", error);
      return NextResponse.json({ error: "Failed to save achievements" }, { status: 500 });
    }
  }

  return NextResponse.json({ newly_earned: newBadges });
}
