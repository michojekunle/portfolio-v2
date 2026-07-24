"use client";

import { useState, useCallback, useEffect } from "react";
import type { FwAccount, FwCategory, FwTransaction } from "@/lib/flowise/types";
import { formatCurrency } from "@/lib/flowise/calculator";
import { usePrivacy, Amount } from "@/components/flowise/PrivacyProvider";
import { TransactionForm } from "./TransactionForm";
import { CSVImportWizard } from "./CSVImportWizard";
import { ReceiptScanner } from "./ReceiptScanner";
import { Plus, Trash2, ChevronLeft, ChevronRight, Upload, Camera } from "lucide-react";

const ACCENT = "#16A34A";
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface Props {
  accounts: FwAccount[];
  categories: FwCategory[];
  initialTransactions: FwTransaction[];
  initialMonth: string;
}

export function TransactionsClient({ accounts, categories, initialTransactions, initialMonth }: Props): React.ReactElement {
  const { hidden } = usePrivacy();
const [transactions, setTransactions] = useState(initialTransactions);
  const [month, setMonth] = useState(initialMonth);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // useState(initialTransactions) only seeds state on first mount — if Next.js
  // reuses this component instance across a soft navigation (e.g. Dashboard →
  // scan → back to Transactions without a full reload), fresh server props
  // land here but get ignored unless we explicitly resync.
  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  const fetchMonth = useCallback(async (m: string): Promise<void> => {
    setLoading(true);
    setMonth(m);
    try {
      const res = await fetch(`/api/flowise/transactions?month=${m}&limit=100`);
      const data = await res.json() as { transactions: FwTransaction[] };
      setTransactions(data.transactions ?? []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const shiftMonth = (delta: number): void => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    fetchMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleCreated = useCallback((tx: FwTransaction): void => {
    const [ty, tm] = tx.date.split("-");
    if (`${ty}-${tm}` === month) {
      setTransactions((prev) => [tx, ...prev]);
    }
    setShowForm(false);
  }, [month]);

  const handleDelete = async (id: string): Promise<void> => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setDeletingId(id);
    setConfirmDeleteId(null);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/flowise/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Delete failed (${res.status})`);
      }
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteError(err instanceof Error ? err.message : "Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const [year, mon] = month.split("-").map(Number);
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="px-10 pt-12 pb-15 max-[1024px]:pt-20 max-[720px]:px-5">
      {deleteError && (
        <div className="mb-4 px-3.5 py-2.5 rounded-[10px] bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.2)] text-[#DC2626] font-mono text-[11px] flex items-center justify-between">
          {deleteError}
          <button onClick={() => setDeleteError(null)} className="ml-3 text-[#DC2626] bg-transparent border-none cursor-pointer opacity-60 hover:opacity-100">✕</button>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.03em] fvs-text m-0 text-(--ink)">
          Transactions
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowScanner(true)} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full font-mono text-[10px] uppercase tracking-[0.12em] font-semibold border-none cursor-pointer" style={{ background: "var(--bg-2)", color: "var(--ink-2)", border: "1px solid var(--rule)" }} title="Scan receipt or bank alert">
            <Camera size={12} /> Scan
          </button>
          <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full font-mono text-[10px] uppercase tracking-[0.12em] font-semibold border-none cursor-pointer" style={{ background: "var(--bg-2)", color: "var(--ink-2)", border: "1px solid var(--rule)" }} title="Import CSV bank statement">
            <Upload size={12} /> Import
          </button>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 h-10 px-4.5 rounded-full font-mono text-[10px] uppercase tracking-[0.14em] font-semibold text-white border-none cursor-pointer" style={{ background: ACCENT }}>
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => shiftMonth(-1)} className="w-8 h-8 rounded-lg flex items-center justify-center border-none bg-transparent cursor-pointer text-secondary-foreground hover:bg-(--bg-2) transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text text-(--ink) min-w-35 text-center">
          {MONTHS[mon - 1]} {year}
        </div>
        <button onClick={() => shiftMonth(1)} disabled={month >= new Date().toISOString().slice(0, 7)} className="w-8 h-8 rounded-lg flex items-center justify-center border-none bg-transparent cursor-pointer text-secondary-foreground hover:bg-(--bg-2) transition-colors disabled:opacity-30">
          <ChevronRight size={16} />
        </button>

        <div className="flex gap-3 ml-auto">
          <span className="font-mono text-[11px] text-muted-foreground">
            In: <span style={{ color: ACCENT }}>+{(hidden ? "****" : formatCurrency(income, "NGN", true))}</span>
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            Out: <span style={{ color: "#DC2626" }}>−{(hidden ? "****" : formatCurrency(expenses, "NGN", true))}</span>
          </span>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-15 text-muted-foreground font-mono text-[12px]">Loading…</div>
      ) : transactions.length === 0 ? (
        <div className="rounded-xl py-15 text-center" style={{ border: "1px dashed var(--rule)" }}>
          <div className="text-[32px] mb-3">📋</div>
          <div className="text-[15px] font-medium text-(--ink) mb-1.5">No transactions this month</div>
          <button onClick={() => setShowForm(true)} className="mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-full font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-white border-none cursor-pointer" style={{ background: ACCENT }}>
            <Plus size={12} /> Add one
          </button>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
          {transactions.map((tx, i) => {
            const cat = tx.category ?? categories.find(c => c.id === tx.category_id);
            const isIncome = tx.amount > 0;
            const date = new Date(tx.date + "T00:00:00Z");
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3.5 px-4 py-3.5 bg-(--bg) hover:bg-(--bg-2) transition-colors group"
                style={{ borderBottom: i < transactions.length - 1 ? "1px solid var(--rule)" : undefined }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[16px] shrink-0" style={{ background: cat?.color ? `${cat.color}18` : "var(--bg-2)" }}>
                  {cat?.icon ?? (isIncome ? "💰" : "💸")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-(--ink) truncate">{tx.description}</div>
                  <div className="font-mono text-[10px] text-muted-foreground mt-0.25">
                    {cat?.name ?? "Uncategorized"} · {date.toLocaleDateString("en-NG", { month: "short", day: "numeric", timeZone: "UTC" })}
                    {tx.account && ` · ${tx.account.icon} ${tx.account.name}`}
                  </div>
                </div>
                <div className="shrink-0 text-right flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[15px] font-semibold tabular-nums" style={{ color: isIncome ? "#16A34A" : "var(--ink)" }}>
                      {isIncome ? "+" : "−"}{hidden ? "****" : formatCurrency(Math.abs(tx.amount), tx.account?.currency ?? "NGN")}
                    </div>
                  </div>
                  {confirmDeleteId === tx.id ? (
                    <button
                      onClick={() => void handleDelete(tx.id)}
                      disabled={deletingId === tx.id}
                      className="w-7 h-7 rounded-md flex items-center justify-center border-none cursor-pointer text-[#DC2626] bg-[rgba(220,38,38,0.12)] transition-all text-[9px] font-mono font-semibold"
                      aria-label="Confirm delete"
                      title="Click again to confirm"
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : (
                    <button
                      onClick={() => void handleDelete(tx.id)}
                      disabled={deletingId === tx.id}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-md flex items-center justify-center border-none bg-transparent cursor-pointer text-(--ink-4) hover:text-[#DC2626] hover:bg-[rgba(220,38,38,0.08)] transition-all"
                      aria-label="Delete transaction"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <TransactionForm accounts={accounts} categories={categories} onCreated={handleCreated} onClose={() => setShowForm(false)} />
      )}
      {showImport && (
        <CSVImportWizard accounts={accounts} onClose={() => setShowImport(false)} onImported={() => void fetchMonth(month)} />
      )}
      {showScanner && (
        <ReceiptScanner accounts={accounts} categories={categories} onClose={() => setShowScanner(false)} onTransactionAdded={() => void fetchMonth(month)} />
      )}
    </div>
  );
}
