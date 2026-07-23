"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp, Plus, Pencil, X, Check, Loader2 } from "lucide-react";
import type { JoObjectiveWithMilestones, JoMilestone } from "@/lib/journal/types";
import { PRIORITY_CONFIG, STATUS_CONFIG, OBJECTIVE_COLORS, VELA_ACCENT, VELA_ACCENT_SOFT } from "@/lib/journal/types";

const ICONS = ["🎯", "💡", "🚀", "📚", "💪", "🏆", "🌱", "✍️", "💰", "🎨", "🔬", "🤝"];

interface Props {
  objective: JoObjectiveWithMilestones;
  onUpdate: (id: string, patch: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMilestoneToggle: (milestoneId: string, isDone: boolean) => Promise<void>;
  onMilestoneAdd: (objectiveId: string, title: string) => Promise<void>;
  onMilestoneDelete: (milestoneId: string) => Promise<void>;
}

export function ObjectiveCard({
  objective,
  onUpdate,
  onDelete,
  onMilestoneToggle,
  onMilestoneAdd,
  onMilestoneDelete,
}: Props): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editTitle, setEditTitle] = useState(objective.title);
  const [editDescription, setEditDescription] = useState(objective.description ?? "");
  const [editTargetDate, setEditTargetDate] = useState(objective.target_date ?? "");
  const [editPriority, setEditPriority] = useState(objective.priority);
  const [editColor, setEditColor] = useState(objective.color);
  const [editIcon, setEditIcon] = useState(objective.icon);

  const startEdit = (): void => {
    setEditTitle(objective.title);
    setEditDescription(objective.description ?? "");
    setEditTargetDate(objective.target_date ?? "");
    setEditPriority(objective.priority);
    setEditColor(objective.color);
    setEditIcon(objective.icon);
    setEditing(true);
  };

  const handleSaveEdit = async (): Promise<void> => {
    const title = editTitle.trim();
    if (!title) return;
    setEditSaving(true);
    try {
      await onUpdate(objective.id, {
        title,
        description: editDescription.trim() || null,
        target_date: editTargetDate || null,
        priority: editPriority,
        color: editColor,
        icon: editIcon,
      });
      setEditing(false);
    } finally {
      setEditSaving(false);
    }
  };

  const milestones = objective.milestones ?? [];
  const doneMilestones = milestones.filter((m) => m.is_done).length;
  const totalMilestones = milestones.length;
  const pct = totalMilestones > 0 ? Math.round((doneMilestones / totalMilestones) * 100) : 0;

  const daysUntilTarget = objective.target_date
    ? Math.ceil((new Date(objective.target_date).getTime() - Date.now()) / 86_400_000)
    : null;

  const priorityCfg = PRIORITY_CONFIG[objective.priority];
  const statusCfg = STATUS_CONFIG[objective.status];

  const handleStatusCycle = async (): Promise<void> => {
    const next: Record<string, string> = {
      active: "paused",
      paused: "active",
      completed: "active",
      dropped: "active",
    };
    setStatusBusy(true);
    try {
      await onUpdate(objective.id, { status: next[objective.status] });
    } finally {
      setStatusBusy(false);
    }
  };

  const handleAddMilestone = async (): Promise<void> => {
    const title = newMilestone.trim();
    if (!title) return;
    setBusy(true);
    await onMilestoneAdd(objective.id, title);
    setNewMilestone("");
    setAddingMilestone(false);
    setBusy(false);
  };

  const handleDelete = async (): Promise<void> => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleteBusy(true);
    try {
      await onDelete(objective.id);
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleMilestoneToggle = async (milestoneId: string, isDone: boolean): Promise<void> => {
    setTogglingId(milestoneId);
    await onMilestoneToggle(milestoneId, isDone);
    setTogglingId(null);
  };

  return (
    <div
      className="rounded-xl border overflow-hidden transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]"
      style={{
        borderColor: "var(--rule)",
        background: "var(--bg-2)",
      }}
    >
      {/* Top colour stripe */}
      <div className="h-0.75" style={{ background: objective.color }} />

      <div className="p-4.5">
        {editing ? (
          <div className="space-y-3.5">
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-2 text-muted-foreground">
                  Icon
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setEditIcon(ic)}
                      className="w-7.5 h-7.5 text-[16px] rounded-md flex items-center justify-center border cursor-pointer transition-all"
                      style={{
                        background: editIcon === ic ? VELA_ACCENT_SOFT : "var(--bg)",
                        borderColor: editIcon === ic ? VELA_ACCENT : "var(--rule)",
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
                      onClick={() => setEditColor(c)}
                      className="w-5.5 h-5.5 rounded-full border-0.5 cursor-pointer transition-transform hover:scale-110"
                      style={{
                        background: c,
                        borderColor: editColor === c ? "var(--ink)" : "transparent",
                      }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-1.5 text-muted-foreground">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void handleSaveEdit(); if (e.key === "Escape") setEditing(false); }}
                autoFocus
                className="w-full h-9.5 px-3 rounded-[7px] text-[14px] border border-(--rule) bg-(--bg) text-(--ink) outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-1.5 text-muted-foreground">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-[7px] text-[13px] leading-normal border border-(--rule) bg-(--bg) text-(--ink) outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[150px]">
                <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-1.5 text-muted-foreground">
                  Target Date
                </label>
                <input
                  type="date"
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                  className="w-full h-9.5 px-3 rounded-[7px] text-[13px] border border-(--rule) bg-(--bg) text-(--ink) outline-none"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-1.5 text-muted-foreground">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as "high" | "medium" | "low")}
                  className="w-full h-9.5 px-3 rounded-[7px] text-[13px] border border-(--rule) bg-(--bg) text-(--ink) outline-none cursor-pointer"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-0.5">
              <button
                onClick={() => void handleSaveEdit()}
                disabled={editSaving || !editTitle.trim()}
                className="flex items-center gap-1.5 px-4 h-8.5 rounded-[7px] font-mono text-[9px] tracking-widest uppercase font-semibold text-white border-none cursor-pointer disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: VELA_ACCENT }}
              >
                {editSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={editSaving}
                className="px-3.5 h-8.5 rounded-[7px] font-mono text-[9px] tracking-widest uppercase border border-(--rule) bg-transparent cursor-pointer text-muted-foreground transition-opacity hover:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
        <div className="flex items-start gap-3">

          {/* Icon */}
          <div
            className="w-10 h-10 rounded-[9px] flex items-center justify-center text-[20px] flex-shrink-0 mt-0.25"
            style={{
              background: `${objective.color}15`,
              border: `1px solid ${objective.color}25`,
            }}
          >
            {objective.icon}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title + pills */}
            <div className="flex items-center gap-1.75 flex-wrap mb-0.5">
              <h3 className="font-medium text-[14px] leading-[1.3] text-(--ink) m-0 truncate">
                {objective.title}
              </h3>
              <button
                onClick={() => void handleStatusCycle()}
                disabled={statusBusy}
                className="flex-shrink-0 font-mono text-[8px] tracking-widest uppercase px-1.75 py-0.5 rounded-full border-none cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-50"
                style={{ background: `${statusCfg.color}15`, color: statusCfg.color }}
                title="Click to toggle status"
              >
                {statusBusy ? "…" : statusCfg.label}
              </button>
              <span
                className="flex-shrink-0 font-mono text-[8px] tracking-widest uppercase px-1.75 py-0.5 rounded-full"
                style={{ background: `${priorityCfg.color}12`, color: priorityCfg.color }}
              >
                {priorityCfg.label}
              </span>
            </div>

            {objective.description && (
              <p className="text-[12px] leading-normal mt-1 mb-0 text-muted-foreground">
                {objective.description}
              </p>
            )}

            {/* Progress bar — only when milestones exist */}
            {totalMilestones > 0 && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-1.25">
                  <span className="font-mono text-[9px] text-(--ink-4)">
                    {doneMilestones}/{totalMilestones} milestones
                  </span>
                  <span
                    className="font-mono text-[9px] font-semibold"
                    style={{ color: objective.color }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: "var(--rule)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: objective.color }}
                  />
                </div>
              </div>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-3.5 mt-2 flex-wrap">
              {daysUntilTarget !== null && (
                <span
                  className="font-mono text-[9px] tracking-[0.06em]"
                  style={{ color: daysUntilTarget < 7 ? "#DC2626" : "var(--ink-4)" }}
                >
                  {daysUntilTarget < 0
                    ? `${Math.abs(daysUntilTarget)}d overdue`
                    : daysUntilTarget === 0
                    ? "Due today"
                    : `${daysUntilTarget}d left`}
                </span>
              )}
              {totalMilestones === 0 && (
                <span className="font-mono text-[9px] text-(--ink-4)">No milestones yet</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.25 flex-shrink-0">
            <button
              onClick={startEdit}
              className="w-7 h-7 flex items-center justify-center rounded-md border-none cursor-pointer transition-all bg-transparent"
              style={{ color: "var(--ink-4)" }}
              title="Edit objective"
              aria-label="Edit objective"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => void handleDelete()}
              disabled={deleteBusy}
              className="w-7 h-7 flex items-center justify-center rounded-md border-none cursor-pointer transition-all bg-transparent disabled:opacity-50"
              style={{ color: confirmDelete ? "#DC2626" : "var(--ink-4)" }}
              title={confirmDelete ? "Click again to confirm" : "Delete objective"}
            >
              <Trash2 size={12} className={deleteBusy ? "animate-pulse" : ""} />
            </button>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="w-7 h-7 flex items-center justify-center rounded-md border-none cursor-pointer transition-all bg-transparent"
              style={{ color: "var(--ink-4)" }}
              aria-label={expanded ? "Collapse" : "Expand milestones"}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Milestones */}
      {expanded && !editing && (
        <div
          className="border-t px-4.5 py-4"
          style={{ borderColor: "var(--rule)", background: "var(--bg)" }}
        >
          <div
            className="font-mono text-[9px] tracking-[0.14em] uppercase mb-2.5"
            style={{ color: "var(--ink-4)" }}
          >
            Milestones
          </div>

          {milestones.length === 0 && (
            <p className="text-[12px] text-muted-foreground m-0 pb-1">No milestones yet.</p>
          )}

          <div className="space-y-0.5">
            {milestones.map((m: JoMilestone) => (
              <div
                key={m.id}
                className="flex items-center gap-2.25 group px-2 py-1.75 rounded-md hover:bg-(--bg-2) transition-colors"
              >
                <button
                  onClick={() => void handleMilestoneToggle(m.id, !m.is_done)}
                  disabled={togglingId === m.id}
                  className="flex-shrink-0 border-none bg-transparent cursor-pointer p-0 flex items-center transition-all disabled:opacity-60"
                  style={{ color: m.is_done ? VELA_ACCENT : "var(--ink-4)" }}
                  aria-label={m.is_done ? "Mark incomplete" : "Mark done"}
                >
                  {m.is_done ? (
                    <CheckCircle2 size={14} strokeWidth={2.5} />
                  ) : (
                    <Circle size={14} />
                  )}
                </button>
                <span
                  className="flex-1 text-[13px] leading-[1.4] transition-all duration-200"
                  style={{
                    color: m.is_done ? "var(--ink-4)" : "var(--ink)",
                    textDecoration: m.is_done ? "line-through" : "none",
                  }}
                >
                  {m.title}
                </span>
                {m.due_date && (
                  <span className="font-mono text-[9px] text-(--ink-4) shrink-0">
                    {new Date(m.due_date).toLocaleDateString("en-GB", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
                <button
                  onClick={() => void onMilestoneDelete(m.id)}
                  className="w-4.5 h-4.5 flex items-center justify-center border-none bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--ink-4)" }}
                  aria-label="Delete milestone"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>

          {/* Add milestone */}
          {addingMilestone ? (
            <div className="flex items-center gap-2 mt-2.5">
              <input
                autoFocus
                type="text"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleAddMilestone();
                  if (e.key === "Escape") {
                    setAddingMilestone(false);
                    setNewMilestone("");
                  }
                }}
                placeholder="Milestone title…"
                className="flex-1 h-8.5 px-2.5 rounded-md text-[13px] border outline-none"
                style={{
                  borderColor: "var(--rule)",
                  background: "var(--bg-2)",
                  color: "var(--ink)",
                }}
              />
              <button
                onClick={() => void handleAddMilestone()}
                disabled={busy || !newMilestone.trim()}
                className="h-8.5 px-3 rounded-md text-[11px] font-mono font-semibold border-none cursor-pointer disabled:opacity-50 transition-opacity"
                style={{ background: VELA_ACCENT, color: "#fff" }}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAddingMilestone(false);
                  setNewMilestone("");
                }}
                className="h-8.5 px-2.5 rounded-md text-[11px] border cursor-pointer bg-transparent"
                style={{ borderColor: "var(--rule)", color: "var(--ink-3)" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingMilestone(true)}
              className="flex items-center gap-1.25 text-[12px] font-medium border-none bg-transparent cursor-pointer mt-2.5 transition-opacity hover:opacity-70"
              style={{ color: VELA_ACCENT }}
            >
              <Plus size={12} />
              Add milestone
            </button>
          )}
        </div>
      )}
    </div>
  );
}
