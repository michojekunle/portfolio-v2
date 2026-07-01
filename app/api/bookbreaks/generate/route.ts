import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { getBBBook, getBBSettings } from "@/lib/bookbreaks/queries";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/bookbreaks/prompts";
import type { ContentType } from "@/lib/bookbreaks/types";
import { SEED_CONTENT } from "@/lib/bookbreaks/seed-data";

export const DEFAULT_MODEL_CHAIN = [
  "google:gemini-3.5-flash",
  "google:gemini-2.5-flash",
  "google:gemini-3.1-flash-lite",
  "google:gemini-2.5-flash-lite",
  "groq:openai/gpt-oss-120b",
  "groq:llama-3.1-8b-instant",
  "google:gemini-3-flash-preview",
  "google:gemini-flash-latest"
];

const RequestSchema = z.object({
  book_id: z.string().uuid(),
  content_type: z.enum(["article", "thread", "carousel", "tiktok", "caption"]),
  platform: z.string().optional(),
  tone: z.string().optional(),
  word_count: z.number().int().min(300).max(3000).optional(),
  seo_keywords: z.array(z.string()).optional(),
  custom_instructions: z.string().optional(),
});

function getModelChain(preference: string): string[] {
  const googleModels = DEFAULT_MODEL_CHAIN.filter((m) => m.startsWith("google:"));
  const groqModels = DEFAULT_MODEL_CHAIN.filter((m) => m.startsWith("groq:"));

  if (preference === "gemini") {
    return [...googleModels, ...groqModels];
  }
  if (preference === "groq") {
    return [...groqModels, ...googleModels];
  }
  return DEFAULT_MODEL_CHAIN;
}

async function tryStreamModel(
  modelString: string,
  systemPrompt: string,
  userPrompt: string
): Promise<ReadableStream<Uint8Array>> {
  const [provider, modelName] = modelString.split(":");
  if (!provider || !modelName) {
    throw new Error(`Invalid model name: ${modelString}`);
  }

  if (provider === "google") {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContentStream(userPrompt);
    const iterator = result.stream[Symbol.asyncIterator]();

    // Verify stream starts successfully before returning it
    const firstResult = await iterator.next();
    if (firstResult.done) {
      throw new Error("Empty stream returned from Google AI");
    }

    const encoder = new TextEncoder();
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const firstText = firstResult.value.text();
          if (firstText) {
            controller.enqueue(encoder.encode(firstText));
          }

          let next = await iterator.next();
          while (!next.done) {
            const text = next.value.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
            next = await iterator.next();
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });
  } else if (provider === "groq") {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const stream = await groq.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    });

    const iterator = stream[Symbol.asyncIterator]();

    // Verify stream starts successfully before returning it
    const firstResult = await iterator.next();
    if (firstResult.done) {
      throw new Error("Empty stream returned from Groq");
    }

    const encoder = new TextEncoder();
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const firstDelta = firstResult.value.choices[0]?.delta?.content ?? "";
          if (firstDelta) {
            controller.enqueue(encoder.encode(firstDelta));
          }

          let next = await iterator.next();
          while (!next.done) {
            const delta = next.value.choices[0]?.delta?.content ?? "";
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
            next = await iterator.next();
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
}

function fallbackStream(
  bookTitle: string,
  contentType: ContentType
): ReadableStream<Uint8Array> {
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

  const models = getModelChain(settings?.ai_provider ?? "auto");
  let stream: ReadableStream<Uint8Array> | null = null;
  const errors: string[] = [];

  for (const modelString of models) {
    try {
      stream = await tryStreamModel(modelString, systemPrompt, userPrompt);
      break;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${modelString}: ${msg}`);
      console.warn(`Fallback triggered from model ${modelString} due to error:`, msg);
    }
  }

  if (!stream) {
    console.error("All models in the chain failed:", errors);
    stream = fallbackStream(book.title, request.content_type);
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
