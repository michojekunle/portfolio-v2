import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const RequestSchema = z.object({
  topic: z.string().min(1).max(5000),
  slideCount: z.number().int().min(3).max(8), // support 3-8 slides
  theme: z.enum(["Minimal", "Dark", "Bold", "Earthy"]),
  mode: z.enum(["topic", "refine"]).default("topic").optional(),
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
};

function buildPrompt(topic: string, slideCount: number, theme: string, mode: "topic" | "refine" = "topic"): string {
  const toneInstruction = THEME_INSTRUCTIONS[theme] ?? THEME_INSTRUCTIONS.Minimal;
  const coreInstruction = mode === "refine"
    ? `Take the following rough notes, draft outline, or raw text ideas and refine/structure them into a highly engaging presentation:
---
${topic}
---
`
    : `Create a carousel presentation about the following topic: ${topic}`;

  return `${coreInstruction}

Slide count: ${slideCount}
Tone: ${toneInstruction}

Each slide needs a short title (under 60 chars), main content (2-3 punchy sentences, under 200 chars total), and an optional single emoji that represents the slide.

Return ONLY a valid JSON array of objects with this exact shape:
[
  { "title": "Slide title", "content": "Slide content here.", "emoji": "..." },
  ...
]

Rules:
- Exactly ${slideCount} slides
- First slide is the hook/intro, last slide is the CTA or key takeaway
- Content must be punchy and scroll-stopping — this is for social media
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
  mode: "topic" | "refine"
): Promise<Slide[]> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: buildPrompt(topic, slideCount, theme, mode) }],
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
  mode: "topic" | "refine"
): Promise<Slide[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is not configured");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(buildPrompt(topic, slideCount, theme, mode));
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

  const { topic, slideCount, theme, mode } = parsed.data;
  const errors: string[] = [];
  const activeMode = mode || "topic";

  try {
    const slides = await generateWithGroq(topic, slideCount, theme, activeMode);
    return NextResponse.json({ slides });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Groq: ${msg}`);
    console.warn("Carousel Lab: Groq failed, trying Gemini:", msg);
  }

  try {
    const slides = await generateWithGemini(topic, slideCount, theme, activeMode);
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
