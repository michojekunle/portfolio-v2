/**
 * POST /api/french/generate
 * On-demand challenge generation endpoint.
 * Multi-Provider AI Architecture: Gemini 2.5 Flash (Primary) → Groq Llama 3.1 (Secondary) → Static Fallback.
 * Generates rich, immersive 250-400 word French dialogues & stories with full English translations.
 */
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!;
  return createClient(process.env.SUPABASE_URL!, serviceKey);
}

const CHALLENGE_TYPES = ["speaking", "writing", "reading"] as const;
type ChallengeType = (typeof CHALLENGE_TYPES)[number];

const SPEAKING_PROMPTS = [
  {
    prompt_text: "Enregistrez votre réponse en français : Décrivez votre routine du matin idéale et expliquez pourquoi chaque étape est importante pour vous.",
    example_text: `Pour moi, la matinée idéale commence très tôt, vers six heures et demie du matin. La toute première chose que je fais est d'ouvrir en grand la fenêtre de ma chambre pour faire entrer l'air frais du matin et écouter le calme de la ville. Ensuite, je me dirige vers la cuisine pour préparer un expresso bien chaud tout en écoutant de la musique douce. Ce moment de tranquillité absolue me permet de faire le vide dans mon esprit, de boire mon café tranquillement et de planifier sereinement les tâches prioritaires de la journée. 

Après avoir pris mon petit-déjeuner composé de croissants et de fruits frais, je prends vingt minutes pour faire une marche rapide dehors dans le parc. L'exercice matinal donne une énergie formidable pour attaquer la journée de travail avec enthousiasme. Enfin, je me douche, je m'habille et je m'installe à mon bureau, prêt à commencer ma journée de travail avec sérénité et concentration. Et vous, quelle est la routine matinale qui vous donne le plus d'énergie ?`,
  },
];

const WRITING_PROMPTS = [
  {
    prompt_text: "Rédigez un texte complet en français (8 à 12 phrases) pour raconter un voyage ou un souvenir d'enfance inoubliable.",
    example_text: `Guide de rédaction — Mots & expressions cibles à inclure dans votre texte :
1. "Après être arrivé(e) à..." (Passé composé avec être)
2. "Il faisait un temps magnifique quand..." (Imparfait pour le décor)
3. "Se rendre compte de..." (Expression réflexive)
4. "Avoir l'intention de..." (Intention future)
5. "Du coup..." (Connecteur logique courant)
6. "Bien que ce soit..." (Emploi du subjonctif)`,
  },
];

const READING_PROMPTS = [
  {
    prompt_text: "Lisez ce dialogue complet dans un café parisien à voix haute. Prêtez une attention particulière aux liaisons et à l'intonation naturelle.",
    example_text: `— Bonjour Antoine ! Ça fait tellement plaisir de te voir ici. Tu m'attends depuis longtemps ?
— Salut Sophie ! Non pas du tout, rassure-toi. Je suis arrivé il y a peine dix minutes. J'ai failli être en retard à cause d'un ralentissement important sur la ligne de métro près de l'opéra.
— Ah je comprends parfaitement ! La circulation à Paris est particulièrement difficile aujourd'hui. Alors dis-moi, qu'est-ce que tu vas commander ?
— Je pense prendre un grand café crème avec des croissants chauds et du beurre. Et toi, tu as déjà pris ton petit-déjeuner ce matin ?
— Pas encore ! Je vais commander un thé vert à la menthe et une omelette au fromage. Dis-moi, tu as eu des nouvelles de Thomas depuis son départ en Italie ?
— Oui tout à fait ! Il m'a envoyé un long message hier soir avec des photos magnifiques. Il adore son séjour à Rome et il revient la semaine prochaine avec plein d'anecdotes passionnantes à nous raconter.
— C'est formidable ! On devra organiser un dîner tous ensemble dès son retour pour fêter ça.`,
  },
];

function buildFrenchPrompt(type: ChallengeType): string {
  return `You are a master French language instructor creating an immersive 5-minute practice drill for an intermediate learner (A2-B2 level).
The challenge type is: "${type}".

Strict Quality & Word Count Guidelines:
- French grammar MUST be 100% authentic, natural, and grammatically flawless (e.g. use "je suis en retard", NEVER "j'ai retardé").
- FOR "reading" (Elocution & Rhythm): "prompt_text" should instruct the user to read the full text out loud. "example_text" MUST be a LONG, IMMERSIVE, REALISTIC dialogue or narrative story (250 - 400 words / 12-18 lines). For example, a full multi-turn conversation between friends at a café, ordering food, planning a weekend trip, or a rich narrative story about life in Paris or Provence.
- FOR "speaking" (Oral Practice & Fluency): "prompt_text" should present a compelling scenario and ask 3 specific questions. "example_text" MUST provide a long, native model response (200 - 320 words / 10-15 sentences) demonstrating natural connectors (en effet, cependant, du coup, à mon avis, par conséquent).
- FOR "writing" (Composition & Grammar): "prompt_text" should give a creative writing topic. "example_text" MUST provide a helpful structure guide with 6 target vocabulary/grammar expressions to include.

Return ONLY a raw valid JSON object with no markdown codeblocks:
{
  "prompt_text": "Clear instruction in natural French (1-2 sentences)",
  "example_text": "The long, rich, 250-400 word target French dialogue, story passage, or structured writing guide"
}`;
}

