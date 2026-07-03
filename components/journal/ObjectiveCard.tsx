"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp, Plus, Pencil, Check, X } from "lucide-react";
import type { JoObjectiveWithMilestones, JoMilestone, JoObjective } from "@/lib/journal/types";
import { PRIORITY_CONFIG, STATUS_CONFIG, OBJECTIVE_COLORS, VELA_ACCENT } from "@/lib/journal/types";

const ICONS = ["🎯", "💡", "🚀", "📚", "💪", "🏆", "🌱", "✍️", "💰", "🎨", "🔬", "🤝"];

// All four statuses reachable: active → completed → dropped → paused → active
const STATUS_CYCLE: Record<JoObjective["status"], JoObjective["status"]> = {
  active: "completed",
  completed: "dropped",
  dropped: "paused",
  paused: "active",
};

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

  // Inline edit state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(objective.title);
  const [editDesc, setEditDesc] = useState(objective.description ?? "");
  const [editDate, setEditDate] = useState(objective.target_date ?? "");
  const [editPriority, setEditPriority] = useState<JoObjective["priority"]>(objective.priority);
  const [editColor, setEditColor] = useState(objective.color);
  const [editIcon, setEditIcon] = useState(objective.icon);
  const [editSaving, setEditSaving] = useState(false);

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
    await onUpdate(objective.id, { status: STATUS_CYCLE[objective.status] });
  };

  const handleEditSave = async (): Promise<void> => {
    if (!editTitle.trim()) return;
    setEditSaving(true);
    await onUpdate(objective.id, {
      title: editTitle.trim(),
      description: editDesc.trim() || null,
      target_date: editDate || null,
      priority: editPriority,
      color: editColor,
      icon: editIcon,
    });
    setEditSaving(false);
    setEditing(false);
  };

  const handleEditCancel = (): void => {
    setEditTitle(objective.title);
    setEditDesc(objective.description ?? "");
    setEditDate(objective.target_date ?? "");
    setEditPriority(objective.priority);
    setEditColor(objective.color);
    setEditIcon(objective.icon);
    setEditing(false);
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
    await onDelete(objective.id);
  };

  return (
    <div
      className="rounded-[12px] border border-[var(--rule)] overflow-hidden transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      style={{ background: "var(--bg)" }}
    >
      <div className="h-[3px]" style={{ background: editing ? editColor : objective.color }} />

      <div className="p-[20px]">
        {editing ? (
          /* ── Inline edit panel ── */
          <div className="space-y-[14px]">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
              Edit Objective
            </div>

            <div className="flex gap-[16px] flex-wrap">
              <div>
                <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[6px] text-[var(--ink-3)]">Icon</label>
                <div className="flex flex-wrap gap-[5px]">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setEditIcon(ic)}
                      className="w-[30px] h-[30px] text-[16px] rounded-[6px] flex items-center justify-center border cursor-pointer transition-all"
                      style={{
                        background: editIcon === ic ? `${editColor}18` : "var(--bg-2)",
                        borderColor: editIcon === ic ? editColor : "var(--rule)",
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[6px] text-[var(--ink-3)]">Colour</label>
                <div className="flex flex-wrap gap-[5px]">
                  {OBJECTIVE_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className="w-[22px] h-[22px] rounded-full border-[2px] cursor-pointer transition-transform hover:scale-110"
                      style={{ background: c, borderColor: editColor === c ? "var(--ink)" : "transparent" }}
                      aria-label={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title *"
              className="w-full h-[40px] px-[12px] rounded-[8px] text-[14px] border border-[var(--rule)] bg-[var(--bg-2)] text-[var(--ink)] outline-none focus:border-[var(--ink-3)]"
            />

            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-[12px] py-[9px] rounded-[8px] text-[13px] leading-[1.5] border border-[var(--rule)] bg-[var(--bg-2)] text-[var(--ink)] outline-none focus:border-[var(--ink-3)] resize-none"
            />

            <div className="flex gap-[12px] flex-wrap">
              <div className="flex-1 min-w-[160px]">
                <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[5px] text-[var(--ink-3)]">Target Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full h-[38px] px-[10px] rounded-[8px] text-[13px] border border-[var(--rule)] bg-[var(--bg-2)] text-[var(--ink)] outline-none"
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[5px] text-[var(--ink-3)]">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as JoObjective["priority"])}
                  className="w-full h-[38px] px-[10px] rounded-[8px] text-[13px] border border-[var(--rule)] bg-[var(--bg-2)] text-[var(--ink)] outline-none cursor-pointer"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex gap-[8px]">
              <button
                onClick={() => void handleEditSave()}
                disabled={editSaving || !editTitle.trim()}
                className="flex items-center gap-[6px] h-[36px] px-[14px] rounded-[7px] font-mono text-[10px] tracking-[0.1em] uppercase font-semibold text-white border-none cursor-pointer disabled:opacity-50 transition-opacity"
                style={{ background: VELA_ACCENT }}
              >
                {editSaving ? "Saving…" : <><Check size={12} /> Save</>}
              </button>
              <button
                onClick={handleEditCancel}
                className="h-[36px] px-[12px] rounded-[7px] font-mono text-[10px] tracking-[0.1em] uppercase border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] transition-opacity hover:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* ── Display mode ── */
          <>
            <div className="flex items-start gap-[12px]">
              <span className="text-[22px] leading-none mt-[1px] select-none">{objective.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[8px] flex-wrap">
                  <h3 className="font-medium text-[15px] leading-[1.3] text-[var(--ink)] m-0 truncate">
                    {objective.title}
                  </h3>
                  <button
                    onClick={() => void handleStatusCycle()}
                    className="flex-shrink-0 font-mono text-[9px] tracking-[0.1em] uppercase px-[7px] py-[3px] rounded-full border-none cursor-pointer transition-opacity hover:opacity-70"
                    style={{ background: `${statusCfg.color}18`, color: statusCfg.color }}
                    title={`Status: ${statusCfg.label} — click to advance`}
                  >
                    {statusCfg.label}
                  </button>
                  <span
                    className="flex-shrink-0 font-mono text-[9px] tracking-[0.1em] uppercase px-[7px] py-[3px] rounded-full"
                    style={{ background: `${priorityCfg.color}15`, color: priorityCfg.color }}
                  >
                    {priorityCfg.label}
                  </span>
                </div>

                {objective.description && (
                  <p className="text-[13px] leading-[1.5] mt-[6px] mb-0 text-[var(--ink-3)]">
                    {objective.description}
                  </p>
                )}

                <div className="flex items-center gap-[16px] mt-[10px] flex-wrap">
                  {daysUntilTarget !== null && (
                    <span
                      className="font-mono text-[10px] tracking-[0.06em]"
                      style={{ color: daysUntilTarget < 7 ? "#DC2626" : "var(--ink-3)" }}
                    >
                      {daysUntilTarget < 0
                        ? `${Math.abs(daysUntilTarget)}d overdue`
                        : daysUntilTarget === 0
                        ? "Due today"
                        : `${daysUntilTarget}d left`}
                    </span>
                  )}
                  {totalMilestones > 0 && (
                    <span className="font-mono text-[10px] tracking-[0.06em] text-[var(--ink-3)]">
                      {doneMilestones}/{totalMilestones} milestones
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-[4px] flex-shrink-0">
                <button
                  onClick={() => setEditing(true)}
                  className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border-none cursor-pointer bg-transparent text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
                  title="Edit objective"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => void handleDelete()}
                  className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border-none cursor-pointer transition-all bg-transparent"
                  style={{ color: confirmDelete ? "#DC2626" : "var(--ink-3)" }}
                  title={confirmDelete ? "Click again to confirm" : "Delete objective"}
                >
                  <Trash2 size={13} />
                </button>
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border-none cursor-pointer transition-all bg-transparent text-[var(--ink-3)]"
                  aria-label={expanded ? "Collapse milestones" : "Expand milestones"}
                >
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {totalMilestones > 0 && (
              <div className="mt-[14px]">
                <div className="h-[4px] rounded-full overflow-hidden" style={{ background: "var(--rule)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: objective.color }}
                  />
                </div>
                <div className="font-mono text-[10px] tracking-[0.06em] mt-[5px] text-[var(--ink-3)]">
                  {pct}% complete
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Expanded milestones */}
      {!editing && expanded && (
        <div
          className="border-t border-[var(--rule)] px-[20px] py-[16px] space-y-[8px]"
          style={{ background: "var(--bg-2)" }}
        >
          <div className="font-mono text-[9px] tracking-[0.14em] uppercase mb-[10px] text-[var(--ink-3)]">
            Milestones
          </div>

          {milestones.length === 0 && (
            <p className="text-[13px] text-[var(--ink-3)] m-0">No milestones yet.</p>
          )}

          {milestones.map((m: JoMilestone) => (
            <div key={m.id} className="flex items-center gap-[10px] group">
              <button
                onClick={() => void onMilestoneToggle(m.id, !m.is_done)}
                className="flex-shrink-0 border-none bg-transparent cursor-pointer p-0 flex items-center"
                style={{ color: m.is_done ? VELA_ACCENT : "var(--ink-3)" }}
                aria-label={m.is_done ? "Mark incomplete" : "Mark done"}
              >
                {m.is_done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </button>
              <span
                className="flex-1 text-[13px] leading-[1.4]"
                style={{
                  color: m.is_done ? "var(--ink-3)" : "var(--ink)",
                  textDecoration: m.is_done ? "line-through" : "none",
                }}
              >
                {m.title}
              </span>
              {m.due_date && (
                <span className="font-mono text-[10px] text-[var(--ink-3)] shrink-0">
                  {new Date(m.due_date).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                </span>
              )}
              <button
                onClick={() => void onMilestoneDelete(m.id)}
                className="w-[20px] h-[20px] flex items-center justify-center border-none bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--ink-3)" }}
                aria-label="Delete milestone"
              >
                <X size={11} />
              </button>
            </div>
          ))}

          {addingMilestone ? (
            <div className="flex items-center gap-[8px] mt-[8px]">
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
                className="flex-1 h-[34px] px-[10px] rounded-[7px] text-[13px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none"
              />
              <button
                onClick={() => void handleAddMilestone()}
                disabled={busy || !newMilestone.trim()}
                className="h-[34px] px-[12px] rounded-[7px] text-[12px] font-mono font-semibold border-none cursor-pointer disabled:opacity-50 transition-opacity"
                style={{ background: VELA_ACCENT, color: "#fff" }}
              >
                Add
              </button>
              <button
                onClick={() => { setAddingMilestone(false); setNewMilestone(""); }}
                className="h-[34px] px-[10px] rounded-[7px] text-[12px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingMilestone(true)}
              className="flex items-center gap-[6px] text-[12px] font-medium border-none bg-transparent cursor-pointer mt-[4px] transition-opacity hover:opacity-70"
              style={{ color: VELA_ACCENT }}
            >
              <Plus size={13} />
              Add milestone
            </button>
          )}
        </div>
      )}
    </div>
  );
}
