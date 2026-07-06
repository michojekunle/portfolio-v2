import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { checkRateLimit } from "@/lib/rate-limit";
import { DEFAULT_MODEL_CHAIN } from "../chat/route";
import { z } from "zod";

export interface ConceptCard {
  title: string;
  concept: string;
  insight: string;
  quote: string | null;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit(`shorts:${user.id}`, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: { book_id: string; book_title: string; book_author?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawBody: unknown = body;
  const schema = z.object({
    book_id: z.string().uuid(),
    book_title: z.string().min(1).max(300),
    book_author: z.string().max(200).nullable().optional(),
  });
  const parsed = schema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid parameters", details: parsed.error.issues }, { status: 400 });
  }

  const { book_id, book_title, book_author } = parsed.data;

  // Verify this book belongs to the user
  const { data: book } = await supabase
    .from("ch_books")
    .select("id")
    .eq("id", book_id)
    .eq("user_id", user.id)
    .single();

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  // Fetch up to 30 highlights to give AI rich material
  const { data: highlights } = await supabase
    .from("ch_highlights")
    .select("text, note, color")
    .eq("book_id", book_id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(30);

  const highlightList = (highlights ?? [])
    .map((h, i) => `${i + 1}. "${h.text}"${h.note ? ` (reader note: ${h.note})` : ""}`)
    .join("\n");

  const systemPrompt = `You are a world-class reading companion that distills books into actionable insights.

Extract 6 powerful concept cards from the book "${book_title}"${book_author ? ` by ${book_author}` : ""}.

${highlightList.length > 0 ? `The reader highlighted these passages:\n${highlightList}\n\nPrioritize concepts from these highlights, but add depth beyond them.` : "Generate the 6 most important concepts from this book."}

Return ONLY a valid JSON array. No markdown fences, no explanations outside JSON.

Each item MUST follow this exact shape:
{
  "title": string,        // 3-6 word concept name (e.g., "Deep Work vs Shallow Work")
  "concept": string,      // 1 crisp sentence (≤20 words) stating the core idea
  "insight": string,      // 2-3 sentences expanding on the practical application or nuance
  "quote": string | null  // A direct quote from the reader's highlights, or null if none applies
}`;

  let cards: ConceptCard[] | null = null;

  for (const modelString of DEFAULT_MODEL_CHAIN) {
    if (cards) break;
    try {
      const [prov, modelName] = modelString.split(":");

      if (prov === "google" && process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" },
        });
        const result = await model.generateContent(systemPrompt);
        const text = result.response.text();
        cards = JSON.parse(text) as ConceptCard[];
      } else if (prov === "groq" && process.env.GROQ_API_KEY) {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const completion = await groq.chat.completions.create({
          model: modelName,
          messages: [{ role: "user", content: systemPrompt }],
          max_tokens: 1200,
          temperature: 0.6,
          response_format: { type: "json_object" },
        });
        const raw = completion.choices[0]?.message?.content ?? "{}";
        const parsed = JSON.parse(raw) as { cards?: ConceptCard[] } | ConceptCard[];
        cards = Array.isArray(parsed) ? parsed : (parsed.cards ?? []);
      }
    } catch (err) {
      console.error(`[shorts] model ${modelString} failed:`, err);
    }
  }

  if (!cards || cards.length === 0) {
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }

  // Validate shape and cap at 8 cards
  const validated: ConceptCard[] = cards
    .filter((c) => c.title && c.concept && c.insight)
    .slice(0, 8);

  return NextResponse.json({ cards: validated });
}
