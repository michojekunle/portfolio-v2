export type AccountType = "bank" | "wallet" | "cash" | "investment" | "credit";

export type TransactionSource = "manual" | "csv_import" | "ai_scan";

export type RecurrenceRule = "daily" | "weekly" | "biweekly" | "monthly" | "yearly";

export const CURRENCIES = ["NGN", "USD", "GBP", "EUR", "GHS", "KES"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  GHS: "₵",
  KES: "KSh",
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank: "Bank Account",
  wallet: "Mobile Wallet",
  cash: "Cash",
  investment: "Investment",
  credit: "Credit Card",
};

export const NIGERIAN_PROVIDERS = [
  "GTBank",
  "Access Bank",
  "Zenith Bank",
  "UBA",
  "First Bank",
  "OPay",
  "PalmPay",
  "Kuda",
  "Moniepoint",
  "Carbon",
  "Cowrywise",
  "PiggyVest",
  "Chipper Cash",
  "Flutterwave",
  "Other",
] as const;

export interface FwAccount {
  id: string;
  user_id: string;
  name: string;
  provider: string | null;
  type: AccountType;
  currency: Currency;
  starting_balance: number;
  current_balance: number;
  color: string;
  icon: string;
  is_archived: boolean;
  created_at: string;
}

export const SYSTEM_CATEGORIES = [
  { id: "food_dining", name: "Food & Dining", icon: "🍽️", color: "#F97316" },
  { id: "transport", name: "Transport", icon: "🚗", color: "#8B5CF6" },
  { id: "airtime_data", name: "Airtime & Data", icon: "📱", color: "#06B6D4" },
  { id: "utilities", name: "Utilities", icon: "💡", color: "#EAB308" },
  { id: "rent_housing", name: "Rent & Housing", icon: "🏠", color: "#6366F1" },
  { id: "clothing", name: "Clothing", icon: "👕", color: "#EC4899" },
  { id: "health", name: "Health", icon: "❤️", color: "#EF4444" },
  { id: "entertainment", name: "Entertainment", icon: "🎮", color: "#10B981" },
  { id: "education", name: "Education", icon: "📚", color: "#3B82F6" },
  { id: "savings", name: "Savings", icon: "💰", color: "#16A34A" },
  { id: "salary", name: "Salary", icon: "💼", color: "#16A34A" },
  { id: "business", name: "Business Income", icon: "📈", color: "#059669" },
  { id: "transfer", name: "Transfer", icon: "↔️", color: "#6B7280" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "#F59E0B" },
  { id: "travel", name: "Travel", icon: "✈️", color: "#0EA5E9" },
  { id: "subscriptions", name: "Subscriptions", icon: "🔄", color: "#7C3AED" },
  { id: "gifts", name: "Gifts & Donations", icon: "🎁", color: "#DB2777" },
  { id: "investment_in", name: "Investment", icon: "📊", color: "#0D9488" },
  { id: "family", name: "Family", icon: "👨‍👩‍👧", color: "#B45309" },
  { id: "other", name: "Other", icon: "📌", color: "#6B7280" },
] as const;

export type SystemCategoryId = (typeof SYSTEM_CATEGORIES)[number]["id"];

export interface FwCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  parent_id: string | null;
  is_system: boolean;
  created_at: string;
}

export interface FwTransaction {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  category_id: string | null;
  date: string;
  description: string;
  note: string | null;
  tags: string[];
  is_recurring: boolean;
  recurrence_rule: RecurrenceRule | null;
  source: TransactionSource;
  raw_import_ref: string | null;
  created_at: string;
  // Joined fields
  account?: Pick<FwAccount, "name" | "color" | "currency" | "icon">;
  category?: Pick<FwCategory, "name" | "icon" | "color">;
}

export interface FwBudget {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  amount: number;
  rollover_enabled: boolean;
  created_at: string;
  // Joined
  category?: Pick<FwCategory, "name" | "icon" | "color">;
  spent?: number;
}

export interface FwGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  linked_account_id: string | null;
  color: string;
  icon: string;
  is_completed: boolean;
  created_at: string;
}

export interface FwTransfer {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

export interface MonthlyStats {
  income: number;
  expenses: number;
  net: number;
  savingsRate: number;
  topCategory: { name: string; icon: string; amount: number } | null;
  transactionCount: number;
}

export interface DashboardData {
  accounts: FwAccount[];
  recentTransactions: FwTransaction[];
  thisMonth: MonthlyStats;
  lastMonth: MonthlyStats;
  netWorth: number;
}

export const FREE_ACCOUNT_LIMIT = 3;
export const FREE_TRANSACTION_MONTHLY_LIMIT = 100;
export const FREE_GOAL_LIMIT = 3;

export const FINANCIAL_PERSONAS = [
  "saver",
  "spender",
  "planner",
  "avoider",
  "hustler",
] as const;
export type FinancialPersona = (typeof FINANCIAL_PERSONAS)[number];

export const PERSONA_CONFIG: Record<FinancialPersona, { label: string; blurb: string; icon: string }> = {
  saver: { label: "The Saver", blurb: "You'd rather stash it than spend it — we'll help you find the best home for it.", icon: "🐷" },
  spender: { label: "The Spender", blurb: "Money flows freely — we'll help you keep enough guardrails to hit your goals.", icon: "💳" },
  planner: { label: "The Planner", blurb: "You like a clear budget and a plan for every naira — we'll keep it structured.", icon: "🗂️" },
  avoider: { label: "The Avoider", blurb: "Finances feel overwhelming — we'll keep things simple and low-pressure.", icon: "🙈" },
  hustler: { label: "The Hustler", blurb: "Income is irregular and comes from multiple places — we'll help you smooth it out.", icon: "🚀" },
};

export interface FwProfile {
  user_id: string;
  persona: FinancialPersona | null;
  primary_goal: string | null;
  income_type: string | null;
  monthly_income_range: string | null;
  currency: Currency;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuggestedBudget {
  category_id: SystemCategoryId;
  amount: number;
}

export interface SuggestedGoal {
  name: string;
  target_amount: number;
  deadline: string | null;
}
