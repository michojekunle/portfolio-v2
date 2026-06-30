import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import { z } from "zod";

const RequestSchema = z.object({
  book_id: z.string().uuid(),
  book_title: z.string().min(1),
  book_author: z.string().nullable().optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
    })
  ).min(1),
});

export async function POST(request: NextRequest): Promise<NextResponse | Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const { book_id, book_title, book_author, messages } = parsed.data;

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
      ? `\n\nThe user's highlighted passages from this book:\n${highlights
          .map((h, i) => `${i + 1}. "${h.text}"${h.note ? ` — Note: ${h.note}` : ""}`)
          .join("\n")}`
      : "";

  const systemPrompt = `You are an AI reading companion for the book "${book_title}"${
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

  if (!process.env.GROQ_API_KEY) {
    // Graceful fallback when API key is not set
    const fallback = `I can discuss "${book_title}" with you! This feature requires a Groq API key to be configured. Once set up, I'll be able to answer questions, create summaries, generate quizzes, and discuss the book's ideas with you in depth.`;
    return new Response(fallback, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const stream = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 1024,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) controller.enqueue(new TextEncoder().encode(delta));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  });
}
