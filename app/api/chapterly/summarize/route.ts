import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { getBBSettings } from "@/lib/bookbreaks/queries";
import { checkRateLimit } from "@/lib/rate-limit";
import { DEFAULT_MODEL_CHAIN } from "@/app/api/chapterly/chat/route";

const RequestSchema = z.object({
  book_id: z.string().uuid(),
  book_title: z.string().min(1),
  book_author: z.string().nullable().optional(),
});

function getModelChain(preference: string): string[] {
  const googleModels = DEFAULT_MODEL_CHAIN.filter((m) => m.startsWith("google:"));
  const groqModels = DEFAULT_MODEL_CHAIN.filter((m) => m.startsWith("groq:"));
  if (preference === "gemini") return [...googleModels, ...groqModels];
  if (preference === "groq") return [...groqModels, ...googleModels];
  return DEFAULT_MODEL_CHAIN;
}

function buildPrompt(bookTitle: string, bookAuthor?: string | null, highlights: string[] = []): string {
  const highlightBlock =
    highlights.length > 0
      ? `\n\nReader's actual highlights from this book:\n${highlights.map((h, i) => `${i + 1}. "${h}"`).join("\n")}\n\nWhere relevant, weave these quotes into the Key Insights section as supporting evidence.`
      : "";

  return `Generate a structured Headway-style book summary for "${bookTitle}"${bookAuthor ? ` by ${bookAuthor}` : ""}.${highlightBlock}

Your output MUST follow this EXACT structure with these EXACT H2 headers:

## Core Premise
One compelling sentence capturing the book's central thesis.

## Why This Book Matters
2–3 sentences on who it's for and the key problem it solves.

## Key Insights
List exactly 7 to 12 numbered insights. Each insight MUST have:
- A **bold title** (3–6 words)
- 2–4 sentences explaining the concept with concrete examples
- (optional) A > blockquote with a relevant quote from the book

## Memorable Quotes
3–5 of the most powerful, standalone quotes from the book as > blockquotes.

## Action Steps
Exactly 5 specific, immediately actionable steps the reader can start today. Number them.

## One-Line Takeaway
A single punchy sentence the reader will remember forever.

Rules:
- Use markdown headers (##, ###) and bold (**text**) consistently
- Bullet lists use - prefix
- Blockquotes use > prefix
- Never use generic filler phrases like "This section discusses" — be direct and specific
- Write for an intelligent adult reader, not a student
- Keep Key Insights section as the longest and most detailed section`;
}

async function tryStreamModel(
  modelString: string,
  systemPrompt: string,
  bookTitle: string,
  bookAuthor?: string | null,
  highlights?: string[]
): Promise<ReadableStream<Uint8Array>> {
  const [provider, modelName] = modelString.split(":");
  if (!provider || !modelName) {
    throw new Error(`Invalid model name: ${modelString}`);
  }

  const prompt = buildPrompt(bookTitle, bookAuthor, highlights);

  if (provider === "google") {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 3000 },
    });
    const iterator = result.stream[Symbol.asyncIterator]();
    const firstResult = await iterator.next();
    if (firstResult.done) {
      throw new Error("Empty stream returned from Google AI");
    }

    const encoder = new TextEncoder();
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const firstText = firstResult.value.text();
          if (firstText) controller.enqueue(encoder.encode(firstText));

          let next = await iterator.next();
          while (!next.done) {
            const text = next.value.text();
            if (text) controller.enqueue(encoder.encode(text));
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
        { role: "user", content: prompt },
      ],
      stream: true,
      temperature: 0.5,
      max_tokens: 3000,
    });

    const iterator = stream[Symbol.asyncIterator]();
    const firstResult = await iterator.next();
    if (firstResult.done) {
      throw new Error("Empty stream returned from Groq");
    }

    const encoder = new TextEncoder();
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          const firstDelta = firstResult.value.choices[0]?.delta?.content ?? "";
          if (firstDelta) controller.enqueue(encoder.encode(firstDelta));

          let next = await iterator.next();
          while (!next.done) {
            const delta = next.value.choices[0]?.delta?.content ?? "";
            if (delta) controller.enqueue(encoder.encode(delta));
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

export async function POST(request: NextRequest): Promise<NextResponse | Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(`chapterly:summarize:${user.id}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many summary requests. Please wait a minute." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { book_id, book_title, book_author } = parsed.data;

  // Verify ownership + fetch highlights in parallel
  const [bookRes, highlightsRes] = await Promise.all([
    supabase.from("ch_books").select("id").eq("id", book_id).eq("user_id", user.id).single(),
    supabase
      .from("ch_highlights")
      .select("text")
      .eq("book_id", book_id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  if (!bookRes.data) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const highlights = (highlightsRes.data ?? []).map((h) => h.text as string).filter(Boolean);

  const systemPrompt = `You are a professional book summarizer similar to Headway and Blinkist. You produce high-quality, structured, deeply insightful summaries that feel personal and immediately actionable.`;

  const settings = await getBBSettings();
  const models = getModelChain(settings?.ai_provider ?? "auto");
  let stream: ReadableStream<Uint8Array> | null = null;
  const errors: string[] = [];

  for (const modelString of models) {
    try {
      stream = await tryStreamModel(modelString, systemPrompt, book_title, book_author, highlights);
      break;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${modelString}: ${msg}`);
      console.warn(`Summary fallback from ${modelString} due to error:`, msg);
    }
  }

  if (!stream) {
    return NextResponse.json({ error: "All AI providers are currently busy. Please try again later." }, { status: 503 });
  }

  // Wrap stream to intercept accumulated text and persist as a special note
  const persistingStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = stream!.getReader();
      let accumulated = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += new TextDecoder().decode(value, { stream: true });
          controller.enqueue(value);
        }
      } catch (err) {
        controller.error(err);
        return;
      } finally {
        controller.close();
        reader.releaseLock();
      }

      if (accumulated) {
        void (async () => {
          // Check if a summary note already exists to update it, or create a new one
          const { data: existing } = await supabase
            .from("ch_notes")
            .select("id")
            .eq("book_id", book_id)
            .eq("user_id", user.id)
            .eq("chapter_title", "AI Book Summary")
            .maybeSingle();

          if (existing) {
            await supabase
              .from("ch_notes")
              .update({
                content_md: accumulated,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existing.id);
          } else {
            await supabase.from("ch_notes").insert({
              user_id: user.id,
              book_id,
              chapter_title: "AI Book Summary",
              chapter_ref: "summary",
              content_md: accumulated,
            });
          }
        })();
      }
    },
  });

  return new Response(persistingStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  });
}
