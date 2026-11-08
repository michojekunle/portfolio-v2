"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChFlashcard } from "@/lib/chapterly/types";
import {
  ArrowLeft,
  Brain,
  Check,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Trash2,
} from "lucide-react";

const ACCENT = "var(--ch-accent)";

type Rating = 0 | 1 | 2 | 3;

const RATINGS: { rating: Rating; label: string; color: string; hotkey: string }[] = [
  { rating: 0, label: "Again",  color: "#DC2626", hotkey: "1" },
  { rating: 1, label: "Hard",   color: "#D97706", hotkey: "2" },
  { rating: 2, label: "Good",   color: ACCENT,    hotkey: "3" },
  { rating: 3, label: "Easy",   color: "#16A34A", hotkey: "4" },
];

export interface FlashcardWithBook extends ChFlashcard {
  ch_books: { title: string; author: string | null } | null;
}

interface Props {
  initialCards: FlashcardWithBook[];
  totalCount: number;
  studyAll: boolean;
}

export function ChFlashcardClient({ initialCards, totalCount, studyAll }: Props): React.ReactElement {
  const [queue, setQueue] = useState<FlashcardWithBook[]>(initialCards);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sessionStats, setSessionStats] = useState<Record<Rating, number>>({
    0: 0, 1: 0, 2: 0, 3: 0,
  });
  const [failedCardIds, setFailedCardIds] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(queue.length === 0);

  const card = queue[current];
  const progress = queue.length > 0 ? Math.round((current / queue.length) * 100) : 100;

  const removeCard = async (): Promise<void> => {
    if (!card || submitting) return;
    setSubmitting(true);
    try {
      await fetch(`/api/chapterly/flashcards/${card.id}`, { method: "DELETE" });
    } catch (err) {
      console.error("[flashcards] delete error:", err);
    }
    const newQueue = queue.filter((_, i) => i !== current);
    if (newQueue.length === 0) {
      setDone(true);
    } else {
      setQueue(newQueue);
      if (current >= newQueue.length) setCurrent(newQueue.length - 1);
      setFlipped(false);
    }
    setSubmitting(false);
  };

  const submitRating = async (rating: Rating): Promise<void> => {
    if (!card || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/chapterly/flashcards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) throw new Error("Rating failed");
    } catch (err) {
      console.error("[flashcards] submit error:", err);
    }

    setSessionStats((prev) => ({ ...prev, [rating]: prev[rating] + 1 }));
    if (rating === 0) {
      setFailedCardIds((prev) => new Set(prev).add(card.id));
    }

    if (current + 1 >= queue.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setFlipped(false);
    }

    setSubmitting(false);
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (!flipped) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped(true);
      }
      return;
    }
    const r = RATINGS.find((x) => x.hotkey === e.key);
    if (r) void submitRating(r.rating);
  };

  if (initialCards.length === 0) {
    const hasCollection = totalCount > 0;
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-20 max-[1024px]:pt-[100px] gap-6 text-center"
      >
        <div
          className="w-18 h-18 rounded-[20px] flex items-center justify-center"
          style={{ background: `color-mix(in srgb, var(--ch-accent) 9%, transparent)` }}
        >
          <Brain size={32} style={{ color: ACCENT }} />
        </div>
        <div className="max-w-105">
          <h1 className="font-display text-[26px] font-normal tracking-[-0.02em] fvs-text text-(--ink) mb-2.5">
            {hasCollection ? "No cards due today" : "No flashcards yet"}
          </h1>
          <p className="text-[13px] leading-[1.6] text-muted-foreground mb-6">
            {hasCollection
              ? `Great job! You have reviewed all cards due for today. You have ${totalCount} total card${totalCount > 1 ? "s" : ""} in your library collection.`
              : "To create flashcards, open any book, highlight a passage, and click the Flashcard (sparkles) icon in the notes sidebar. They will appear here immediately for study."}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {hasCollection && !studyAll && (
              <Link
                href="/tools/chapterly/flashcards?all=true"
                className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-5 py-3 rounded-[10px] no-underline"
                style={{ background: ACCENT, color: "var(--ch-bg)" }}
              >
                Study All Anyway
              </Link>
            )}
            <Link
              href="/tools/chapterly"
              className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-5 py-3 rounded-[10px] no-underline border transition-colors"
              style={{
                borderColor: hasCollection && !studyAll ? "var(--rule)" : ACCENT,
                background: hasCollection && !studyAll ? "transparent" : ACCENT,
                color: hasCollection && !studyAll ? "var(--ink)" : "#fff"
              }}
            >
              Go to Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    const total = Object.values(sessionStats).reduce((s, v) => s + v, 0);
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-20 max-[1024px]:pt-[100px] gap-8"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        <div
          className="w-18 h-18 rounded-[20px] flex items-center justify-center"
          style={{ background: `color-mix(in srgb, var(--ch-accent) 9%, transparent)` }}
        >
          <Sparkles size={32} style={{ color: ACCENT }} />
        </div>
        <div className="text-center">
          <h1 className="font-display text-[32px] font-normal tracking-[-0.02em] fvs-text text-(--ink) mb-2">
            Session complete
          </h1>
          <p className="font-mono text-[12px] tracking-[0.08em] text-muted-foreground">
            {total} card{total !== 1 ? "s" : ""} reviewed
          </p>
        </div>

        {total > 0 && (
          <div className="flex items-center gap-5">
            {RATINGS.map(({ rating, label, color }) => {
              const count = sessionStats[rating];
              if (count === 0) return null;
              return (
                <div key={rating} className="text-center">
                  <div
                    className="text-[24px] font-bold mb-0.5"
                    style={{ color }}
                  >
                    {count}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href="/tools/chapterly"
            className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-5 py-3 rounded-[10px] no-underline border border-(--rule) text-secondary-foreground hover:text-(--ink) transition-colors"
          >
            <ArrowLeft size={14} /> Home
          </Link>
          <button
            onClick={() => {
              const again = queue.filter((c) => failedCardIds.has(c.id));
              if (again.length > 0) {
                setQueue(again);
                setCurrent(0);
                setFlipped(false);
                setDone(false);
                setSessionStats({ 0: 0, 1: 0, 2: 0, 3: 0 });
                setFailedCardIds(new Set());
              }
            }}
            disabled={failedCardIds.size === 0}
            className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-5 py-3 rounded-[10px] border-none cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: ACCENT, color: "var(--ch-bg)" }}
          >
            <RotateCcw size={13} />
            Re-review {sessionStats[0]} failed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      onKeyDown={handleKeyDown}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      role="main"
    >
      {/* Header — adds extra top clearance on mobile for the fixed topbar */}
      <div className="flex items-center justify-between px-8 py-5 max-[1024px]:pt-20 border-b border-(--rule) max-[720px]:px-5">
        <Link
          href="/tools/chapterly"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground hover:text-(--ink) no-underline transition-colors"
        >
          <ArrowLeft size={12} /> Back
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => void removeCard()}
            disabled={submitting}
            className="inline-flex items-center gap-1.25 font-mono text-[9px] tracking-widest uppercase text-muted-foreground hover:text-[#DC2626] transition-colors bg-transparent border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Remove this card permanently"
          >
            <Trash2 size={11} />
            Remove
          </button>
          <div className="flex items-center gap-2.5">
            <Brain size={15} style={{ color: ACCENT }} />
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase font-semibold text-muted-foreground">
              {current + 1} / {queue.length}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.75 bg-(--rule)">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: ACCENT }}
        />
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-[720px]:py-8">
        {/* Source book */}
        {card.ch_books && (
          <div className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mb-6 text-center">
            {card.ch_books.title}
            {card.ch_books.author ? ` · ${card.ch_books.author}` : ""}
          </div>
        )}

        {/* Card face */}
        <div
          className="w-full max-w-[600px] rounded-[20px] border border-(--rule) bg-(--bg-2) overflow-hidden cursor-pointer transition-all duration-150 hover:border-muted-foreground active:scale-[0.99]"
          onClick={() => setFlipped(true)}
          role="button"
          tabIndex={-1}
        >
          {/* Front */}
          <div className="p-9 max-[480px]:p-6">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted-foreground mb-5 flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: ACCENT }}
              />
              Highlight
            </div>
            <blockquote
              className="m-0 text-[17px] leading-[1.75] text-(--ink) italic"
              style={{ borderLeft: "none" }}
            >
              &ldquo;{card.front}&rdquo;
            </blockquote>
          </div>

          {/* Back / reveal */}
          {!flipped ? (
            <div
              className="px-9 py-5 border-t border-(--rule) flex items-center justify-between max-[480px]:px-6"
              style={{ background: `color-mix(in srgb, var(--ch-accent) 3%, transparent)` }}
            >
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
                Tap to reveal
              </span>
              <ChevronRight size={14} style={{ color: ACCENT }} />
            </div>
          ) : (
            <div className="px-9 py-6 border-t border-(--rule) max-[480px]:px-6">
              <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
                <Check size={10} style={{ color: "#16A34A" }} />
                Your note
              </div>
              {card.back ? (
                <p className="text-[15px] leading-[1.65] text-(--ink) m-0">
                  {card.back}
                </p>
              ) : (
                <p className="text-[14px] text-muted-foreground m-0 italic">
                  No note — rate how well you recalled this passage.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Rating buttons */}
        {flipped && (
          <div className="mt-8 flex gap-2.5 max-[480px]:gap-1.5">
            {RATINGS.map(({ rating, label, color, hotkey }) => (
              <button
                key={rating}
                onClick={() => void submitRating(rating)}
                disabled={submitting}
                className="flex flex-col items-center gap-1.5 px-5 py-3.5 rounded-xl border border-(--rule) bg-(--bg-2) cursor-pointer transition-all hover:border-secondary-foreground disabled:opacity-40 max-[480px]:px-3.5 max-[480px]:py-2.5"
              >
                <span
                  className="font-semibold text-[14px]"
                  style={{ color }}
                >
                  {label}
                </span>
                <kbd
                  className="font-mono text-[9px] px-1.25 py-0.25 rounded border border-(--rule) text-muted-foreground"
                >
                  {hotkey}
                </kbd>
              </button>
            ))}
          </div>
        )}

        {/* Space hint when not flipped */}
        {!flipped && (
          <div className="mt-5 font-mono text-[10px] tracking-widest text-muted-foreground opacity-60">
            Space or Enter to reveal
          </div>
        )}
      </div>
    </div>
  );
}
