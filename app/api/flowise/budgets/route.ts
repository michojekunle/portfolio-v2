import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpsertSchema = z.object({
  category_id: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be YYYY-MM"),
  amount: z.number().min(0),
  rollover_enabled: z.boolean().default(false),
});

const DeleteSchema = z.object({
  category_id: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const month = request.nextUrl.searchParams.get("month");
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "month param required (YYYY-MM)" }, { status: 400 });
  }

  // Fetch budgets for the month
  const { data: budgets, error } = await supabase
    .from("fw_budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", month);

  if (error) {
    console.error("[flowise/budgets] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }

  // Fetch actual spend per category for the month
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const { data: txRows, error: txErr } = await supabase
    .from("fw_transactions")
    .select("category_id, amount")
    .eq("user_id", user.id)
    .lt("amount", 0)
    .gte("date", `${month}-01`)
    .lte("date", `${month}-${String(lastDay).padStart(2, "0")}`);

  if (txErr) {
    console.error("[flowise/budgets] spend query error:", txErr);
  }

  const spendByCategory: Record<string, number> = {};
  for (const row of txRows ?? []) {
    const catId = row.category_id as string | null;
    if (catId) {
      spendByCategory[catId] = (spendByCategory[catId] ?? 0) + Math.abs(row.amount as number);
    }
  }

  const enriched = (budgets ?? []).map((b) => ({
    ...b,
    spent: spendByCategory[b.category_id as string] ?? 0,
  }));

  return NextResponse.json({ budgets: enriched, spend_by_category: spendByCategory });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("fw_budgets")
    .upsert(
      { ...parsed.data, user_id: user.id },
      { onConflict: "user_id,category_id,month" },
    )
    .select()
    .single();

  if (error) {
    console.error("[flowise/budgets] POST upsert error:", error);
    return NextResponse.json({ error: "Failed to save budget" }, { status: 500 });
  }

  return NextResponse.json({ budget: data }, { status: 201 });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = DeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { error } = await supabase
    .from("fw_budgets")
    .delete()
    .eq("user_id", user.id)
    .eq("category_id", parsed.data.category_id)
    .eq("month", parsed.data.month);

  if (error) {
    console.error("[flowise/budgets] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete budget" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
