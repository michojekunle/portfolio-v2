import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  // Fetch old transaction to adjust account balance
  const { data: oldTx } = await supabase
    .from("fw_transactions")
    .select("account_id, amount")
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

  // Recalculate account balance if amount or account changed
  const amountChanged = parsed.data.amount !== undefined && parsed.data.amount !== (oldTx.amount as number);
  const accountChanged = parsed.data.account_id !== undefined && parsed.data.account_id !== (oldTx.account_id as string);

  if (amountChanged || accountChanged) {
    const newAmount = parsed.data.amount ?? (oldTx.amount as number);
    const oldAccountId = oldTx.account_id as string;
    const newAccountId = parsed.data.account_id ?? oldAccountId;

    if (accountChanged) {
      // Revert old account
      const { data: oldAccount } = await supabase
        .from("fw_accounts")
        .select("current_balance")
        .eq("id", oldAccountId)
        .eq("user_id", user.id)
        .single();
      if (oldAccount) {
        await supabase
          .from("fw_accounts")
          .update({ current_balance: (oldAccount.current_balance as number) - (oldTx.amount as number) })
          .eq("id", oldAccountId)
          .eq("user_id", user.id);
      }
      // Apply to new account
      const { data: newAccount } = await supabase
        .from("fw_accounts")
        .select("current_balance")
        .eq("id", newAccountId)
        .eq("user_id", user.id)
        .single();
      if (newAccount) {
        await supabase
          .from("fw_accounts")
          .update({ current_balance: (newAccount.current_balance as number) + newAmount })
          .eq("id", newAccountId)
          .eq("user_id", user.id);
      }
    } else {
      // Same account, just adjust by the diff
      const diff = newAmount - (oldTx.amount as number);
      const { data: account } = await supabase
        .from("fw_accounts")
        .select("current_balance")
        .eq("id", oldAccountId)
        .eq("user_id", user.id)
        .single();
      if (account) {
        await supabase
          .from("fw_accounts")
          .update({ current_balance: (account.current_balance as number) + diff })
          .eq("id", oldAccountId)
          .eq("user_id", user.id);
      }
    }
  }

  return NextResponse.json({ transaction: tx });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch first to reverse the balance
  const { data: tx } = await supabase
    .from("fw_transactions")
    .select("account_id, amount")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!tx) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("fw_transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[flowise/transactions/[id]] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }

  // Revert balance
  const { data: account } = await supabase
    .from("fw_accounts")
    .select("current_balance")
    .eq("id", tx.account_id as string)
    .eq("user_id", user.id)
    .single();

  if (account) {
    await supabase
      .from("fw_accounts")
      .update({ current_balance: (account.current_balance as number) - (tx.amount as number) })
      .eq("id", tx.account_id as string)
      .eq("user_id", user.id);
  }

  return NextResponse.json({ success: true });
}
