import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { requireFlowiseAuth } from "@/lib/flowise/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { classifyPersona } from "@/lib/flowise/persona";
import { SYSTEM_CATEGORIES, CURRENCIES, PERSONA_CONFIG } from "@/lib/flowise/types";
import type { SuggestedBudget, SuggestedGoal, SystemCategoryId } from "@/lib/flowise/types";

const VALID_CATEGORY_IDS = new Set<string>(SYSTEM_CATEGORIES.map((c) => c.id));

const FALLBACK_MODELS = [
  "groq:openai/gpt-oss-120b",
  "groq:llama-3.1-8b-instant",
  "google:gemini-2.5-flash",
  "google:gemini-2.5-flash-lite",
];

const INCOME_RANGE_LABELS: Record<string, string> = {
  under_100k: "Under ₦100,000/month",
  "100k_300k": "₦100,000 - ₦300,000/month",
  "300k_700k": "₦300,000 - ₦700,000/month",
  "700k_1_5m": "₦700,000 - ₦1,500,000/month",
  over_1_5m: "Over ₦1,500,000/month",
};

// Representative monthly income used to size suggested budget amounts
const INCOME_RANGE_MIDPOINT: Record<string, number> = {
  under_100k: 80_000,
  "100k_300k": 200_000,
  "300k_700k": 500_000,
  "700k_1_5m": 1_100_000,
  over_1_5m: 2_000_000,
};

const OnboardingSchema = z.object({
  income_type: z.enum(["salary", "freelance", "business", "student", "mixed"]),
  monthly_income_range: z.enum(["under_100k", "100k_300k", "300k_700k", "700k_1_5m", "over_1_5m"]),
  primary_goal: z.enum(["save", "debt", "track", "wealth"]),
  currency: z.enum(CURRENCIES).default("NGN"),
  quiz_answers: z.record(z.string(), z.string()),
});

async function callModel(model: string, prompt: string): Promise<string> {
  const [provider, name] = model.split(":");

  if (provider === "groq") {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY not set");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const res = await groq.chat.completions.create({
      model: name,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });
    return res.choices[0]?.message?.content ?? "";
  }

  if (provider === "google") {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");
    const genAI = new GoogleGenerativeAI(apiKey);
    const m = genAI.getGenerativeModel({ model: name, generationConfig: { responseMimeType: "application/json" } });
    const res = await m.generateContent(prompt);
    return res.response.text();
  }

  throw new Error(`Unknown provider: ${provider}`);
}

function fallbackSuggestions(income: number, goal: string): { budgets: SuggestedBudget[]; goals: SuggestedGoal[] } {
  // Conservative 50/30/20-style default, split across a few common categories
  const budgets: SuggestedBudget[] = [
    { category_id: "rent_housing", amount: Math.round(income * 0.3) },
    { category_id: "food_dining", amount: Math.round(income * 0.15) },
    { category_id: "transport", amount: Math.round(income * 0.1) },
    { category_id: "savings", amount: Math.round(income * (goal === "save" ? 0.25 : 0.15)) },
  ];
  const goals: SuggestedGoal[] = [
    { name: goal === "debt" ? "Debt payoff fund" : "Emergency fund", target_amount: Math.round(income * 3), deadline: null },
  ];
  return { budgets, goals };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireFlowiseAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = auth;

  const rl = checkRateLimit(`flowise:onboarding:${user.id}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = OnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { income_type, monthly_income_range, primary_goal, currency, quiz_answers } = parsed.data;
  const persona = classifyPersona(quiz_answers);
  const personaInfo = PERSONA_CONFIG[persona];
  const income = INCOME_RANGE_MIDPOINT[monthly_income_range];

  const prompt = `You are a personal finance advisor for a Nigerian user, onboarding them into a budgeting app.

Persona: ${personaInfo.label} — ${personaInfo.blurb}
Income type: ${income_type}
Income range: ${INCOME_RANGE_LABELS[monthly_income_range]}
Primary goal: ${primary_goal === "save" ? "Save more money" : primary_goal === "debt" ? "Pay off debt" : primary_goal === "track" ? "Track spending better" : "Build long-term wealth"}
Currency: ${currency}

Suggest a starter monthly budget split and 1-2 starter savings goals tailored to this persona and goal. Use ONLY these category ids for budgets: ${SYSTEM_CATEGORIES.map((c) => c.id).join(", ")}.
Budget amounts should roughly sum to 60-85% of a ${income.toLocaleString()} ${currency} monthly income (leave room for the rest), reflecting the persona (e.g. a Saver skews budgets toward "savings", an Avoider gets a very simple 3-4 category split, a Hustler includes "business" if relevant).

Return ONLY JSON matching this schema, no markdown:
{
  "welcome_message": "1-2 warm sentences addressing the user by persona, explaining the plan below",
  "budgets": [{ "category_id": "string", "amount": number }],
  "goals": [{ "name": "string", "target_amount": number, "deadline": "YYYY-MM-DD or null" }]
}`;

  let welcomeMessage = `Welcome! Based on your answers, you're ${personaInfo.label.toLowerCase()}. ${personaInfo.blurb}`;
  let budgets: SuggestedBudget[] = [];
  let goals: SuggestedGoal[] = [];

  for (const model of FALLBACK_MODELS) {
    try {
      const raw = await callModel(model, prompt);
      const clean = raw.trim().replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim();
      const result = JSON.parse(clean) as {
        welcome_message?: string;
        budgets?: { category_id: string; amount: number }[];
        goals?: { name: string; target_amount: number; deadline: string | null }[];
      };

      const validBudgets = (result.budgets ?? [])
        .filter((b) => VALID_CATEGORY_IDS.has(b.category_id) && typeof b.amount === "number" && b.amount > 0)
        .map((b) => ({ category_id: b.category_id as SystemCategoryId, amount: Math.round(b.amount) }));

      const validGoals = (result.goals ?? [])
        .filter((g) => typeof g.name === "string" && g.name.length > 0 && typeof g.target_amount === "number" && g.target_amount > 0)
        .map((g) => ({ name: g.name, target_amount: Math.round(g.target_amount), deadline: g.deadline ?? null }));

      if (validBudgets.length > 0) {
        budgets = validBudgets;
        goals = validGoals;
        if (result.welcome_message) welcomeMessage = result.welcome_message;
        break;
      }
    } catch (err) {
      console.warn(`[flowise/onboarding] model ${model} failed:`, err instanceof Error ? err.message : err);
    }
  }

  if (budgets.length === 0) {
    const fallback = fallbackSuggestions(income, primary_goal);
    budgets = fallback.budgets;
    goals = fallback.goals;
  }

  const { error } = await supabase
    .from("fw_profiles")
    .upsert(
      {
        user_id: user.id,
        persona,
        primary_goal,
        income_type,
        monthly_income_range,
        currency,
        onboarded: true,
      },
      { onConflict: "user_id" },
    );

  if (error) {
    console.error("[flowise/onboarding] profile upsert error:", error);
    return NextResponse.json({ error: "Failed to save your profile" }, { status: 500 });
  }

  return NextResponse.json({ persona, welcome_message: welcomeMessage, budgets, goals });
}
