import { NextRequest, NextResponse } from "next/server";
import { requireJournalAuth } from "@/lib/journal/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@deepgram/sdk";
import Groq from "groq-sdk";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireJournalAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(`journal:speech:${auth.user.id}`, { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    return NextResponse.json({ error: "Missing form data" }, { status: 400 });
  }

  const audio = formData.get("audio") as File | null;
  if (!audio) return NextResponse.json({ error: "No audio file" }, { status: 400 });

  const buffer = Buffer.from(await audio.arrayBuffer());

  // 1. Try Deepgram
  if (process.env.DEEPGRAM_API_KEY) {
    try {
      const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        buffer,
        { model: "nova-2", smart_format: true }
      );
      if (!error && result?.results?.channels[0]?.alternatives[0]?.transcript) {
        return NextResponse.json({ transcript: result.results.channels[0].alternatives[0].transcript });
      }
    } catch (err) {
      console.warn("[journal/speech] Deepgram failed:", err);
    }
  }

  // 2. Try Groq (Whisper) as fallback to OpenAI
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const transcription = await groq.audio.transcriptions.create({
        file: audio,
        model: "whisper-large-v3",
      });
      if (transcription.text) {
        return NextResponse.json({ transcript: transcription.text });
      }
    } catch (err) {
      console.warn("[journal/speech] Groq whisper failed:", err);
    }
  }

  // 3. Try OpenAI Whisper
  if (process.env.OPENAI_API_KEY) {
    try {
      const form = new FormData();
      form.append("file", new Blob([buffer]), "audio.webm");
      form.append("model", "whisper-1");
      const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: form,
      });
      if (res.ok) {
        const data = await res.json() as { text: string };
        if (data.text) return NextResponse.json({ transcript: data.text });
      } else {
        console.warn("[journal/speech] OpenAI whisper failed:", await res.text());
      }
    } catch (err) {
      console.warn("[journal/speech] OpenAI whisper request failed:", err);
    }
  }

  // If no keys are configured, return 501 so frontend knows to use native
  return NextResponse.json({ error: "No external speech providers configured" }, { status: 501 });
}
