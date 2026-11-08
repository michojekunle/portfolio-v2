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

  const [
    booksResult,
    goalResult,
    allSessionsResult,
    alreadyEarnedResult,
    highlightCountResult,
    noteCountResult,
    flashcardReviewsResult,
    aiMessageCountResult,
  ] = await Promise.all([
    supabase.from("ch_books").select("id, status, genres").eq("user_id", user.id),
    supabase
      .from("ch_goals")
      .select("longest_streak")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("ch_sessions")
      .select("started_at, duration_seconds, pages_read")
      .eq("user_id", user.id),
    supabase.from("ch_achievements").select("badge_id").eq("user_id", user.id),
    // Engagement counters — head-only for efficiency
    supabase
      .from("ch_highlights")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("ch_notes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("ch_flashcards")
      .select("review_count")
      .eq("user_id", user.id),
    supabase
      .from("ch_chat_history")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("role", "user"),
  ]);

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
    const hour = new Date(s.started_at as string).getUTCHours();
    return hour >= 23 || hour < 4;
  }).length;

  const earlyBirdCount = sessions.filter((s) => {
    const hour = new Date(s.started_at as string).getUTCHours();
    return hour >= 4 && hour < 7;
  }).length;

  const marathonCount = sessions.filter(
    (s) => (s.duration_seconds as number) >= 7200,
  ).length;

  const speedReaderCount = sessions.filter(
    (s) => ((s.pages_read as number) ?? 0) >= 100,
  ).length;

  const totalMinutes = sessions.reduce(
    (sum, s) => sum + Math.round(((s.duration_seconds as number) ?? 0) / 60),
    0,
  );

  const flashcardReviews = (flashcardReviewsResult.data ?? []).reduce(
    (sum, r) => sum + ((r.review_count as number) ?? 0),
    0,
  );

  // Count distinct genres across all books
  const allGenres = new Set<string>();
  books.forEach((b) => {
    ((b.genres as string[]) ?? []).forEach((g: string) => {
      if (g) allGenres.add(g.toLowerCase().trim());
    });
  });

  const input = {
    total_books: books.length,
    finished_books: books.filter((b) => b.status === "finished").length,
    longest_streak: (goalResult.data?.longest_streak as number) ?? 0,
    total_reading_time_minutes: totalMinutes,
    night_owl_sessions: nightOwlCount,
    early_bird_sessions: earlyBirdCount,
    marathon_sessions: marathonCount,
    speed_reader_sessions: speedReaderCount,
    highlight_count: highlightCountResult.count ?? 0,
    note_count: noteCountResult.count ?? 0,
    flashcard_reviews: flashcardReviews,
    ai_message_count: aiMessageCountResult.count ?? 0,
    distinct_genres: allGenres.size,
  };

  const alreadyEarned = (alreadyEarnedResult.data ?? []).map(
    (a) => a.badge_id as BadgeId,
  );
  const newBadges = checkEligibleBadges(input, alreadyEarned);

  if (newBadges.length > 0) {
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
