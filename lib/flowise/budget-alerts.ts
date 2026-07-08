import type { SupabaseClient } from "@supabase/supabase-js";
import { formatCurrency } from "./calculator";

/**
 * Checks the budget status for a given user, category, and date.
 * Returns a formatted message indicating if the budget is crossed, close to limit, or fine.
 */
export async function checkBudgetStatus(
  supabase: SupabaseClient,
  userId: string,
  categoryId: string,
  dateStr: string,
  currency: string = "NGN"
): Promise<string> {
  const currentMonth = dateStr.slice(0, 7); // "YYYY-MM"
  
  const { data: budget, error: budgetErr } = await supabase
    .from("fw_budgets")
    .select("amount")
    .eq("user_id", userId)
    .eq("category_id", categoryId)
    .eq("month", currentMonth)
    .maybeSingle();

  if (budgetErr) {
    console.error("[flowise/budget-alerts] failed to fetch budget:", budgetErr);
    return "";
  }
  if (!budget) return "";

  const startOfMonth = `${currentMonth}-01`;
  const endOfMonth = `${currentMonth}-31`;

  const { data: txs, error: txErr } = await supabase
    .from("fw_transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("category_id", categoryId)
    .gte("date", startOfMonth)
    .lte("date", endOfMonth);

  if (txErr) {
    console.error("[flowise/budget-alerts] failed to fetch transactions:", txErr);
    return "";
  }

  const totalSpent = (txs ?? []).reduce((acc, t) => acc + Math.abs(t.amount as number), 0);
  const limit = budget.amount as number;

  const fmtAmount = (val: number) => formatCurrency(val, currency);

  if (totalSpent > limit) {
    return `\n\n🚨 *Budget exceeded!* You've spent *${fmtAmount(totalSpent)}* of your *${fmtAmount(limit)}* budget for this category. You're going out of hand! 😱`;
  } else if (totalSpent >= limit * 0.85) {
    return `\n\n⚠️ *Budget warning!* You've spent *${fmtAmount(totalSpent)}* of your *${fmtAmount(limit)}* budget (85%+ used). Watch it, you're getting close to the limit! ⚠️`;
  } else {
    return `\n\n✅ *Status:* You're doing okay! Spent *${fmtAmount(totalSpent)}* of *${fmtAmount(limit)}* budget.`;
  }
}
