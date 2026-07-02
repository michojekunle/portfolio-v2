"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Target } from "lucide-react";
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
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [color, setColor] = useState<string>(OBJECTIVE_COLORS[0]);
  const [icon, setIcon] = useState("🎯");

  const loadObjectives = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/journal/objectives");
      const json = (await res.json()) as { objectives: JoObjectiveWithMilestones[] };
      setObjectives(json.objectives ?? []);
    } catch (err) {
      console.error("[objectives] load error:", err);
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
      const json = (await res.json()) as { objective: JoObjectiveWithMilestones };
      if (json.objective) {
        setObjectives((prev) => [json.objective, ...prev]);
        setTitle("");
        setDescription("");
        setTargetDate("");
        setPriority("medium");
        setColor(OBJECTIVE_COLORS[0]);
        setIcon("🎯");
        setShowForm(false);
      }
    } catch (err) {
      console.error("[objectives] create error:", err);
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
    <div className="max-w-[800px] mx-auto px-[32px] py-[48px] max-[640px]:px-[20px] max-[640px]:py-[32px]">
      <div className="flex items-center justify-between mb-[32px]">
        <div>
          <h1 className="font-display text-[28px] font-normal tracking-[-0.02em] fvs-text m-0 text-[var(--ink)]">
            Objectives
          </h1>
          <p className="text-[13px] text-[var(--ink-3)] mt-[4px] mb-0">
            The big things you're steering toward.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-[8px] px-[16px] py-[9px] rounded-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold text-white border-none cursor-pointer transition-opacity hover:opacity-90"
          style={{ background: VELA_ACCENT }}
        >
          <Plus size={13} />
          New
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div
          className="rounded-[12px] border border-[var(--rule)] p-[24px] mb-[28px] space-y-[16px]"
          style={{ background: "var(--bg-2)" }}
        >
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
            New Objective
          </div>

          {/* Icon + color row */}
          <div className="flex gap-[16px] flex-wrap">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-[8px] text-[var(--ink-3)]">
                Icon
              </label>
              <div className="flex flex-wrap gap-[6px]">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className="w-[32px] h-[32px] text-[18px] rounded-[6px] flex items-center justify-center border cursor-pointer transition-all"
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
              <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-[8px] text-[var(--ink-3)]">
                Colour
              </label>
              <div className="flex flex-wrap gap-[6px]">
                {OBJECTIVE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-[24px] h-[24px] rounded-full border-[2px] cursor-pointer transition-transform hover:scale-110"
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
            <label htmlFor="obj-title" className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-[6px] text-[var(--ink-3)]">
              Title *
            </label>
            <input
              id="obj-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you working toward?"
              className="w-full h-[42px] px-[14px] rounded-[8px] text-[14px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none"
            />
          </div>

          <div>
            <label htmlFor="obj-desc" className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-[6px] text-[var(--ink-3)]">
              Description
            </label>
            <textarea
              id="obj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why does this matter to you?"
              rows={2}
              className="w-full px-[14px] py-[10px] rounded-[8px] text-[14px] leading-[1.5] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none resize-none"
            />
          </div>

          <div className="flex gap-[16px] flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="obj-date" className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-[6px] text-[var(--ink-3)]">
                Target Date
              </label>
              <input
                id="obj-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full h-[42px] px-[14px] rounded-[8px] text-[14px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="obj-priority" className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-[6px] text-[var(--ink-3)]">
                Priority
              </label>
              <select
                id="obj-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
                className="w-full h-[42px] px-[14px] rounded-[8px] text-[14px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none cursor-pointer"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex gap-[10px] pt-[4px]">
            <button
              onClick={() => void handleCreate()}
              disabled={saving || !title.trim()}
              className="flex items-center gap-[8px] px-[20px] h-[40px] rounded-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold text-white border-none cursor-pointer disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: VELA_ACCENT }}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Create Objective
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-[16px] h-[40px] rounded-[8px] font-mono text-[10px] tracking-[0.12em] uppercase border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] transition-opacity hover:opacity-70"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Objectives list */}
      {loading ? (
        <div className="flex items-center justify-center py-[60px]">
          <Loader2 size={22} className="animate-spin" style={{ color: VELA_ACCENT }} />
        </div>
      ) : objectives.length === 0 ? (
        <div className="text-center py-[60px]">
          <Target size={36} className="mx-auto mb-[16px]" style={{ color: VELA_ACCENT, opacity: 0.3 }} />
          <div className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text mb-[8px] text-[var(--ink)]">
            No objectives yet
          </div>
          <p className="text-[14px] text-[var(--ink-3)] mb-[24px]">
            Add your first objective to start steering with intention.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-[20px] py-[10px] rounded-[8px] font-mono text-[11px] tracking-[0.12em] uppercase font-semibold text-white border-none cursor-pointer"
            style={{ background: VELA_ACCENT }}
          >
            Add your first objective
          </button>
        </div>
      ) : (
        <div className="space-y-[16px]">
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
