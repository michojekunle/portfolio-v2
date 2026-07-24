"use client";

import React, { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/journal/db";
import { ChevronDown, ChevronRight, Calendar, X } from "lucide-react";
import { ENERGY_LABELS, VELA_ACCENT, VELA_ACCENT_SOFT } from "@/lib/journal/types";
import { createClient } from "@/lib/supabase/client";

const DAYS_BACK = 7;

export function CanvasClient() {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    void fetchUser();
  }, []);

  const objectives = useLiveQuery(() => db.objectives.toArray()) || [];
  const milestones = useLiveQuery(() => db.milestones.toArray()) || [];
  const entries = useLiveQuery(() => db.entries.toArray()) || [];

  const today = new Date();
  const days = Array.from({ length: DAYS_BACK }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d.toLocaleDateString("en-CA");
  });

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  const openDate = (date: string) => {
    setActiveDate(date);
    setDraftNotes(entries.find((e) => e.date === date)?.notes ?? "");
  };

  const handleNotesSave = async (): Promise<void> => {
    if (!userId || !activeDate) return;
    const existing = entries.find((e) => e.date === activeDate);
    if (existing) {
      await db.entries.update(existing.id, { notes: draftNotes, updated_at: new Date().toISOString(), sync_status: "pending_push" });
    } else {
      await db.entries.add({
        id: crypto.randomUUID(),
        user_id: userId,
        date: activeDate,
        top_priorities: [],
        accomplished: [],
        blockers: null,
        notes: draftNotes,
        energy_level: null,
        objective_ids: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: "pending_push",
      });
    }
    setActiveDate(null);
  };

  const activeEntry = activeDate ? entries.find((e) => e.date === activeDate) : null;

  return (
    <div className="max-w-[900px] mx-auto px-8 py-12 max-[640px]:px-5 max-[640px]:py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[20px]" style={{ background: VELA_ACCENT_SOFT, color: VELA_ACCENT }}>
          <Calendar size={20} />
        </div>
        <div>
          <h1 className="font-display text-[28px] font-normal m-0 tracking-[-0.02em] fvs-text" style={{ color: "var(--ink)" }}>Daily Canvas</h1>
          <p className="font-mono text-[10px] tracking-[0.08em] uppercase m-0 mt-1" style={{ color: "var(--ink-3)" }}>Your last {DAYS_BACK} days, at a glance</p>
        </div>
      </div>

      <div className="space-y-4">
        {days.map((date) => {
          const isExpanded = expandedDays[date] ?? true;
          const dayMilestones = milestones.filter((m) => m.due_date === date);
          const entry = entries.find((e) => e.date === date);
          const hasEntry = Boolean(entry && (entry.top_priorities.length || entry.accomplished.length || entry.blockers || entry.notes || entry.energy_level));

          return (
            <div key={date} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
              <button
                onClick={() => openDate(date)}
                className="w-full flex items-center justify-between px-5 py-4 bg-transparent border-none cursor-pointer hover:bg-(--bg-3) transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown size={16} style={{ color: "var(--ink-3)" }} onClick={(e) => { e.stopPropagation(); toggleDay(date); }} /> : <ChevronRight size={16} style={{ color: "var(--ink-3)" }} onClick={(e) => { e.stopPropagation(); toggleDay(date); }} />}
                  <span className="font-mono text-[12px] tracking-widest uppercase font-semibold" style={{ color: "var(--ink)" }}>
                    {new Date(date).toLocaleDateString("en-GB", { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  {dayMilestones.length > 0 && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--bg-3)", color: "var(--ink-2)" }}>
                      {dayMilestones.length} tasks
                    </span>
                  )}
                  {hasEntry && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: VELA_ACCENT_SOFT, color: VELA_ACCENT }}>
                      Logged
                    </span>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-(--rule) cursor-pointer" onClick={() => openDate(date)}>
                  {dayMilestones.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {dayMilestones.map((m) => {
                        const parentObj = objectives.find(o => o.id === m.objective_id);
                        return (
                          <div key={m.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-(--bg) border border-(--rule)">
                            <input type="checkbox" checked={m.is_done} readOnly className="w-4 h-4 rounded accent-(--accent)" />
                            <div className="flex-1">
                              <div className="text-[14px]" style={{ color: m.is_done ? "var(--ink-3)" : "var(--ink)", textDecoration: m.is_done ? "line-through" : "none" }}>{m.title}</div>
                              {parentObj && <div className="font-mono text-[9px] mt-1" style={{ color: "var(--ink-4)" }}>{parentObj.title}</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {hasEntry ? (
                    <div className="mt-3 space-y-2.5">
                      {entry!.top_priorities.length > 0 && (
                        <div>
                          <div className="font-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: "var(--ink-4)" }}>Priorities</div>
                          <ul className="m-0 pl-4.5 text-[13px]" style={{ color: "var(--ink)" }}>
                            {entry!.top_priorities.map((p, i) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                      )}
                      {entry!.accomplished.length > 0 && (
                        <div>
                          <div className="font-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: "var(--ink-4)" }}>Accomplished</div>
                          <ul className="m-0 pl-4.5 text-[13px]" style={{ color: "var(--ink)" }}>
                            {entry!.accomplished.map((a, i) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                      )}
                      {entry!.blockers && (
                        <div>
                          <div className="font-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: "var(--ink-4)" }}>Blockers</div>
                          <p className="m-0 text-[13px]" style={{ color: "var(--ink)" }}>{entry!.blockers}</p>
                        </div>
                      )}
                      {entry!.notes && (
                        <div>
                          <div className="font-mono text-[9px] tracking-widest uppercase mb-1" style={{ color: "var(--ink-4)" }}>Notes</div>
                          <p className="m-0 text-[13px] whitespace-pre-wrap" style={{ color: "var(--ink)" }}>{entry!.notes}</p>
                        </div>
                      )}
                      {entry!.energy_level && (
                        <div className="font-mono text-[10px]" style={{ color: "var(--ink-3)" }}>
                          {"⚡".repeat(entry!.energy_level)} {ENERGY_LABELS[entry!.energy_level]}
                        </div>
                      )}
                    </div>
                  ) : dayMilestones.length === 0 ? (
                    <div className="py-8 text-center font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--ink-4)" }}>
                      No log for this day. Click to add notes.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes editor sheet — plain-text, shares the same `notes` field as the daily log's reflection box */}
      {activeDate && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-160 h-full bg-(--bg) shadow-2xl border-l border-(--rule) flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-8 py-6 border-b border-(--rule) bg-(--bg-2)">
              <div>
                <h2 className="font-display text-[24px] tracking-[-0.01em] m-0" style={{ color: "var(--ink)" }}>
                  {new Date(activeDate).toLocaleDateString("en-GB", { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <div className="font-mono text-[10px] tracking-widest uppercase mt-1" style={{ color: "var(--ink-3)" }}>
                  Canvas Notes
                </div>
              </div>
              <button
                onClick={() => setActiveDate(null)}
                className="w-10 h-10 rounded-full border border-(--rule) bg-transparent flex items-center justify-center cursor-pointer hover:bg-(--bg-3) transition-colors"
              >
                <X size={18} style={{ color: "var(--ink-2)" }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-12 py-10 max-[640px]:px-5 max-[640px]:py-6 flex flex-col gap-6">
              {activeEntry && (activeEntry.top_priorities.length > 0 || activeEntry.accomplished.length > 0) && (
                <div className="rounded-[10px] px-4 py-3.5 text-[13px]" style={{ background: "var(--bg-2)", border: "1px solid var(--rule)", color: "var(--ink-3)" }}>
                  This day already has priorities/accomplishments logged from the daily log — edit those from{" "}
                  <a href={`/tools/journal/log/${activeDate}`} style={{ color: VELA_ACCENT }}>the log page</a>. This box is for free-form notes only.
                </div>
              )}
              <textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                placeholder="Write freely about this day…"
                className="flex-1 w-full resize-none outline-none bg-transparent text-[15px] leading-[1.7]"
                style={{ color: "var(--ink)" }}
                autoFocus
              />
              <button
                onClick={() => void handleNotesSave()}
                className="self-end px-5 h-10 rounded-lg font-mono text-[10px] tracking-[0.12em] uppercase font-semibold text-white border-none cursor-pointer"
                style={{ background: VELA_ACCENT }}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
