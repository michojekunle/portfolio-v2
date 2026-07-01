import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Recomputes current_balance for an account from source of truth:
 *   starting_balance + SUM(all transactions for that account)
 *
 * Idempotent and self-healing — calling it after any write always produces
 * the correct balance even if a previous update failed.
 */
export async function syncAccountBalance(
  supabase: SupabaseClient,
  accountId: string,
  userId: string,
): Promise<void> {
  const { data: account } = await supabase
    .from("fw_accounts")
    .select("starting_balance")
    .eq("id", accountId)
    .eq("user_id", userId)
    .single();

  if (!account) return;

  const { data: txs } = await supabase
    .from("fw_transactions")
    .select("amount")
    .eq("account_id", accountId)
    .eq("user_id", userId);

  const txTotal = (txs ?? []).reduce((s, t) => s + (t.amount as number), 0);

  await supabase
    .from("fw_accounts")
    .update({ current_balance: (account.starting_balance as number) + txTotal })
    .eq("id", accountId)
    .eq("user_id", userId);
}
