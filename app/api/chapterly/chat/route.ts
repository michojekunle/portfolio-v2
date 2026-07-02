import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { getBBSettings } from "@/lib/bookbreaks/queries";
import { checkRateLimit } from "@/lib/rate-limit";

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
  book_title: z.string().min(1),
  book_author: z.string().nullable().optional(),
  voice_mode: z.boolean().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
    })
  ).min(1),
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
  messages: { role: "user" | "assistant"; content: string }[]
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

    let chatContents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Google Gemini content APIs require history to start with a user message
    if (chatContents[0]?.role === "model") {
      chatContents = chatContents.slice(1);
    }

    const result = await model.generateContentStream({ contents: chatContents });
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
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
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

function fallbackStream(bookTitle: string): ReadableStream<Uint8Array> {
  const text = `I'm having trouble connecting to my AI models to discuss "${bookTitle}". Please configure a valid GEMINI_API_KEY or GROQ_API_KEY in your settings to enable chat.`;
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

export async function POST(request: NextRequest): Promise<NextResponse | Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(`chapterly:chat:${user.id}`, { limit: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
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

  const { book_id, book_title, book_author, messages, voice_mode } = parsed.data;

  // Verify user owns the book
  const { data: book } = await supabase
    .from("ch_books")
    .select("id")
    .eq("id", book_id)
    .eq("user_id", user.id)
    .single();

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  // Fetch user's highlights for context
  const { data: highlights } = await supabase
    .from("ch_highlights")
    .select("text, note")
    .eq("book_id", book_id)
    .eq("user_id", user.id)
    .limit(20);

  const highlightContext =
    highlights && highlights.length > 0
      ? `\n\nThe user's highlighted passages from this book (${highlights.length === 20 ? "showing 20 most recent; they may have more" : `${highlights.length} total`}):\n${highlights
          .map((h, i) => `${i + 1}. "${h.text}"${h.note ? ` — Note: ${h.note}` : ""}`)
          .join("\n")}`
      : "";

  let systemPrompt = `You are an AI reading companion for the book "${book_title}"${
    book_author ? ` by ${book_author}` : ""
  }. You help the reader understand, analyze, and discuss this book deeply.

Your role:
- Answer questions about themes, characters, plot, and ideas in the book
- Help the reader remember and connect concepts
- Generate quizzes, summaries, and study aids on request
- Discuss the book's ideas in relation to the reader's own life and questions
- Be concise but substantive — prioritize insight over length
${highlightContext}

Respond conversationally. If asked about something outside this book, gently redirect back to the book unless it's a direct connection.`;

  if (voice_mode) {
    systemPrompt += `\n\nCRITICAL VOICE MODE INSTRUCTION: You are in a real-time live voice dialogue with the user.
- Keep your answers very short (1-3 sentences maximum).
- Respond in a natural, spoken-style tone. 
- NEVER use markdown, bullet points, numbered lists, asterisks (**), or headers. Use plain, easy-to-read text that sounds natural when spoken aloud.`;
  }

  const settings = await getBBSettings();
  const models = getModelChain(settings?.ai_provider ?? "auto");
  let stream: ReadableStream<Uint8Array> | null = null;
  const errors: string[] = [];

  for (const modelString of models) {
    try {
      stream = await tryStreamModel(modelString, systemPrompt, messages);
      break;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${modelString}: ${msg}`);
      console.warn(`Fallback triggered from model ${modelString} due to error:`, msg);
    }
  }

  if (!stream) {
    console.error("All models in the chain failed:", errors);
    stream = fallbackStream(book_title);
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  // Wrap stream to intercept accumulated text and persist the exchange afterwards
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
      // Persist after stream closes — errors are logged but don't affect the client
      if (accumulated && lastUserMessage) {
        void (async () => {
          const { error } = await supabase.from("ch_chat_history").insert([
            { user_id: user.id, book_id, role: "user", content: lastUserMessage.content },
            { user_id: user.id, book_id, role: "assistant", content: accumulated },
          ]);
          if (error) console.error("[chapterly/chat] chat history insert failed:", error);
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
