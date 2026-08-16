/**
 * POST /api/french/generate
 * On-demand challenge generation endpoint.
 * Allows user to manually request a new French challenge for today up to 5 times per day.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CHALLENGE_TYPES = ["speaking", "writing", "reading"] as const;
type ChallengeType = (typeof CHALLENGE_TYPES)[number];

const SPEAKING_PROMPTS = [
  "Record yourself introducing yourself in French. Include your name, where you're from, and one thing you love.",
  "Record yourself describing what you did today — in French. Use at least 5 sentences.",
  "Read this sentence out loud 3 times until it flows naturally: 'Je fais des efforts chaque jour pour m'améliorer.'",
  "Record a 60-second French rant or opinion about any topic — sports, food, tech, anything.",
  "Describe your room or workspace in French. Record yourself for at least 45 seconds.",
];

const WRITING_PROMPTS = [
  "Write 3 sentences about your day in French and post it as your Twitter/X status.",
  "Write a short journal entry in French: What was the best part of today?",
  "Translate your thoughts from the last 10 minutes into French sentences. Write at least 4.",
  "Write a mini review of the last thing you watched, read, or listened to — in French.",
  "Write 5 French sentences using the passé composé (past tense). Describe something that happened this week.",
];

const READING_PROMPTS = [
  "Read this paragraph out loud until you can say it without hesitation: 'Apprendre une nouvelle langue, c'est comme ouvrir une nouvelle fenêtre sur le monde. Chaque mot appris est un pas de plus vers la maîtrise.'",
  "Go to r/france or a French news site. Pick any article and read the first 3 paragraphs out loud.",
  "Read the lyrics of any French song out loud while it plays. Focus on matching the rhythm.",
  "Read these 5 common French expressions out loud and say their English meaning after each: 'C'est la vie', 'Savoir-faire', 'Joie de vivre', 'Comme ci comme ça', 'Coup de grâce'.",
  "Open a French Wikipedia article on any topic you find interesting and read the intro section out loud.",
];

async function generateChallengeWithGroq(type: ChallengeType): Promise<{ prompt_text: string; example_text: string }> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("No GROQ_API_KEY");

  const systemPrompt = `You are a French language learning coach. Generate a single, clear daily micro-challenge for a French learner. 
The challenge type is: ${type}.
Return a JSON object with:
- "prompt_text": a 1-sentence instruction telling the user exactly what to do (max 20 words)
- "example_text": the specific French sentence/passage/material to use (1-2 sentences for speaking/reading, 1 topic prompt for writing)
Keep it achievable in under 5 minutes. Be specific and actionable. No fluff.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: systemPrompt }],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.9,
    }),
  });

  if (!response.ok) throw new Error(`Groq error: ${response.status}`);
  const data = (await response.json()) as { choices: { message: { content: string } }[] };
  return JSON.parse(data.choices[0].message.content) as { prompt_text: string; example_text: string };
}

function getStaticChallenge(type: ChallengeType): { prompt_text: string; example_text: string } {
  const day = new Date().getDay();
  const map: Record<ChallengeType, string[]> = {
    speaking: SPEAKING_PROMPTS,
    writing: WRITING_PROMPTS,
    reading: READING_PROMPTS,
  };
  const prompts = map[type];
  return {
    prompt_text: prompts[day % prompts.length],
    example_text: "",
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to generate on-demand challenges." },
        { status: 401 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    // Optional requested type from client
    let requestedType: ChallengeType | undefined;
    try {
      const body = (await request.json()) as { type?: ChallengeType };
      requestedType = body.type;
    } catch {
      // Body empty or invalid JSON
    }

    // 1. Fetch existing challenges for today
    const { data: existingChallenges } = await supabase
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

    // 3. Generate challenge content via Groq or static fallback
    let content: { prompt_text: string; example_text: string };
    try {
      content = await generateChallengeWithGroq(type);
    } catch (err) {
      console.warn("[french/generate] Groq failed, using static fallback:", err);
      content = getStaticChallenge(type);
    }

    // 4. Insert into DB
    const { data: inserted, error: insertError } = await supabase
      .from("french_challenges")
      .insert({
        challenge_date: today,
        type,
        prompt_text: content.prompt_text,
        example_text: content.example_text || null,
      })
      .select("*")
      .single();

    if (insertError || !inserted) {
      console.error("[french/generate] DB insert error:", insertError);
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
