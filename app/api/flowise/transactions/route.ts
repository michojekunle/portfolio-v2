import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { syncAccountBalance } from "@/lib/flowise/balance";

const CreateSchema = z.object({
  account_id: z.string().uuid(),
  amount: z.number().refine((n) => n !== 0, "Amount cannot be zero"),
  category_id: z.string().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  description: z.string().min(1).max(200),
  note: z.string().max(1000).nullable().optional(),
  tags: z.array(z.string().max(40)).max(10).default([]),
  is_recurring: z.boolean().default(false),
  recurrence_rule: z.enum(["daily", "weekly", "biweekly", "monthly", "yearly"]).nullable().optional(),
  source: z.enum(["manual", "csv_import", "ai_scan"]).default("manual"),
  raw_import_ref: z.string().nullable().optional(),
});

const ListSchema = z.object({
  account_id: z.string().uuid().optional(),
  category_id: z.string().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = ListSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { account_id, category_id, month, limit, offset } = parsed.data;

  // No fw_categories join — system categories aren't in the DB, which would
  // cause a PostgREST "could not find relationship" error. Resolved client-side.
  let query = supabase
    .from("fw_transactions")
    .select("*, account:fw_accounts(name, color, currency, icon)", { count: "exact" })
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (account_id) query = query.eq("account_id", account_id);
  if (category_id) query = query.eq("category_id", category_id);
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const lastDay = new Date(year, mon, 0).getDate();
    query = query
      .gte("date", `${month}-01`)
      .lte("date", `${month}-${String(lastDay).padStart(2, "0")}`);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[flowise/transactions] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }

  return NextResponse.json({ transactions: data ?? [], total: count ?? 0 });
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

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { data: account } = await supabase
    .from("fw_accounts")
    .select("id")
    .eq("id", parsed.data.account_id)
    .eq("user_id", user.id)
    .single();

  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const { data: tx, error: txError } = await supabase
    .from("fw_transactions")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (txError) {
    console.error("[flowise/transactions] POST insert error:", txError);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }

  // Recompute balance from source of truth — idempotent and self-healing.
  await syncAccountBalance(supabase, parsed.data.account_id, user.id);

  return NextResponse.json({ transaction: tx }, { status: 201 });
}
