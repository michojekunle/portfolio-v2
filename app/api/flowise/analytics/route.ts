import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const monthsRaw = parseInt(request.nextUrl.searchParams.get("months") ?? "3", 10);
  const clampedMonths = Math.min(Math.max(isNaN(monthsRaw) ? 3 : monthsRaw, 1), 12);

  // Date range: start of (clampedMonths ago) → today, using local dates throughout
  // to avoid UTC/local year-boundary mismatch on Dec 31 in UTC+offset timezones.
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - clampedMonths + 1, 1);
  const pad = (n: number): string => String(n).padStart(2, "0");
  const startStr = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-01`;
  const endStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  // Fetch transactions in range — limit to 2000 to bound memory on edge runtime
  const { data: txRows, error } = await supabase
    .from("fw_transactions")
    .select("date, amount, category_id")
    .eq("user_id", user.id)
    .gte("date", startStr)
    .lte("date", endStr)
    .order("date", { ascending: true })
    .limit(2000);

  if (error) {
    console.error("[flowise/analytics] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }

  const rows = txRows ?? [];

  // Daily spend map for heatmap (YYYY-MM-DD → total expenses)
  const dailySpend: Record<string, number> = {};
  // Monthly income/expense for trend chart
  const monthlyTrend: Record<string, { income: number; expenses: number }> = {};
  // Category breakdown across the entire requested range
  const categoryBreak: Record<string, number> = {};

  for (const row of rows) {
    const date = row.date as string;
    const amount = row.amount as number;
    const month = date.slice(0, 7);

    if (!monthlyTrend[month]) monthlyTrend[month] = { income: 0, expenses: 0 };
    if (amount > 0) {
      monthlyTrend[month].income += amount;
    } else {
      const abs = Math.abs(amount);
      monthlyTrend[month].expenses += abs;
      // Daily heatmap
      dailySpend[date] = (dailySpend[date] ?? 0) + abs;
      // Category breakdown covers full requested range
      const catId = (row.category_id as string | null) ?? "other";
      categoryBreak[catId] = (categoryBreak[catId] ?? 0) + abs;
    }
  }

  return NextResponse.json({
    daily_spend: dailySpend,
    monthly_trend: monthlyTrend,
    category_breakdown: categoryBreak,
    date_range: { start: startStr, end: endStr },
  });
}
