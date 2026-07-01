import { createClient } from "@/lib/supabase/server";
import type { FwAccount, FwTransaction, FwCategory, FwGoal, FwBudget } from "./types";
import { SYSTEM_CATEGORIES } from "./types";
import { getMonthRange } from "./calculator";

export async function getUserAccounts(): Promise<FwAccount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fw_accounts")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[flowise] getUserAccounts error:", error);
    return [];
  }
  return (data ?? []) as FwAccount[];
}

export async function getUserCategories(): Promise<FwCategory[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return getSystemCategories();

  const { data, error } = await supabase
    .from("fw_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("[flowise] getUserCategories error:", error);
  }

  const userCats = (data ?? []) as FwCategory[];
  const sysCats = getSystemCategories();
  const userIds = new Set(userCats.filter((c) => c.is_system).map((c) => c.id));
  const merged = [...sysCats.filter((s) => !userIds.has(s.id)), ...userCats];
  return merged.sort((a, b) => a.name.localeCompare(b.name));
}

function getSystemCategories(): FwCategory[] {
  const now = new Date().toISOString();
  return SYSTEM_CATEGORIES.map((c) => ({
    id: c.id,
    user_id: "system",
    name: c.name,
    icon: c.icon,
    color: c.color,
    parent_id: null,
    is_system: true,
    created_at: now,
  }));
}

export async function getTransactions(opts: {
  accountId?: string;
  categoryId?: string;
  month?: string;
  limit?: number;
  offset?: number;
}): Promise<FwTransaction[]> {
  const supabase = await createClient();
  // Intentionally no fw_categories join — system categories have no DB rows
  // and would cause a PostgREST relationship error. Category info is resolved
  // client-side via the categories prop + SYSTEM_CATEGORIES.
  let query = supabase
    .from("fw_transactions")
    .select("*, account:fw_accounts(name, color, currency, icon)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (opts.accountId) query = query.eq("account_id", opts.accountId);
  if (opts.categoryId) query = query.eq("category_id", opts.categoryId);
  if (opts.month) {
    const { start, end } = getMonthRange(opts.month);
    query = query.gte("date", start).lte("date", end);
  }
  if (opts.limit) query = query.limit(opts.limit);
  if (opts.offset) query = query.range(opts.offset, opts.offset + (opts.limit ?? 50) - 1);

  const { data, error } = await query;
  if (error) {
    console.error("[flowise] getTransactions error:", error);
    return [];
  }
  return (data ?? []) as FwTransaction[];
}

export async function getGoals(): Promise<FwGoal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fw_goals")
    .select("*")
    .eq("is_completed", false)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[flowise] getGoals error:", error);
    return [];
  }
  return (data ?? []) as FwGoal[];
}

export async function getBudgets(month: string): Promise<FwBudget[]> {
  const supabase = await createClient();
  // No fw_categories join — system categories aren't in the DB.
  // BudgetsClient resolves category display using SYSTEM_CATEGORIES locally.
  const { data, error } = await supabase
    .from("fw_budgets")
    .select("*")
    .eq("month", month);

  if (error) {
    console.error("[flowise] getBudgets error:", error);
    return [];
  }
  return (data ?? []) as FwBudget[];
}
