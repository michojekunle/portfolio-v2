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
    <div className="flex items-center gap-3 mt-2">
      <div
        className="h-1 rounded-full bg-(--rule) overflow-hidden w-40"
        aria-label={`${pct}% complete`}
      >
        <div
          className="h-full rounded-full bg-(--v3-accent) transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[10px] text-muted-foreground tracking-[0.06em]">
        {pct}%
      </span>
    </div>
  );
}

export function NoteEntry({ note }: { note: BookNote }): React.ReactElement {
  const isQuote = note.type === "quote";
  const isTakeaway = note.type === "takeaway";

  const wrapperClass = isQuote
    ? "flex flex-col gap-4 py-9 px-7 border border-(--v3-accent-soft) bg-[color-mix(in_oklab,var(--v3-accent)_3%,transparent)] rounded-[14px] relative overflow-hidden"
    : "grid grid-cols-[18px_1fr] gap-3 items-start py-1.5";

  if (isQuote) {
    return (
      <div className={wrapperClass}>
        <span className="font-display text-[80px] leading-[0.5] text-(--v3-accent) opacity-20 absolute top-11 left-5">
          ❝
        </span>
        <blockquote className="m-0 p-0 font-display text-[clamp(24px,3vw,38px)] font-light italic text-(--ink) leading-[1.4] fvs-text relative z-10">
          {note.content}
        </blockquote>
        {note.page_ref && (
          <span className="inline-block font-mono text-[10px] text-muted-foreground tracking-[0.06em] uppercase relative z-10">
            p. {note.page_ref}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <span
        className={`text-[14px] mt-0.5 leading-normal ${
          isTakeaway ? "text-(--v3-accent)" : "text-muted-foreground"
        }`}
        aria-hidden="true"
      >
        {isTakeaway ? <ArrowRight className="inline w-3 h-3" /> : "·"}
      </span>
      <div>
        <p
          className={`m-0 text-[16px] leading-[1.7] ${
            isTakeaway ? "text-(--ink) font-medium" : "text-secondary-foreground"
          }`}
        >
          {note.content}
        </p>
        {note.page_ref && (
          <span className="inline-block mt-2 font-mono text-[10px] text-muted-foreground tracking-[0.06em]">
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
      <div className="flex flex-wrap gap-12 max-180:gap-6 mb-10">
        <div className="flex flex-col gap-2">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Author</div>
          <div className="text-[15px] font-medium text-(--ink)">{book.author}</div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Status</div>
          <div className="text-[15px] font-medium text-(--ink)">
            {book.status === "reading" ? "Currently reading" : "Finished"}
          </div>
        </div>
        {book.status === "reading" && (
          <div className="flex flex-col gap-2">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Progress</div>
            <ProgressBar value={book.progress} />
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="m-0 font-display font-light text-[clamp(40px,7vw,88px)] leading-[0.95] tracking-[-0.03em] text-(--ink) mb-16 text-balance fvs-display max-w-[16ch]">
        {book.title}
      </h1>

      {/* Cover sidebar + notes */}
      <div className="grid grid-cols-[280px_1fr] max-[860px]:grid-cols-1 gap-20 max-[860px]:gap-12 items-start">
        <div className="sticky top-30 max-[860px]:static">
          <TiltCard intensity={20}>
            <div className="relative w-full aspect-[2/3] rounded-[10px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
              <BookCover title={book.title} coverUrl={book.cover_url} titleSize={20} />
              <div
                className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/40 to-transparent blur-0.25 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </TiltCard>
        </div>

        <div className="max-w-[72ch]">
          {hasNotes ? (
            <div className="flex flex-col gap-18">
              {quotes.length > 0 && (
                <div className="flex flex-col gap-7">
                  <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium flex items-center gap-3">
                    <div className="w-3 h-0.25 bg-(--v3-accent)" />
                    Notable Quotes
                  </div>
                  <div className="flex flex-col gap-7">
                    {quotes.map((n) => (
                      <NoteEntry key={n.id} note={n} />
                    ))}
                  </div>
                </div>
              )}
              {takeaways.length > 0 && (
                <div className="flex flex-col gap-7">
                  <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium flex items-center gap-3">
                    <div className="w-3 h-0.25 bg-(--v3-accent)" />
                    Key Takeaways
                  </div>
                  <div className="flex flex-col gap-5">
                    {takeaways.map((n) => (
                      <NoteEntry key={n.id} note={n} />
                    ))}
                  </div>
                </div>
              )}
              {notes.length > 0 && (
                <div className="flex flex-col gap-7">
                  <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium flex items-center gap-3">
                    <div className="w-3 h-0.25 bg-(--ink-4)" />
                    Reading Notes
                  </div>
                  <div className="flex flex-col gap-5">
                    {notes.map((n) => (
                      <NoteEntry key={n.id} note={n} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="m-0 font-sans text-[20px] text-muted-foreground font-normal leading-[1.6]">
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
        className="group flex flex-col h-full no-underline bg-(--paper) border border-(--rule) rounded-2xl overflow-hidden transition-all duration-300 hover:border-(--v3-accent-soft) hover:shadow-[0_16px_36px_color-mix(in_oklab,var(--ink)_5%,transparent)] hover:-translate-y-0.5"
      >
        <div className="relative w-full aspect-[3/2] bg-(--bg-2) border-b border-(--rule) flex items-center justify-center overflow-hidden">
          <div className="relative w-[92px] aspect-[2/3] rounded overflow-hidden shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
            <BookCover title={book.title} coverUrl={book.cover_url} titleSize={11} />
          </div>
          <span
            className="absolute top-3 right-3 font-mono text-[8px] tracking-[0.12em] uppercase px-2 py-0.75 rounded-full font-semibold"
            style={
              book.status === "reading"
                ? { background: "var(--v3-accent)", color: "#fff" }
                : { background: "var(--bg)", color: "var(--ink-3)", border: "1px solid var(--rule)" }
            }
          >
            {book.status === "reading" ? "Reading" : "Finished"}
          </span>
        </div>

        <div className="flex-1 flex flex-col p-5 gap-2.5">
          <div>
            <h3 className="m-0 font-display text-[18px] font-normal leading-[1.25] tracking-[-0.01em] text-(--ink) fvs-text line-clamp-2">
              {book.title}
            </h3>
            <div className="mt-0.75 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">
              {book.author}
            </div>
          </div>

          {book.status === "reading" && <ProgressBar value={book.progress} />}

          {teaser && (
            <p className="m-0 text-[13px] leading-[1.6] text-secondary-foreground line-clamp-2 italic">
              &ldquo;{teaser.content}&rdquo;
            </p>
          )}

          <div className="mt-auto pt-2 font-mono text-[9px] tracking-widest uppercase font-semibold text-(--v3-accent) opacity-0 group-hover:opacity-100 transition-opacity">
            Read notes →
          </div>
        </div>
      </Link>
    </MagneticWrapper>
  );
}
