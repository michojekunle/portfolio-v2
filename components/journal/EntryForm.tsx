"use client";

import { useState, useCallback, useRef } from "react";
import { Plus, X, Save, Loader2, Sparkles } from "lucide-react";
import type { JoEntry, JoObjectiveWithMilestones } from "@/lib/journal/types";
import { ENERGY_LABELS, VELA_ACCENT, VELA_ACCENT_SOFT } from "@/lib/journal/types";
import { SaveToast } from "@/components/journal/SaveToast";

const REFLECTION_PROMPTS = [
  "What is one thing that felt surprisingly easy or smooth today?",
  "How did you handle any moments of frustration or blocker today?",
  "If you could replay one conversation from today, what would you change?",
  "What was a small, quiet moment of joy or peace you experienced today?",
  "What did you learn about yourself or your work style today?",
  "Who did you feel most connected to today, and why?",
  "What was the most challenging decision you had to make today?",
  "What is something you are proud of moving forward today?",
  "How did your energy level affect your focus and priorities today?",
  "What habit are you currently building that you made progress on today?",
  "What did you do today that brought you closer to your active objectives?",
  "If you could summarize today's lesson in one sentence, what would it be?",
  "What is a priority you planned today but couldn't touch? Why not?",
  "What is one thing you can do tomorrow to remove today's biggest friction?",
  "Who or what are you most grateful for in your day today?",
];

interface Props {
  date: string;
  initialEntry: JoEntry | null;
  objectives: JoObjectiveWithMilestones[];
  onSaved?: (entry: JoEntry) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div
      className="font-mono text-[10px] tracking-[0.14em] uppercase mb-[12px]"
      style={{ color: "var(--ink-3)" }}
    >
      {children}
    </div>
  );
}

