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
  const { data: account, error: accountErr } = await supabase
    .from("fw_accounts")
    .select("starting_balance")
    .eq("id", accountId)
    .eq("user_id", userId)
    .single();

  if (accountErr) {
    console.error("[flowise/balance] syncAccountBalance account SELECT failed:", accountErr);
    throw new Error(`Failed to fetch account ${accountId}: ${accountErr.message}`);
  }
  if (!account) return;

  const { data: txs, error: txErr } = await supabase
    .from("fw_transactions")
    .select("amount")
    .eq("account_id", accountId)
    .eq("user_id", userId);

  if (txErr) {
    console.error("[flowise/balance] syncAccountBalance transactions SELECT failed:", txErr);
    throw new Error(`Failed to fetch transactions for account ${accountId}: ${txErr.message}`);
  }

  const txTotal = (txs ?? []).reduce((s, t) => s + (t.amount as number), 0);

  const { error } = await supabase
    .from("fw_accounts")
    .update({ current_balance: (account.starting_balance as number) + txTotal })
    .eq("id", accountId)
    .eq("user_id", userId);

  if (error) {
    console.error("[flowise/balance] syncAccountBalance UPDATE failed:", error);
    throw new Error(`Failed to sync balance for account ${accountId}: ${error.message}`);
  }
}
