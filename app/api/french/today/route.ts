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
    prompt_text: "Lisez ce dialogue complet dans un café parisien à voix haute. Prêtez une attention particulière aux liaisons et à l'intonation naturelle.",
    example_text: `— Bonjour Antoine ! Ça fait plaisir de te voir ici. Tu m'attends depuis longtemps ?
— Salut Sophie ! Non pas du tout, je suis arrivé il y a peine cinq minutes. J'ai failli être en retard à cause des embouteillages près de l'opéra.
— Ah je comprends parfaitement, la circulation est terrible aujourd'hui. Alors, qu'est-ce que tu vas prendre ?
— Je vais commander un grand café crème avec une tartine beurrée. Et toi, tu as déjà pris ton petit-déjeuner ?
— Pas encore ! Je vais prendre un thé vert et un croissant chaud. Dis-moi, tu as des nouvelles de Thomas depuis son voyage en Italie ?
— Oui absolument ! Il m'a envoyé un message hier soir. Il adore Rome et il revient la semaine prochaine avec plein d'anecdotes à nous raconter !`,
  },
  {
    type: "speaking",
    prompt_text: "Enregistrez votre réponse en français : Décrivez votre routine du matin idéale et expliquez pourquoi chaque étape est importante pour vous.",
    example_text: `Modèle d'expression orale :
Pour moi, la matinée idéale commence très tôt, vers six heures et demie. La première chose que je fais est d'ouvrir la fenêtre pour faire entrer de l'air frais. Ensuite, je prépare un expresso bien chaud tout en écoutant de la musique douce. Ce moment de calme me permet de faire le vide dans mon esprit et de planifier sereinement les tâches de la journée. Après avoir pris mon petit-déjeuner, je fais vingt minutes de méditation ou de marche rapide dehors. Cela me donne une énergie formidable pour attaquer la journée de travail avec enthousiasme et sérénité.`,
  },
  {
    type: "writing",
    prompt_text: "Rédigez un paragraphe complet en français (5 à 8 phrases) pour raconter un souvenir de vacances inoubliable.",
    example_text: `Guide de rédaction — Mots & expressions cibles à inclure obligatoirement :
1. "Après être arrivé(e) à..." (Passé composé)
2. "Il faisait un temps magnifique quand..." (Imparfait)
3. "Se rendre compte de..." (Expression réflexive)
4. "Avoir l'intention de..." (Intention)
5. "Du coup..." (Connecteur logique courant)`,
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
