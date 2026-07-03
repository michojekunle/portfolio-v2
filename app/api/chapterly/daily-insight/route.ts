import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ChBook, ChGoal } from "@/lib/chapterly/types";

export interface DailyInsightPayload {
  insight: string;
  date: string;
  stats: {
    streak: number;
    todayMinutes: number;
    dailyGoal: number;
    currentBook: string | null;
    currentBookAuthor: string | null;
    progressPct: number;
    totalBooks: number;
    finishedBooks: number;
  };
}

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(`chapterly:daily-insight:${user.id}`, {
    limit: 20,
    windowMs: 86_400_000,
  });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Daily insight limit reached" }, { status: 429 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const [booksRes, sessionsRes, goalRes] = await Promise.all([
    supabase
      .from("ch_books")
      .select("id, title, author, status, progress_pct")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("ch_sessions")
      .select("duration_seconds")
      .eq("user_id", user.id)
      .gte("started_at", `${today}T00:00:00.000Z`),
    supabase
      .from("ch_goals")
      .select("streak_count, daily_minutes, annual_books")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const books = (booksRes.data ?? []) as Pick<ChBook, "id" | "title" | "author" | "status" | "progress_pct">[];
  const goal = goalRes.data as Pick<ChGoal, "streak_count" | "daily_minutes" | "annual_books"> | null;
  const todayMinutes = Math.round(
    (sessionsRes.data ?? []).reduce((s, r) => s + ((r.duration_seconds as number) ?? 0), 0) / 60
  );

  const currentBook = books.find((b) => b.status === "reading") ?? books[0] ?? null;
  const streak = goal?.streak_count ?? 0;
  const dailyGoal = goal?.daily_minutes ?? 15;
  const remainingMinutes = Math.max(0, dailyGoal - todayMinutes);
  const finishedBooks = books.filter((b) => b.status === "finished").length;

  const contextLines = [
    currentBook
      ? `Currently reading: "${currentBook.title}"${currentBook.author ? ` by ${currentBook.author}` : ""} — ${Math.round(currentBook.progress_pct ?? 0)}% through`
      : "No active book",
    `Reading streak: ${streak} day${streak !== 1 ? "s" : ""}`,
    `Read today: ${todayMinutes} of ${dailyGoal} minutes`,
    remainingMinutes > 0
      ? `${remainingMinutes} minutes left to hit today's goal`
      : "Daily goal already hit today — great work!",
    `Total books: ${books.length} (${finishedBooks} finished)`,
  ].join(". ");

  const prompt = `You are a sharp, personal reading coach. Write ONE daily insight for this reader — maximum 3 sentences, under 70 words total. Make it feel genuinely personal to their specific context. Reference their current book, streak, or progress concretely (use the actual numbers). End with a single, specific micro-action they can do in the next 5 minutes. Avoid generic motivational fluff — be precise and actionable.

Reader context: ${contextLines}`;

  const stats: DailyInsightPayload["stats"] = {
    streak,
    todayMinutes,
    dailyGoal,
    currentBook: currentBook?.title ?? null,
    currentBookAuthor: currentBook?.author ?? null,
    progressPct: Math.round(currentBook?.progress_pct ?? 0),
    totalBooks: books.length,
    finishedBooks,
  };

  const generators: (() => Promise<string>)[] = [];

  if (process.env.GROQ_API_KEY) {
    generators.push(async (): Promise<string> => {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
      const res = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.75,
        max_tokens: 140,
      });
      const text = res.choices[0]?.message?.content?.trim() ?? "";
      if (!text) throw new Error("Empty response from Groq");
      return text;
    });
  }

  if (process.env.GEMINI_API_KEY) {
    generators.push(async (): Promise<string> => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const res = await model.generateContent(prompt);
      const text = res.response.text().trim();
      if (!text) throw new Error("Empty response from Gemini");
      return text;
    });
  }

  const errors: string[] = [];
  for (const gen of generators) {
    try {
      const insight = await gen();
      const payload: DailyInsightPayload = { insight, date: today, stats };
      return NextResponse.json(payload);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(msg);
      console.warn("[daily-insight] provider failed:", msg);
    }
  }

  console.error("[daily-insight] all providers failed:", errors);

  const fallback = currentBook
    ? `You're ${Math.round(currentBook.progress_pct ?? 0)}% through "${currentBook.title}" — momentum is real. ${remainingMinutes > 0 ? `${remainingMinutes} more minutes today locks in your streak.` : "You already crushed today's goal."}`
    : `Every reading habit starts with one session. Open a book today and start building your streak — even 10 minutes compounds into weeks of knowledge.`;

  const payload: DailyInsightPayload = { insight: fallback, date: today, stats };
  return NextResponse.json(payload);
}
