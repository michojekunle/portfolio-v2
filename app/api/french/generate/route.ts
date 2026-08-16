/**
 * POST /api/french/generate
 * On-demand challenge generation endpoint.
 * Multi-Provider AI Architecture: Gemini 2.5 Flash (Primary) → Groq Llama 3.1 (Secondary) → Static Fallback.
 * Generates rich, substantial 120-250 word French dialogues & passages for a true 5-minute drill.
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
    example_text: `Modèle d'expression orale :
Pour moi, la matinée idéale commence très tôt, vers six heures et demie. La première chose que je fais est d'ouvrir la fenêtre pour faire entrer de l'air frais. Ensuite, je prépare un expresso bien chaud tout en écoutant de la musique douce. Ce moment de calme me permet de faire le vide dans mon esprit et de planifier sereinement les tâches de la journée. Après avoir pris mon petit-déjeuner, je fais vingt minutes de méditation ou de marche rapide dehors. Cela me donne une énergie formidable pour attaquer la journée de travail avec enthousiasme et sérénité. Et vous, quelle est votre routine idéale ?`,
  },
  {
    prompt_text: "Enregistrez-vous en français pour exprimer votre opinion sur les avantages du travail à distance versus le travail au bureau.",
    example_text: `Modèle d'expression orale :
À mon avis, le travail à distance offre une flexibilité incroyable au quotidien. On gagne un temps précieux en évitant les trajets dans les transports en commun, ce qui réduit considérablement le stress. Cependant, je pense aussi qu'il est indispensable de maintenir un contact humain régulier avec ses collègues. Rien ne remplace la spontanéité d'une discussion autour d'une pause café au bureau pour renforcer l'esprit d'équipe. La solution parfaite est donc un mode hybride avec deux ou trois jours de télétravail par semaine.`,
  },
];

const WRITING_PROMPTS = [
  {
    prompt_text: "Rédigez un paragraphe complet en français (5 à 8 phrases) pour raconter un souvenir de vacances inoubliable.",
    example_text: `Guide de rédaction — Mots & expressions cibles à inclure obligatoirement :
1. "Après être arrivé(e) à..." (Passé composé)
2. "Il faisait un temps magnifique quand..." (Imparfait)
3. "Se rendre compte de..." (Expression réflexive)
4. "Avoir l'intention de..." (Intention)
5. "Du coup..." (Connecteur logique courant)`,
  },
  {
    prompt_text: "Écrivez une lettre ou un courriel informel à un ami en français pour lui proposer de faire un voyage ensemble cet été.",
    example_text: `Guide de rédaction — Mots & expressions cibles à inclure obligatoirement :
1. "Ça te dirait de..." (Proposition)
2. "Bien que ce soit..." (Subjonctif)
3. "Réserver à l'avance" (Vocabulaire de voyage)
4. "Prendre du temps pour soi" (Bien-être)
5. "À bientôt j'espère !" (Formule de politesse)`,
  },
];

const READING_PROMPTS = [
  {
    prompt_text: "Lisez ce dialogue complet entre deux amis dans un café à voix haute. Prêtez une attention particulière aux liaisons et à l'intonation naturelle.",
    example_text: `— Bonjour Antoine ! Ça fait plaisir de te voir ici. Tu m'attends depuis longtemps ?
— Salut Sophie ! Non pas du tout, je suis arrivé il y a peine cinq minutes. J'ai failli être en retard à cause des embouteillages près de l'opéra.
— Ah je comprends parfaitement, la circulation est terrible aujourd'hui. Alors, qu'est-ce que tu vas prendre ?
— Je vais commander un grand café crème avec une tartine beurrée. Et toi, tu as déjà pris ton petit-déjeuner ?
— Pas encore ! Je vais prendre un thé vert et un croissant chaud. Dis-moi, tu as des nouvelles de Thomas depuis son voyage en Italie ?
— Oui absolument ! Il m'a envoyé un message hier soir. Il adore Rome et il revient la semaine prochaine avec plein d'anecdotes à nous raconter !`,
  },
  {
    prompt_text: "Lisez ce récit de voyage à voix haute en vous concentrant sur l'articulation, le rythme et le ton naturel.",
    example_text: `Le week-end dernier, j'ai décidé d'échapper au bruit de la ville et de partir en randonnée dans les montagnes. Le départ était très tôt le matin, alors que le soleil commençait à peine à se lever au-dessus des collines. L'air était frais et pur, et le silence était seulement interrompu par le chant des oiseaux. Après deux heures de marche le long d'un sentier escarpé, je suis enfin arrivé au sommet. La vue panoramique sur toute la vallée était tout simplement à couper le souffle. J'ai pris quelques photos et j'ai savouré mon pique-nique en contemplant le paysage. Ce genre de journée me rappelle à quel point il est essentiel de prendre du temps pour soi et de renouer avec la nature.`,
  },
];

function buildFrenchPrompt(type: ChallengeType): string {
  return `You are a master French language instructor creating a comprehensive, engaging 5-minute practice drill for an intermediate learner (A2-B2 level).
The challenge type is: "${type}".

Strict Quality & Length Guidelines:
- French grammar MUST be 100% authentic, natural, and grammatically flawless (e.g. use "je suis en retard", NEVER "j'ai retardé").
- FOR "reading" (Elocution & Rhythm): "prompt_text" should instruct the user to read the full text out loud. "example_text" MUST be a LONG, RICH, REALISTIC dialogue or story (120 - 200 words / 8-12 lines of dialogue). For example, a realistic multi-turn conversation between friends at a café, ordering food, planning a weekend trip, or a vivid story paragraph.
- FOR "speaking" (Oral Practice & Fluency): "prompt_text" should present a compelling real-life scenario and ask 2-3 specific conversational questions. "example_text" MUST provide a full, native model response (100 - 160 words / 6-8 sentences) demonstrating natural phrasing and connectors (en effet, cependant, du coup, à mon avis).
- FOR "writing" (Composition & Grammar): "prompt_text" should give an engaging journal/opinion prompt and ask for a 5-8 sentence response. "example_text" MUST provide a helpful structure guide with 5 target vocabulary/grammar expressions to include (e.g., 1. après avoir + participe passé, 2. bien que + subjonctif, 3. se rendre compte, 4. avoir l'intention de, 5. du coup).

Return ONLY a raw valid JSON object with no markdown codeblocks:
{
  "prompt_text": "Clear instruction in natural French (1-2 sentences)",
  "example_text": "The long, rich, 120-200 word target French dialogue, story passage, or structured writing guide"
}`;
}

// ── Provider 1: Google Gemini 2.5 Flash (Primary) ─────────────────────────────
async function generateChallengeWithGemini(type: ChallengeType): Promise<{ prompt_text: string; example_text: string }> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 1200 },
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
      max_tokens: 1200,
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
