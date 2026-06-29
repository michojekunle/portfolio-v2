import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { getBBBook, getBBSettings } from "@/lib/bookbreaks/queries";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/bookbreaks/prompts";
import type { ContentType } from "@/lib/bookbreaks/types";
import { SEED_CONTENT } from "@/lib/bookbreaks/seed-data";

const RequestSchema = z.object({
  book_id: z.string().uuid(),
  content_type: z.enum(["article", "thread", "carousel", "tiktok", "caption"]),
  platform: z.string().optional(),
  tone: z.string().optional(),
  word_count: z.number().int().min(300).max(3000).optional(),
  seo_keywords: z.array(z.string()).optional(),
  custom_instructions: z.string().optional(),
});

// Articles → Gemini (long context, high quality)
// Everything else → Groq (fast streaming)
function chooseProvider(
  contentType: ContentType,
  preference: string
): "gemini" | "groq" {
  if (preference === "gemini") return "gemini";
  if (preference === "groq") return "groq";
  return contentType === "article" ? "gemini" : "groq";
}

async function streamWithGroq(
  systemPrompt: string,
  userPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const stream = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 4096,
  });

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } finally {
        controller.close();
      }
    },
  });
}

async function streamWithGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContentStream(userPrompt);
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
      } finally {
        controller.close();
      }
    },
  });
}

function fallbackStream(
  bookTitle: string,
  contentType: ContentType
): ReadableStream<Uint8Array> {
  // Return pre-seeded content when no API keys are configured
  const match = SEED_CONTENT.find(
    (c) =>
      c.content_type === contentType &&
      SEED_CONTENT.some((b) => b.content_type === contentType)
  );

  const text =
    match?.content ??
    `No pre-generated content available for "${bookTitle}" (${contentType}). Please configure GROQ_API_KEY or GEMINI_API_KEY to enable live AI generation.`;

  const encoder = new TextEncoder();
  const chunks = text.match(/.{1,40}/g) ?? [text];

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 10));
      }
      controller.close();
    },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json();
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const request = parsed.data;
  const [book, settings] = await Promise.all([
    getBBBook(request.book_id),
    getBBSettings(),
  ]);

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const systemPrompt = buildSystemPrompt(request.content_type);
  const userPrompt = buildUserPrompt(book, request, settings?.website_url);
  const provider = chooseProvider(
    request.content_type,
    settings?.ai_provider ?? "auto"
  );

  const hasGroq = Boolean(process.env.GROQ_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  let stream: ReadableStream<Uint8Array>;

  try {
    if (provider === "gemini" && hasGemini) {
      stream = await streamWithGemini(systemPrompt, userPrompt);
    } else if (provider === "groq" && hasGroq) {
      stream = await streamWithGroq(systemPrompt, userPrompt);
    } else if (hasGroq) {
      stream = await streamWithGroq(systemPrompt, userPrompt);
    } else if (hasGemini) {
      stream = await streamWithGemini(systemPrompt, userPrompt);
    } else {
      stream = fallbackStream(book.title, request.content_type);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    console.error("[generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
