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

async function tryStreamModel(
  modelString: string,
  systemPrompt: string,
  bookTitle: string,
  bookAuthor?: string | null
): Promise<ReadableStream<Uint8Array>> {
  const [provider, modelName] = modelString.split(":");
  if (!provider || !modelName) {
    throw new Error(`Invalid model name: ${modelString}`);
  }

  const prompt = `Please generate a comprehensive, structured 15-minute summary of the book "${bookTitle}"${
    bookAuthor ? ` by ${bookAuthor}` : ""
  }.
Your summary MUST contain:
1. **Core Concept/Tagline**: A 1-sentence summary of the main premise.
2. **Key Takeaways**: 3-5 bullet points of the most valuable lessons.
3. **Chapter Summaries**: Summarize the most important chapters or phases of the book in detail, using bold headers and clean, readable markdown paragraphs.
4. **Action Steps**: 3 concrete, actionable things the reader can start doing today.

Structure the output with clean markdown headers (H2, H3) and keep the tone professional, inspiring, and engaging.`;

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
      max_tokens: 2048,
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

  // Verify ownership
  const { data: book } = await supabase
    .from("ch_books")
    .select("id")
    .eq("id", book_id)
    .eq("user_id", user.id)
    .single();

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const systemPrompt = `You are a professional book summarizer similar to Headway and Blinkist. You generate high-quality, actionable, highly readable summaries of non-fiction bestsellers.`;

  const settings = await getBBSettings();
  const models = getModelChain(settings?.ai_provider ?? "auto");
  let stream: ReadableStream<Uint8Array> | null = null;
  const errors: string[] = [];

  for (const modelString of models) {
    try {
      stream = await tryStreamModel(modelString, systemPrompt, book_title, book_author);
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
