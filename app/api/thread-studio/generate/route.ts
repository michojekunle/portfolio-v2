import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const RequestSchema = z.object({
  topic: z.string().min(1).max(500),
  tone: z.enum(["Educational", "Storytelling", "Controversial", "Technical"]),
  threadLength: z.number().int().min(3).max(15),
});

function buildPrompt(topic: string, tone: string, threadLength: number): string {
  return `Generate a ${tone} X/Twitter thread about: ${topic}

Requirements:
- Exactly ${threadLength} tweets
- Each tweet must be under 280 characters
- Number them 1/${threadLength} through ${threadLength}/${threadLength} at the START of each tweet
- Make them engaging, ready-to-post, and sequential — each building on the last
- Return ONLY a valid JSON array of strings, nothing else. Example format:
["1/${threadLength} First tweet text here...", "2/${threadLength} Second tweet text here...", ..., "${threadLength}/${threadLength} Final tweet text here..."]

Return ONLY the JSON array. No markdown, no explanation, no code fences.`;
}

async function generateWithGroq(
  topic: string,
  tone: string,
  threadLength: number
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
        content: buildPrompt(topic, tone, threadLength),
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
  threadLength: number
): Promise<string[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(buildPrompt(topic, tone, threadLength));
  const content = result.response.text();
  return parseJsonArray(content);
}

function parseJsonArray(raw: string): string[] {
  // Strip markdown code fences if present
  const stripped = raw
    .replace(/^```(?:json)?\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();

  const parsed: unknown = JSON.parse(stripped);
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

  const { topic, tone, threadLength } = parsed.data;
  const errors: string[] = [];

  // Try Groq first
  try {
    const tweets = await generateWithGroq(topic, tone, threadLength);
    return NextResponse.json({ tweets });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Groq: ${msg}`);
    console.warn("Thread Studio: Groq failed, trying Gemini:", msg);
  }

  // Fallback to Gemini
  try {
    const tweets = await generateWithGemini(topic, tone, threadLength);
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
