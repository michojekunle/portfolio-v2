"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { FwAccount, FwTransaction, FwCategory, MonthlyStats } from "@/lib/flowise/types";
import { formatCurrency } from "@/lib/flowise/calculator";
import { usePrivacy, Amount } from "@/components/flowise/PrivacyProvider";
import { TransactionForm } from "./TransactionForm";
import { ReceiptScanner } from "./ReceiptScanner";
import { TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownLeft, ChevronRight, Camera } from "lucide-react";
import Link from "next/link";

const ACCENT = "#16A34A";

interface Props {
  accounts: FwAccount[];
  recentTransactions: FwTransaction[];
  categories: FwCategory[];
  thisMonth: MonthlyStats;
  lastMonth: MonthlyStats;
  netWorth: number;
}

export function FwDashboardClient({
  accounts: initialAccounts,
  recentTransactions: initialTransactions,
  categories,
  thisMonth,
  lastMonth,
  netWorth: initialNetWorth,
}: Props): React.ReactElement {
  const { hidden } = usePrivacy();
const router = useRouter();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [stats, setStats] = useState({ thisMonth, lastMonth });
  const netWorth = accounts.filter(a => !a.is_archived)
    .reduce((s, a) => s + a.current_balance, 0);

  // Resync from fresh server props on re-render — useState(initialX) only seeds
  // once, so a reused component instance across a soft navigation would
  // otherwise keep showing whatever was true when it first mounted.
  useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]);
  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);
  useEffect(() => {
    setStats({ thisMonth, lastMonth });
  }, [thisMonth, lastMonth]);

  const handleTransactionCreated = useCallback((tx: FwTransaction): void => {
    setTransactions((prev) => [tx, ...prev].slice(0, 10));
    // Update the account balance locally
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === tx.account_id
          ? { ...a, current_balance: a.current_balance + tx.amount }
          : a,
      ),
    );
    // Optimistically update month stats (recompute net and savingsRate in one place)
    setStats((s) => {
      const income = s.thisMonth.income + (tx.amount > 0 ? tx.amount : 0);
      const expenses = s.thisMonth.expenses + (tx.amount < 0 ? Math.abs(tx.amount) : 0);
      const net = income - expenses;
      const savingsRate = income > 0 ? Math.round((net / income) * 100) : 0;
      return {
        ...s,
        thisMonth: {
          ...s.thisMonth,
          income,
          expenses,
          net,
          savingsRate,
          transactionCount: s.thisMonth.transactionCount + 1,
        },
      };
    });
    setShowForm(false);
    // Refresh server data so other pages (e.g. Transactions) don't serve a stale
    // cached render that predates this transaction when navigated to next.
    router.refresh();
  }, [router]);

  const incomeChange =
    lastMonth.income > 0
      ? Math.round(((stats.thisMonth.income - lastMonth.income) / lastMonth.income) * 100)
      : 0;
  const expenseChange =
    lastMonth.expenses > 0
      ? Math.round(((stats.thisMonth.expenses - lastMonth.expenses) / lastMonth.expenses) * 100)
      : 0;

  return (
    <div className="px-10 pt-12 pb-15 max-256:pt-20 max-180:px-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
        <div>
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-(--ink-4) mb-1.5">
            {new Date().toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
          </div>
          <h1
            className="font-display font-normal text-[40px] max-180:text-[28px] leading-[1.05] tracking-[-0.03em] fvs-text m-0 text-(--ink)"
          >
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScanner(true)}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-all duration-200 hover:bg-(--bg-3) cursor-pointer"
            style={{ background: "var(--bg-2)", color: "var(--ink-2)", border: "1px solid var(--rule)" }}
            title="Scan a receipt or bank alert"
          >
            <Camera size={14} />
            Scan
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-white transition-all duration-200 hover:opacity-90 border-none cursor-pointer"
            style={{ background: ACCENT }}
          >
            <Plus size={14} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 max-[900px]:grid-cols-1 gap-4 mb-10">
        <SummaryCard
          label="Net Worth"
          value={(hidden ? "****" : formatCurrency(netWorth, "NGN"))}
          sub={accounts.length === 0 ? "No accounts yet" : `${accounts.length} account${accounts.length !== 1 ? "s" : ""}`}
          accent={netWorth >= 0 ? ACCENT : "#DC2626"}
        />
        <SummaryCard
          label="Income this month"
          value={(hidden ? "****" : formatCurrency(stats.thisMonth.income, "NGN"))}
          change={incomeChange}
          sub={incomeChange !== 0 ? `vs last month` : "vs last month"}
          accent={ACCENT}
          positive
        />
        <SummaryCard
          label="Expenses this month"
          value={(hidden ? "****" : formatCurrency(stats.thisMonth.expenses, "NGN"))}
          change={expenseChange}
          sub={expenseChange !== 0 ? `vs last month` : "vs last month"}
          accent="#DC2626"
          positive={false}
        />
      </div>

      {/* Two-col layout */}
      <div className="grid grid-cols-[1fr_320px] max-[1200px]:grid-cols-1 gap-6">
        {/* Recent Transactions */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text m-0 text-(--ink)">
              Recent Transactions
            </h2>
            <Link
              href="/tools/flowise/transactions"
              className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] uppercase no-underline transition-colors"
              style={{ color: ACCENT }}
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              body='Click "Add Transaction" to log your first one.'
              onAction={() => setShowForm(true)}
              actionLabel="Add Transaction"
            />
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--rule)" }}
            >
              {transactions.map((tx, i) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  last={i === transactions.length - 1}
                  categories={categories}
                />
              ))}
            </div>
          )}
        </section>

        {/* Accounts */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text m-0 text-(--ink)">
              Accounts
            </h2>
            <Link
              href="/tools/flowise/accounts"
              className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.12em] uppercase no-underline transition-colors"
              style={{ color: ACCENT }}
            >
              Manage <ChevronRight size={12} />
            </Link>
          </div>

          {accounts.length === 0 ? (
            <EmptyState
              title="No accounts"
              body="Add a bank or wallet account to track balances."
              href="/tools/flowise/accounts"
              actionLabel="Add Account"
            />
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <AccountSummaryCard key={account.id} account={account} />
              ))}
            </div>
          )}

          {/* Month savings rate */}
          {stats.thisMonth.income > 0 && (
            <div
              className="mt-4 rounded-xl px-5 py-4"
              style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)" }}
            >
              <div className="font-mono text-[9px] tracking-[0.14em] uppercase mb-1" style={{ color: ACCENT }}>
                Savings Rate
              </div>
              <div className="font-display text-[28px] font-normal tracking-[-0.02em] fvs-text" style={{ color: ACCENT }}>
                {stats.thisMonth.savingsRate}%
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                {(hidden ? "****" : formatCurrency(stats.thisMonth.net, "NGN"))} saved this month
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Add transaction modal */}
      {showForm && (
        <TransactionForm
          accounts={accounts}
          categories={categories}
          onCreated={handleTransactionCreated}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Receipt / bank alert scanner modal */}
      {showScanner && (
        <ReceiptScanner
          accounts={accounts}
          categories={categories}
          onClose={() => setShowScanner(false)}
          onTransactionAdded={handleTransactionCreated}
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  change,
  accent,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  change?: number;
  accent: string;
  positive?: boolean;
}): React.ReactElement {
  const { hidden, toggle } = usePrivacy();

  const isUp = (change ?? 0) > 0;
  const isDown = (change ?? 0) < 0;
  const changeColor =
    change === undefined
      ? "var(--ink-3)"
      : positive
        ? isUp ? "#16A34A" : isDown ? "#DC2626" : "var(--ink-3)"
        : isUp ? "#DC2626" : isDown ? "#16A34A" : "var(--ink-3)";

  return (
    <div
      className="rounded-[14px] px-6 py-5"
      style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}
    >
      <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2.5">
        {label}
      </div>
      <div
        onClick={toggle}
        className="font-display text-[28px] max-180:text-[22px] font-normal tracking-[-0.02em] fvs-text leading-none cursor-pointer hover:opacity-80 transition-opacity"
        style={{ color: accent }}
      >
        {value}
      </div>
      {(sub ?? change !== undefined) && (
        <div className="flex items-center gap-1.5 mt-2">
          {change !== undefined && (
            <span className="inline-flex items-center gap-0.5 font-mono text-[10px] font-semibold" style={{ color: changeColor }}>
              {isUp ? <TrendingUp size={10} /> : isDown ? <TrendingDown size={10} /> : null}
              {change > 0 ? "+" : ""}{change}%
            </span>
          )}
          {sub && (
            <span className="font-mono text-[10px] text-(--ink-4)">{sub}</span>
          )}
        </div>
      )}
    </div>
  );
}

