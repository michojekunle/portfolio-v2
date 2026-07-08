"use client";

import React, { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/journal/db";
import { ChevronDown, ChevronRight, Plus, Calendar, X } from "lucide-react";
import { VELA_ACCENT, VELA_ACCENT_SOFT } from "@/lib/journal/types";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { createClient } from "@/lib/supabase/client";

export function CanvasClient() {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toLocaleDateString("en-CA");
  });

  const toggleDay = (date: string) => {
    setExpandedDays((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  const handleEditorChange = async (date: string, html: string) => {
    if (!userId) return;
    const existing = entries.find(e => e.date === date);
    if (existing) {
      await db.entries.update(existing.id, { content: html, sync_status: "pending_push" });
    } else {
      await db.entries.add({
        id: crypto.randomUUID(),
        user_id: userId,
        date: date,
        top_priorities: [],
        accomplished: [],
        blockers: null,
        energy_level: null,
        content: html,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: "pending_push"
      });
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-[32px] py-[48px] max-[640px]:px-[20px] max-[640px]:py-[32px]">
      <div className="flex items-center gap-[12px] mb-[32px]">
        <div className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center text-[20px]" style={{ background: VELA_ACCENT_SOFT, color: VELA_ACCENT }}>
          <Calendar size={20} />
        </div>
        <div>
          <h1 className="font-display text-[28px] font-normal m-0 tracking-[-0.02em] fvs-text" style={{ color: "var(--ink)" }}>Daily Canvas</h1>
          <p className="font-mono text-[10px] tracking-[0.08em] uppercase m-0 mt-[4px]" style={{ color: "var(--ink-3)" }}>Drag and drop your plans across days</p>
        </div>
      </div>

      <div className="space-y-[16px]">
        {days.map((date) => {
          const isExpanded = expandedDays[date] ?? true;
          const dayMilestones = milestones.filter((m) => m.due_date === date);
          const hasContent = entries.find(e => e.date === date)?.content;

          return (
            <div key={date} className="rounded-[12px] overflow-hidden" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
              <button
                onClick={() => setActiveDate(date)}
                className="w-full flex items-center justify-between px-[20px] py-[16px] bg-transparent border-none cursor-pointer hover:bg-[var(--bg-3)] transition-colors"
              >
                <div className="flex items-center gap-[12px]">
                  {isExpanded ? <ChevronDown size={16} style={{ color: "var(--ink-3)" }} onClick={(e) => { e.stopPropagation(); toggleDay(date); }} /> : <ChevronRight size={16} style={{ color: "var(--ink-3)" }} onClick={(e) => { e.stopPropagation(); toggleDay(date); }} />}
                  <span className="font-mono text-[12px] tracking-[0.1em] uppercase font-semibold" style={{ color: "var(--ink)" }}>
                    {new Date(date).toLocaleDateString("en-GB", { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                  {dayMilestones.length > 0 && (
                    <span className="font-mono text-[10px] px-[8px] py-[2px] rounded-full" style={{ background: "var(--bg-3)", color: "var(--ink-2)" }}>
                      {dayMilestones.length} tasks
                    </span>
                  )}
                  {hasContent && (
                    <span className="font-mono text-[10px] px-[8px] py-[2px] rounded-full" style={{ background: VELA_ACCENT_SOFT, color: VELA_ACCENT }}>
                      Notes
                    </span>
                  )}
                </div>
                <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center hover:bg-[var(--bg)] transition-colors" onClick={(e) => { e.stopPropagation(); setActiveDate(date); }}>
                  <Plus size={14} style={{ color: "var(--ink-2)" }} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-[20px] pb-[20px] pt-[4px] border-t border-[var(--rule)] cursor-pointer" onClick={() => setActiveDate(date)}>
                  {dayMilestones.length > 0 ? (
                    <div className="space-y-[8px] mt-[12px]">
                      {dayMilestones.map((m) => {
                        const parentObj = objectives.find(o => o.id === m.objective_id);
                        return (
                          <div key={m.id} className="flex items-center gap-[12px] px-[16px] py-[12px] rounded-[8px] bg-[var(--bg)] border border-[var(--rule)]">
                            <input type="checkbox" checked={m.is_done} readOnly className="w-[16px] h-[16px] rounded-[4px] accent-[var(--accent)]" />
                            <div className="flex-1">
                              <div className="text-[14px]" style={{ color: m.is_done ? "var(--ink-3)" : "var(--ink)", textDecoration: m.is_done ? "line-through" : "none" }}>{m.title}</div>
                              {parentObj && <div className="font-mono text-[9px] mt-[4px]" style={{ color: "var(--ink-4)" }}>{parentObj.title}</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-[32px] text-center font-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: "var(--ink-4)" }}>
                      {hasContent ? "Click to open canvas notes." : "No plans for this day. Click to add notes."}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full-screen Editor Modal / Sheet */}
      {activeDate && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[800px] h-full bg-[var(--bg)] shadow-2xl border-l border-[var(--rule)] flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-[32px] py-[24px] border-b border-[var(--rule)] bg-[var(--bg-2)]">
              <div>
                <h2 className="font-display text-[24px] tracking-[-0.01em] m-0" style={{ color: "var(--ink)" }}>
                  {new Date(activeDate).toLocaleDateString("en-GB", { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                <div className="font-mono text-[10px] tracking-[0.1em] uppercase mt-[4px]" style={{ color: "var(--ink-3)" }}>
                  Canvas
                </div>
              </div>
              <button 
                onClick={() => setActiveDate(null)}
                className="w-[40px] h-[40px] rounded-full border border-[var(--rule)] bg-transparent flex items-center justify-center cursor-pointer hover:bg-[var(--bg-3)] transition-colors"
              >
                <X size={18} style={{ color: "var(--ink-2)" }} />
              </button>
            </div>
            
            {/* Editor Scroll Area */}
            <div className="flex-1 overflow-y-auto px-[48px] py-[40px] max-[640px]:px-[20px] max-[640px]:py-[24px]">
              <JournalEditor 
                content={entries.find(e => e.date === activeDate)?.content || ""}
                onChange={(html) => handleEditorChange(activeDate, html)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
