"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Target, AlertCircle } from "lucide-react";
import { ObjectiveCard } from "@/components/journal/ObjectiveCard";
import type { JoObjectiveWithMilestones } from "@/lib/journal/types";
import {
  OBJECTIVE_COLORS,
  VELA_ACCENT,
  VELA_ACCENT_SOFT,
} from "@/lib/journal/types";

const ICONS = ["🎯", "💡", "🚀", "📚", "💪", "🏆", "🌱", "✍️", "💰", "🎨", "🔬", "🤝"];

export default function ObjectivesPage(): React.ReactElement {
  const [objectives, setObjectives] = useState<JoObjectiveWithMilestones[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [color, setColor] = useState<string>(OBJECTIVE_COLORS[0]);
  const [icon, setIcon] = useState("🎯");

  const loadObjectives = useCallback(async (): Promise<void> => {
    setFetchError(null);
    try {
      const res = await fetch("/api/journal/objectives");
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Failed to load objectives");
      }
      const json = (await res.json()) as { objectives: JoObjectiveWithMilestones[] };
      setObjectives(json.objectives ?? []);
    } catch (err) {
      console.error("[objectives] load error:", err);
      setFetchError(err instanceof Error ? err.message : "Failed to load objectives");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadObjectives();
  }, [loadObjectives]);

  const handleCreate = async (): Promise<void> => {
    if (!title.trim()) return;
    setSaving(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/journal/objectives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          target_date: targetDate || null,
          priority,
          color,
          icon,
        }),
      });
      const json = (await res.json()) as { objective?: JoObjectiveWithMilestones; error?: string };
      if (!res.ok || !json.objective) {
        throw new Error(json.error ?? "Failed to create objective");
      }
      setObjectives((prev) => [json.objective!, ...prev]);
      setTitle("");
      setDescription("");
      setTargetDate("");
      setPriority("medium");
      setColor(OBJECTIVE_COLORS[0]);
      setIcon("🎯");
      setShowForm(false);
    } catch (err) {
      console.error("[objectives] create error:", err);
      setCreateError(err instanceof Error ? err.message : "Failed to create. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, patch: Record<string, unknown>): Promise<void> => {
    try {
      const res = await fetch(`/api/journal/objectives/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = (await res.json()) as { objective: JoObjectiveWithMilestones };
      if (json.objective) {
        setObjectives((prev) => prev.map((o) => (o.id === id ? json.objective : o)));
      }
    } catch (err) {
      console.error("[objectives] update error:", err);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await fetch(`/api/journal/objectives/${id}`, { method: "DELETE" });
      setObjectives((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("[objectives] delete error:", err);
    }
  };

  const handleMilestoneToggle = async (milestoneId: string, isDone: boolean): Promise<void> => {
    try {
      const res = await fetch(`/api/journal/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_done: isDone }),
      });
      const json = (await res.json()) as { milestone: { id: string; objective_id: string; is_done: boolean; title: string; due_date: string | null; user_id: string; created_at: string } };
      if (json.milestone) {
        setObjectives((prev) =>
          prev.map((o) =>
            o.id === json.milestone.objective_id
              ? { ...o, milestones: o.milestones.map((m) => (m.id === milestoneId ? json.milestone : m)) }
              : o
          )
        );
      }
    } catch (err) {
      console.error("[objectives] milestone toggle error:", err);
    }
  };

  const handleMilestoneAdd = async (objectiveId: string, milestoneTitle: string): Promise<void> => {
    try {
      const res = await fetch("/api/journal/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective_id: objectiveId, title: milestoneTitle }),
      });
      const json = (await res.json()) as { milestone: { id: string; objective_id: string; is_done: boolean; title: string; due_date: string | null; user_id: string; created_at: string } };
      if (json.milestone) {
        setObjectives((prev) =>
          prev.map((o) =>
            o.id === objectiveId
              ? { ...o, milestones: [...o.milestones, json.milestone] }
              : o
          )
        );
      }
    } catch (err) {
      console.error("[objectives] milestone add error:", err);
    }
  };

  const handleMilestoneDelete = async (milestoneId: string): Promise<void> => {
    try {
      await fetch(`/api/journal/milestones/${milestoneId}`, { method: "DELETE" });
      setObjectives((prev) =>
        prev.map((o) => ({
          ...o,
          milestones: o.milestones.filter((m) => m.id !== milestoneId),
        }))
      );
    } catch (err) {
      console.error("[objectives] milestone delete error:", err);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto px-8 py-12 max-160:px-5 max-160:py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-[28px] font-normal tracking-[-0.02em] fvs-text m-0 text-(--ink)">
            Objectives
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1 mb-0">
            The big things you&apos;re steering toward.
          </p>
        </div>
        <button
          onClick={() => { setShowForm((s) => !s); setCreateError(null); }}
          className="flex items-center gap-2 px-4 py-2.25 rounded-lg font-mono text-[10px] tracking-[0.12em] uppercase font-semibold text-white border-none cursor-pointer transition-opacity hover:opacity-90"
          style={{ background: VELA_ACCENT }}
        >
          <Plus size={13} />
          New
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div
          className="rounded-xl border border-(--rule) p-6 mb-7 space-y-4"
          style={{ background: "var(--bg-2)" }}
        >
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
            New Objective
          </div>

          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-2 text-muted-foreground">
                Icon
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className="w-8 h-8 text-[18px] rounded-md flex items-center justify-center border cursor-pointer transition-all"
                    style={{
                      background: icon === ic ? VELA_ACCENT_SOFT : "var(--bg)",
                      borderColor: icon === ic ? VELA_ACCENT : "var(--rule)",
                    }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-2 text-muted-foreground">
                Colour
              </label>
              <div className="flex flex-wrap gap-1.5">
                {OBJECTIVE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full border-0.5 cursor-pointer transition-transform hover:scale-110"
                    style={{
                      background: c,
                      borderColor: color === c ? "var(--ink)" : "transparent",
                    }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="obj-title" className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-1.5 text-muted-foreground">
              Title *
            </label>
            <input
              id="obj-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void handleCreate(); }}
              placeholder="What are you working toward?"
              className="w-full h-[42px] px-3.5 rounded-lg text-[14px] border border-(--rule) bg-(--bg) text-(--ink) outline-none"
            />
          </div>

          <div>
            <label htmlFor="obj-desc" className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-1.5 text-muted-foreground">
              Description
            </label>
            <textarea
              id="obj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why does this matter to you?"
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg text-[14px] leading-normal border border-(--rule) bg-(--bg) text-(--ink) outline-none resize-none"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="obj-date" className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-1.5 text-muted-foreground">
                Target Date
              </label>
              <input
                id="obj-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full h-[42px] px-3.5 rounded-lg text-[14px] border border-(--rule) bg-(--bg) text-(--ink) outline-none"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="obj-priority" className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-1.5 text-muted-foreground">
                Priority
              </label>
              <select
                id="obj-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
                className="w-full h-[42px] px-3.5 rounded-lg text-[14px] border border-(--rule) bg-(--bg) text-(--ink) outline-none cursor-pointer"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {createError && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px]"
              style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626" }}
            >
              <AlertCircle size={14} />
              {createError}
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              onClick={() => void handleCreate()}
              disabled={saving || !title.trim()}
              className="flex items-center gap-2 px-5 h-10 rounded-lg font-mono text-[10px] tracking-[0.12em] uppercase font-semibold text-white border-none cursor-pointer disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: VELA_ACCENT }}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Create Objective
            </button>
            <button
              onClick={() => { setShowForm(false); setCreateError(null); }}
              className="px-4 h-10 rounded-lg font-mono text-[10px] tracking-[0.12em] uppercase border border-(--rule) bg-transparent cursor-pointer text-muted-foreground transition-opacity hover:opacity-70"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Objectives list */}
      {loading ? (
        <div className="flex items-center justify-center py-15">
          <Loader2 size={22} className="animate-spin" style={{ color: VELA_ACCENT }} />
        </div>
      ) : fetchError ? (
        <div className="text-center py-15">
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: "#DC2626", opacity: 0.5 }} />
          <div className="text-[15px] font-medium mb-2 text-(--ink)">Failed to load objectives</div>
          <p className="text-[13px] text-muted-foreground mb-5">{fetchError}</p>
          <button
            onClick={() => void loadObjectives()}
            className="px-4 py-2 rounded-lg font-mono text-[10px] tracking-[0.12em] uppercase border border-(--rule) bg-transparent cursor-pointer text-secondary-foreground transition-opacity hover:opacity-70"
          >
            Try again
          </button>
        </div>
      ) : objectives.length === 0 ? (
        <div className="text-center py-15">
          <Target size={36} className="mx-auto mb-4" style={{ color: VELA_ACCENT, opacity: 0.3 }} />
          <div className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text mb-2 text-(--ink)">
            No objectives yet
          </div>
          <p className="text-[14px] text-muted-foreground mb-6">
            Add your first objective to start steering with intention.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 rounded-lg font-mono text-[11px] tracking-[0.12em] uppercase font-semibold text-white border-none cursor-pointer"
            style={{ background: VELA_ACCENT }}
          >
            Add your first objective
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {objectives.map((obj) => (
            <ObjectiveCard
              key={obj.id}
              objective={obj}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onMilestoneToggle={handleMilestoneToggle}
              onMilestoneAdd={handleMilestoneAdd}
              onMilestoneDelete={handleMilestoneDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
