import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import Groq from "groq-sdk";
import { SYSTEM_CATEGORIES } from "@/lib/flowise/types";
import { syncAccountBalance } from "@/lib/flowise/balance";

const ImportSchema = z.object({
  account_id: z.string().uuid(),
  rows: z.array(z.object({
    date: z.string(),
    description: z.string(),
    amount: z.number(),
    raw: z.string().optional(),
  })).min(1).max(500),
});

async function categorizeBatch(descriptions: string[]): Promise<(string | null)[]> {
  const catList = SYSTEM_CATEGORIES.map((c) => `${c.id}: ${c.name}`).join(", ");
  const prompt = `Categorize these ${descriptions.length} Nigerian bank transaction descriptions into one of these categories: ${catList}.
Return ONLY a JSON array of category IDs (or null if unclear), in the same order. No extra text.
Transactions: ${JSON.stringify(descriptions)}`;

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 800,
    });
    const raw = res.choices[0]?.message?.content ?? "[]";
    const clean = raw.trim().replace(/^```json?\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(clean) as (string | null)[];
    const validIds = new Set<string>(SYSTEM_CATEGORIES.map((c) => c.id));
    return parsed.map((id) => (id && validIds.has(id) ? id : null));
  } catch (err) {
    console.error("[flowise/import] categorize error:", err);
    return descriptions.map(() => null);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ImportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { account_id, rows } = parsed.data;

  const { data: account } = await supabase
    .from("fw_accounts")
    .select("id")
    .eq("id", account_id)
    .eq("user_id", user.id)
    .single();

  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  // Build dedup keys: deterministic hash of account + date + description + amount.
  // Prevents importing the same CSV twice from creating duplicates.
  const incomingRefs = rows.map(
    (r) => `${account_id}:${r.date}:${r.description}:${r.amount}`,
  );

  const { data: existingRows } = await supabase
    .from("fw_transactions")
    .select("raw_import_ref")
    .eq("user_id", user.id)
    .in("raw_import_ref", incomingRefs);

  const existingRefs = new Set(
    (existingRows ?? []).map((e) => e.raw_import_ref as string),
  );

  const newRows = rows.filter((_, i) => !existingRefs.has(incomingRefs[i]));
  const newRefs = incomingRefs.filter((ref) => !existingRefs.has(ref));
  const skipped = rows.length - newRows.length;

  if (newRows.length === 0) {
    return NextResponse.json({
      imported: 0,
      duplicates_skipped: skipped,
      message: "All rows already imported — no duplicates created.",
    });
  }

  const categories = await categorizeBatch(newRows.map((r) => r.description));

  const inserts = newRows.map((row, i) => ({
    user_id: user.id,
    account_id,
    amount: row.amount,
    category_id: categories[i] ?? null,
    date: row.date,
    description: row.description,
    source: "csv_import" as const,
    tags: [] as string[],
    raw_import_ref: newRefs[i],
  }));

  const { data: inserted, error } = await supabase
    .from("fw_transactions")
    .insert(inserts)
    .select("id");

  if (error) {
    console.error("[flowise/import] insert error:", error);
    return NextResponse.json({ error: "Failed to import transactions" }, { status: 500 });
  }

  // Recompute balance from source of truth — handles partial inserts correctly.
  try {
    await syncAccountBalance(supabase, account_id, user.id);
  } catch (syncErr) {
    console.error("[flowise/import] balance sync failed (rows were imported):", syncErr);
  }

  return NextResponse.json({
    imported: inserted?.length ?? 0,
    duplicates_skipped: skipped,
    categories_assigned: categories.filter(Boolean).length,
  });
}