// ── Provider 1: Google Gemini 2.5 Flash (Primary) ─────────────────────────────
async function generateChallengeWithGemini(type: ChallengeType): Promise<{ prompt_text: string; example_text: string }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 2000 },
  });

  const prompt = buildFrenchPrompt(type);
  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const stripped = rawText.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  const parsed = JSON.parse(stripped) as { prompt_text: string; example_text: string };
  if (!parsed.prompt_text || !parsed.example_text) throw new Error("Gemini returned incomplete JSON");
  return parsed;
}

// ── Provider 2: Groq Llama 3.1 (Secondary Fallback) ───────────────────────────
async function generateChallengeWithGroq(type: ChallengeType): Promise<{ prompt_text: string; example_text: string }> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("GROQ_API_KEY is not configured");

  const prompt = buildFrenchPrompt(type);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`Groq error: ${response.status}`);
  const data = (await response.json()) as { choices: { message: { content: string } }[] };
  const rawContent = data.choices[0]?.message?.content ?? "";
  const parsed = JSON.parse(rawContent) as { prompt_text: string; example_text: string };
  if (!parsed.prompt_text || !parsed.example_text) throw new Error("Groq returned incomplete JSON");
  return parsed;
}

// ── Provider 3: Static Curated Drills (Tertiary Fallback) ─────────────────────
function getStaticChallenge(type: ChallengeType): { prompt_text: string; example_text: string } {
  const day = new Date().getDay();
  const map = {
    speaking: SPEAKING_PROMPTS,
    writing: WRITING_PROMPTS,
    reading: READING_PROMPTS,
  };
  const prompts = map[type];
  const selected = prompts[day % prompts.length];
  return {
    prompt_text: selected.prompt_text,
    example_text: selected.example_text,
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to generate on-demand challenges." },
        { status: 401 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const adminDb = getAdminSupabase();

    let requestedType: ChallengeType | undefined;
    try {
      const body = (await request.json()) as { type?: ChallengeType };
      requestedType = body.type;
    } catch {
      // Body empty or invalid JSON
    }

    // 1. Fetch existing challenges for today using adminDb
    const { data: existingChallenges } = await adminDb
      .from("french_challenges")
      .select("*")
      .eq("challenge_date", today)
      .order("created_at", { ascending: true });

    const currentCount = existingChallenges?.length ?? 0;
    const maxAllowed = 5;

    if (currentCount >= maxAllowed) {
      return NextResponse.json(
        {
          ok: false,
          error: "Daily limit reached (5/5). You can practice any of today's 5 prompts!",
          count: currentCount,
          maxAllowed,
          challenges: existingChallenges ?? [],
        },
        { status: 200 }
      );
    }

    // 2. Determine challenge type (rotate or pick requested)
    const type: ChallengeType =
      requestedType && CHALLENGE_TYPES.includes(requestedType)
        ? requestedType
        : CHALLENGE_TYPES[currentCount % 3];

    // 3. Multi-Provider AI Fallback Pipeline: Gemini → Groq → Static
    let content: { prompt_text: string; example_text: string } | null = null;

    try {
      content = await generateChallengeWithGemini(type);
    } catch (geminiErr) {
      console.warn("[french/generate] Gemini failed, falling back to Groq:", geminiErr);
      try {
        content = await generateChallengeWithGroq(type);
      } catch (groqErr) {
        console.warn("[french/generate] Groq failed, using static fallback:", groqErr);
        content = getStaticChallenge(type);
      }
    }

    // 4. Insert into DB using adminDb (bypasses insert false RLS)
    let { data: inserted, error: insertError } = await adminDb
      .from("french_challenges")
      .insert({
        challenge_date: today,
        type,
        prompt_text: content.prompt_text,
        example_text: content.example_text || null,
      })
      .select("*")
      .single();

    if (insertError) {
      console.warn("[french/generate] DB insert error:", insertError);

      if (insertError.code === "23505" && existingChallenges && existingChallenges.length > 0) {
        const targetId = existingChallenges[existingChallenges.length - 1].id;
        const { data: updated } = await adminDb
          .from("french_challenges")
          .update({
            type,
            prompt_text: content.prompt_text,
            example_text: content.example_text || null,
          })
          .eq("id", targetId)
          .select("*")
          .single();

        if (updated) {
          inserted = updated;
          insertError = null;
        }
      }
    }

    if (insertError || !inserted) {
      console.error("[french/generate] DB insert error after fallback:", insertError);
      return NextResponse.json({ error: "Failed to save generated challenge" }, { status: 500 });
    }

    const allToday = [...(existingChallenges ?? []), inserted];

    return NextResponse.json({
      ok: true,
      challenge: inserted,
      count: allToday.length,
      maxAllowed,
      challenges: allToday,
    });
  } catch (err) {
    console.error("[french/generate] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
