"use client";

import { useState } from "react";
import { Clock, BookOpen } from "lucide-react";
import type { CuratedBookSummary } from "@/lib/chapterly/curated";
import { SummaryDrawer } from "./SummaryDrawer";

const ACCENT = "var(--ch-accent)";

const CATEGORY_COLORS: Record<string, string> = {
  Productivity: "#EA580C",
  Wealth: "#16A34A",
  Psychology: "#8B5CF6",
  Leadership: "#0EA5E9",
};

interface Props {
  books: CuratedBookSummary[];
  categories: string[];
  userBookTitles: string[];
}

export function DiscoverClient({ books, categories, userBookTitles }: Props): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<CuratedBookSummary | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(() => {
    const lowerTitles = userBookTitles.map((t) => t.toLowerCase());
    return new Set(
      books
        .filter((b) => lowerTitles.includes(`summary: ${b.title}`.toLowerCase()))
        .map((b) => b.id)
    );
  });

  const filtered = activeCategory ? books.filter((b) => b.category === activeCategory) : books;

  const addToLibrary = async (book: CuratedBookSummary): Promise<void> => {
    const dataUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(book.content)}`;
    const res = await fetch("/api/chapterly/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `Summary: ${book.title}`,
        author: book.author,
        cover_url: book.cover_url,
        file_url: dataUrl,
        file_format: "md",
        file_size_bytes: book.content.length,
      }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(d.error ?? "Failed to save summary to library");
    }
    setAddedIds((prev) => new Set(prev).add(book.id));
  };

  return (
    <>
      {/* Category filter pills */}
      <div className="flex items-center gap-[8px] flex-wrap mb-[32px]">
        <button
          onClick={() => setActiveCategory(null)}
          className="font-mono text-[9px] tracking-[0.12em] uppercase px-[12px] py-[6px] rounded-full border cursor-pointer transition-all"
          style={
            activeCategory === null
              ? { background: ACCENT, color: "var(--ch-bg)", borderColor: ACCENT }
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
                  ? { background: color, color: "var(--ch-bg)", borderColor: color }
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
                  style={{ background: color, color: "var(--ch-bg)" }}
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
                  className="flex items-center gap-[4px] font-mono text-[9px] tracking-[0.08em] uppercase font-semibold transition-opacity group-hover:opacity-100 opacity-60"
                  style={{ color: ACCENT }}
                >
                  <BookOpen size={11} /> Read Summary
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Headway-style summary drawer: chapter cards + Listen tab */}
      {selected && (
        <SummaryDrawer
          book={{
            title: selected.title,
            author: selected.author,
            cover_url: selected.cover_url,
            previewContent: selected.content,
          }}
          onClose={() => setSelected(null)}
          onAddToLibrary={() => addToLibrary(selected)}
          isAdded={addedIds.has(selected.id)}
        />
      )}
    </>
  );
}
