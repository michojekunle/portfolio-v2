import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_CATEGORIES } from "@/lib/flowise/types";
import { checkRateLimit } from "@/lib/rate-limit";

const FALLBACK_MODELS = [
  "groq:openai/gpt-oss-120b",
  "groq:llama-3.1-8b-instant",
  "google:gemini-2.5-flash",
  "google:gemini-2.5-flash-lite",
];

async function callModel(model: string, prompt: string): Promise<string> {
  const [provider, name] = model.split(":");

  if (provider === "groq") {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
    const res = await groq.chat.completions.create({
      model: name,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 600,
    });
    return res.choices[0]?.message?.content ?? "";
  }

  if (provider === "google") {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const m = genAI.getGenerativeModel({ model: name });
    const res = await m.generateContent(prompt);
    return res.response.text();
  }

  throw new Error(`Unknown provider: ${provider}`);
}

export async function POST(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(`flowise:insights:${user.id}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  // Gather last 60 days of data for context
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setUTCDate(sixtyDaysAgo.getUTCDate() - 60);
  const startStr = sixtyDaysAgo.toISOString().slice(0, 10);

  const [txResult, accountResult] = await Promise.all([
    supabase
      .from("fw_transactions")
      .select("date, amount, category_id, description")
      .eq("user_id", user.id)
      .gte("date", startStr)
      .order("date", { ascending: false })
      .limit(200),
    supabase
      .from("fw_accounts")
      .select("name, current_balance, currency, type")
      .eq("user_id", user.id)
      .eq("is_archived", false),
  ]);

  const txRows = txResult.data ?? [];
  const accounts = accountResult.data ?? [];

  // Aggregate for prompt — never send raw descriptions
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = (() => {
    const d = new Date();
    d.setUTCMonth(d.getUTCMonth() - 1);
    return d.toISOString().slice(0, 7);
  })();

  const catNames: Record<string, string> = {};
  for (const c of SYSTEM_CATEGORIES) catNames[c.id] = c.name;

  const summariseMonth = (month: string) => {
    const rows = txRows.filter((r) => (r.date as string).startsWith(month));
    const income = rows.filter((r) => (r.amount as number) > 0).reduce((s, r) => s + (r.amount as number), 0);
    const expenses = rows.filter((r) => (r.amount as number) < 0).reduce((s, r) => s + Math.abs(r.amount as number), 0);
    const catTotals: Record<string, number> = {};
    for (const r of rows) {
      if ((r.amount as number) < 0) {
        const catId = (r.category_id as string | null) ?? "other";
        catTotals[catId] = (catTotals[catId] ?? 0) + Math.abs(r.amount as number);
      }
    }
    const topCats = Object.entries(catTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id, amt]) => `${catNames[id] ?? id}: ₦${Math.round(amt).toLocaleString()}`);
    return { income: Math.round(income), expenses: Math.round(expenses), topCats, txCount: rows.length };
  };

  const thisMonthStats = summariseMonth(currentMonth);
  const lastMonthStats = summariseMonth(lastMonth);

  const totalBalance = accounts
    .filter((a) => (a.currency as string) === "NGN")
    .reduce((s, a) => s + (a.current_balance as number), 0);

  const prompt = `You are a personal finance advisor for a Nigerian user. Provide 3–4 concise, actionable insights based on this spending data. Be specific about the numbers. Use ₦ for currency. Keep each insight to 1–2 sentences. Be encouraging but direct.

Current month (${currentMonth}):
- Income: ₦${thisMonthStats.income.toLocaleString()}
- Expenses: ₦${thisMonthStats.expenses.toLocaleString()}
- Net: ₦${(thisMonthStats.income - thisMonthStats.expenses).toLocaleString()}
- Top categories: ${thisMonthStats.topCats.join(", ") || "none yet"}
- Transactions: ${thisMonthStats.txCount}

Last month (${lastMonth}):
- Income: ₦${lastMonthStats.income.toLocaleString()}
- Expenses: ₦${lastMonthStats.expenses.toLocaleString()}
- Net: ₦${(lastMonthStats.income - lastMonthStats.expenses).toLocaleString()}
- Top categories: ${lastMonthStats.topCats.join(", ") || "none"}

Total wallet balance: ₦${Math.round(totalBalance).toLocaleString()} across ${accounts.length} account(s).

Return ONLY a JSON array of insight strings, no markdown, no extra text. Example: ["insight 1", "insight 2", "insight 3"]`;

  let insights: string[] = [];
  for (const model of FALLBACK_MODELS) {
    try {
      const raw = await callModel(model, prompt);
      const clean = raw.trim().replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim();
      const parsed: unknown = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((i) => typeof i === "string")) {
        insights = parsed as string[];
        break;
      }
    } catch (err) {
      console.warn(`[flowise/insights] model ${model} failed:`, err instanceof Error ? err.message : err);
    }
  }

  if (insights.length === 0) {
    insights = [
      "Keep logging transactions consistently — the more data you add, the sharper your insights will get.",
      "Set monthly budgets per category to track where you can cut back.",
    ];
  }

  return NextResponse.json({ insights, generated_at: new Date().toISOString() });
}
