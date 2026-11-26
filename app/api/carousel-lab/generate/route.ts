import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const RequestSchema = z.object({
  topic: z.string().min(1).max(5000),
  slideCount: z.number().int().min(3).max(8), // support 3-8 slides
  theme: z.string().default("Minimal"),
  mode: z.enum(["topic", "refine"]).default("topic").optional(),
  voiceProfile: z
    .object({
      toneSummary: z.string(),
      cadence: z.enum(["staccato", "balanced", "narrative"]),
      bannedWords: z.array(z.string()),
      customRules: z.array(z.string()),
    })
    .optional(),
});

export type Slide = {
  title: string;
  content: string;
  emoji?: string;
};

const THEME_INSTRUCTIONS: Record<string, string> = {
  Minimal: "Use clean, concise language. Short sentences. White space. No hype.",
  Dark: "Use bold, dramatic language. High contrast ideas. Power words.",
  Bold: "Use strong, energetic language. Action verbs. High-impact statements.",
  Earthy: "Use warm, grounded language. Natural analogies. Community-focused tone.",
  Tech: "Use technical, code-literate language. Focus on system architecture, concurrency, performance tradeoffs, and engineering post-mortems.",
  Executive: "Use institutional, high-credibility executive language. Focus on macro shifts, business models, unit economics, market dynamics, and capital allocation.",
  Growth: "Use high-energy, scroll-stopping, conversion copy. Short, punchy sentences. Focus on customer pain relief, psychology triggers, and viral engagement.",
  Mindset: "Use contemplative, philosophical language. Focus on timeless mental models, creative stamina, deep work, and compounding principles.",
  Design: "Use design-literate, precision language. Focus on UI/UX, micro-interactions, spatial hierarchy, typography tokens, and product craft.",
  Brutalist: "Use direct, provocative, contrarian language. Challenge industry sacred cows and status quo myths. Spark debate, no corporate speak.",
  Editorial: "Use polished, high-status thought-leadership tone. Elegant prose, deep insight, authoritative analysis.",
};

function buildPrompt(
  topic: string,
  slideCount: number,
  theme: string,
  mode: "topic" | "refine" = "topic",
  voiceProfile?: z.infer<typeof RequestSchema>["voiceProfile"]
): string {
  const toneInstruction = THEME_INSTRUCTIONS[theme] ?? THEME_INSTRUCTIONS.Minimal;
  const coreInstruction = mode === "refine"
    ? `Take the following rough notes, draft outline, or raw text ideas and refine/structure them into a highly engaging presentation:
---
${topic}
---
`
    : `Create a carousel presentation about the following topic: ${topic}`;

  let voiceSection = "";
  if (voiceProfile) {
    voiceSection = `
AUTHENTIC CREATOR VOICEPRINT & GUARDRAILS:
You must strictly ghostwrite in this creator's authentic tone and enforce their boundary rules:
- Distinct Tone: ${voiceProfile.toneSummary}
- Cadence: ${voiceProfile.cadence} (${voiceProfile.cadence === "staccato" ? "short, punchy, high-impact lines, minimal filler" : voiceProfile.cadence === "narrative" ? "flowing, story-driven, observational" : "balanced"})
- Style Rules:
${voiceProfile.customRules.map((r) => `  * ${r}`).join("\n")}
- FORBIDDEN BANNED WORDS (NEVER use any of these words or variants): ${voiceProfile.bannedWords.join(", ")}
`;
  }

  return `${coreInstruction}

Slide count: ${slideCount}
Tone Baseline: ${toneInstruction}
${voiceSection}

Each slide needs a short title (under 60 chars), main content (2-3 punchy sentences, under 200 chars total), and an optional single emoji or stat callout (e.g. "99.9%", "7.2x", or emoji) that represents the slide.

Return ONLY a valid JSON array of objects with this exact shape:
[
  { "title": "Slide title", "content": "Slide content here.", "emoji": "..." },
  ...
]

Rules:
- Exactly ${slideCount} slides
- First slide is the hook/intro, last slide is the CTA or key takeaway
- Content must be punchy and scroll-stopping — this is for social media
- Strictly respect all voice guardrails and banned words
- Return ONLY the JSON array. No markdown, no code fences, no explanation.`;
}

function parseSlides(raw: string): Slide[] {
  const stripped = raw
    .replace(/^```(?:json)?\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    throw new Error("AI returned malformed JSON — please try again");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("Response is not a JSON array");
  }

  const SlideSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    emoji: z.string().optional(),
  });

  const slides: Slide[] = [];
  for (const item of parsed) {
    const result = SlideSchema.safeParse(item);
    if (result.success) {
      slides.push(result.data);
    }
  }

  if (slides.length === 0) {
    throw new Error("No valid slides in parsed response");
  }

  return slides;
}

async function generateWithGroq(
  topic: string,
  slideCount: number,
  theme: string,
  mode: "topic" | "refine",
  voiceProfile?: z.infer<typeof RequestSchema>["voiceProfile"]
): Promise<Slide[]> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: buildPrompt(topic, slideCount, theme, mode, voiceProfile) }],
    temperature: 0.75,
    max_tokens: 1024,
  });

  const content = completion.choices[0]?.message?.content ?? "";
  return parseSlides(content);
}

async function generateWithGemini(
  topic: string,
  slideCount: number,
  theme: string,
  mode: "topic" | "refine",
  voiceProfile?: z.infer<typeof RequestSchema>["voiceProfile"]
): Promise<Slide[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is not configured");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(buildPrompt(topic, slideCount, theme, mode, voiceProfile));
  const content = result.response.text();
  return parseSlides(content);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = await checkRateLimit(`carousel-lab:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before generating again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { topic, slideCount, theme, mode, voiceProfile } = parsed.data;
  const errors: string[] = [];
  const activeMode = mode || "topic";

  try {
    const slides = await generateWithGroq(topic, slideCount, theme, activeMode, voiceProfile);
    return NextResponse.json({ slides });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Groq: ${msg}`);
    console.warn("Carousel Lab: Groq failed, trying Gemini:", msg);
  }

  try {
    const slides = await generateWithGemini(topic, slideCount, theme, activeMode, voiceProfile);
    return NextResponse.json({ slides });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Gemini: ${msg}`);
    console.error("Carousel Lab: All models failed:", errors);
  }

  return NextResponse.json(
    { error: "Failed to generate slides. Both AI providers are unavailable." },
    { status: 503 }
  );
}
