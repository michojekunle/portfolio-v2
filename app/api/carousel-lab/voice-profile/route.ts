import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import type { VoiceProfile } from "@/app/tools/carousel-lab/lib/types";

const RequestSchema = z.object({
  posts: z.array(z.string().min(10).max(5000)).min(1).max(5),
});

const DEFAULT_BANNED_WORDS = [
  "delve",
  "unlock",
  "supercharge",
  "game-changer",
  "testament",
  "synergy",
  "in conclusion",
  "harness",
  "tapestry",
  "furthermore",
];

function buildVoiceAnalysisPrompt(posts: string[]): string {
  const combined = posts.map((p, idx) => `[Post ${idx + 1}]:\n${p}`).join("\n\n---\n\n");

  return `You are an elite linguistic stylist and voice analyst. Analyze the following sample posts written by a creator to infer their authentic voiceprint, sentence rhythm, and boundaries.

${combined}

Analyze:
1. Tone summary (concise, 10-18 words describing their distinct voice, attitude, and posture).
2. Cadence: one of "staccato" (short punchy lines), "balanced" (standard), or "narrative" (longer, storytelling flows).
3. 3-5 specific style rules observed in their writing (e.g., "Uses real-world numbers early", "Never uses emojis", "Short one-sentence paragraphs", "Speaks from direct builder experience").
4. Any specific banned/forbidden phrases they clearly avoid or that sound like generic corporate AI.

Return ONLY a valid JSON object matching this exact schema:
{
  "toneSummary": "Direct, technical, contrarian, no corporate fluff, grounded in engineering realities.",
  "cadence": "staccato",
  "customRules": [
    "Lead immediately with an uncomfortable truth or hard metric",
    "Keep sentences under 15 words where possible",
    "Avoid corporate buzzwords or generic motivational platitudes",
    "Write from direct first-person perspective ('I built', 'we tested')"
  ],
  "bannedWords": ["delve", "unlock", "supercharge", "synergy", "game-changer"]
}

Return ONLY the JSON object. No markdown fences, no explanation.`;
}

function parseVoiceResponse(raw: string, samplePosts: string[]): VoiceProfile {
  const stripped = raw
    .replace(/^```(?:json)?\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    throw new Error("AI returned malformed JSON for voice analysis");
  }

  const Schema = z.object({
    toneSummary: z.string().default("Direct, authentic, clear, and engaging."),
    cadence: z.enum(["staccato", "balanced", "narrative"]).default("balanced"),
    customRules: z.array(z.string()).default([]),
    bannedWords: z.array(z.string()).optional(),
  });

  const valid = Schema.parse(parsed);

  const combinedBanned = Array.from(
    new Set([...(valid.bannedWords || []), ...DEFAULT_BANNED_WORDS])
  );

  return {
    toneSummary: valid.toneSummary,
    cadence: valid.cadence,
    bannedWords: combinedBanned,
    customRules: valid.customRules.length > 0 ? valid.customRules : [
      "Keep sentences concise and clear",
      "Avoid corporate fluff and buzzwords",
      "Focus on specific, concrete details",
    ],
    sampleSnippets: samplePosts.map((p) => p.slice(0, 160)),
    extractedAt: Date.now(),
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = await checkRateLimit(`voice-profile:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many voice analysis requests. Please wait a moment." },
      { status: 429 }
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
      { error: parsed.error.errors[0]?.message ?? "Please provide at least 1 sample post with at least 10 characters." },
      { status: 400 }
    );
  }

  const { posts } = parsed.data;
  const prompt = buildVoiceAnalysisPrompt(posts);

  // 1. Try Groq
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 512,
      });
      const content = completion.choices[0]?.message?.content ?? "";
      const profile = parseVoiceResponse(content, posts);
      return NextResponse.json({ voiceProfile: profile });
    } catch (err) {
      console.warn("[carousel-lab/voice-profile] Groq failed, trying Gemini:", err);
    }
  }

  // 2. Fallback to Gemini
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const profile = parseVoiceResponse(text, posts);
      return NextResponse.json({ voiceProfile: profile });
    } catch (err) {
      console.error("[carousel-lab/voice-profile] Gemini failed:", err);
    }
  }

  return NextResponse.json(
    { error: "Voice analysis is temporarily unavailable." },
    { status: 503 }
  );
}
