"use client";

import { useState } from "react";
import type { RecommendedBookPlanItem } from "@/lib/chapterly/types";
import { BookOpen, Plus, Loader2, Check, Sparkles } from "lucide-react";
import { CURATED_BOOKS } from "@/lib/chapterly/curated";

const ACCENT = "#4F6D7A";

interface Props {
  initialPlan: RecommendedBookPlanItem[];
  userBookTitles: string[];
}

export function ChLearningPlanClient({ initialPlan, userBookTitles }: Props): React.ReactElement {
  const [plan, setPlan] = useState<RecommendedBookPlanItem[]>(() =>
    initialPlan.map((item) => ({
      ...item,
      // If the user already has a book with this title in their library, mark it as added
      is_added: item.is_added || userBookTitles.some((t) => t.toLowerCase() === item.title.toLowerCase()),
    }))
  );
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async (item: RecommendedBookPlanItem): Promise<void> => {
    setLoadingId(item.id);
    setError(null);
    try {
      // Find the template summary content
      const summary = CURATED_BOOKS.find((c) => c.id === item.id);
      if (!summary) throw new Error("Book summary not found in catalog");

      const dataUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(summary.content)}`;
      
      const res = await fetch("/api/chapterly/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Summary: ${summary.title}`,
          author: summary.author,
          cover_url: summary.cover_url,
          file_url: dataUrl,
          file_format: "md",
          file_size_bytes: summary.content.length,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error || "Failed to add book to library");
      }

      // Update local state
      setPlan((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, is_added: true } : p))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import");
    } finally {
      setLoadingId(null);
    }
  };

  if (plan.length === 0) return <></>;

  return (
    <div className="rounded-[16px] p-[32px] max-[480px]:p-[24px] bg-[var(--bg-2)] border border-[var(--rule)]">
      <div className="flex items-center justify-between mb-[24px]">
        <div className="flex items-center gap-[8px]">
          <Sparkles size={16} style={{ color: ACCENT }} />
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
            Your 30-Day Personalized Plan
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-[16px] p-[12px] rounded-[8px] text-[12px] bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      {/* Timeline queue */}
      <div className="space-y-[20px]">
        {plan.map((item, index) => {
          const isLoading = loadingId === item.id;
          return (
            <div key={item.id} className="flex gap-[20px] items-start relative">
              {/* Timeline dot & line */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center font-mono text-[10px] font-bold"
                  style={
                    item.is_added
                      ? { borderColor: "#16A34A", background: "#16A34A15", color: "#16A34A" }
                      : { borderColor: ACCENT, background: "var(--bg)", color: ACCENT }
                  }
                >
                  {index + 1}
                </div>
                {index < plan.length - 1 && (
                  <div className="w-[2px] h-[70px] bg-[var(--rule)] mt-[4px]" />
                )}
              </div>

              {/* Book Info Card */}
              <div className="flex-1 bg-[var(--bg)] border border-[var(--rule)] rounded-[12px] p-[14px] flex items-center gap-[14px] min-w-0 hover:border-[var(--ink-3)] transition-all">
                {/* Cover thumbnail */}
                <div
                  className="w-[44px] h-[60px] rounded-[4px] shrink-0 overflow-hidden relative border border-[var(--rule)]"
                  style={{ background: ACCENT + "15" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.cover_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--ink)] truncate">
                    {item.title}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--ink-3)] mt-[2px] truncate">
                    {item.author}
                  </div>
                  <div className="flex items-center gap-[8px] mt-[6px]">
                    <span className="font-mono text-[8px] tracking-[0.05em] uppercase text-[var(--ink-3)] bg-[var(--bg-2)] px-[6px] py-[2px] rounded-full">
                      {item.category}
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.05em] uppercase text-[var(--ink-3)]">
                      {item.read_time_minutes}m summary
                    </span>
                  </div>
                </div>

                {/* Import/Action button */}
                <div className="shrink-0">
                  {item.is_added ? (
                    <div
                      className="w-[28px] h-[28px] rounded-full flex items-center justify-center"
                      style={{ background: "#16A34A15", color: "#16A34A" }}
                      title="Added to Library"
                    >
                      <Check size={14} />
                    </div>
                  ) : (
                    <button
                      onClick={() => void handleImport(item)}
                      disabled={isLoading}
                      className="h-[28px] px-[12px] rounded-[6px] font-mono text-[8px] tracking-[0.08em] uppercase font-semibold text-(--bg) cursor-pointer border-none flex items-center gap-[4px] transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: ACCENT }}
                      title="Add to Library"
                    >
                      {isLoading ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <>
                          <Plus size={10} /> Add
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