export function EntryForm({ date, initialEntry, objectives, onSaved }: Props): React.ReactElement {
  const [priorities, setPriorities] = useState<string[]>(initialEntry?.top_priorities ?? []);
  const [accomplished, setAccomplished] = useState<string[]>(initialEntry?.accomplished ?? []);
  const [blockers, setBlockers] = useState(initialEntry?.blockers ?? "");
  const [notes, setNotes] = useState(initialEntry?.notes ?? "");
  const [energy, setEnergy] = useState<number | null>(initialEntry?.energy_level ?? null);
  const [linkedObjectiveIds, setLinkedObjectiveIds] = useState<string[]>(
    initialEntry?.objective_ids ?? []
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newPriority, setNewPriority] = useState("");
  const [newAccomplished, setNewAccomplished] = useState("");
  const priorityInputRef = useRef<HTMLInputElement>(null);
  const accomplishedInputRef = useRef<HTMLInputElement>(null);

  const isComplete = priorities.length > 0 && accomplished.length > 0 && energy !== null;

  const generatePrompt = (): void => {
    const randomPrompt = REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
    setNotes((prev) => {
      const spacing = prev.trim() ? "\n\n" : "";
      return prev + spacing + `${randomPrompt}\n\n`;
    });
  };

  const addItem = (
    list: string[],
    setList: (v: string[]) => void,
    value: string,
    setValue: (v: string) => void
  ): void => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setList([...list, trimmed]);
    setValue("");
  };

  const removeItem = (list: string[], setList: (v: string[]) => void, idx: number): void => {
    setList(list.filter((_, i) => i !== idx));
  };

  const toggleObjective = (id: string): void => {
    setLinkedObjectiveIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = useCallback(async (): Promise<void> => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/journal/entries/${date}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          top_priorities: priorities,
          accomplished,
          blockers: blockers.trim() || null,
          notes: notes.trim() || null,
          energy_level: energy,
          objective_ids: linkedObjectiveIds,
        }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Save failed");
      }
      const json = (await res.json()) as { entry: JoEntry };
      setSaved(true);
      setToastVisible(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved?.(json.entry);
    } catch (err) {
      console.error("[entry-form] save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [date, priorities, accomplished, blockers, notes, energy, linkedObjectiveIds, onSaved]);

  const activeObjectives = objectives.filter((o) => o.status === "active");

  const inputClass =
    "flex-1 h-[40px] px-[12px] rounded-[8px] text-[14px] outline-none transition-colors";
  const inputStyle = {
    border: "1.5px solid var(--rule)",
    background: "var(--bg)",
    color: "var(--ink)",
  };
  const textareaClass =
    "w-full px-[12px] py-[10px] rounded-[8px] text-[14px] leading-[1.65] outline-none transition-colors resize-none";

  return (
    <>
      <SaveToast
        visible={toastVisible}
        message="Entry saved"
        onDismiss={() => setToastVisible(false)}
      />

      <div className="space-y-[36px]">

        {/* Priorities */}
        <section id="priorities" style={{ scrollMarginTop: "24px" }}>
          <SectionLabel>Today&apos;s Priorities</SectionLabel>
          <div className="space-y-[6px]">
            {priorities.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-[10px] group px-[12px] py-[10px] rounded-[8px]"
                style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
              >
                <span
                  className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                  style={{ background: VELA_ACCENT_SOFT, color: VELA_ACCENT }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-[14px] text-[var(--ink)]">{p}</span>
                <button
                  onClick={() => removeItem(priorities, setPriorities, i)}
                  className="w-[20px] h-[20px] flex items-center justify-center rounded-full border-none bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--ink-3)" }}
                  aria-label="Remove"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            <div className="flex gap-[8px]">
              <input
                ref={priorityInputRef}
                type="text"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addItem(priorities, setPriorities, newPriority, setNewPriority);
                    priorityInputRef.current?.focus();
                  }
                }}
                placeholder="Add a priority and press Enter…"
                className={inputClass}
                style={inputStyle}
              />
              <button
                onClick={() => addItem(priorities, setPriorities, newPriority, setNewPriority)}
                disabled={!newPriority.trim()}
                className="w-[40px] h-[40px] flex items-center justify-center rounded-[8px] border-none cursor-pointer disabled:opacity-40 transition-opacity"
                style={{ background: VELA_ACCENT_SOFT, color: VELA_ACCENT }}
                aria-label="Add priority"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        </section>

        <div className="h-[1px]" style={{ background: "var(--rule)" }} />

        {/* Accomplished — start of the "log the day" wrap-up flow */}
        <section id="log-today" style={{ scrollMarginTop: "24px" }}>
          <SectionLabel>What Got Done</SectionLabel>
          <div className="space-y-[6px]">
            {accomplished.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-[10px] group px-[12px] py-[10px] rounded-[8px]"
                style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
              >
                <span
                  className="text-[13px] flex-shrink-0 font-semibold"
                  style={{ color: "#16A34A" }}
                >
                  ✓
                </span>
                <span className="flex-1 text-[14px] text-[var(--ink)]">{a}</span>
                <button
                  onClick={() => removeItem(accomplished, setAccomplished, i)}
                  className="w-[20px] h-[20px] flex items-center justify-center rounded-full border-none bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--ink-3)" }}
                  aria-label="Remove"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            <div className="flex gap-[8px]">
              <input
                ref={accomplishedInputRef}
                type="text"
                value={newAccomplished}
                onChange={(e) => setNewAccomplished(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addItem(accomplished, setAccomplished, newAccomplished, setNewAccomplished);
                    accomplishedInputRef.current?.focus();
                  }
                }}
                placeholder="What did you actually finish today?"
                className={inputClass}
                style={inputStyle}
              />
              <button
                onClick={() =>
                  addItem(accomplished, setAccomplished, newAccomplished, setNewAccomplished)
                }
                disabled={!newAccomplished.trim()}
                className="w-[40px] h-[40px] flex items-center justify-center rounded-[8px] border-none cursor-pointer disabled:opacity-40 transition-opacity"
                style={{ background: "rgba(22,163,74,0.10)", color: "#16A34A" }}
                aria-label="Add"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        </section>

        <div className="h-[1px]" style={{ background: "var(--rule)" }} />

        {/* Blockers */}
        <section>
          <SectionLabel>Blockers &amp; Friction</SectionLabel>
          <textarea
            id="blockers"
            value={blockers}
            onChange={(e) => setBlockers(e.target.value)}
            placeholder="What got in the way? What would you remove if you could?"
            rows={3}
            className={textareaClass}
            style={{ ...inputStyle, height: "auto" }}
          />
        </section>

        <div className="h-[1px]" style={{ background: "var(--rule)" }} />

        {/* Reflection */}
        <section>
          <div className="flex items-center justify-between mb-[12px]">
            <SectionLabel>Reflection &amp; Notes</SectionLabel>
            <button
              type="button"
              onClick={generatePrompt}
              className="font-mono text-[8px] tracking-[0.1em] uppercase px-[9px] py-[4px] rounded-[6px] border cursor-pointer transition-all flex items-center gap-[5px] -mt-[12px]"
              style={{
                borderColor: "var(--rule)",
                background: "transparent",
                color: "var(--ink-3)",
              }}
            >
              <Sparkles size={8} style={{ color: VELA_ACCENT }} />
              Prompt
            </button>
          </div>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you learn? What would you do differently? Free write here…"
            rows={5}
            className={textareaClass}
            style={{ ...inputStyle, height: "auto" }}
          />
        </section>

        <div className="h-[1px]" style={{ background: "var(--rule)" }} />

        {/* Energy */}
        <section>
          <SectionLabel>Energy Level</SectionLabel>
          <div className="flex gap-[8px]">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setEnergy(energy === level ? null : level)}
                className="flex-1 py-[10px] rounded-[8px] text-[12px] font-medium border transition-all cursor-pointer"
                style={
                  energy === level
                    ? {
                        background: VELA_ACCENT,
                        color: "#fff",
                        borderColor: VELA_ACCENT,
                        boxShadow: `0 2px 12px rgba(124,58,237,0.3)`,
                      }
                    : {
                        background: "var(--bg-2)",
                        color: "var(--ink-2)",
                        borderColor: "var(--rule)",
                      }
                }
                title={ENERGY_LABELS[level]}
              >
                <div className="text-[15px] mb-[2px]">{"⚡".repeat(level)}</div>
                <div className="font-mono text-[9px] tracking-[0.04em] hidden min-[480px]:block opacity-70">
                  {ENERGY_LABELS[level]}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Linked objectives */}
        {activeObjectives.length > 0 && (
          <>
            <div className="h-[1px]" style={{ background: "var(--rule)" }} />
            <section>
              <SectionLabel>Objectives Touched Today</SectionLabel>
              <div className="flex flex-wrap gap-[8px]">
                {activeObjectives.map((obj) => {
                  const active = linkedObjectiveIds.includes(obj.id);
                  return (
                    <button
                      key={obj.id}
                      onClick={() => toggleObjective(obj.id)}
                      className="flex items-center gap-[6px] px-[12px] py-[7px] rounded-[8px] text-[13px] font-medium border transition-all cursor-pointer"
                      style={
                        active
                          ? {
                              background: `${obj.color}15`,
                              color: obj.color,
                              borderColor: `${obj.color}35`,
                            }
                          : {
                              background: "var(--bg-2)",
                              color: "var(--ink-2)",
                              borderColor: "var(--rule)",
                            }
                      }
                    >
                      <span>{obj.icon}</span>
                      {obj.title}
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-[8px] px-[14px] py-[10px] text-[13px] font-mono"
            style={{
              background: "rgba(220,38,38,0.07)",
              color: "#DC2626",
              border: "1px solid rgba(220,38,38,0.18)",
            }}
          >
            {error}
          </div>
        )}

        {/* Save */}
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="flex items-center justify-center gap-[8px] w-full h-[48px] rounded-[10px] font-mono text-[11px] tracking-[0.14em] uppercase font-semibold text-white border-none cursor-pointer disabled:opacity-60 transition-all"
          style={{
            background: saved ? "#16A34A" : VELA_ACCENT,
            boxShadow: isComplete && !saved
              ? `0 4px 24px rgba(124,58,237,0.35)`
              : "none",
          }}
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : saved ? (
            <>Saved ✓</>
          ) : (
            <>
              <Save size={13} />
              Save Entry
            </>
          )}
        </button>
      </div>
    </>
  );
}
