import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getBBSettings } from "@/lib/bookbreaks/queries";
import { DEFAULT_MODEL_CHAIN } from "../chat/route";
import { checkRateLimit } from "@/lib/rate-limit";
import Groq from "groq-sdk";
import { z } from "zod";

const RequestSchema = z.object({
  book_id: z.string().uuid("Invalid book ID"),
  book_title: z.string().min(1).max(300),
  book_author: z.string().max(200).nullable().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await checkRateLimit(`chapterly:quiz:${user.id}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many quiz requests. Please wait a minute." }, { status: 429 });
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

  // Verify the book belongs to the requesting user before generating anything.
  const { data: book, error: bookError } = await supabase
    .from("ch_books")
    .select("id")
    .eq("id", book_id)
    .eq("user_id", user.id)
    .single();

  if (bookError || !book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const systemPrompt = `You are a professional reading comprehension instructor.
Generate a high-quality 5-question multiple choice quiz to test a reader's understanding of the book "${book_title}"${
    book_author ? ` by ${book_author}` : ""
  }.
Return ONLY a valid JSON array of objects. Do not include markdown codeblocks (\`\`\`json), comments, or explanations outside the JSON.

Each object in the array MUST follow this exact TypeScript interface:
interface QuizQuestion {
  question: string;
  options: string[]; // exactly 4 options
  correctIndex: number; // 0, 1, 2, or 3 representing the index of the correct option
  explanation: string; // brief explanation of why this option is correct
}`;

  const settings = await getBBSettings();
  const provider = settings?.ai_provider ?? "auto";
  const models = provider === "groq"
    ? DEFAULT_MODEL_CHAIN.filter((m) => m.startsWith("groq:")).concat(DEFAULT_MODEL_CHAIN.filter((m) => m.startsWith("google:")))
    : DEFAULT_MODEL_CHAIN.filter((m) => m.startsWith("google:")).concat(DEFAULT_MODEL_CHAIN.filter((m) => m.startsWith("groq:")));

  let resultText = "";
  let successModel = "";

  for (const modelString of models) {
    try {
      const [prov, modelName] = modelString.split(":");
      if (prov === "google" && process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" },
        });
        const resp = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        });
        resultText = resp.response.text();
        successModel = modelString;
        break;
      } else if (prov === "groq" && process.env.GROQ_API_KEY) {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const resp = await groq.chat.completions.create({
          model: modelName,
          messages: [{ role: "user", content: systemPrompt }],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });
        resultText = resp.choices[0]?.message?.content ?? "";
        successModel = modelString;
        break;
      }
    } catch (err) {
      console.warn(`Quiz generation failed for ${modelString}:`, err);
    }
  }

  if (!resultText) {
    return NextResponse.json({ error: "All AI models failed to generate the quiz." }, { status: 500 });
  }

  try {
    // Some models might wrap JSON inside an envelope or outer object like {"questions": [...]}, check and extract
    let parsed = JSON.parse(resultText.trim());
    if (!Array.isArray(parsed) && parsed.questions && Array.isArray(parsed.questions)) {
      parsed = parsed.questions;
    }
    return NextResponse.json({ questions: parsed, modelUsed: successModel });
  } catch (err) {
    console.error("[quiz] JSON parse error:", err, "rawResponse:", resultText);
    return NextResponse.json({ error: "Failed to parse generated quiz JSON" }, { status: 500 });
  }
}
