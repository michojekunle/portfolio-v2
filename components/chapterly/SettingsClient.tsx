"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChGoal } from "@/lib/chapterly/types";
import { Save, Loader2, BookMarked, ArrowRight } from "lucide-react";
import Link from "next/link";

const ACCENT = "#4F6D7A";

const DAILY_GOAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

interface Props {
  goal: ChGoal | null;
}

export function ChSettingsClient({ goal }: Props): React.ReactElement {
  const [dailyMinutes, setDailyMinutes] = useState(goal?.daily_minutes ?? 15);
  const [annualBooks, setAnnualBooks] = useState(goal?.annual_books ?? 12);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setError(null);
    setSaved(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setSaving(false);
      return;
    }

    const { error: dbError } = await supabase
      .from("ch_goals")
      .upsert(
        {
          user_id: user.id,
          daily_minutes: dailyMinutes,
          annual_books: annualBooks,
        },
        { onConflict: "user_id" }
      );

    if (dbError) {
      setError(dbError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }

    setSaving(false);
  };

  return (
    <div className="space-y-[32px]">
      {/* ── Daily reading goal ── */}
      <div className="rounded-[16px] p-[28px] border border-[var(--rule)] bg-[var(--bg-2)]">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[20px]">
          Daily Reading Goal
        </div>
        <div className="flex gap-[8px] flex-wrap mb-[16px]">
          {DAILY_GOAL_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => setDailyMinutes(m)}
              className="font-mono text-[11px] tracking-[0.1em] uppercase px-[14px] py-[8px] rounded-[8px] border-none cursor-pointer transition-all font-semibold"
              style={
                dailyMinutes === m
                  ? { background: ACCENT, color: "#fff" }
                  : {
                      background: "var(--bg)",
                      color: "var(--ink-3)",
                      outline: "1px solid var(--rule)",
                    }
              }
            >
              {m}m
            </button>
          ))}
        </div>
        <div className="text-[13px] text-[var(--ink-3)]">
          Read{" "}
          <strong className="text-[var(--ink)]">{dailyMinutes} minutes</strong>{" "}
          per day to maintain your streak.
        </div>
      </div>

      {/* ── Annual challenge ── */}
      <div className="rounded-[16px] p-[28px] border border-[var(--rule)] bg-[var(--bg-2)]">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[20px]">
          Annual Reading Challenge
        </div>
        <div className="flex items-center gap-[16px]">
          <input
            type="range"
            min={1}
            max={52}
            value={annualBooks}
            onChange={(e) => setAnnualBooks(Number(e.target.value))}
            className="flex-1 accent-[#4F6D7A]"
            aria-label="Annual book goal"
          />
          <div className="text-[28px] font-bold text-[var(--ink)] w-[48px] text-center shrink-0">
            {annualBooks}
          </div>
        </div>
        <div className="text-[13px] text-[var(--ink-3)] mt-[8px]">
          <strong className="text-[var(--ink)]">{annualBooks} books</strong> in{" "}
          {new Date().getFullYear()} — about {(annualBooks / 12).toFixed(1)}{" "}
          books per month.
        </div>
      </div>

      {/* ── Plan ── */}
      <div
        id="upgrade"
        className="rounded-[16px] p-[28px] border"
        style={{ borderColor: ACCENT + "40", background: ACCENT + "08" }}
      >
        <div
          className="font-mono text-[10px] tracking-[0.14em] uppercase mb-[16px]"
          style={{ color: ACCENT }}
        >
          Plan
        </div>
        <div className="flex items-center justify-between gap-[16px] flex-wrap">
          <div>
            <div className="text-[16px] font-semibold text-[var(--ink)]">
              Free Plan
            </div>
            <div className="text-[13px] text-[var(--ink-3)] mt-[4px]">
              Up to 3 books · All AI features · Unlimited notes and highlights
            </div>
          </div>
          <div
            className="font-mono text-[10px] tracking-[0.12em] uppercase px-[12px] py-[6px] rounded-full font-semibold"
            style={{ background: ACCENT + "20", color: ACCENT }}
          >
            Active
          </div>
        </div>
        <div
          className="mt-[20px] pt-[20px] border-t"
          style={{ borderColor: ACCENT + "25" }}
        >
          <div className="text-[14px] font-semibold text-[var(--ink)] mb-[4px]">
            Pro — Unlimited
          </div>
          <div className="text-[13px] text-[var(--ink-3)] mb-[12px]">
            Unlimited books · ElevenLabs voice · Priority AI · Export PDF
          </div>
          <button
            className="font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[16px] py-[8px] rounded-[8px] border-none cursor-pointer text-(--bg) transition-opacity hover:opacity-80"
            style={{ background: ACCENT }}
          >
            Upgrade to Pro — coming soon
          </button>
        </div>
      </div>

      {/* ── BookBreaks integration ── */}
      <div className="rounded-[16px] p-[28px] border border-[var(--rule)] bg-[var(--bg-2)]">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[16px]">
          BookBreaks Integration
        </div>
        <div className="flex items-center justify-between gap-[16px] flex-wrap">
          <div>
            <div className="text-[14px] text-[var(--ink)]">
              Finished books automatically appear in your BookBreaks library.
            </div>
            <div className="text-[13px] text-[var(--ink-3)] mt-[4px]">
              Your highlights and notes are used as context for AI content
              generation.
            </div>
          </div>
          <Link
            href="/tools/bookbreaks"
            className="shrink-0 inline-flex items-center gap-[6px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold no-underline px-[14px] py-[8px] rounded-[8px] transition-opacity hover:opacity-80"
            style={{ background: "#C85A2C", color: "#fff" }}
          >
            <BookMarked size={12} /> Open BookBreaks <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Save */}
      {error && (
        <div
          className="rounded-[8px] px-[16px] py-[12px] text-[13px]"
          style={{
            background: "rgba(220,38,38,0.08)",
            color: "#DC2626",
            border: "1px solid rgba(220,38,38,0.2)",
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-[52px] rounded-[10px] font-mono text-[11px] tracking-[0.14em] uppercase font-semibold text-(--bg) transition-all disabled:opacity-60 border-none cursor-pointer hover:opacity-90 flex items-center justify-center gap-[8px]"
        style={{ background: ACCENT }}
      >
        {saving ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Saving…
          </>
        ) : saved ? (
          "Saved!"
        ) : (
          <>
            <Save size={14} /> Save Settings
          </>
        )}
      </button>
    </div>
  );
}
