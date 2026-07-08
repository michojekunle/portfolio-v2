"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChGoal } from "@/lib/chapterly/types";
import { Save, Loader2, BookMarked, ArrowRight, Snowflake, Check } from "lucide-react";
import Link from "next/link";

const ACCENT = "var(--ch-accent)";

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
  const [freezing, setFreezing] = useState(false);
  const [freezeUsed, setFreezeUsed] = useState(false);
  const supabase = createClient();

  const freezeCount = goal?.streak_freeze_count ?? 0;
  const freezeUntil = goal?.streak_freeze_until ?? null;
  const isFrozen = freezeUntil ? new Date(freezeUntil) > new Date() : false;

  const handleFreezeStreak = async (): Promise<void> => {
    if (freezeCount <= 0 || isFrozen) return;
    setFreezing(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setFreezing(false); return; }

    // Freeze until end of tomorrow
    const until = new Date();
    until.setDate(until.getDate() + 2);
    until.setHours(23, 59, 59, 999);

    const { error: dbError } = await supabase
      .from("ch_goals")
      .update({
        streak_freeze_until: until.toISOString(),
        streak_freeze_count: Math.max(0, freezeCount - 1),
      })
      .eq("user_id", user.id);

    if (!dbError) setFreezeUsed(true);
    setFreezing(false);
  };

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
                  ? { background: ACCENT, color: "var(--bg)" }
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
            className="flex-1 accent-[var(--ch-accent)]"
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
        style={{ borderColor: "color-mix(in srgb, var(--ch-accent) 25%, transparent)", background: "color-mix(in srgb, var(--ch-accent) 3%, transparent)" }}
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
            style={{ background: "color-mix(in srgb, var(--ch-accent) 13%, transparent)", color: ACCENT }}
          >
            Active
          </div>
        </div>
        <div
          className="mt-[20px] pt-[20px] border-t"
          style={{ borderColor: "color-mix(in srgb, var(--ch-accent) 15%, transparent)" }}
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

      {/* ── Streak freeze ── */}
      <div className="rounded-[16px] p-[28px] border border-[var(--rule)] bg-[var(--bg-2)]">
        <div className="flex items-center gap-[8px] mb-[4px]">
          <Snowflake size={14} style={{ color: "#0EA5E9" }} />
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
            Streak Freeze
          </div>
        </div>
        <p className="text-[13px] text-[var(--ink-3)] mt-[8px] mb-[20px]">
          Use a freeze token to protect your streak on days you can&apos;t read. The freeze lasts until end of tomorrow.
        </p>
        <div className="flex items-center gap-[16px] flex-wrap">
          <div
            className="flex items-center gap-[8px] px-[14px] py-[8px] rounded-[10px]"
            style={{ background: "#0EA5E908", border: "1px solid #0EA5E930" }}
          >
            <Snowflake size={14} style={{ color: "#0EA5E9" }} />
            <span className="font-mono text-[11px] font-semibold" style={{ color: "#0EA5E9" }}>
              {freezeCount} freeze{freezeCount !== 1 ? "s" : ""} available
            </span>
          </div>
          {isFrozen ? (
            <div
              className="flex items-center gap-[6px] font-mono text-[10px] tracking-[0.1em] uppercase px-[14px] py-[8px] rounded-[8px]"
              style={{ background: "#0EA5E912", color: "#0EA5E9" }}
            >
              <Check size={12} />
              Streak frozen until tomorrow
            </div>
          ) : freezeUsed ? (
            <div
              className="flex items-center gap-[6px] font-mono text-[10px] tracking-[0.1em] uppercase px-[14px] py-[8px] rounded-[8px]"
              style={{ background: "#16A34A12", color: "#16A34A" }}
            >
              <Check size={12} />
              Freeze activated
            </div>
          ) : (
            <button
              onClick={() => void handleFreezeStreak()}
              disabled={freezing || freezeCount <= 0}
              className="flex items-center gap-[6px] font-mono text-[10px] tracking-[0.1em] uppercase px-[14px] py-[8px] rounded-[8px] border-none cursor-pointer font-semibold transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#0EA5E9", color: "var(--ch-bg)" }}
            >
              {freezing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Snowflake size={12} />
              )}
              {freezeCount <= 0 ? "No freezes left" : "Activate Freeze"}
            </button>
          )}
        </div>
        {freezeCount === 0 && !isFrozen && (
          <p className="text-[12px] text-[var(--ink-3)] mt-[12px]">
            You&apos;ll earn more freeze tokens as your streak grows.
          </p>
        )}
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
            style={{ background: "#C85A2C", color: "var(--ch-bg)" }}
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
