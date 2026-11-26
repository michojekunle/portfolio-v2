import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = await checkRateLimit(`carousel-transcribe:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many audio transcription requests. Please wait a moment." },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const audio = formData.get("audio") as File | null;
  if (!audio) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  // 1. Try Groq Whisper (lightning fast, ~800ms)
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const transcription = await groq.audio.transcriptions.create({
        file: audio,
        model: "whisper-large-v3",
        response_format: "json",
      });
      if (transcription.text?.trim()) {
        return NextResponse.json({ text: transcription.text.trim() });
      }
    } catch (err) {
      console.warn("[carousel-lab/transcribe] Groq Whisper failed:", err);
    }
  }

  // 2. Fallback to Gemini Multimodal Audio
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const buffer = await audio.arrayBuffer();
      const base64Audio = Buffer.from(buffer).toString("base64");

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: audio.type || "audio/webm",
            data: base64Audio,
          },
        },
        {
          text: "Transcribe this audio recording verbatim. Return only the spoken transcript with proper capitalization and punctuation. Do not add comments or introductions.",
        },
      ]);
      const text = result.response.text();
      if (text?.trim()) {
        return NextResponse.json({ text: text.trim() });
      }
    } catch (err) {
      console.error("[carousel-lab/transcribe] Gemini audio fallback failed:", err);
    }
  }

  return NextResponse.json(
    { error: "Speech transcription failed or audio was unintelligible. Please try again." },
    { status: 500 }
  );
}
