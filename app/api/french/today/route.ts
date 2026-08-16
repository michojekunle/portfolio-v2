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
    type: "speaking",
    prompt_text: "Record yourself introducing yourself in French: name, where you live, and why you are learning French.",
    example_text: "Bonjour! Je m'appelle Alex, j'habite en ville et j'apprends le français parce que j'aime la culture et la musique française.",
  },
  {
    type: "writing",
    prompt_text: "Write 3 French sentences describing what you plan to accomplish today.",
    example_text: "Aujourd'hui, je vais pratiquer mon français, faire de l'exercice et lire un bon livre.",
  },
  {
    type: "reading",
    prompt_text: "Read this passage out loud and focus on your rhythm and pronunciation.",
    example_text: "Chaque jour est une nouvelle opportunité d'apprendre quelque chose d'extraordinaire.",
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
