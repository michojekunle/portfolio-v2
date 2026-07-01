"use client";

import { useState, useCallback } from "react";
import type { FwAccount, FwCategory, FwTransaction } from "@/lib/flowise/types";
import { formatCurrency } from "@/lib/flowise/calculator";
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
  const [transactions, setTransactions] = useState(initialTransactions);
  const [month, setMonth] = useState(initialMonth);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    if (!confirm("Delete this transaction?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/flowise/transactions/${id}`, { method: "DELETE" });
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const [year, mon] = month.split("-").map(Number);
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="px-[40px] pt-[48px] pb-[60px] max-[1024px]:pt-[80px] max-[720px]:px-[20px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-[32px] gap-[16px] flex-wrap">
        <h1 className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.03em] fvs-text m-0 text-[var(--ink)]">
          Transactions
        </h1>
        <div className="flex items-center gap-[8px]">
          <button onClick={() => setShowScanner(true)} className="inline-flex items-center gap-[6px] h-[36px] px-[14px] rounded-full font-mono text-[10px] uppercase tracking-[0.12em] font-semibold border-none cursor-pointer" style={{ background: "var(--bg-2)", color: "var(--ink-2)", border: "1px solid var(--rule)" }} title="Scan receipt or bank alert">
            <Camera size={12} /> Scan
          </button>
          <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-[6px] h-[36px] px-[14px] rounded-full font-mono text-[10px] uppercase tracking-[0.12em] font-semibold border-none cursor-pointer" style={{ background: "var(--bg-2)", color: "var(--ink-2)", border: "1px solid var(--rule)" }} title="Import CSV bank statement">
            <Upload size={12} /> Import
          </button>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-[8px] h-[40px] px-[18px] rounded-full font-mono text-[10px] uppercase tracking-[0.14em] font-semibold text-white border-none cursor-pointer" style={{ background: ACCENT }}>
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-[16px] mb-[24px]">
        <button onClick={() => shiftMonth(-1)} className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-2)] hover:bg-[var(--bg-2)] transition-colors">
          <ChevronLeft size={16} />
        </button>
        <div className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text text-[var(--ink)] min-w-[140px] text-center">
          {MONTHS[mon - 1]} {year}
        </div>
        <button onClick={() => shiftMonth(1)} disabled={month >= new Date().toISOString().slice(0, 7)} className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-2)] hover:bg-[var(--bg-2)] transition-colors disabled:opacity-30">
          <ChevronRight size={16} />
        </button>

        <div className="flex gap-[12px] ml-auto">
          <span className="font-mono text-[11px] text-[var(--ink-3)]">
            In: <span style={{ color: ACCENT }}>+{formatCurrency(income, "NGN", true)}</span>
          </span>
          <span className="font-mono text-[11px] text-[var(--ink-3)]">
            Out: <span style={{ color: "#DC2626" }}>−{formatCurrency(expenses, "NGN", true)}</span>
          </span>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-[60px] text-[var(--ink-3)] font-mono text-[12px]">Loading…</div>
      ) : transactions.length === 0 ? (
        <div className="rounded-[12px] py-[60px] text-center" style={{ border: "1px dashed var(--rule)" }}>
          <div className="text-[32px] mb-[12px]">📋</div>
          <div className="text-[15px] font-medium text-[var(--ink)] mb-[6px]">No transactions this month</div>
          <button onClick={() => setShowForm(true)} className="mt-[16px] inline-flex items-center gap-[6px] h-[36px] px-[16px] rounded-full font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-white border-none cursor-pointer" style={{ background: ACCENT }}>
            <Plus size={12} /> Add one
          </button>
        </div>
      ) : (
        <div className="rounded-[12px] overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
          {transactions.map((tx, i) => {
            const cat = tx.category ?? categories.find(c => c.id === tx.category_id);
            const isIncome = tx.amount > 0;
            const date = new Date(tx.date + "T00:00:00Z");
            return (
              <div
                key={tx.id}
                className="flex items-center gap-[14px] px-[16px] py-[14px] bg-[var(--bg)] hover:bg-[var(--bg-2)] transition-colors group"
                style={{ borderBottom: i < transactions.length - 1 ? "1px solid var(--rule)" : undefined }}
              >
                <div className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center text-[16px] shrink-0" style={{ background: cat?.color ? `${cat.color}18` : "var(--bg-2)" }}>
                  {cat?.icon ?? (isIncome ? "💰" : "💸")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-[var(--ink)] truncate">{tx.description}</div>
                  <div className="font-mono text-[10px] text-[var(--ink-3)] mt-[1px]">
                    {cat?.name ?? "Uncategorized"} · {date.toLocaleDateString("en-NG", { month: "short", day: "numeric", timeZone: "UTC" })}
                    {tx.account && ` · ${tx.account.icon} ${tx.account.name}`}
                  </div>
                </div>
                <div className="shrink-0 text-right flex items-center gap-[12px]">
                  <div className="text-right">
                    <div className="text-[15px] font-semibold tabular-nums" style={{ color: isIncome ? "#16A34A" : "var(--ink)" }}>
                      {isIncome ? "+" : "−"}{formatCurrency(Math.abs(tx.amount), tx.account?.currency ?? "NGN")}
                    </div>
                  </div>
                  <button
                    onClick={() => void handleDelete(tx.id)}
                    disabled={deletingId === tx.id}
                    className="opacity-0 group-hover:opacity-100 w-[28px] h-[28px] rounded-[6px] flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-4)] hover:text-[#DC2626] hover:bg-[rgba(220,38,38,0.08)] transition-all"
                    aria-label="Delete transaction"
                  >
                    <Trash2 size={13} />
                  </button>
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
