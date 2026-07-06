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

const ACCENT = "#4F6D7A";

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
        className="min-h-screen flex flex-col items-center justify-center px-[24px] py-[80px] max-[1024px]:pt-[100px] gap-[24px] text-center"
      >
        <div
          className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center"
          style={{ background: `${ACCENT}18` }}
        >
          <Brain size={32} style={{ color: ACCENT }} />
        </div>
        <div className="max-w-[420px]">
          <h1 className="font-display text-[26px] font-normal tracking-[-0.02em] fvs-text text-[var(--ink)] mb-[10px]">
            {hasCollection ? "No cards due today" : "No flashcards yet"}
          </h1>
          <p className="text-[13px] leading-[1.6] text-[var(--ink-3)] mb-[24px]">
            {hasCollection
              ? `Great job! You have reviewed all cards due for today. You have ${totalCount} total card${totalCount > 1 ? "s" : ""} in your library collection.`
              : "To create flashcards, open any book, highlight a passage, and click the Flashcard (sparkles) icon in the notes sidebar. They will appear here immediately for study."}
          </p>
          <div className="flex items-center justify-center gap-[12px] flex-wrap">
            {hasCollection && !studyAll && (
              <Link
                href="/tools/chapterly/flashcards?all=true"
                className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[20px] py-[12px] rounded-[10px] no-underline"
                style={{ background: ACCENT, color: "#fff" }}
              >
                Study All Anyway
              </Link>
            )}
            <Link
              href="/tools/chapterly"
              className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[20px] py-[12px] rounded-[10px] no-underline border transition-colors"
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
        className="min-h-screen flex flex-col items-center justify-center px-[24px] py-[80px] max-[1024px]:pt-[100px] gap-[32px]"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
      >
        <div
          className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center"
          style={{ background: `${ACCENT}18` }}
        >
          <Sparkles size={32} style={{ color: ACCENT }} />
        </div>
        <div className="text-center">
          <h1 className="font-display text-[32px] font-normal tracking-[-0.02em] fvs-text text-[var(--ink)] mb-[8px]">
            Session complete
          </h1>
          <p className="font-mono text-[12px] tracking-[0.08em] text-[var(--ink-3)]">
            {total} card{total !== 1 ? "s" : ""} reviewed
          </p>
        </div>

        {total > 0 && (
          <div className="flex items-center gap-[20px]">
            {RATINGS.map(({ rating, label, color }) => {
              const count = sessionStats[rating];
              if (count === 0) return null;
              return (
                <div key={rating} className="text-center">
                  <div
                    className="text-[24px] font-bold mb-[2px]"
                    style={{ color }}
                  >
                    {count}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)]">
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-[12px]">
          <Link
            href="/tools/chapterly"
            className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[20px] py-[12px] rounded-[10px] no-underline border border-[var(--rule)] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
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
            className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[20px] py-[12px] rounded-[10px] border-none cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: ACCENT, color: "#fff" }}
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
      <div className="flex items-center justify-between px-[32px] py-[20px] max-[1024px]:pt-[80px] border-b border-[var(--rule)] max-[720px]:px-[20px]">
        <Link
          href="/tools/chapterly"
          className="inline-flex items-center gap-[6px] font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] hover:text-[var(--ink)] no-underline transition-colors"
        >
          <ArrowLeft size={12} /> Back
        </Link>
        <div className="flex items-center gap-[16px]">
          <button
            onClick={() => void removeCard()}
            disabled={submitting}
            className="inline-flex items-center gap-[5px] font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] hover:text-[#DC2626] transition-colors bg-transparent border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Remove this card permanently"
          >
            <Trash2 size={11} />
            Remove
          </button>
          <div className="flex items-center gap-[10px]">
            <Brain size={15} style={{ color: ACCENT }} />
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase font-semibold text-[var(--ink-3)]">
              {current + 1} / {queue.length}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] bg-[var(--rule)]">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: ACCENT }}
        />
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-[24px] py-[48px] max-[720px]:py-[32px]">
        {/* Source book */}
        {card.ch_books && (
          <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)] mb-[24px] text-center">
            {card.ch_books.title}
            {card.ch_books.author ? ` · ${card.ch_books.author}` : ""}
          </div>
        )}

        {/* Card face */}
        <div
          className="w-full max-w-[600px] rounded-[20px] border border-[var(--rule)] bg-[var(--bg-2)] overflow-hidden cursor-pointer transition-all duration-150 hover:border-[var(--ink-3)] active:scale-[0.99]"
          onClick={() => setFlipped(true)}
          role="button"
          tabIndex={-1}
        >
          {/* Front */}
          <div className="p-[36px] max-[480px]:p-[24px]">
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[20px] flex items-center gap-[6px]">
              <div
                className="w-[6px] h-[6px] rounded-full"
                style={{ background: ACCENT }}
              />
              Highlight
            </div>
            <blockquote
              className="m-0 text-[17px] leading-[1.75] text-[var(--ink)] italic"
              style={{ borderLeft: "none" }}
            >
              &ldquo;{card.front}&rdquo;
            </blockquote>
          </div>

          {/* Back / reveal */}
          {!flipped ? (
            <div
              className="px-[36px] py-[20px] border-t border-[var(--rule)] flex items-center justify-between max-[480px]:px-[24px]"
              style={{ background: `${ACCENT}08` }}
            >
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
                Tap to reveal
              </span>
              <ChevronRight size={14} style={{ color: ACCENT }} />
            </div>
          ) : (
            <div className="px-[36px] py-[24px] border-t border-[var(--rule)] max-[480px]:px-[24px]">
              <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[12px] flex items-center gap-[6px]">
                <Check size={10} style={{ color: "#16A34A" }} />
                Your note
              </div>
              {card.back ? (
                <p className="text-[15px] leading-[1.65] text-[var(--ink)] m-0">
                  {card.back}
                </p>
              ) : (
                <p className="text-[14px] text-[var(--ink-3)] m-0 italic">
                  No note — rate how well you recalled this passage.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Rating buttons */}
        {flipped && (
          <div className="mt-[32px] flex gap-[10px] max-[480px]:gap-[6px]">
            {RATINGS.map(({ rating, label, color, hotkey }) => (
              <button
                key={rating}
                onClick={() => void submitRating(rating)}
                disabled={submitting}
                className="flex flex-col items-center gap-[6px] px-[20px] py-[14px] rounded-[12px] border border-[var(--rule)] bg-[var(--bg-2)] cursor-pointer transition-all hover:border-[var(--ink-2)] disabled:opacity-40 max-[480px]:px-[14px] max-[480px]:py-[10px]"
              >
                <span
                  className="font-semibold text-[14px]"
                  style={{ color }}
                >
                  {label}
                </span>
                <kbd
                  className="font-mono text-[9px] px-[5px] py-[1px] rounded border border-[var(--rule)] text-[var(--ink-3)]"
                >
                  {hotkey}
                </kbd>
              </button>
            ))}
          </div>
        )}

        {/* Space hint when not flipped */}
        {!flipped && (
          <div className="mt-[20px] font-mono text-[10px] tracking-[0.1em] text-[var(--ink-3)] opacity-60">
            Space or Enter to reveal
          </div>
        )}
      </div>
    </div>
  );
}
