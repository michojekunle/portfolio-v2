"use client";

import Link from "next/link";
import { type PublicBook, type BookNote } from "@/lib/supabase/reading";
import { TiltCard } from "./tilt-card";
import { MagneticWrapper } from "./magnetic-wrapper";
import { BookCover } from "./book-cover";
import { ArrowRight } from "lucide-react";

export function ProgressBar({ value }: { value: number }): React.ReactElement {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex items-center gap-[12px] mt-[8px]">
      <div
        className="h-[4px] rounded-full bg-[var(--rule)] overflow-hidden w-[160px]"
        aria-label={`${pct}% complete`}
      >
        <div
          className="h-full rounded-full bg-[var(--v3-accent)] transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
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
    ? "flex flex-col gap-[16px] py-[36px] px-[28px] border border-[var(--v3-accent-soft)] bg-[color-mix(in_oklab,var(--v3-accent)_3%,transparent)] rounded-[14px] relative overflow-hidden"
    : "grid grid-cols-[18px_1fr] gap-[12px] items-start py-[6px]";

  if (isQuote) {
    return (
      <div className={wrapperClass}>
        <span className="font-display text-[80px] leading-[0.5] text-[var(--v3-accent)] opacity-20 absolute top-[44px] left-[20px]">
          ❝
        </span>
        <blockquote className="m-0 p-0 font-display text-[clamp(24px,3vw,38px)] font-light italic text-[var(--ink)] leading-[1.4] fvs-text relative z-10">
          {note.content}
        </blockquote>
        {note.page_ref && (
          <span className="inline-block font-mono text-[10px] text-[var(--ink-3)] tracking-[0.06em] uppercase relative z-10">
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
          isTakeaway ? "text-[var(--v3-accent)]" : "text-[var(--ink-3)]"
        }`}
        aria-hidden="true"
      >
        {isTakeaway ? <ArrowRight className="inline w-3 h-3" /> : "·"}
      </span>
      <div>
        <p
          className={`m-0 text-[16px] leading-[1.7] ${
            isTakeaway ? "text-[var(--ink)] font-medium" : "text-[var(--ink-2)]"
          }`}
        >
          {note.content}
        </p>
        {note.page_ref && (
          <span className="inline-block mt-[8px] font-mono text-[10px] text-[var(--ink-3)] tracking-[0.06em]">
            p. {note.page_ref}
          </span>
        )}
      </div>
    </div>
  );
}

// Full detail view for a single book — a proper standalone page, not a card.
// Big hero meta + title, then a sticky cover sidebar next to a generously
// spaced notes column. Used on /reading/[id].
export function BookCard({ book }: { book: PublicBook }): React.ReactElement {
  const quotes = book.notes.filter((n) => n.type === "quote");
  const takeaways = book.notes.filter((n) => n.type === "takeaway");
  const notes = book.notes.filter((n) => n.type === "note");
  const hasNotes = book.notes.length > 0;

  return (
    <div>
      {/* Meta row */}
      <div className="flex flex-wrap gap-[48px] max-[720px]:gap-[24px] mb-[40px]">
        <div className="flex flex-col gap-[8px]">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-3)]">Author</div>
          <div className="text-[15px] font-medium text-[var(--ink)]">{book.author}</div>
        </div>
        <div className="flex flex-col gap-[8px]">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-3)]">Status</div>
          <div className="text-[15px] font-medium text-[var(--ink)]">
            {book.status === "reading" ? "Currently reading" : "Finished"}
          </div>
        </div>
        {book.status === "reading" && (
          <div className="flex flex-col gap-[8px]">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-3)]">Progress</div>
            <ProgressBar value={book.progress} />
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="m-0 font-display font-light text-[clamp(40px,7vw,88px)] leading-[0.95] tracking-[-0.03em] text-[var(--ink)] mb-[64px] text-balance fvs-display max-w-[16ch]">
        {book.title}
      </h1>

      {/* Cover sidebar + notes */}
      <div className="grid grid-cols-[280px_1fr] max-[860px]:grid-cols-1 gap-[80px] max-[860px]:gap-[48px] items-start">
        <div className="sticky top-[120px] max-[860px]:static">
          <TiltCard intensity={20}>
            <div className="relative w-full aspect-[2/3] rounded-[10px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
              <BookCover title={book.title} coverUrl={book.cover_url} titleSize={20} />
              <div
                className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-black/40 to-transparent blur-[1px] pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </TiltCard>
        </div>

        <div className="max-w-[72ch]">
          {hasNotes ? (
            <div className="flex flex-col gap-[72px]">
              {quotes.length > 0 && (
                <div className="flex flex-col gap-[28px]">
                  <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--ink-3)] font-medium flex items-center gap-[12px]">
                    <div className="w-[12px] h-[1px] bg-[var(--v3-accent)]" />
                    Notable Quotes
                  </div>
                  <div className="flex flex-col gap-[28px]">
                    {quotes.map((n) => (
                      <NoteEntry key={n.id} note={n} />
                    ))}
                  </div>
                </div>
              )}
              {takeaways.length > 0 && (
                <div className="flex flex-col gap-[28px]">
                  <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--ink-3)] font-medium flex items-center gap-[12px]">
                    <div className="w-[12px] h-[1px] bg-[var(--v3-accent)]" />
                    Key Takeaways
                  </div>
                  <div className="flex flex-col gap-[20px]">
                    {takeaways.map((n) => (
                      <NoteEntry key={n.id} note={n} />
                    ))}
                  </div>
                </div>
              )}
              {notes.length > 0 && (
                <div className="flex flex-col gap-[28px]">
                  <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--ink-3)] font-medium flex items-center gap-[12px]">
                    <div className="w-[12px] h-[1px] bg-[var(--ink-4)]" />
                    Reading Notes
                  </div>
                  <div className="flex flex-col gap-[20px]">
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
  );
}

// Compact teaser for the /reading index grid — cover, meta, one preview
// line, and a link through to the full detail page.
export function BookTeaserCard({ book }: { book: PublicBook }): React.ReactElement {
  const teaser =
    book.notes.find((n) => n.type === "quote") ??
    book.notes.find((n) => n.type === "takeaway") ??
    book.notes[0] ??
    null;

  return (
    <MagneticWrapper strength={6}>
      <Link
        href={`/reading/${book.id}`}
        className="group flex flex-col h-full no-underline bg-[var(--paper)] border border-[var(--rule)] rounded-[16px] overflow-hidden transition-all duration-300 hover:border-[var(--v3-accent-soft)] hover:shadow-[0_16px_36px_color-mix(in_oklab,var(--ink)_5%,transparent)] hover:-translate-y-[2px]"
      >
        <div className="relative w-full aspect-[3/2] bg-[var(--bg-2)] border-b border-[var(--rule)] flex items-center justify-center overflow-hidden">
          <div className="relative w-[92px] aspect-[2/3] rounded-[4px] overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
            <BookCover title={book.title} coverUrl={book.cover_url} titleSize={11} />
          </div>
          <span
            className="absolute top-[12px] right-[12px] font-mono text-[8px] tracking-[0.12em] uppercase px-[8px] py-[3px] rounded-full font-semibold"
            style={
              book.status === "reading"
                ? { background: "var(--v3-accent)", color: "#fff" }
                : { background: "var(--bg)", color: "var(--ink-3)", border: "1px solid var(--rule)" }
            }
          >
            {book.status === "reading" ? "Reading" : "Finished"}
          </span>
        </div>

        <div className="flex-1 flex flex-col p-[20px] gap-[10px]">
          <div>
            <h3 className="m-0 font-display text-[18px] font-normal leading-[1.25] tracking-[-0.01em] text-[var(--ink)] fvs-text line-clamp-2">
              {book.title}
            </h3>
            <div className="mt-[3px] font-mono text-[10px] tracking-[0.08em] uppercase text-[var(--ink-3)]">
              {book.author}
            </div>
          </div>

          {book.status === "reading" && <ProgressBar value={book.progress} />}

          {teaser && (
            <p className="m-0 text-[13px] leading-[1.6] text-[var(--ink-2)] line-clamp-2 italic">
              &ldquo;{teaser.content}&rdquo;
            </p>
          )}

          <div className="mt-auto pt-[8px] font-mono text-[9px] tracking-[0.1em] uppercase font-semibold text-[var(--v3-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
            Read notes →
          </div>
        </div>
      </Link>
    </MagneticWrapper>
  );
}
