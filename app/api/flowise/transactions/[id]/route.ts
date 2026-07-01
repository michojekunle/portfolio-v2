import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { syncAccountBalance } from "@/lib/flowise/balance";

const UpdateSchema = z.object({
  account_id: z.string().uuid().optional(),
  amount: z.number().refine((n) => n !== 0, "Amount cannot be zero").optional(),
  category_id: z.string().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  description: z.string().min(1).max(200).optional(),
  note: z.string().max(1000).nullable().optional(),
  tags: z.array(z.string().max(40)).max(10).optional(),
  is_recurring: z.boolean().optional(),
  recurrence_rule: z.enum(["daily", "weekly", "biweekly", "monthly", "yearly"]).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // Fetch original to know which account(s) to resync after update.
  const { data: oldTx } = await supabase
    .from("fw_transactions")
    .select("account_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!oldTx) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const { data: tx, error } = await supabase
    .from("fw_transactions")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[flowise/transactions/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }

  // Resync the old account. If the account changed, also resync the new one.
  const oldAccountId = oldTx.account_id as string;
  const newAccountId = parsed.data.account_id;

  await syncAccountBalance(supabase, oldAccountId, user.id);
  if (newAccountId && newAccountId !== oldAccountId) {
    await syncAccountBalance(supabase, newAccountId, user.id);
  }

  return NextResponse.json({ transaction: tx });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: tx } = await supabase
    .from("fw_transactions")
    .select("account_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!tx) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const accountId = tx.account_id as string;

  const { error } = await supabase
    .from("fw_transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[flowise/transactions/[id]] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }

  // Resync after delete — balance will reflect the removed transaction.
  await syncAccountBalance(supabase, accountId, user.id);

  return NextResponse.json({ success: true });
}
