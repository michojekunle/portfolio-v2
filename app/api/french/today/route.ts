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
    english_translation: `Read this complete dialogue in a Parisian café out loud. Pay special attention to liaisons and natural intonation.

— Hello Antoine! It's great to see you here. Have you been waiting long?
— Hi Sophie! No, not at all, I arrived barely five minutes ago. I was almost late because of traffic jams near the Opera.
— Ah I completely understand, traffic is terrible today. So, what are you going to get?
— I'm going to order a large café crème with buttered toast. And you, have you had breakfast yet?
— Not yet! I'm going to get a green tea and a warm croissant. Tell me, have you heard from Thomas since his trip to Italy?
— Yes, absolutely! He sent me a message last night. He loves Rome and is coming back next week with lots of stories to tell us!`,
  },
  {
    type: "speaking",
    prompt_text: "Enregistrez votre réponse en français : Décrivez votre routine du matin idéale et expliquez pourquoi chaque étape est importante pour vous.",
    example_text: `Pour moi, la matinée idéale commence très tôt, vers six heures et demie. La première chose que je fais est d'ouvrir la fenêtre pour faire entrer de l'air frais. Ensuite, je prépare un expresso bien chaud tout en écoutant de la musique douce. Ce moment de calme me permet de faire le vide dans mon esprit et de planifier sereinement les tâches de la journée. Après avoir pris mon petit-déjeuner, je fais vingt minutes de méditation ou de marche rapide dehors. Cela me donne une énergie formidable pour attaquer la journée de travail avec enthousiasme et sérénité.`,
    english_translation: `Record your answer in French: Describe your ideal morning routine and explain why each step is important to you.

For me, the ideal morning starts very early, around six-thirty. The first thing I do is open the window to let in fresh air. Next, I make a piping hot espresso while listening to gentle music. This quiet moment allows me to clear my mind and calmly plan the day's tasks. After having my breakfast, I do twenty minutes of meditation or a brisk walk outside. This gives me wonderful energy to tackle the workday with enthusiasm and serenity.`,
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
    english_translation: `Write a complete paragraph in French (5 to 8 sentences) recounting an unforgettable holiday memory.

Writing Guide — Target vocabulary & expressions required to be included:
1. "After having arrived at..." (Past tense)
2. "The weather was magnificent when..." (Imperfect tense)
3. "To realize that..." (Reflexive expression)
4. "To intend to..." (Intention)
5. "As a result / so..." (Common logical connector)`,
  },
];

export async function GET(): Promise<Response> {
  try {
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const adminDb = getAdminSupabase();

    let { data: challenges } = await adminDb
      .from("french_challenges")
      .select("*")
      .eq("challenge_date", today)
      .order("created_at", { ascending: true });

    if (!challenges || challenges.length === 0) {
      const seed = STARTER_PROMPTS[Math.floor(Math.random() * STARTER_PROMPTS.length)];
      const { data: newChallenge } = await adminDb
        .from("french_challenges")
        .insert({
          challenge_date: today,
          type: seed.type,
          prompt_text: seed.prompt_text,
          example_text: seed.example_text,
          english_translation: seed.english_translation,
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
        let currentStreak = userStreak.current_streak ?? 0;
        let longestStreak = userStreak.longest_streak ?? 0;
        let streakFreezes = userStreak.streak_freezes ?? 2;
        let lastCompletedDate = userStreak.last_completed_date ?? null;
        let needsUpdate = false;

        if (lastCompletedDate) {
          const todayDateStr = new Date().toISOString().split("T")[0];
          const d1 = new Date(lastCompletedDate);
          const d2 = new Date(todayDateStr);
          const utc1 = Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate());
          const utc2 = Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate());
          const daysDiff = Math.floor((utc2 - utc1) / (24 * 60 * 60 * 1000));

          if (daysDiff > 1) {
            // User missed days!
            const missedDays = daysDiff - 1;
            if (streakFreezes >= missedDays) {
              // Consume freezes to keep streak alive
              streakFreezes -= missedDays;
              // Set last completed date to yesterday so it's kept alive
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              lastCompletedDate = yesterday.toISOString().split("T")[0];
              needsUpdate = true;
            } else {
              // No freezes left or not enough to cover missed days, streak resets to 0
              currentStreak = 0;
              needsUpdate = true;
            }
          }
        }

        if (needsUpdate) {
          const updatedStreak = {
            user_id: user.id,
            current_streak: currentStreak,
            longest_streak: longestStreak,
            streak_freezes: streakFreezes,
            last_completed_date: lastCompletedDate,
            total_completions: userStreak.total_completions ?? 0,
            updated_at: new Date().toISOString(),
          };
          await adminDb
            .from("french_user_streaks")
            .upsert(updatedStreak, { onConflict: "user_id" });
        }

        streak = {
          current_streak: currentStreak,
          longest_streak: longestStreak,
          streak_freezes: streakFreezes,
          total_completions: userStreak.total_completions ?? 0,
          last_completed_date: lastCompletedDate,
        };
      }

      if (challengeIds.length > 0) {
        const { data: logs } = await adminDb
          .from("french_logs")
          .select("challenge_id")
          .eq("user_id", user.id)
          .in("challenge_id", challengeIds);

        completedIds = logs?.map((l) => l.challenge_id) ?? [];
      }
    }

    const activeChallenge = todayChallenges[0] ?? null;
    const completedToday = challengeIds.some((id) => completedIds.includes(id));

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
