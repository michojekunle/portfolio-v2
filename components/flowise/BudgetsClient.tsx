"use client";

import { useState, useCallback } from "react";
import { formatCurrency } from "@/lib/flowise/calculator";
import { SYSTEM_CATEGORIES } from "@/lib/flowise/types";
import type { FwCategory } from "@/lib/flowise/types";
import { Plus, X, Check, ChevronLeft, ChevronRight, Pencil } from "lucide-react";

const ACCENT = "#16A34A";
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface BudgetRow {
  id: string;
  category_id: string;
  month: string;
  amount: number;
  rollover_enabled: boolean;
  spent?: number;
}

interface Props {
  initialBudgets: BudgetRow[];
  initialMonth: string;
  categories: FwCategory[];
}

export function BudgetsClient({ initialBudgets, initialMonth, categories }: Props): React.ReactElement {
  const [month, setMonth] = useState(initialMonth);
  const [budgets, setBudgets] = useState(initialBudgets);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editRow, setEditRow] = useState<BudgetRow | null>(null);

  const allCategories = [
    ...SYSTEM_CATEGORIES.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color })),
    ...categories.filter((c) => !c.is_system),
  ];

  const fetchMonth = useCallback(async (m: string): Promise<void> => {
    setLoading(true);
    setMonth(m);
    try {
      const res = await fetch(`/api/flowise/budgets?month=${m}`);
      const data = await res.json() as { budgets: BudgetRow[] };
      setBudgets(data.budgets ?? []);
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const shiftMonth = (delta: number): void => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    fetchMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const handleSaved = useCallback((budget: BudgetRow): void => {
    setBudgets((prev) => {
      const exists = prev.findIndex((b) => b.category_id === budget.category_id);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = { ...next[exists], ...budget };
        return next;
      }
      return [...prev, budget];
    });
    setShowForm(false);
    setEditRow(null);
  }, []);

  const handleDelete = async (categoryId: string): Promise<void> => {
    try {
      const res = await fetch("/api/flowise/budgets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: categoryId, month }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setBudgets((prev) => prev.filter((b) => b.category_id !== categoryId));
    } catch (err) {
      console.error("[budgets] delete error:", err);
    }
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent ?? 0), 0);
  const [year, mon] = month.split("-").map(Number);

  const unusedCategoryIds = new Set(
    allCategories
      .filter((c) => !["salary","business","investment_in","transfer"].includes(c.id))
      .map((c) => c.id)
      .filter((id) => !budgets.some((b) => b.category_id === id))
  );

  return (
    <div className="px-[40px] pt-[48px] pb-[60px] max-[1024px]:pt-[80px] max-[720px]:px-[20px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-[32px] gap-[16px] flex-wrap">
        <h1 className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.03em] fvs-text m-0 text-[var(--ink)]">
          Budgets
        </h1>
        <button
          onClick={() => { setEditRow(null); setShowForm(true); }}
          className="inline-flex items-center gap-[8px] h-[40px] px-[18px] rounded-full font-mono text-[10px] uppercase tracking-[0.14em] font-semibold text-white border-none cursor-pointer"
          style={{ background: ACCENT }}
        >
          <Plus size={13} /> Add Budget
        </button>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-[16px] mb-[28px]">
        <button onClick={() => shiftMonth(-1)} className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-2)] hover:bg-[var(--bg-2)]">
          <ChevronLeft size={16} />
        </button>
        <div className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text text-[var(--ink)] min-w-[140px] text-center">
          {MONTHS[mon - 1]} {year}
        </div>
        <button onClick={() => shiftMonth(1)} disabled={month >= new Date().toISOString().slice(0, 7)} className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-2)] hover:bg-[var(--bg-2)] disabled:opacity-30">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-3 max-[720px]:grid-cols-1 gap-[12px] mb-[28px]">
          <SummaryPill label="Total Budgeted" value={formatCurrency(totalBudgeted, "NGN")} color="var(--ink)" />
          <SummaryPill label="Total Spent" value={formatCurrency(totalSpent, "NGN")} color={totalSpent > totalBudgeted ? "#DC2626" : "var(--ink)"} />
          <SummaryPill label="Remaining" value={formatCurrency(Math.max(0, totalBudgeted - totalSpent), "NGN")} color={ACCENT} />
        </div>
      )}

      {/* Budget list */}
      {loading ? (
        <div className="text-center py-[60px] text-[var(--ink-3)] font-mono text-[12px]">Loading…</div>
      ) : budgets.length === 0 ? (
        <div className="rounded-[12px] py-[60px] text-center" style={{ border: "1px dashed var(--rule)" }}>
          <div className="text-[36px] mb-[12px]">📊</div>
          <div className="text-[15px] font-medium text-[var(--ink)] mb-[6px]">No budgets for {MONTHS[mon - 1]}</div>
          <div className="text-[13px] text-[var(--ink-3)] mb-[20px] max-w-[36ch] mx-auto">Set spending limits per category to stay in control of your money.</div>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-[6px] h-[36px] px-[16px] rounded-full font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-white border-none cursor-pointer" style={{ background: ACCENT }}>
            <Plus size={12} /> Set first budget
          </button>
        </div>
      ) : (
        <div className="space-y-[10px]">
          {budgets.map((budget) => {
            const cat = allCategories.find((c) => c.id === budget.category_id);
            const spent = budget.spent ?? 0;
            const pct = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
            const over = spent > budget.amount;
            return (
              <BudgetBar
                key={budget.category_id}
                catIcon={cat?.icon ?? "📌"}
                catName={cat?.name ?? budget.category_id}
                catColor={cat?.color ?? "#6B7280"}
                amount={budget.amount}
                spent={spent}
                pct={pct}
                over={over}
                onEdit={() => { setEditRow(budget); setShowForm(true); }}
                onDelete={() => handleDelete(budget.category_id)}
              />
            );
          })}
        </div>
      )}

      {/* Budget form modal */}
      {showForm && (
        <BudgetFormModal
          month={month}
          monthLabel={`${MONTHS[mon - 1]} ${year}`}
          categories={allCategories.filter((c) =>
            editRow ? c.id === editRow.category_id || unusedCategoryIds.has(c.id) : unusedCategoryIds.has(c.id)
          )}
          editRow={editRow}
          onSaved={handleSaved}
          onClose={() => { setShowForm(false); setEditRow(null); }}
        />
      )}
    </div>
  );
}

