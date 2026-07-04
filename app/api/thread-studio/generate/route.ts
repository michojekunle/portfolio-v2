import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const RequestSchema = z.object({
  topic: z.string().min(1).max(5000),
  tone: z.enum(["Educational", "Storytelling", "Controversial", "Technical"]),
  threadLength: z.number().int().min(3).max(15),
  mode: z.enum(["topic", "refine"]).default("topic"),
});

function buildPrompt(topic: string, tone: string, threadLength: number, mode: "topic" | "refine"): string {
  if (mode === "refine") {
    return `You are a world-class ghostwriter. Convert the following raw notes, outline, transcript, or draft script into a highly engaging, viral, and sequential ${tone} X/Twitter thread:

RAW NOTES/DRAFT:
"""
${topic}
"""

Requirements:
- Exactly ${threadLength} tweets
- Each tweet must be under 280 characters
- Number them 1/${threadLength} through ${threadLength}/${threadLength} at the START of each tweet (e.g. "1/${threadLength} ...")
- Retain the key insights, facts, and value from the raw notes, but format them for high readability, pacing, and hooks on X
- Return ONLY a valid JSON array of strings, nothing else. Example format:
["1/${threadLength} First tweet text here...", "2/${threadLength} Second tweet text here...", ..., "${threadLength}/${threadLength} Final tweet text here..."]

Return ONLY the JSON array. No markdown, no explanation, no code fences.`;
  }

  return `Generate a ${tone} X/Twitter thread about: ${topic}

Requirements:
- Exactly ${threadLength} tweets
- Each tweet must be under 280 characters
- Number them 1/${threadLength} through ${threadLength}/${threadLength} at the START of each tweet (e.g. "1/${threadLength} ...")
- Make them engaging, ready-to-post, and sequential — each building on the last
- Return ONLY a valid JSON array of strings, nothing else. Example format:
["1/${threadLength} First tweet text here...", "2/${threadLength} Second tweet text here...", ..., "${threadLength}/${threadLength} Final tweet text here..."]

Return ONLY the JSON array. No markdown, no explanation, no code fences.`;
}

async function generateWithGroq(
  topic: string,
  tone: string,
  threadLength: number,
  mode: "topic" | "refine"
): Promise<string[]> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: buildPrompt(topic, tone, threadLength, mode),
      },
    ],
    temperature: 0.8,
    max_tokens: 2048,
  });

  const content = completion.choices[0]?.message?.content ?? "";
  return parseJsonArray(content);
}

async function generateWithGemini(
  topic: string,
  tone: string,
  threadLength: number,
  mode: "topic" | "refine"
): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is not configured");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(buildPrompt(topic, tone, threadLength, mode));
  const content = result.response.text();
  return parseJsonArray(content);
}

function parseJsonArray(raw: string): string[] {
  // Strip markdown code fences if present
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
  const tweets = parsed.filter((t): t is string => typeof t === "string" && t.length > 0);
  if (tweets.length === 0) {
    throw new Error("Parsed array contains no valid tweet strings");
  }
  return tweets;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = checkRateLimit(`thread-studio:${ip}`, { limit: 5, windowMs: 60_000 });
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

  const { topic, tone, threadLength, mode } = parsed.data;
  const errors: string[] = [];

  // Try Groq first
  try {
    const tweets = await generateWithGroq(topic, tone, threadLength, mode);
    return NextResponse.json({ tweets });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Groq: ${msg}`);
    console.warn("Thread Studio: Groq failed, trying Gemini:", msg);
  }

  // Fallback to Gemini
  try {
    const tweets = await generateWithGemini(topic, tone, threadLength, mode);
    return NextResponse.json({ tweets });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Gemini: ${msg}`);
    console.error("Thread Studio: All models failed:", errors);
  }

  return NextResponse.json(
    { error: "Failed to generate thread. Both AI providers are unavailable." },
    { status: 503 }
  );
}
