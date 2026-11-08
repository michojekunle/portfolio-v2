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
    <div className="space-y-8">
      {/* ── Daily reading goal ── */}
      <div className="rounded-2xl p-7 border border-(--rule) bg-(--bg-2)">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-5">
          Daily Reading Goal
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          {DAILY_GOAL_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => setDailyMinutes(m)}
              className="font-mono text-[11px] tracking-widest uppercase px-3.5 py-2 rounded-lg border-none cursor-pointer transition-all font-semibold"
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
        <div className="text-[13px] text-muted-foreground">
          Read{" "}
          <strong className="text-(--ink)">{dailyMinutes} minutes</strong>{" "}
          per day to maintain your streak.
        </div>
      </div>

      {/* ── Annual challenge ── */}
      <div className="rounded-2xl p-7 border border-(--rule) bg-(--bg-2)">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-5">
          Annual Reading Challenge
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={52}
            value={annualBooks}
            onChange={(e) => setAnnualBooks(Number(e.target.value))}
            className="flex-1 accent-(--ch-accent)"
            aria-label="Annual book goal"
          />
          <div className="text-[28px] font-bold text-(--ink) w-12 text-center shrink-0">
            {annualBooks}
          </div>
        </div>
        <div className="text-[13px] text-muted-foreground mt-2">
          <strong className="text-(--ink)">{annualBooks} books</strong> in{" "}
          {new Date().getFullYear()} — about {(annualBooks / 12).toFixed(1)}{" "}
          books per month.
        </div>
      </div>

      {/* ── Plan ── */}
      <div
        id="upgrade"
        className="rounded-2xl p-7 border"
        style={{ borderColor: "color-mix(in srgb, var(--ch-accent) 25%, transparent)", background: "color-mix(in srgb, var(--ch-accent) 3%, transparent)" }}
      >
        <div
          className="font-mono text-[10px] tracking-[0.14em] uppercase mb-4"
          style={{ color: ACCENT }}
        >
          Plan
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[16px] font-semibold text-(--ink)">
              Free Plan
            </div>
            <div className="text-[13px] text-muted-foreground mt-1">
              Up to 3 books · All AI features · Unlimited notes and highlights
            </div>
          </div>
          <div
            className="font-mono text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 rounded-full font-semibold"
            style={{ background: "color-mix(in srgb, var(--ch-accent) 13%, transparent)", color: ACCENT }}
          >
            Active
          </div>
        </div>
        <div
          className="mt-5 pt-5 border-t"
          style={{ borderColor: "color-mix(in srgb, var(--ch-accent) 15%, transparent)" }}
        >
          <div className="text-[14px] font-semibold text-(--ink) mb-1">
            Pro — Unlimited
          </div>
          <div className="text-[13px] text-muted-foreground mb-3">
            Unlimited books · ElevenLabs voice · Priority AI · Export PDF
          </div>
          <button
            className="font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-4 py-2 rounded-lg border-none cursor-pointer text-(--bg) transition-opacity hover:opacity-80"
            style={{ background: ACCENT }}
          >
            Upgrade to Pro — coming soon
          </button>
        </div>
      </div>

      {/* ── Streak freeze ── */}
      <div className="rounded-2xl p-7 border border-(--rule) bg-(--bg-2)">
        <div className="flex items-center gap-2 mb-1">
          <Snowflake size={14} style={{ color: "#0EA5E9" }} />
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
            Streak Freeze
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground mt-2 mb-5">
          Use a freeze token to protect your streak on days you can&apos;t read. The freeze lasts until end of tomorrow.
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-[10px]"
            style={{ background: "#0EA5E908", border: "1px solid #0EA5E930" }}
          >
            <Snowflake size={14} style={{ color: "#0EA5E9" }} />
            <span className="font-mono text-[11px] font-semibold" style={{ color: "#0EA5E9" }}>
              {freezeCount} freeze{freezeCount !== 1 ? "s" : ""} available
            </span>
          </div>
          {isFrozen ? (
            <div
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-3.5 py-2 rounded-lg"
              style={{ background: "#0EA5E912", color: "#0EA5E9" }}
            >
              <Check size={12} />
              Streak frozen until tomorrow
            </div>
          ) : freezeUsed ? (
            <div
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-3.5 py-2 rounded-lg"
              style={{ background: "#16A34A12", color: "#16A34A" }}
            >
              <Check size={12} />
              Freeze activated
            </div>
          ) : (
            <button
              onClick={() => void handleFreezeStreak()}
              disabled={freezing || freezeCount <= 0}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-3.5 py-2 rounded-lg border-none cursor-pointer font-semibold transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
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
          <p className="text-[12px] text-muted-foreground mt-3">
            You&apos;ll earn more freeze tokens as your streak grows.
          </p>
        )}
      </div>

      {/* ── BookBreaks integration ── */}
      <div className="rounded-2xl p-7 border border-(--rule) bg-(--bg-2)">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-4">
          BookBreaks Integration
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[14px] text-(--ink)">
              Finished books automatically appear in your BookBreaks library.
            </div>
            <div className="text-[13px] text-muted-foreground mt-1">
              Your highlights and notes are used as context for AI content
              generation.
            </div>
          </div>
          <Link
            href="/tools/bookbreaks"
            className="shrink-0 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold no-underline px-3.5 py-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: "#C85A2C", color: "var(--ch-bg)" }}
          >
            <BookMarked size={12} /> Open BookBreaks <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Save */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-[13px]"
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
        className="w-full h-13 rounded-[10px] font-mono text-[11px] tracking-[0.14em] uppercase font-semibold text-(--bg) transition-all disabled:opacity-60 border-none cursor-pointer hover:opacity-90 flex items-center justify-center gap-2"
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
