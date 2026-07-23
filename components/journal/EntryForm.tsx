"use client";

import { useState, useCallback, useRef } from "react";
import { Plus, X, Save, Loader2, Sparkles, ChevronDown, AlertCircle } from "lucide-react";
import type { JoEntry, JoObjectiveWithMilestones } from "@/lib/journal/types";
import { ENERGY_LABELS, VELA_ACCENT, VELA_ACCENT_SOFT } from "@/lib/journal/types";
import { SaveToast } from "@/components/journal/SaveToast";
import { db } from "@/lib/journal/db";
import { createClient } from "@/lib/supabase/client";

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
  /** "priorities" narrows the form to just priorities and collapses the rest. "log" (default) shows everything. */
  initialView?: "priorities" | "log";
}

async function queueEntryLocally(
  date: string,
  initialEntry: JoEntry | null,
  payload: {
    top_priorities: string[];
    accomplished: string[];
    blockers: string | null;
    notes: string | null;
    energy_level: number | null;
    objective_ids: string[];
  }
): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user for offline save");

  const existingLocal = await db.entries.get(initialEntry?.id ?? "");
  const id = existingLocal?.id ?? initialEntry?.id ?? crypto.randomUUID();
  const now = new Date().toISOString();

  await db.entries.put({
    id,
    user_id: user.id,
    date,
    ...payload,
    created_at: existingLocal?.created_at ?? initialEntry?.created_at ?? now,
    updated_at: now,
    sync_status: "pending_push",
  });
}

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div
      className="font-mono text-[10px] tracking-[0.14em] uppercase mb-3"
      style={{ color: "var(--ink-3)" }}
    >
      {children}
    </div>
  );
}

