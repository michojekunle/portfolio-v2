"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";

const ACCENT = "#4F6D7A";

interface InsightCache {
  insight: string;
  date: string;
}

export function DailyInsightCard(): React.ReactElement {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = "chapterly_daily_insight";

  const fetchInsight = async (force = false): Promise<void> => {
    if (!force) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as InsightCache;
          if (parsed.date === today && parsed.insight) {
            setInsight(parsed.insight);
            setLoading(false);
            return;
          }
        }
      } catch {
        // stale or corrupt cache — fall through to fetch
      }
    }

    setError(null);
    if (force) setRefreshing(true);

    try {
      const res = await fetch("/api/chapterly/daily-insight");
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        throw new Error(d.error ?? "Failed to load insight");
      }
      const { insight: text } = (await res.json()) as { insight: string };
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ insight: text, date: today }));
      } catch {
        // localStorage may be full or unavailable — not critical
      }
      setInsight(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insight");
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
        className="rounded-[14px] px-[20px] py-[16px] flex items-center gap-[10px] mb-[32px]"
        style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}20` }}
      >
        <Loader2 size={13} className="animate-spin shrink-0" style={{ color: ACCENT, opacity: 0.6 }} />
        <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-3)]">
          Generating your daily insight…
        </span>
      </div>
    );
  }

  if (error || !insight) return <></>;

  return (
    <div
      className="rounded-[14px] px-[20px] py-[16px] mb-[32px] relative"
      style={{ background: `${ACCENT}08`, border: `1px solid ${ACCENT}20` }}
    >
      <div className="flex items-start justify-between gap-[10px]">
        <div className="flex items-start gap-[10px] flex-1 min-w-0">
          <Sparkles size={13} className="shrink-0 mt-[2px]" style={{ color: ACCENT }} />
          <p className="text-[13px] leading-[1.65] m-0 flex-1 text-[var(--ink)]">
            {insight}
          </p>
        </div>
        <button
          onClick={() => void fetchInsight(true)}
          disabled={refreshing}
          className="shrink-0 w-[26px] h-[26px] flex items-center justify-center rounded-[6px] border-none cursor-pointer bg-transparent transition-opacity hover:opacity-60 disabled:opacity-30 mt-[-2px]"
          style={{ color: ACCENT }}
          title="Refresh insight"
          aria-label="Refresh daily insight"
        >
          <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
      <div
        className="font-mono text-[8px] tracking-[0.14em] uppercase mt-[10px] ml-[23px]"
        style={{ color: ACCENT, opacity: 0.45 }}
      >
        Daily insight · AI
      </div>
    </div>
  );
}
