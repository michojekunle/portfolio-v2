import type { FwTransaction, FwAccount, MonthlyStats } from "./types";

export function getMonthRange(yearMonth: string): { start: string; end: string } {
  const [year, month] = yearMonth.split("-").map(Number);
  const start = `${yearMonth}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${yearMonth}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export function getCurrentMonthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getLastMonthKey(): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - 1);
  return d.toISOString().slice(0, 7);
}

export function computeMonthlyStats(
  transactions: FwTransaction[],
  categories: Array<{ id: string; name: string; icon: string }>,
): MonthlyStats {
  let income = 0;
  let expenses = 0;
  const categoryTotals: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.amount > 0) {
      income += tx.amount;
    } else {
      const abs = Math.abs(tx.amount);
      expenses += abs;
      if (tx.category_id) {
        categoryTotals[tx.category_id] = (categoryTotals[tx.category_id] ?? 0) + abs;
      }
    }
  }

  const net = income - expenses;
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;

  let topCategory: MonthlyStats["topCategory"] = null;
  let topAmount = 0;
  for (const [catId, amount] of Object.entries(categoryTotals)) {
    if (amount > topAmount) {
      topAmount = amount;
      const cat = categories.find((c) => c.id === catId);
      if (cat) {
        topCategory = { name: cat.name, icon: cat.icon, amount };
      }
    }
  }

  return {
    income,
    expenses,
    net,
    savingsRate,
    topCategory,
    transactionCount: transactions.length,
  };
}

export function computeNetWorth(accounts: FwAccount[]): number {
  return accounts
    .filter((a) => !a.is_archived && a.currency === "NGN")
    .reduce((sum, a) => sum + a.current_balance, 0);
}

export function formatCurrency(
  amount: number,
  currency: string = "NGN",
  compact: boolean = false,
): string {
  const symbols: Record<string, string> = {
    NGN: "₦", USD: "$", GBP: "£", EUR: "€", GHS: "₵", KES: "KSh",
  };
  const symbol = symbols[currency] ?? currency;
  const abs = Math.abs(amount);

  if (compact && abs >= 1_000_000) {
    return `${amount < 0 ? "-" : ""}${symbol}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (compact && abs >= 1_000) {
    return `${amount < 0 ? "-" : ""}${symbol}${(abs / 1_000).toFixed(1)}K`;
  }

  return `${amount < 0 ? "-" : ""}${symbol}${abs.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
