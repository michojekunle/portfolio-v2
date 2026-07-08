"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import type { DailyInsightPayload } from "@/app/api/chapterly/daily-insight/route";
import { MarkdownInline } from "@/components/ui/Markdown";

const ACCENT = "var(--ch-accent)";
const CACHE_KEY = "chapterly_daily_insight_v2";

interface InsightCache {
  payload: DailyInsightPayload;
  date: string;
}

export function DailyInsightCard(): React.ReactElement {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const fetchInsight = async (force = false): Promise<void> => {
    if (!force) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as InsightCache;
          if (parsed.date === today && parsed.payload?.insight) {
            setInsight(parsed.payload.insight);
            setLoading(false);
            return;
          }
        }
      } catch {
        // stale cache — fall through
      }
    }

    if (force) setRefreshing(true);
    setFetchError(false);

    try {
      const res = await fetch("/api/chapterly/daily-insight");
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as DailyInsightPayload;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ payload: data, date: today }));
      } catch {
        // localStorage unavailable
      }
      setInsight(data.insight);
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div
        className="rounded-[14px] px-[16px] py-[14px] mb-[24px] flex items-center gap-[10px]"
        style={{ background: `color-mix(in srgb, var(--ch-accent) 3%, transparent)`, border: `1px solid color-mix(in srgb, var(--ch-accent) 8%, transparent)` }}
      >
        <Loader2 size={12} className="animate-spin shrink-0" style={{ color: ACCENT, opacity: 0.5 }} />
        <span className="font-mono text-[10px] tracking-[0.08em] text-[var(--ink-3)]">
          Getting your daily insight…
        </span>
      </div>
    );
  }

  if (!insight && fetchError) {
    return (
      <div
        className="rounded-[14px] px-[16px] py-[14px] mb-[24px] flex items-center justify-between gap-[10px]"
        style={{ background: `rgba(239,68,68,0.06)`, border: `1px solid rgba(239,68,68,0.15)` }}
      >
        <span className="font-mono text-[10px] tracking-[0.08em] text-[var(--ink-3)]">
          Could not load daily insight
        </span>
        <button
          onClick={() => void fetchInsight(true)}
          disabled={refreshing}
          className="shrink-0 flex items-center gap-[5px] font-mono text-[10px] tracking-[0.06em] uppercase border-none cursor-pointer bg-transparent disabled:opacity-50"
          style={{ color: ACCENT }}
        >
          <RefreshCw size={10} className={refreshing ? "animate-spin" : ""} />
          Retry
        </button>
      </div>
    );
  }

  if (!insight) return <></>;

  return (
    <div
      className="rounded-[14px] mb-[24px] overflow-hidden"
      style={{ border: `1px solid color-mix(in srgb, var(--ch-accent) 10%, transparent)`, background: `color-mix(in srgb, var(--ch-accent) 2%, transparent)` }}
    >
      <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${ACCENT}, transparent)` }} />
      <div className="px-[18px] py-[14px] flex items-start gap-[10px]">
        <Sparkles size={13} className="shrink-0 mt-[2px]" style={{ color: ACCENT, opacity: 0.7 }} />
        <p className="flex-1 text-[13px] leading-[1.65] m-0 text-[var(--ink-2)]">
          {insight && <MarkdownInline text={insight} />}
        </p>
        <button
          onClick={() => void fetchInsight(true)}
          disabled={refreshing}
          className="shrink-0 w-[22px] h-[22px] flex items-center justify-center rounded-[5px] border-none cursor-pointer bg-transparent transition-opacity hover:opacity-60 disabled:opacity-30 mt-[1px]"
          style={{ color: ACCENT }}
          title="Refresh insight"
          aria-label="Refresh daily insight"
        >
          <RefreshCw size={10} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}