function SummaryPill({ label, value, color }: { label: string; value: string; color: string }): React.ReactElement {
  return (
    <div className="rounded-[10px] px-[16px] py-[12px]" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
      <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-4)] mb-[4px]">{label}</div>
      <div className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text" style={{ color }}>{value}</div>
    </div>
  );
}

function BudgetBar({ catIcon, catName, catColor, amount, spent, pct, over, onEdit, onDelete }: {
  catIcon: string; catName: string; catColor: string;
  amount: number; spent: number; pct: number; over: boolean;
  onEdit: () => void; onDelete: () => void;
}): React.ReactElement {
  const barColor = over ? "#DC2626" : pct >= 80 ? "#F59E0B" : catColor;
  return (
    <div className="rounded-[12px] px-[20px] py-[16px] group" style={{ border: "1px solid var(--rule)", background: "var(--bg)" }}>
      <div className="flex items-center justify-between mb-[10px]">
        <div className="flex items-center gap-[10px]">
          <span className="text-[18px]">{catIcon}</span>
          <div>
            <div className="text-[14px] font-medium text-[var(--ink)]">{catName}</div>
            <div className="font-mono text-[10px] text-[var(--ink-4)]">
              {over
                ? <span style={{ color: "#DC2626" }}>₦{(spent - amount).toLocaleString("en-NG")} over budget</span>
                : pct >= 80
                  ? <span style={{ color: "#F59E0B" }}>{Math.round(pct)}% used — watch out</span>
                  : `${Math.round(pct)}% of budget used`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-[12px]">
          <div className="text-right">
            <div className="text-[14px] font-semibold tabular-nums text-[var(--ink)]">
              {formatCurrency(spent, "NGN", true)} <span className="font-normal text-[var(--ink-4)]">/ {formatCurrency(amount, "NGN", true)}</span>
            </div>
          </div>
          <div className="flex gap-[4px] opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-3)] hover:bg-[var(--bg-2)]"><Pencil size={12} /></button>
            <button onClick={onDelete} className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[#DC2626] hover:bg-[rgba(220,38,38,0.08)]"><X size={12} /></button>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-[6px] rounded-full overflow-hidden" style={{ background: "var(--bg-2)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

function BudgetFormModal({ month, monthLabel, categories, editRow, onSaved, onClose }: {
  month: string;
  monthLabel: string;
  categories: Array<{ id: string; name: string; icon: string; color: string }>;
  editRow: BudgetRow | null;
  onSaved: (b: BudgetRow) => void;
  onClose: () => void;
}): React.ReactElement {
  const [categoryId, setCategoryId] = useState(editRow?.category_id ?? categories[0]?.id ?? "");
  const [amount, setAmount] = useState(editRow ? String(editRow.amount) : "");
  const [rollover, setRollover] = useState(editRow?.rollover_enabled ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid amount"); return; }
    if (!categoryId) { setError("Select a category"); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/flowise/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: categoryId, month, amount: amt, rollover_enabled: rollover }),
      });
      const data = await res.json() as { budget?: BudgetRow; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      onSaved({ ...data.budget!, spent: editRow?.spent ?? 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-0 sm:px-[16px]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-[420px] rounded-t-[20px] sm:rounded-[16px] overflow-hidden" style={{ background: "var(--bg)", border: "1px solid var(--rule)" }}>
        <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-[var(--rule)]">
          <h2 className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text m-0 text-[var(--ink)]">
            {editRow ? "Edit Budget" : "Set Budget"} · {monthLabel}
          </h2>
          <button onClick={onClose} className="w-[32px] h-[32px] rounded-full flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-3)] hover:bg-[var(--bg-2)]" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-[24px] py-[20px] space-y-[16px]">
          <div>
            <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] mb-[8px]">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required disabled={!!editRow} className="w-full h-[44px] px-[12px] rounded-[8px] text-[14px] outline-none bg-[var(--bg-2)] text-[var(--ink)] cursor-pointer disabled:opacity-60" style={{ border: "1.5px solid var(--rule)" }}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] mb-[8px]">Monthly Limit (₦)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" step="100" placeholder="e.g. 50000" required autoFocus className="w-full h-[48px] px-[14px] rounded-[8px] font-display text-[20px] fvs-text outline-none bg-[var(--bg-2)] text-[var(--ink)]" style={{ border: "1.5px solid var(--rule)" }} />
          </div>
          <label className="flex items-center gap-[10px] cursor-pointer">
            <input type="checkbox" checked={rollover} onChange={(e) => setRollover(e.target.checked)} className="w-[16px] h-[16px] rounded-[4px] cursor-pointer" />
            <span className="text-[13px] text-[var(--ink-2)]">Roll over unspent budget to next month</span>
          </label>
          {error && <div className="rounded-[8px] px-[14px] py-[10px] text-[13px] font-mono" style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}>{error}</div>}
          <button type="submit" disabled={loading} className="w-full h-[48px] rounded-[10px] font-mono text-[11px] tracking-[0.14em] uppercase font-semibold text-white border-none cursor-pointer disabled:opacity-60 flex items-center justify-center gap-[8px]" style={{ background: ACCENT }}>
            {loading ? <span className="w-[16px] h-[16px] rounded-full border-[2px] border-white/30 border-t-white animate-spin" /> : <><Check size={14} />{editRow ? "Update Budget" : "Set Budget"}</>}
          </button>
        </form>
      </div>
    </div>
  );
}