function TransactionRow({
  tx,
  last,
  categories,
}: {
  tx: FwTransaction;
  last: boolean;
  categories: FwCategory[];
}): React.ReactElement {
  const { hidden } = usePrivacy();

  const cat = tx.category
    ? tx.category
    : categories.find((c) => c.id === tx.category_id);

  const isIncome = tx.amount > 0;
  const date = new Date(tx.date + "T00:00:00Z");

  return (
    <div
      className="flex items-center gap-3.5 px-4 py-3.5 bg-(--bg) hover:bg-(--bg-2) transition-colors"
      style={{ borderBottom: last ? undefined : "1px solid var(--rule)" }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-[16px] shrink-0"
        style={{ background: cat?.color ? `${cat.color}18` : "var(--bg-2)" }}
      >
        {cat?.icon ?? (isIncome ? "💰" : "💸")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-(--ink) truncate">{tx.description}</div>
        <div className="font-mono text-[10px] text-muted-foreground mt-0.25">
          {cat?.name ?? "Uncategorized"} · {date.toLocaleDateString("en-NG", { month: "short", day: "numeric", timeZone: "UTC" })}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div
          className="text-[15px] font-semibold tabular-nums"
          style={{ color: isIncome ? "#16A34A" : "var(--ink)" }}
        >
          {isIncome ? "+" : "−"}{hidden ? "****" : formatCurrency(Math.abs(tx.amount), tx.account?.currency ?? "NGN")}
        </div>
        {tx.account && (
          <div className="font-mono text-[9px] text-(--ink-4) mt-0.25">
            {tx.account.icon} {tx.account.name}
          </div>
        )}
      </div>
    </div>
  );
}

function AccountSummaryCard({ account }: { account: FwAccount }): React.ReactElement {
  const { hidden, toggle } = usePrivacy();

  const currencySymbols: Record<string, string> = {
    NGN: "₦", USD: "$", GBP: "£", EUR: "€", GHS: "₵", KES: "KSh",
  };
  const symbol = currencySymbols[account.currency] ?? account.currency;
  const isPositive = account.current_balance >= 0;

  return (
    <div
      className="rounded-xl px-4 py-3.5 flex items-center gap-3"
      style={{ border: "1px solid var(--rule)", background: "var(--bg)" }}
    >
      <div
        className="w-9.5 h-9.5 rounded-lg flex items-center justify-center text-[18px] shrink-0"
        style={{ background: `${account.color}18` }}
      >
        {account.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-(--ink) truncate">{account.name}</div>
        <div className="font-mono text-[10px] text-muted-foreground capitalize">{account.type}</div>
      </div>
      <div
        onClick={toggle}
        className="font-display text-[18px] font-normal tracking-[-0.01em] fvs-text tabular-nums shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        style={{ color: isPositive ? "var(--ink)" : "#DC2626" }}
      >
        <Amount value={account.current_balance} currency={account.currency} />
      </div>
    </div>
  );
}

function EmptyState({
  title,
  body,
  onAction,
  href,
  actionLabel,
}: {
  title: string;
  body: string;
  onAction?: () => void;
  href?: string;
  actionLabel: string;
}): React.ReactElement {
  return (
    <div
      className="rounded-xl px-6 py-10 text-center"
      style={{ border: "1px dashed var(--rule)" }}
    >
      <div className="text-[32px] mb-3">💸</div>
      <div className="text-[15px] font-medium text-(--ink) mb-1.5">{title}</div>
      <div className="text-[13px] text-muted-foreground mb-5 max-w-[30ch] mx-auto leading-normal">{body}</div>
      {onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-white border-none cursor-pointer"
          style={{ background: ACCENT }}
        >
          <Plus size={12} />
          {actionLabel}
        </button>
      ) : href ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-white no-underline"
          style={{ background: ACCENT }}
        >
          <Plus size={12} />
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
