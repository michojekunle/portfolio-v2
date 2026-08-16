/**
 * GET /api/french/today
 * Returns today's challenges + user-specific streak + completion status.
 * Auto-seeds an initial daily prompt if none exists yet today.
 * Supports multi-user isolation.
 */
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!;
  return createClient(process.env.SUPABASE_URL!, serviceKey);
}

const STARTER_PROMPTS = [
  {
    type: "reading",
    prompt_text: "Lisez ce dialogue dans un café à voix haute avec une bonne intonation.",
    example_text: "— Bonjour ! Je peux vous prendre votre commande ?\n— Oui, un grand café au lait et un croissant s'il vous plaît.\n— Très bien, ce sera tout pour vous ?\n— Oui, merci beaucoup !",
  },
  {
    type: "speaking",
    prompt_text: "Enregistrez-vous en français pour présenter votre journée idéale.",
    example_text: "Bonjour ! Pour ma journée idéale, je commence par un bon café au soleil. Ensuite, je me promène en ville et je retrouve mes amis pour le déjeuner. C'est simple et relaxant.",
  },
  {
    type: "writing",
    prompt_text: "Écrivez 3 à 4 phrases en français sur vos objectifs de la semaine.",
    example_text: "Mots clés à utiliser : aujourd'hui, réussir, progresser",
  },
];

export async function GET(): Promise<Response> {
  try {
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const adminDb = getAdminSupabase();

    // 1. Fetch today's generated challenges
    let { data: challenges } = await adminDb
      .from("french_challenges")
      .select("*")
      .eq("challenge_date", today)
      .order("created_at", { ascending: true });

    // 2. If no challenge exists for today yet, auto-seed a starter prompt so visitors immediately get content
    if (!challenges || challenges.length === 0) {
      const seed = STARTER_PROMPTS[Math.floor(Math.random() * STARTER_PROMPTS.length)];
      const { data: newChallenge } = await adminDb
        .from("french_challenges")
        .insert({
          challenge_date: today,
          type: seed.type,
          prompt_text: seed.prompt_text,
          example_text: seed.example_text,
        })
        .select()
        .single();

      if (newChallenge) {
        challenges = [newChallenge];
      }
    }

    const todayChallenges = challenges ?? [];
    const challengeIds = todayChallenges.map((c) => c.id);

    let completedIds: string[] = [];
    let streak = {
      current_streak: 0,
      longest_streak: 0,
      streak_freezes: 2,
      total_completions: 0,
      last_completed_date: null as string | null,
    };

    if (user) {
      const { data: userStreak } = await adminDb
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
      }

      if (challengeIds.length > 0) {
        const { data: logs } = await adminDb
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
