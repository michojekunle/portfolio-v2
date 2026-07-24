"use client";

import { useState, useCallback } from "react";
import { formatCurrency } from "@/lib/flowise/calculator";
import { usePrivacy, Amount } from "@/components/flowise/PrivacyProvider";
import type { FwGoal } from "@/lib/flowise/types";
import { FREE_GOAL_LIMIT } from "@/lib/flowise/types";
import { Plus, X, Check, Trash2 } from "lucide-react";

const ACCENT = "#16A34A";
const GOAL_ICONS = ["🎯","🏠","💻","✈️","🎓","🚗","💍","🏋️","📱","🌍","💰","🏦"];
const GOAL_COLORS = ["#16A34A","#3B82F6","#8B5CF6","#F97316","#EC4899","#0EA5E9","#F59E0B","#EF4444","#0D9488","#6366F1"];

interface Props {
  initialGoals: FwGoal[];
}

export function GoalsClient({ initialGoals }: Props): React.ReactElement {
  const { hidden } = usePrivacy();
const [goals, setGoals] = useState(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [addingAmount, setAddingAmount] = useState<string | null>(null);

  const activeGoals = goals.filter((g) => !g.is_completed);
  const completedGoals = goals.filter((g) => g.is_completed);
  const atLimit = activeGoals.length >= FREE_GOAL_LIMIT;

  const handleCreated = useCallback((goal: FwGoal): void => {
    setGoals((prev) => [...prev, goal]);
    setShowForm(false);
  }, []);

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/flowise/goals?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error("[goals] delete error:", err);
    }
  };

  const handleMarkComplete = async (id: string): Promise<void> => {
    try {
      const res = await fetch("/api/flowise/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_completed: true }),
      });
      if (!res.ok) throw new Error("Mark complete failed");
      const data = await res.json() as { goal: FwGoal };
      setGoals((prev) => prev.map((g) => g.id === id ? data.goal : g));
    } catch (err) {
      console.error("[goals] mark-complete error:", err);
    }
  };

  const handleAddProgress = async (id: string, extra: number): Promise<void> => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const newAmount = Math.min(goal.current_amount + extra, goal.target_amount);
    const res = await fetch("/api/flowise/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, current_amount: newAmount }),
    });
    const data = await res.json() as { goal: FwGoal };
    if (res.ok) {
      setGoals((prev) => prev.map((g) => g.id === id ? data.goal : g));
      setAddingAmount(null);
    }
  };

  return (
    <div className="px-10 pt-12 pb-15 max-[1024px]:pt-20 max-[720px]:px-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.03em] fvs-text m-0 text-(--ink)">
          Savings Goals
        </h1>
        <button
          onClick={() => setShowForm(true)}
          disabled={atLimit}
          className="inline-flex items-center gap-2 h-10 px-4.5 rounded-full font-mono text-[10px] uppercase tracking-[0.14em] font-semibold text-white border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: ACCENT }}
          title={atLimit ? `Free plan: max ${FREE_GOAL_LIMIT} active goals` : undefined}
        >
          <Plus size={13} /> New Goal
        </button>
      </div>

      {atLimit && (
        <div className="mb-6 rounded-[10px] px-4 py-3 font-mono text-[12px]" style={{ background: "rgba(22,163,74,0.08)", color: ACCENT, border: "1px solid rgba(22,163,74,0.2)" }}>
          Free plan: {FREE_GOAL_LIMIT} active goals max. Complete a goal or upgrade to add more.
        </div>
      )}

      {/* Active goals */}
      {activeGoals.length === 0 ? (
        <div className="rounded-xl py-15 text-center" style={{ border: "1px dashed var(--rule)" }}>
          <div className="text-[40px] mb-3">🎯</div>
          <div className="text-[15px] font-medium text-(--ink) mb-1.5">No savings goals yet</div>
          <div className="text-[13px] text-muted-foreground mb-5 max-w-[36ch] mx-auto">Emergency fund, new laptop, travel — name it, set a target, track progress.</div>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-white border-none cursor-pointer" style={{ background: ACCENT }}>
            <Plus size={12} /> Create your first goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-4">
          {activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              addingAmount={addingAmount === goal.id}
              onAddAmount={() => setAddingAmount(addingAmount === goal.id ? null : goal.id)}
              onSaveProgress={(id, extra) => handleAddProgress(id, extra)}
              onComplete={() => handleMarkComplete(goal.id)}
              onDelete={() => handleDelete(goal.id)}
            />
          ))}
        </div>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div className="mt-12">
          <h2 className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground mb-4">Completed ✓</h2>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-3 rounded-[10px] px-4 py-3 opacity-60" style={{ border: "1px solid var(--rule)" }}>
                <span className="text-[18px]">{goal.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-(--ink)">{goal.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{(hidden ? "****" : formatCurrency(goal.target_amount, "NGN"))} saved</div>
                </div>
                <span className="font-mono text-[10px] text-[#16A34A]">✓ Done</span>
                <button onClick={() => handleDelete(goal.id)} className="w-6 h-6 flex items-center justify-center border-none bg-transparent cursor-pointer text-(--ink-4) hover:text-[#DC2626]">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <GoalFormModal onCreated={handleCreated} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

function GoalCard({ goal, addingAmount, onAddAmount, onSaveProgress, onComplete, onDelete }: {
  goal: FwGoal;
  addingAmount: boolean;
  onAddAmount: () => void;
  onSaveProgress: (id: string, extra: number) => Promise<void>;
  onComplete: () => void;
  onDelete: () => Promise<void>;
}): React.ReactElement {
  const { hidden } = usePrivacy();
  const [extraInput, setExtraInput] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const pct = goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0;
  const remaining = goal.target_amount - goal.current_amount;

  const daysLeft = goal.deadline
    ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86_400_000)
    : null;
  const monthlyNeeded = daysLeft !== null && daysLeft > 0 && remaining > 0
    ? remaining / (daysLeft / 30)
    : null;

  const handleSave = async (): Promise<void> => {
    const n = parseFloat(extraInput);
    if (isNaN(n) || n <= 0) { setSaveError("Enter a valid amount"); return; }
    setSaveError(null);
    try {
      await onSaveProgress(goal.id, n);
      setExtraInput("");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save progress");
    }
  };

  // SVG ring
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="rounded-2xl px-6 py-5" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[20px]" style={{ background: `${goal.color}15` }}>
            {goal.icon}
          </div>
          <div>
            <div className="text-[15px] font-semibold text-(--ink)">{goal.name}</div>
            {goal.deadline && (
              <div className="font-mono text-[10px] text-muted-foreground">
                {daysLeft !== null && daysLeft > 0
                  ? `${daysLeft} days left`
                  : daysLeft === 0 ? "Due today" : "Overdue"}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onComplete} className="w-6.5 h-6.5 rounded-md flex items-center justify-center border-none bg-transparent cursor-pointer" style={{ color: ACCENT }} title="Mark complete">
            <Check size={13} />
          </button>
          <button onClick={onDelete} className="w-6.5 h-6.5 rounded-md flex items-center justify-center border-none bg-transparent cursor-pointer text-(--ink-4) hover:text-[#DC2626]" title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Ring + amounts */}
      <div className="flex items-center gap-5 mb-4">
        <div className="relative w-[100px] h-[100px] shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="var(--rule)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r={r} fill="none"
              stroke={goal.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-display text-[18px] font-normal fvs-text leading-none" style={{ color: goal.color }}>{Math.round(pct)}%</div>
            <div className="font-mono text-[8px] text-(--ink-4)">saved</div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[9px] uppercase tracking-widest text-(--ink-4) mb-0.5">Saved</div>
          <div className="font-display text-[22px] font-normal tracking-[-0.01em] fvs-text text-(--ink)">{(hidden ? "****" : formatCurrency(goal.current_amount, "NGN", true))}</div>
          <div className="font-mono text-[10px] text-muted-foreground">of {(hidden ? "****" : formatCurrency(goal.target_amount, "NGN", true))}</div>
          {monthlyNeeded !== null && monthlyNeeded > 0 && (
            <div className="font-mono text-[10px] mt-1.5" style={{ color: ACCENT }}>
              Save {(hidden ? "****" : formatCurrency(monthlyNeeded, "NGN", true))}/mo to hit deadline
            </div>
          )}
        </div>
      </div>

      {/* Add progress */}
      {addingAmount ? (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-[12px] text-muted-foreground">₦</span>
              <input
                type="number"
                value={extraInput}
                onChange={(e) => { setExtraInput(e.target.value); setSaveError(null); }}
                onKeyDown={(e) => e.key === "Enter" && void handleSave()}
                placeholder="amount to add"
                min="1"
                autoFocus
                className="w-full h-9.5 pl-7 pr-2.5 rounded-lg text-[13px] outline-none bg-(--bg) text-(--ink)"
                style={{ border: "1.5px solid var(--rule)" }}
              />
            </div>
            <button onClick={() => void handleSave()} className="h-9.5 px-3.5 rounded-lg font-mono text-[10px] uppercase tracking-widest font-semibold text-white border-none cursor-pointer" style={{ background: ACCENT }}>Add</button>
            <button onClick={onAddAmount} className="h-9.5 px-2.5 rounded-lg border-none bg-transparent cursor-pointer text-muted-foreground"><X size={14} /></button>
          </div>
          {saveError && (
            <div className="font-mono text-[10px] px-2 py-1 rounded-md" style={{ color: "#DC2626", background: "rgba(220,38,38,0.08)" }}>
              {saveError}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onAddAmount}
          className="w-full h-9 rounded-lg font-mono text-[10px] uppercase tracking-widest font-semibold border-none cursor-pointer transition-colors"
          style={{ background: `${goal.color}12`, color: goal.color, border: `1px solid ${goal.color}30` }}
        >
          + Add Progress
        </button>
      )}
    </div>
  );
}

function GoalFormModal({ onCreated, onClose }: { onCreated: (g: FwGoal) => void; onClose: () => void }): React.ReactElement {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [icon, setIcon] = useState(GOAL_ICONS[0]);
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const amt = parseFloat(target);
    if (isNaN(amt) || amt <= 0) { setError("Enter a valid target amount"); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/flowise/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), target_amount: amt, deadline: deadline || null, icon, color }),
      });
      const data = await res.json() as { goal?: FwGoal; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      onCreated(data.goal!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-[440px] rounded-t-[20px] sm:rounded-2xl overflow-hidden" style={{ background: "var(--bg)", border: "1px solid var(--rule)" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-(--rule)">
          <h2 className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text m-0 text-(--ink)">New Savings Goal</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center border-none bg-transparent cursor-pointer text-muted-foreground hover:bg-(--bg-2)"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">Goal Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emergency Fund, New Laptop" required maxLength={80} autoFocus className="w-full h-11 px-3.5 rounded-lg text-[14px] outline-none bg-(--bg-2) text-(--ink)" style={{ border: "1.5px solid var(--rule)" }} />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">Target Amount (₦)</label>
            <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} min="1" step="100" placeholder="e.g. 500000" required className="w-full h-12 px-3.5 rounded-lg font-display text-[20px] fvs-text outline-none bg-(--bg-2) text-(--ink)" style={{ border: "1.5px solid var(--rule)" }} />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">Deadline <span className="normal-case tracking-normal text-(--ink-4)">(optional)</span></label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={new Date().toISOString().slice(0, 10)} className="w-full h-11 px-3.5 rounded-lg text-[14px] outline-none bg-(--bg-2) text-(--ink)" style={{ border: "1.5px solid var(--rule)" }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">Icon</label>
              <div className="flex flex-wrap gap-1.5">
                {GOAL_ICONS.map((ic) => (
                  <button key={ic} type="button" onClick={() => setIcon(ic)} className="w-8 h-8 rounded-md text-[16px] border-none cursor-pointer flex items-center justify-center transition-all" style={{ background: icon === ic ? `${color}20` : "var(--bg-2)", outline: icon === ic ? `2px solid ${color}` : undefined, outlineOffset: "1px" }}>{ic}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {GOAL_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)} className="w-6 h-6 rounded-full border-none cursor-pointer transition-transform hover:scale-110" style={{ background: c, outline: color === c ? `3px solid ${c}` : undefined, outlineOffset: "2px" }} />
                ))}
              </div>
            </div>
          </div>
          {error && <div className="rounded-lg px-3.5 py-2.5 text-[13px] font-mono" style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}>{error}</div>}
          <button type="submit" disabled={loading} className="w-full h-12 rounded-[10px] font-mono text-[11px] tracking-[0.14em] uppercase font-semibold text-white border-none cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2" style={{ background: ACCENT }}>
            {loading ? <span className="w-4 h-4 rounded-full border-0.5 border-white/30 border-t-white animate-spin" /> : <><Check size={14} /> Create Goal</>}
          </button>
        </form>
      </div>
    </div>
  );
}
