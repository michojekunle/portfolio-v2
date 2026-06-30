"use client";

import { type PublicBook, type BookNote } from "@/lib/supabase/reading";
import { TiltCard } from "./tilt-card";
import { MagneticWrapper } from "./magnetic-wrapper";
import { ArrowRight } from "lucide-react";

export function ProgressBar({ value }: { value: number }): React.ReactElement {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-[12px] mt-[8px]">
      <div
        className="h-[4px] rounded-full bg-[var(--rule)] overflow-hidden w-[160px]"
        aria-label={`${pct}% complete`}
      >
        <MagneticWrapper strength={10}>
          <div
            className="h-full rounded-full bg-[var(--v3-accent)] transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </MagneticWrapper>
      </div>
      <span className="font-mono text-[10px] text-[var(--ink-3)] tracking-[0.06em]">
        {pct}%
      </span>
    </div>
  );
}

export function NoteEntry({ note }: { note: BookNote }): React.ReactElement {
  const isQuote = note.type === "quote";
  const isTakeaway = note.type === "takeaway";

  const wrapperClass = isQuote
    ? "flex flex-col gap-[16px] py-[32px] px-[24px] border border-[var(--v3-accent-soft)] bg-[color-mix(in_oklab,var(--v3-accent)_3%,transparent)] rounded-[12px] relative overflow-hidden"
    : "grid grid-cols-[18px_1fr] gap-[12px] items-start py-[4px]";

  if (isQuote) {
    return (
      <div className={wrapperClass}>
        <span className="font-display text-[80px] leading-[0.5] text-[var(--v3-accent)] opacity-20 absolute top-[40px] left-[16px]">
          ❝
        </span>
        <blockquote className="m-0 p-0 font-display text-[clamp(24px,3vw,36px)] font-light italic text-[var(--ink)] leading-[1.4] fvs-text relative z-10">
          {note.content}
        </blockquote>
        {note.page_ref && (
          <span className="inline-block font-mono text-[10px] text-[var(--ink-4)] tracking-[0.06em] uppercase relative z-10">
            p. {note.page_ref}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <span
        className={`text-[14px] mt-[2px] leading-[1.5] ${
          isTakeaway ? "text-[var(--v3-accent)]" : "text-[var(--ink-4)]"
        }`}
        aria-hidden="true"
      >
        {isTakeaway ? <ArrowRight className="inline w-3 h-3" /> : "·"}
      </span>
      <div>
        <p
          className={`m-0 text-[15px] leading-[1.65] ${
            isTakeaway ? "text-[var(--ink)] font-medium" : "text-[var(--ink-2)]"
          }`}
        >
          {note.content}
        </p>
        {note.page_ref && (
          <span className="inline-block mt-[8px] font-mono text-[10px] text-[var(--ink-4)] tracking-[0.06em]">
            p. {note.page_ref}
          </span>
        )}
      </div>
    </div>
  );
}

export function BookCard({ book }: { book: PublicBook }): React.ReactElement {
  const quotes = book.notes.filter((n) => n.type === "quote");
  const takeaways = book.notes.filter((n) => n.type === "takeaway");
  const notes = book.notes.filter((n) => n.type === "note");
  const hasNotes = book.notes.length > 0;

  return (
    <article className="group relative flex flex-col md:flex-row items-stretch bg-[var(--paper)] border border-[var(--rule)] rounded-[20px] overflow-hidden transition-all duration-300 hover:border-[var(--v3-accent-soft)] hover:shadow-[0_20px_50px_color-mix(in_oklab,var(--ink)_4%,transparent)] h-full w-full">
      {/* Cover Column */}
      <div className="w-full md:w-[300px] shrink-0 p-[24px] md:p-[40px] bg-[var(--bg-2)] flex flex-col items-center border-b md:border-b-0 md:border-r border-[var(--rule)] h-full">
        <TiltCard intensity={25}>
          <div className="relative w-full aspect-[2/3] rounded-[6px] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.25)] transition-transform duration-500">
            {book.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.cover_url}
                alt={book.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-display text-[48px] font-normal text-[var(--v3-accent)] tracking-[-0.03em] bg-[color-mix(in_oklab,var(--v3-accent)_10%,var(--bg-2))]">
                <span>{book.title.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            {/* Subtle spine gradient for book effect */}
            <div
              className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-black/40 to-transparent blur-[1px]"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
          </div>
        </TiltCard>

        {book.status === "reading" && (
          <div className="w-full mt-[40px]">
            <ProgressBar value={book.progress} />
          </div>
        )}
      </div>

      {/* Content Column */}
      <div className="flex-1 relative overflow-hidden flex flex-col h-full">
        <div className="flex-1 p-[32px] md:p-[48px] overflow-y-auto v3-sleek-scrollbar" data-lenis-prevent="true">
          <div className="max-w-[720px] pb-[40px]">
            {/* Meta */}
            <div className="mb-[40px]">
              <h3 className="m-0 font-display font-light text-[clamp(32px,4vw,56px)] leading-[1.05] tracking-[-0.03em] text-[var(--ink)] mb-[12px] fvs-text">
                {book.title}
              </h3>
              <div className="text-[14px] text-[var(--v3-accent)] font-mono tracking-[0.1em] uppercase">
                {book.author}
              </div>
            </div>

            {/* Notes */}
            <div className="pt-[40px] border-t border-[var(--rule)]">
              {hasNotes ? (
                <div className="flex flex-col gap-[56px]">
                  {quotes.length > 0 && (
                    <div className="flex flex-col gap-[24px]">
                      <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--ink-4)] font-medium flex items-center gap-[12px]">
                        <div className="w-[12px] h-[1px] bg-[var(--v3-accent)]" />
                        Notable Quotes
                      </div>
                      <div className="flex flex-col gap-[24px]">
                        {quotes.map((n) => (
                          <NoteEntry key={n.id} note={n} />
                        ))}
                      </div>
                    </div>
                  )}
                  {takeaways.length > 0 && (
                    <div className="flex flex-col gap-[24px]">
                      <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--ink-4)] font-medium flex items-center gap-[12px]">
                        <div className="w-[12px] h-[1px] bg-[var(--v3-accent)]" />
                        Key Takeaways
                      </div>
                      <div className="flex flex-col gap-[16px]">
                        {takeaways.map((n) => (
                          <NoteEntry key={n.id} note={n} />
                        ))}
                      </div>
                    </div>
                  )}
                  {notes.length > 0 && (
                    <div className="flex flex-col gap-[24px]">
                      <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--ink-4)] font-medium flex items-center gap-[12px]">
                        <div className="w-[12px] h-[1px] bg-[var(--ink-4)]" />
                        Reading Notes
                      </div>
                      <div className="flex flex-col gap-[16px]">
                        {notes.map((n) => (
                          <NoteEntry key={n.id} note={n} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="m-0 font-sans text-[20px] text-[var(--ink-3)] font-normal leading-[1.6]">
                  Notes and takeaways for this title are currently being
                  synthesized. Check back soon for the core insights.
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Scroll Indicator Fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[80px] bg-gradient-to-t from-[var(--paper)] to-transparent pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </article>
  );
}
