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
      className="rounded-[12px] border overflow-hidden transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]"
      style={{
        borderColor: "var(--rule)",
        background: "var(--bg-2)",
      }}
    >
      {/* Top colour stripe */}
      <div className="h-[3px]" style={{ background: objective.color }} />

      <div className="p-[18px]">
        {editing ? (
          <div className="space-y-[14px]">
            <div className="flex gap-[16px] flex-wrap">
              <div>
                <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-[8px] text-[var(--ink-3)]">
                  Icon
                </label>
                <div className="flex flex-wrap gap-[6px]">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setEditIcon(ic)}
                      className="w-[30px] h-[30px] text-[16px] rounded-[6px] flex items-center justify-center border cursor-pointer transition-all"
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
                <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-[8px] text-[var(--ink-3)]">
                  Colour
                </label>
                <div className="flex flex-wrap gap-[6px]">
                  {OBJECTIVE_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className="w-[22px] h-[22px] rounded-full border-[2px] cursor-pointer transition-transform hover:scale-110"
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
              <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-[6px] text-[var(--ink-3)]">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void handleSaveEdit(); if (e.key === "Escape") setEditing(false); }}
                autoFocus
                className="w-full h-[38px] px-[12px] rounded-[7px] text-[14px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-[6px] text-[var(--ink-3)]">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="w-full px-[12px] py-[8px] rounded-[7px] text-[13px] leading-[1.5] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none resize-none"
              />
            </div>

            <div className="flex gap-[12px] flex-wrap">
              <div className="flex-1 min-w-[150px]">
                <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-[6px] text-[var(--ink-3)]">
                  Target Date
                </label>
                <input
                  type="date"
                  value={editTargetDate}
                  onChange={(e) => setEditTargetDate(e.target.value)}
                  className="w-full h-[38px] px-[12px] rounded-[7px] text-[13px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block font-mono text-[9px] tracking-[0.12em] uppercase mb-[6px] text-[var(--ink-3)]">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as "high" | "medium" | "low")}
                  className="w-full h-[38px] px-[12px] rounded-[7px] text-[13px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none cursor-pointer"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex gap-[8px] pt-[2px]">
              <button
                onClick={() => void handleSaveEdit()}
                disabled={editSaving || !editTitle.trim()}
                className="flex items-center gap-[6px] px-[16px] h-[34px] rounded-[7px] font-mono text-[9px] tracking-[0.1em] uppercase font-semibold text-white border-none cursor-pointer disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: VELA_ACCENT }}
              >
                {editSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={editSaving}
                className="px-[14px] h-[34px] rounded-[7px] font-mono text-[9px] tracking-[0.1em] uppercase border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] transition-opacity hover:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
        <div className="flex items-start gap-[12px]">

          {/* Icon */}
          <div
            className="w-[40px] h-[40px] rounded-[9px] flex items-center justify-center text-[20px] flex-shrink-0 mt-[1px]"
            style={{
              background: `${objective.color}15`,
              border: `1px solid ${objective.color}25`,
            }}
          >
            {objective.icon}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title + pills */}
            <div className="flex items-center gap-[7px] flex-wrap mb-[2px]">
              <h3 className="font-medium text-[14px] leading-[1.3] text-[var(--ink)] m-0 truncate">
                {objective.title}
              </h3>
              <button
                onClick={() => void handleStatusCycle()}
                disabled={statusBusy}
                className="flex-shrink-0 font-mono text-[8px] tracking-[0.1em] uppercase px-[7px] py-[2px] rounded-full border-none cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-50"
                style={{ background: `${statusCfg.color}15`, color: statusCfg.color }}
                title="Click to toggle status"
              >
                {statusBusy ? "…" : statusCfg.label}
              </button>
              <span
                className="flex-shrink-0 font-mono text-[8px] tracking-[0.1em] uppercase px-[7px] py-[2px] rounded-full"
                style={{ background: `${priorityCfg.color}12`, color: priorityCfg.color }}
              >
                {priorityCfg.label}
              </span>
            </div>

            {objective.description && (
              <p className="text-[12px] leading-[1.5] mt-[4px] mb-0 text-[var(--ink-3)]">
                {objective.description}
              </p>
            )}

            {/* Progress bar — only when milestones exist */}
            {totalMilestones > 0 && (
              <div className="mt-[10px]">
                <div className="flex items-center justify-between mb-[5px]">
                  <span className="font-mono text-[9px] text-[var(--ink-4)]">
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
                  className="h-[4px] rounded-full overflow-hidden"
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
            <div className="flex items-center gap-[14px] mt-[8px] flex-wrap">
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
                <span className="font-mono text-[9px] text-[var(--ink-4)]">No milestones yet</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-[1px] flex-shrink-0">
            <button
              onClick={startEdit}
              className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border-none cursor-pointer transition-all bg-transparent"
              style={{ color: "var(--ink-4)" }}
              title="Edit objective"
              aria-label="Edit objective"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => void handleDelete()}
              disabled={deleteBusy}
              className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border-none cursor-pointer transition-all bg-transparent disabled:opacity-50"
              style={{ color: confirmDelete ? "#DC2626" : "var(--ink-4)" }}
              title={confirmDelete ? "Click again to confirm" : "Delete objective"}
            >
              <Trash2 size={12} className={deleteBusy ? "animate-pulse" : ""} />
            </button>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border-none cursor-pointer transition-all bg-transparent"
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
          className="border-t px-[18px] py-[16px]"
          style={{ borderColor: "var(--rule)", background: "var(--bg)" }}
        >
          <div
            className="font-mono text-[9px] tracking-[0.14em] uppercase mb-[10px]"
            style={{ color: "var(--ink-4)" }}
          >
            Milestones
          </div>

          {milestones.length === 0 && (
            <p className="text-[12px] text-[var(--ink-3)] m-0 pb-[4px]">No milestones yet.</p>
          )}

          <div className="space-y-[2px]">
            {milestones.map((m: JoMilestone) => (
              <div
                key={m.id}
                className="flex items-center gap-[9px] group px-[8px] py-[7px] rounded-[6px] hover:bg-[var(--bg-2)] transition-colors"
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
                  <span className="font-mono text-[9px] text-[var(--ink-4)] shrink-0">
                    {new Date(m.due_date).toLocaleDateString("en-GB", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
                <button
                  onClick={() => void onMilestoneDelete(m.id)}
                  className="w-[18px] h-[18px] flex items-center justify-center border-none bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
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
            <div className="flex items-center gap-[8px] mt-[10px]">
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
                className="flex-1 h-[34px] px-[10px] rounded-[6px] text-[13px] border outline-none"
                style={{
                  borderColor: "var(--rule)",
                  background: "var(--bg-2)",
                  color: "var(--ink)",
                }}
              />
              <button
                onClick={() => void handleAddMilestone()}
                disabled={busy || !newMilestone.trim()}
                className="h-[34px] px-[12px] rounded-[6px] text-[11px] font-mono font-semibold border-none cursor-pointer disabled:opacity-50 transition-opacity"
                style={{ background: VELA_ACCENT, color: "#fff" }}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAddingMilestone(false);
                  setNewMilestone("");
                }}
                className="h-[34px] px-[10px] rounded-[6px] text-[11px] border cursor-pointer bg-transparent"
                style={{ borderColor: "var(--rule)", color: "var(--ink-3)" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingMilestone(true)}
              className="flex items-center gap-[5px] text-[12px] font-medium border-none bg-transparent cursor-pointer mt-[10px] transition-opacity hover:opacity-70"
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
