/**
 * POST /api/french/generate
 * On-demand challenge generation endpoint.
 * Multi-Provider AI Architecture: Gemini 2.5 Flash (Primary) → Groq Llama 3.1 (Secondary) → Static Fallback.
 * Generates rich, immersive 250-400 word French dialogues & stories with complete English translations.
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

function safeParseJSON<T>(raw: string): T {
  const stripped = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  try {
    return JSON.parse(stripped) as T;
  } catch {
    // Escape unescaped control characters and newlines inside JSON string values
    const sanitized = stripped
      .replace(/[\u0000-\u001F]+/g, " ")
      .replace(/\r\n|\n|\r/g, "\\n");
    return JSON.parse(sanitized) as T;
  }
}

const SPEAKING_PROMPTS = [
  {
    prompt_text: "Enregistrez votre réponse en français : Décrivez votre routine du matin idéale et expliquez pourquoi chaque étape est importante pour vous.",
    example_text: `Pour moi, la matinée idéale commence très tôt, vers six heures et demie du matin. La toute première chose que je fais est d'ouvrir en grand la fenêtre de ma chambre pour faire entrer l'air frais du matin et écouter le calme de la ville. Ensuite, je me dirige vers la cuisine pour préparer un expresso bien chaud tout en écoutant de la musique douce. Ce moment de tranquillité absolue me permet de faire le vide dans mon esprit, de boire mon café tranquillement et de planifier sereinement les tâches prioritaires de la journée. 

Après avoir pris mon petit-déjeuner composé de croissants et de fruits frais, je prends vingt minutes pour faire une marche rapide dehors dans le parc. L'exercice matinal donne une énergie formidable pour attaquer la journée de travail avec enthousiasme. Enfin, je me douche, je m'habille et je m'installe à mon bureau, prêt à commencer ma journée de travail avec sérénité et concentration. Et vous, quelle est la routine matinale qui vous donne le plus d'énergie ?`,
    english_translation: `Record your answer in French: Describe your ideal morning routine and explain why each step is important to you.

For me, the ideal morning starts very early, around six-thirty in the morning. The very first thing I do is open my bedroom window wide to let in the fresh morning air and listen to the calm of the city. Then, I head to the kitchen to brew a piping hot espresso while listening to gentle music. This moment of absolute quiet allows me to clear my mind, drink my coffee peacefully, and calmly plan the day's priority tasks.

After enjoying my breakfast of croissants and fresh fruit, I take twenty minutes for a brisk walk outside in the park. Morning exercise provides wonderful energy to tackle the workday with enthusiasm. Finally, I shower, get dressed, and sit down at my desk, ready to start my work with focus and serenity. And you, what morning routine gives you the most energy?`,
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
    english_translation: `Write a complete text in French (8 to 12 sentences) recounting an unforgettable journey or childhood memory.

Writing Guide — Target vocabulary & expressions to include in your text:
1. "After having arrived at..." (Past tense with être)
2. "The weather was magnificent when..." (Imperfect tense for setting)
3. "To realize that..." (Reflexive expression)
4. "To intend to..." (Future intention)
5. "As a result / so..." (Common logical connector)
6. "Although it may be..." (Subjunctive usage)`,
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
    english_translation: `Read this complete dialogue in a Parisian café out loud. Pay special attention to liaisons and natural intonation.

— Hello Antoine! It's so nice to see you here. Have you been waiting long?
— Hi Sophie! No, not at all, don't worry. I arrived barely ten minutes ago. I was almost late because of a major delay on the metro line near the Opera.
— Ah I completely understand! Traffic in Paris is particularly bad today. So tell me, what are you going to order?
— I think I'll get a large café crème with warm croissants and butter. How about you, have you had breakfast yet this morning?
— Not yet! I'm going to order a mint green tea and a cheese omelet. Tell me, have you heard from Thomas since he left for Italy?
— Yes, absolutely! He sent me a long message last night with gorgeous photos. He loves his trip to Rome and is coming back next week with lots of exciting stories to tell us.
— That's wonderful! We should organize a dinner together as soon as he gets back to celebrate.`,
  },
];

function buildFrenchPrompt(type: ChallengeType): string {
  return `You are a master French language instructor creating an immersive 5-minute practice drill for an intermediate learner (A2-B2 level).
The challenge type is: "${type}".

Strict Quality & Word Count Guidelines:
- French grammar MUST be 100% authentic, natural, and grammatically flawless.
- FOR "reading" (Elocution & Rhythm): "prompt_text" should instruct the user in French to read out loud. "example_text" MUST be a LONG, IMMERSIVE, REALISTIC French dialogue or narrative story (250 - 350 words / 12-16 lines).
- FOR "speaking" (Oral Practice & Fluency): "prompt_text" should present a compelling scenario and ask 3 specific questions. "example_text" MUST provide a long, native model response (200 - 300 words / 10-14 sentences).
- FOR "writing" (Composition & Grammar): "prompt_text" should give a creative writing topic. "example_text" MUST provide a helpful structure guide with 6 target vocabulary/grammar expressions to include.
- "english_translation": MUST provide a concise, natural, line-by-line English translation of both prompt_text AND example_text.

Return ONLY a raw valid JSON object with no markdown codeblocks:
{
  "prompt_text": "Clear instruction in natural French (1-2 sentences)",
  "example_text": "The 250-350 word French dialogue or story passage",
  "english_translation": "Concise English translation of both prompt_text and example_text"
}`;
}

// ── Provider 1: Google Gemini 2.5 Flash (Primary) ─────────────────────────────
async function generateChallengeWithGemini(type: ChallengeType): Promise<{ prompt_text: string; example_text: string; english_translation: string }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 3500 },
  });

  const prompt = buildFrenchPrompt(type);
  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const parsed = safeParseJSON<{ prompt_text: string; example_text: string; english_translation?: string }>(rawText);
  if (!parsed.prompt_text || !parsed.example_text) throw new Error("Gemini returned incomplete JSON");
  return {
    prompt_text: parsed.prompt_text,
    example_text: parsed.example_text,
    english_translation: parsed.english_translation || "English translation available below in guided breakdown.",
  };
}

// ── Provider 2: Groq Llama 3.1 (Secondary Fallback) ───────────────────────────
async function generateChallengeWithGroq(type: ChallengeType): Promise<{ prompt_text: string; example_text: string; english_translation: string }> {
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
      temperature: 0.7,
      max_tokens: 3500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const raw = data.choices[0]?.message?.content ?? "";
  const parsed = safeParseJSON<{ prompt_text: string; example_text: string; english_translation?: string }>(raw);
  if (!parsed.prompt_text || !parsed.example_text) throw new Error("Groq returned incomplete JSON");
  return {
    prompt_text: parsed.prompt_text,
    example_text: parsed.example_text,
    english_translation: parsed.english_translation || "English translation available below in guided breakdown.",
  };
}

// ── Provider 3: Native Static Fallbacks ───────────────────────────────────────
function getStaticChallenge(type: ChallengeType): { prompt_text: string; example_text: string; english_translation: string } {
  const pool =
    type === "speaking" ? SPEAKING_PROMPTS : type === "writing" ? WRITING_PROMPTS : READING_PROMPTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function POST(request: Request): Promise<Response> {
  try {
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
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

    const type: ChallengeType =
      requestedType && CHALLENGE_TYPES.includes(requestedType)
        ? requestedType
        : CHALLENGE_TYPES[currentCount % 3];

    let content: { prompt_text: string; example_text: string; english_translation: string } | null = null;

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

    let inserted: Record<string, unknown> | null = null;

    // Attempt insert with english_translation column first
    const { data: firstInserted, error: insertError } = await adminDb
      .from("french_challenges")
      .insert({
        challenge_date: today,
        type,
        prompt_text: content.prompt_text,
        example_text: content.example_text || null,
        english_translation: content.english_translation || null,
      })
      .select("*")
      .single();

    if (!insertError && firstInserted) {
      inserted = firstInserted as Record<string, unknown>;
    } else if (insertError) {
      console.warn("[french/generate] Primary DB insert error:", insertError.message);

      // Fallback: If english_translation column missing in PostgREST schema cache (PGRST204), insert without it
      const { data: retryInserted, error: retryError } = await adminDb
        .from("french_challenges")
        .insert({
          challenge_date: today,
          type,
          prompt_text: content.prompt_text,
          example_text: content.example_text || null,
        })
        .select("*")
        .single();

      if (retryError && retryError.code === "23505" && existingChallenges && existingChallenges.length > 0) {
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
        inserted = updated as Record<string, unknown>;
      } else {
        inserted = retryInserted
          ? { ...(retryInserted as Record<string, unknown>), english_translation: content.english_translation }
          : { id: `gen-${Date.now()}`, type, prompt_text: content.prompt_text, example_text: content.example_text, english_translation: content.english_translation };
      }
    }

    const { data: allToday } = await adminDb
      .from("french_challenges")
      .select("*")
      .eq("challenge_date", today)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      ok: true,
      challenge: inserted,
      count: allToday?.length ?? currentCount + 1,
      maxAllowed,
      challenges: allToday ?? [inserted],
    });
  } catch (err) {
    console.error("[french/generate] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
