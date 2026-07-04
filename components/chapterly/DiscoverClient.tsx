"use client";

import { useState } from "react";
import { Clock, X, ChevronRight, BookOpen } from "lucide-react";
import type { CuratedBookSummary } from "@/lib/chapterly/curated";

const ACCENT = "#4F6D7A";

const CATEGORY_COLORS: Record<string, string> = {
  Productivity: "#EA580C",
  Wealth: "#16A34A",
  Psychology: "#8B5CF6",
  Leadership: "#0EA5E9",
};

interface Props {
  books: CuratedBookSummary[];
  categories: string[];
}

export function DiscoverClient({ books, categories }: Props): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<CuratedBookSummary | null>(null);

  const filtered = activeCategory ? books.filter((b) => b.category === activeCategory) : books;

  return (
    <>
      {/* Category filter pills */}
      <div className="flex items-center gap-[8px] flex-wrap mb-[32px]">
        <button
          onClick={() => setActiveCategory(null)}
          className="font-mono text-[9px] tracking-[0.12em] uppercase px-[12px] py-[6px] rounded-full border cursor-pointer transition-all"
          style={
            activeCategory === null
              ? { background: ACCENT, color: "#fff", borderColor: ACCENT }
              : { background: "transparent", color: "var(--ink-3)", borderColor: "var(--rule)" }
          }
        >
          All
        </button>
        {categories.map((cat) => {
          const color = CATEGORY_COLORS[cat] ?? ACCENT;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className="font-mono text-[9px] tracking-[0.12em] uppercase px-[12px] py-[6px] rounded-full border cursor-pointer transition-all"
              style={
                activeCategory === cat
                  ? { background: color, color: "#fff", borderColor: color }
                  : { background: "transparent", color: "var(--ink-3)", borderColor: "var(--rule)" }
              }
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Book grid */}
      <div className="grid grid-cols-3 max-[1000px]:grid-cols-2 max-[560px]:grid-cols-1 gap-[20px]">
        {filtered.map((book) => {
          const color = CATEGORY_COLORS[book.category] ?? ACCENT;
          return (
            <button
              key={book.id}
              onClick={() => setSelected(book)}
              className="text-left rounded-[16px] border border-[var(--rule)] bg-[var(--bg-2)] p-[24px] cursor-pointer transition-all hover:border-[var(--ink-3)] hover:shadow-md hover:-translate-y-[1px] group"
            >
              {/* Cover placeholder + category badge */}
              <div className="relative mb-[18px]">
                <div
                  className="w-full h-[120px] rounded-[10px] overflow-hidden flex items-center justify-center"
                  style={{ background: color + "15" }}
                >
                  {book.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <BookOpen size={32} style={{ color, opacity: 0.5 }} />
                  )}
                </div>
                <span
                  className="absolute top-[8px] right-[8px] font-mono text-[8px] tracking-[0.12em] uppercase px-[8px] py-[3px] rounded-full font-semibold"
                  style={{ background: color, color: "#fff" }}
                >
                  {book.category}
                </span>
              </div>

              <div className="text-[15px] font-semibold text-[var(--ink)] leading-[1.3] mb-[4px] line-clamp-2">
                {book.title}
              </div>
              <div className="font-mono text-[10px] text-[var(--ink-3)] mb-[10px]">
                {book.author}
              </div>
              <p className="text-[12px] leading-[1.6] text-[var(--ink-3)] line-clamp-2 mb-[14px]">
                {book.tagline}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[5px] font-mono text-[9px] text-[var(--ink-3)]">
                  <Clock size={10} />
                  {book.read_time_minutes} min read
                </div>
                <div
                  className="flex items-center gap-[4px] font-mono text-[9px] tracking-[0.08em] uppercase font-semibold transition-opacity group-hover:opacity-100 opacity-50"
                  style={{ color: ACCENT }}
                >
                  Read <ChevronRight size={12} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary drawer */}
      {selected && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSelected(null)}
            aria-hidden="true"
          />
          <div
            className="fixed top-0 right-0 bottom-0 z-50 w-[540px] max-[600px]:w-full flex flex-col shadow-2xl border-l border-[var(--rule)] overflow-hidden"
            style={{ background: "var(--bg)" }}
          >
            {/* Drawer header */}
            <div className="shrink-0 px-[28px] py-[20px] border-b border-[var(--rule)] flex items-start justify-between gap-[16px]">
              <div className="min-w-0">
                <div
                  className="font-mono text-[8px] tracking-[0.14em] uppercase mb-[4px]"
                  style={{ color: CATEGORY_COLORS[selected.category] ?? ACCENT }}
                >
                  {selected.category} · {selected.read_time_minutes} min read
                </div>
                <h2 className="text-[18px] font-semibold text-[var(--ink)] leading-[1.3] m-0 line-clamp-2">
                  {selected.title}
                </h2>
                <div className="font-mono text-[10px] text-[var(--ink-3)] mt-[2px]">
                  {selected.author}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="shrink-0 w-[30px] h-[30px] flex items-center justify-center rounded-[8px] border-none cursor-pointer bg-transparent transition-opacity hover:opacity-60"
                style={{ color: "var(--ink-3)" }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tagline */}
            <div
              className="shrink-0 px-[28px] py-[14px] border-b border-[var(--rule)]"
              style={{ background: (CATEGORY_COLORS[selected.category] ?? ACCENT) + "08" }}
            >
              <p
                className="text-[13px] leading-[1.6] m-0 italic"
                style={{ color: CATEGORY_COLORS[selected.category] ?? ACCENT }}
              >
                &ldquo;{selected.tagline}&rdquo;
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-[28px] py-[24px]">
              <p className="text-[13px] leading-[1.7] text-[var(--ink-2)] mb-[24px]">
                {selected.description}
              </p>
              <div
                className="text-[13px] leading-[1.8] text-[var(--ink)] whitespace-pre-wrap"
                style={{ fontFamily: "inherit" }}
              >
                {selected.content}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-[28px] py-[16px] border-t border-[var(--rule)] flex items-center justify-between">
              <span className="font-mono text-[9px] text-[var(--ink-3)] tracking-[0.08em]">
                Curated summary
              </span>
              <button
                onClick={() => setSelected(null)}
                className="font-mono text-[9px] tracking-[0.12em] uppercase border-none cursor-pointer bg-transparent transition-opacity hover:opacity-70"
                style={{ color: ACCENT }}
              >
                Done reading →
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
