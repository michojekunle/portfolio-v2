import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ChBook, ChGoal } from "@/lib/chapterly/types";

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
      .limit(5),
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

  const contextLines = [
    currentBook
      ? `Currently reading: "${currentBook.title}"${currentBook.author ? ` by ${currentBook.author}` : ""} (${Math.round(currentBook.progress_pct)}% done)`
      : "No active book currently",
    `Reading streak: ${streak} day${streak !== 1 ? "s" : ""}`,
    `Read today: ${todayMinutes} of ${dailyGoal} minutes`,
    remainingMinutes > 0
      ? `${remainingMinutes} minutes remaining to hit today's goal`
      : "Daily reading goal already met today",
  ].join(". ");

  const prompt = `You are a concise, sharp reading coach. Generate ONE energizing daily insight for this reader in 2-3 sentences max (under 60 words total). Make it feel personal to their specific stats — reference their current book, streak, or progress directly. End with one concrete micro-action for today. Avoid generic platitudes.

Reader stats: ${contextLines}`;

  const generators: (() => Promise<string>)[] = [];

  if (process.env.GROQ_API_KEY) {
    generators.push(async (): Promise<string> => {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
      const res = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.75,
        max_tokens: 120,
      });
      const text = res.choices[0]?.message?.content?.trim() ?? "";
      if (!text) throw new Error("Empty response from Groq");
      return text;
    });
  }

  if (process.env.GEMINI_API_KEY) {
    generators.push(async (): Promise<string> => {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
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
      return NextResponse.json({ insight, date: today });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(msg);
      console.warn("[daily-insight] provider failed:", msg);
    }
  }

  console.error("[daily-insight] all providers failed:", errors);

  // Deterministic fallback so the card is never empty
  const fallback = currentBook
    ? `You're ${Math.round(currentBook.progress_pct)}% through "${currentBook.title}" — that's real momentum. ${remainingMinutes > 0 ? `${remainingMinutes} more minutes today keeps your streak alive.` : "You already hit your daily goal — well done."}`
    : `Every reading journey starts with a single page. Open a book today and build your first streak — even 5 minutes daily compounds into weeks of knowledge by year-end.`;

  return NextResponse.json({ insight: fallback, date: today });
}
