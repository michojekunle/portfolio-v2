/**
 * POST /api/french/generate
 * On-demand challenge generation endpoint.
 * Multi-Provider AI Architecture: Gemini 2.5 Flash (Primary) → Groq Llama 3.1 (Secondary) → Static Fallback.
 * Allows user to manually request a new French challenge for today up to 5 times per day.
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
    prompt_text: "Enregistrez-vous en français pour présenter votre journée idéale.",
    example_text: "Bonjour ! Pour ma journée idéale, je commence par un bon café au soleil. Ensuite, je me promène en ville et je retrouve mes amis pour le déjeuner. C'est simple et relaxant.",
  },
  {
    prompt_text: "Décrivez votre endroit préféré en français pendant 45 secondes.",
    example_text: "Mon endroit préféré est un petit parc près de chez moi. J'aime y aller en fin d'après-midi quand il fait beau pour lire et me détendre au calme.",
  },
  {
    prompt_text: "Présentez vos objectifs de la semaine en français.",
    example_text: "Cette semaine, je veux améliorer mon français, faire trois séances de sport et terminer la lecture de mon livre préféré. Chaque effort compte !",
  },
];

const WRITING_PROMPTS = [
  {
    prompt_text: "Écrivez 3 à 4 phrases sur ce que vous avez fait ce week-end.",
    example_text: "Mots clés à utiliser : week-end, amuser, préparer",
  },
  {
    prompt_text: "Rédigez un mini-journal de votre journée en français.",
    example_text: "Mots clés à utiliser : aujourd'hui, réussir, demain",
  },
  {
    prompt_text: "Écrivez une courte critique du dernier film ou livre que vous avez vu.",
    example_text: "Mots clés à utiliser : histoire, passionnant, recommander",
  },
];

const READING_PROMPTS = [
  {
    prompt_text: "Lisez ce dialogue dans un café à voix haute avec une bonne intonation.",
    example_text: "— Bonjour ! Je peux vous prendre votre commande ?\n— Oui, un grand café au lait et un croissant s'il vous plaît.\n— Très bien, ce sera tout pour vous ?\n— Oui, merci beaucoup !",
  },
  {
    prompt_text: "Lisez ce paragraphe d'inspiration à voix haute en articulant chaque mot.",
    example_text: "Apprendre une nouvelle langue est une aventure magnifique. Chaque mot appris est une porte ouverte sur une nouvelle culture, de nouvelles histoires et de nouvelles rencontres à travers le monde.",
  },
  {
    prompt_text: "Lisez cette courte histoire de voyage à voix haute.",
    example_text: "L'été dernier, je suis parti quelques jours à Paris. Se promener le long de la Seine au coucher du soleil est un souvenir vraiment inoubliable.",
  },
];

function buildFrenchPrompt(type: ChallengeType): string {
  return `You are a native French language instructor. Generate a high-quality daily 5-minute French practice drill for an intermediate learner (A2-B2 level).
The challenge type is: "${type}".

Strict Language Rules:
- French grammar MUST be 100% authentic, natural, and grammatically flawless (e.g. use "je suis en retard", NEVER "j'ai retardé").
- For "reading": "prompt_text" should be a clear instruction in French (e.g., "Lisez ce dialogue au café à voix haute avec une bonne intonation."). "example_text" MUST be a realistic 3-5 line dialogue or paragraph (35-60 words total) perfect for a 5-minute elocution drill.
- For "speaking": "prompt_text" should instruct the user to record their voice answering a scenario in French. "example_text" should provide a native model answer (30-50 words).
- For "writing": "prompt_text" should give a creative writing topic in French. "example_text" should list 3 target French vocabulary words to include in their response.

Return ONLY a raw valid JSON object with no markdown codeblocks:
{
  "prompt_text": "Instruction in clear, correct French",
  "example_text": "The rich, natural target French passage, dialogue, or target vocabulary list"
}`;
}

// ── Provider 1: Google Gemini 2.5 Flash (Primary) ─────────────────────────────
async function generateChallengeWithGemini(type: ChallengeType): Promise<{ prompt_text: string; example_text: string }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
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
      max_tokens: 400,
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

    // Optional requested type from client
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

      // If constraint french_challenges_challenge_date_key still exists in database, fallback to update
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
