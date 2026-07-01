import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const months = parseInt(request.nextUrl.searchParams.get("months") ?? "3", 10);
  const clampedMonths = Math.min(Math.max(months, 1), 12);

  // Date range: start of (clampedMonths ago) → today
  const now = new Date();
  const startDate = new Date(now.getUTCFullYear(), now.getUTCMonth() - clampedMonths + 1, 1);
  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = now.toISOString().slice(0, 10);

  // Fetch all transactions in range
  const { data: txRows, error } = await supabase
    .from("fw_transactions")
    .select("date, amount, category_id")
    .eq("user_id", user.id)
    .gte("date", startStr)
    .lte("date", endStr)
    .order("date", { ascending: true });

  if (error) {
    console.error("[flowise/analytics] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }

  const rows = txRows ?? [];

  // Daily spend map for heatmap (YYYY-MM-DD → total expenses)
  const dailySpend: Record<string, number> = {};
  // Monthly income/expense for trend chart
  const monthlyTrend: Record<string, { income: number; expenses: number }> = {};
  // Category breakdown (last full month)
  const categoryBreak: Record<string, number> = {};

  const currentMonth = now.toISOString().slice(0, 7);

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
      // Category breakdown: current month only
      if (month === currentMonth) {
        const catId = (row.category_id as string | null) ?? "other";
        categoryBreak[catId] = (categoryBreak[catId] ?? 0) + abs;
      }
    }
  }

  return NextResponse.json({
    daily_spend: dailySpend,
    monthly_trend: monthlyTrend,
    category_breakdown: categoryBreak,
    date_range: { start: startStr, end: endStr },
  });
}
