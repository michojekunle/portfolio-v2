"use client";

import { useState } from "react";
import type { RecommendedBookPlanItem } from "@/lib/chapterly/types";
import { BookOpen, Plus, Loader2, Check, Sparkles } from "lucide-react";
import { CURATED_BOOKS, type CuratedBookSummary } from "@/lib/chapterly/curated";
import { SummaryDrawer } from "./SummaryDrawer";

const ACCENT = "var(--ch-accent)";

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
  const [readingBook, setReadingBook] = useState<CuratedBookSummary | null>(null);

  const handleImport = async (item: RecommendedBookPlanItem): Promise<boolean> => {
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
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import");
      return false;
    } finally {
      setLoadingId(null);
    }
  };

  if (plan.length === 0) return <></>;

  return (
    <div className="rounded-2xl p-8 max-[480px]:p-6 bg-(--bg-2) border border-(--rule)">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: ACCENT }} />
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
            Your 30-Day Personalized Plan
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-[12px] bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      {/* Timeline queue */}
      <div className="space-y-5">
        {plan.map((item, index) => {
          const isLoading = loadingId === item.id;
          return (
            <div key={item.id} className="flex gap-5 items-start relative">
              {/* Timeline dot & line */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center font-mono text-[10px] font-bold"
                  style={
                    item.is_added
                      ? { borderColor: "#16A34A", background: "#16A34A15", color: "#16A34A" }
                      : { borderColor: ACCENT, background: "var(--bg)", color: ACCENT }
                  }
                >
                  {index + 1}
                </div>
                {index < plan.length - 1 && (
                  <div className="w-0.5 h-[70px] bg-(--rule) mt-1" />
                )}
              </div>

              {/* Book Info Card */}
              <div className="flex-1 bg-(--bg) border border-(--rule) rounded-xl p-3.5 flex items-center gap-3.5 min-w-0 hover:border-muted-foreground transition-all">
                {/* Cover thumbnail */}
                <div
                  className="w-11 h-15 rounded shrink-0 overflow-hidden relative border border-(--rule)"
                  style={{ background: "color-mix(in srgb, var(--ch-accent) 8%, transparent)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.cover_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-(--ink) truncate">
                    {item.title}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate">
                    {item.author}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-mono text-[8px] tracking-wider uppercase text-muted-foreground bg-(--bg-2) px-1.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="font-mono text-[8px] tracking-wider uppercase text-muted-foreground">
                      {item.read_time_minutes}m summary
                    </span>
                  </div>
                </div>

                {/* Actions: Read Summary */}
                <div className="shrink-0">
                  <button
                    onClick={() => {
                      const summary = CURATED_BOOKS.find((c) => c.id === item.id);
                      if (summary) setReadingBook(summary);
                    }}
                    className="h-7 px-3 rounded-md font-mono text-[8px] tracking-[0.08em] uppercase font-semibold text-(--ch-bg) cursor-pointer border-none flex items-center gap-1 transition-all hover:opacity-90"
                    style={{ background: ACCENT }}
                    title="Read this summary"
                  >
                    <BookOpen size={10} /> Read Summary
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Headway-style summary drawer */}
      {readingBook && (
        <SummaryDrawer
          book={{
            title: readingBook.title,
            author: readingBook.author,
            cover_url: readingBook.cover_url,
            previewContent: readingBook.content,
          }}
          onClose={() => setReadingBook(null)}
          onAddToLibrary={async () => {
            const item = plan.find((p) => p.id === readingBook.id);
            if (!item) throw new Error("Plan item not found");
            const ok = await handleImport(item);
            if (!ok) throw new Error("Failed to save summary to library");
          }}
          isAdded={plan.find((p) => p.id === readingBook.id)?.is_added ?? false}
        />
      )}
    </div>
  );
}