export function EntryForm({ date, initialEntry, objectives, onSaved, initialView = "log" }: Props): React.ReactElement {
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

  const prioritiesFocused = initialView === "priorities";
  const [dailyLogOpen, setDailyLogOpen] = useState(!prioritiesFocused);

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

  const focusPriorities = (): void => {
    setDailyLogOpen(false);
    setTimeout(() => {
      priorityInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      priorityInputRef.current?.focus();
    }, 0);
  };

  const handleSave = useCallback(async (): Promise<void> => {
    // Guard: require at least minimal content before saving
    const hasContent = priorities.length > 0 || accomplished.length > 0 || energy !== null || blockers.trim() || notes.trim();
    if (!hasContent) {
      setError("Please add at least one priority, accomplishment, or energy level before saving.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      top_priorities: priorities,
      accomplished,
      blockers: blockers.trim() || null,
      notes: notes.trim() || null,
      energy_level: energy,
      objective_ids: linkedObjectiveIds,
    };
    try {
      const res = await fetch(`/api/journal/entries/${date}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      // A thrown TypeError means fetch itself failed (offline/no connection),
      // as opposed to a non-ok response the server actually processed —
      // only the former is safe to queue locally and retry later.
      const isNetworkFailure = err instanceof TypeError;
      if (isNetworkFailure) {
        try {
          await queueEntryLocally(date, initialEntry, payload);
          setSaved(true);
          setToastVisible(true);
          setTimeout(() => setSaved(false), 2000);
        } catch (queueErr) {
          console.error("[entry-form] offline queue failed:", queueErr);
          setError("Failed to save, even offline. Please try again.");
        }
      } else {
        console.error("[entry-form] save error:", err);
        setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }, [date, priorities, accomplished, blockers, notes, energy, linkedObjectiveIds, onSaved, initialEntry]);

  const activeObjectives = objectives.filter((o) => o.status === "active");

  const inputClass =
    "flex-1 h-10 px-3 rounded-lg text-[14px] outline-none transition-colors";
  const inputStyle = {
    border: "1.5px solid var(--rule)",
    background: "var(--bg)",
    color: "var(--ink)",
  };
  const textareaClass =
    "w-full px-3 py-2.5 rounded-lg text-[14px] leading-[1.65] outline-none transition-colors resize-none";

  const dailyLogSummary = accomplished.length > 0 || energy !== null || blockers.trim() || notes.trim()
    ? `${accomplished.length} accomplished${energy ? ` · ${"⚡".repeat(energy)} ${ENERGY_LABELS[energy]}` : ""}`
    : "Not logged yet — tap to open";

  return (
    <>
      <SaveToast
        visible={toastVisible}
        message="Entry saved"
        onDismiss={() => setToastVisible(false)}
      />

      <div className="space-y-9">

        {/* Nudge: opened via "Log the day" but priorities haven't been set yet */}
        {!prioritiesFocused && priorities.length === 0 && (
          <button
            type="button"
            onClick={focusPriorities}
            className="w-full text-left flex items-center justify-between gap-3 rounded-[10px] px-4 py-3 border-none cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: VELA_ACCENT_SOFT, border: `1px solid rgba(124,58,237,0.22)` }}
          >
            <span className="flex items-center gap-2.5 text-[13px] font-medium" style={{ color: VELA_ACCENT }}>
              <AlertCircle size={14} />
              You haven&apos;t set your priorities for today yet
            </span>
            <span className="font-mono text-[10px] tracking-[0.08em] uppercase shrink-0" style={{ color: VELA_ACCENT }}>
              Set now →
            </span>
          </button>
        )}

        {/* Priorities */}
        <section id="priorities" style={{ scrollMarginTop: "24px" }}>
          {prioritiesFocused ? (
            <div className="mb-4.5">
              <h1
                className="font-display font-normal leading-[1.05] tracking-[-0.02em] fvs-text m-0"
                style={{ fontSize: "clamp(26px,4vw,34px)", color: "var(--ink)" }}
              >
                Today&apos;s Priorities
              </h1>
              <p className="text-[13px] mt-1.5" style={{ color: "var(--ink-3)" }}>
                Just the things that matter today. You can log the rest of the day later.
              </p>
            </div>
          ) : (
            <SectionLabel>Today&apos;s Priorities</SectionLabel>
          )}
          <div className="space-y-1.5">
            {priorities.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 group px-3 py-2.5 rounded-lg"
                style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
              >
                <span
                  className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                  style={{ background: VELA_ACCENT_SOFT, color: VELA_ACCENT }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-[14px] text-(--ink)">{p}</span>
                <button
                  onClick={() => removeItem(priorities, setPriorities, i)}
                  className="w-5 h-5 flex items-center justify-center rounded-full border-none bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--ink-3)" }}
                  aria-label="Remove"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
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
                className={prioritiesFocused ? `${inputClass} h-12 text-[16px]` : inputClass}
                style={inputStyle}
              />
              <button
                onClick={() => addItem(priorities, setPriorities, newPriority, setNewPriority)}
                disabled={!newPriority.trim()}
                className={`flex items-center justify-center rounded-lg border-none cursor-pointer disabled:opacity-40 transition-opacity ${prioritiesFocused ? "w-12 h-12" : "w-10 h-10"}`}
                style={{ background: VELA_ACCENT_SOFT, color: VELA_ACCENT }}
                aria-label="Add priority"
              >
                <Plus size={prioritiesFocused ? 18 : 15} />
              </button>
            </div>
          </div>

          {/* In priorities-focused mode, saving just the priorities is one tap away without opening the rest */}
          {prioritiesFocused && (
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full h-12 rounded-[10px] font-mono text-[11px] tracking-[0.14em] uppercase font-semibold text-white border-none cursor-pointer disabled:opacity-60 transition-all mt-5"
              style={{
                background: saved ? "#16A34A" : VELA_ACCENT,
                boxShadow: priorities.length > 0 && !saved ? `0 4px 24px rgba(124,58,237,0.35)` : "none",
              }}
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : saved ? (
                <>Saved ✓</>
              ) : (
                <>
                  <Save size={13} />
                  Save Priorities
                </>
              )}
            </button>
          )}
        </section>

        <div className="h-0.25" style={{ background: "var(--rule)" }} />

        {/* Daily Log — collapsible wrap-up: what got done, blockers, reflection, energy, objectives */}
        <section>
          <button
            type="button"
            onClick={() => setDailyLogOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 border-none bg-transparent cursor-pointer p-0 mb-3"
          >
            <span
              className="font-mono text-[10px] tracking-[0.14em] uppercase"
              style={{ color: "var(--ink-3)" }}
            >
              Daily Log — What Got Done, Reflection &amp; Energy
            </span>
            <ChevronDown
              size={14}
              style={{
                color: "var(--ink-3)",
                transform: dailyLogOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
                flexShrink: 0,
              }}
            />
          </button>

          {!dailyLogOpen ? (
            <button
              type="button"
              onClick={() => setDailyLogOpen(true)}
              className="w-full text-left rounded-[10px] px-3.5 py-3 cursor-pointer transition-colors hover:bg-(--bg-3)"
              style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
            >
              <span className="text-[13px]" style={{ color: "var(--ink-3)" }}>{dailyLogSummary}</span>
            </button>
          ) : (
            <div id="log-today" className="space-y-9" style={{ scrollMarginTop: "24px" }}>

              {/* Accomplished */}
              <div>
                <SectionLabel>What Got Done</SectionLabel>
                <div className="space-y-1.5">
                  {accomplished.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 group px-3 py-2.5 rounded-lg"
                      style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
                    >
                      <span
                        className="text-[13px] flex-shrink-0 font-semibold"
                        style={{ color: "#16A34A" }}
                      >
                        ✓
                      </span>
                      <span className="flex-1 text-[14px] text-(--ink)">{a}</span>
                      <button
                        onClick={() => removeItem(accomplished, setAccomplished, i)}
                        className="w-5 h-5 flex items-center justify-center rounded-full border-none bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "var(--ink-3)" }}
                        aria-label="Remove"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
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
                      className="w-10 h-10 flex items-center justify-center rounded-lg border-none cursor-pointer disabled:opacity-40 transition-opacity"
                      style={{ background: "rgba(22,163,74,0.10)", color: "#16A34A" }}
                      aria-label="Add"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-0.25" style={{ background: "var(--rule)" }} />

              {/* Blockers */}
              <div>
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
              </div>

              <div className="h-0.25" style={{ background: "var(--rule)" }} />

              {/* Reflection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel>Reflection &amp; Notes</SectionLabel>
                  <button
                    type="button"
                    onClick={generatePrompt}
                    className="font-mono text-[8px] tracking-widest uppercase px-2.25 py-1 rounded-md border cursor-pointer transition-all flex items-center gap-1.25 -mt-3"
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
              </div>

              <div className="h-0.25" style={{ background: "var(--rule)" }} />

              {/* Energy */}
              <div>
                <SectionLabel>Energy Level</SectionLabel>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setEnergy(energy === level ? null : level)}
                      className="flex-1 py-2.5 rounded-lg text-[12px] font-medium border transition-all cursor-pointer"
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
                      <div className="text-[15px] mb-0.5">{"⚡".repeat(level)}</div>
                      <div className="font-mono text-[9px] tracking-[0.04em] hidden min-[480px]:block opacity-70">
                        {ENERGY_LABELS[level]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Linked objectives */}
              {activeObjectives.length > 0 && (
                <>
                  <div className="h-0.25" style={{ background: "var(--rule)" }} />
                  <div>
                    <SectionLabel>Objectives Touched Today</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                      {activeObjectives.map((obj) => {
                        const active = linkedObjectiveIds.includes(obj.id);
                        return (
                          <button
                            key={obj.id}
                            onClick={() => toggleObjective(obj.id)}
                            className="flex items-center gap-1.5 px-3 py-1.75 rounded-lg text-[13px] font-medium border transition-all cursor-pointer"
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
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <div
            className="rounded-lg px-3.5 py-2.5 text-[13px] font-mono"
            style={{
              background: "rgba(220,38,38,0.07)",
              color: "#DC2626",
              border: "1px solid rgba(220,38,38,0.18)",
            }}
          >
            {error}
          </div>
        )}

        {/* Save — the priorities-focused view has its own inline save button above, so this is only for the full view */}
        {!prioritiesFocused && (
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-[10px] font-mono text-[11px] tracking-[0.14em] uppercase font-semibold text-white border-none cursor-pointer disabled:opacity-60 transition-all"
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
        )}
      </div>
    </>
  );
}
