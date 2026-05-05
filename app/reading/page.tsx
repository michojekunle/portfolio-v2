import type { Metadata } from "next"
import { getPublicBooks, type PublicBook, type BookNote } from "@/lib/supabase/reading"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Reading",
  description: "Books I'm reading and what I'm taking from them — notes, quotes, and key takeaways.",
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }): React.ReactElement {
  const pct = Math.min(100, Math.max(0, value))
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
  )
}

function NoteEntry({ note }: { note: BookNote }): React.ReactElement {
  const isQuote = note.type === "quote"
  const isTakeaway = note.type === "takeaway"

  const wrapperClass = isQuote
    ? "grid grid-cols-[18px_1fr] gap-[12px] items-start border-l-[3px] border-[var(--v3-accent)] rounded-r-[8px] py-[14px] pl-[16px] pr-[16px] bg-[color-mix(in_oklab,var(--v3-accent)_6%,transparent)]"
    : "grid grid-cols-[18px_1fr] gap-[12px] items-start py-[4px]"

  return (
    <div className={wrapperClass}>
      <span
        className={`text-[14px] mt-[2px] leading-[1.5] ${isQuote || isTakeaway ? "text-[var(--v3-accent)]" : "text-[var(--ink-4)]"}`}
        aria-hidden="true"
      >
        {isQuote ? "❝" : isTakeaway ? "→" : "·"}
      </span>
      <div>
        {isQuote ? (
          <blockquote className="m-0 p-0 font-[family:var(--display-font)] text-[18px] italic text-[var(--ink)] leading-[1.6] [font-variation-settings:'opsz'_96]">
            {note.content}
          </blockquote>
        ) : (
          <p className={`m-0 text-[15px] leading-[1.65] ${isTakeaway ? "text-[var(--ink)] font-medium" : "text-[var(--ink-2)]"}`}>
            {note.content}
          </p>
        )}
        {note.page_ref && (
          <span className="inline-block mt-[8px] font-mono text-[10px] text-[var(--ink-4)] tracking-[0.06em]">
            p. {note.page_ref}
          </span>
        )}
      </div>
    </div>
  )
}

function BookCard({ book }: { book: PublicBook }): React.ReactElement {
  const quotes = book.notes.filter((n) => n.type === "quote")
  const takeaways = book.notes.filter((n) => n.type === "takeaway")
  const notes = book.notes.filter((n) => n.type === "note")
  const hasNotes = book.notes.length > 0

  return (
    <article className="group relative flex flex-col md:flex-row items-start bg-[var(--paper)] border border-[var(--rule)] rounded-[20px] overflow-hidden transition-all duration-300 hover:border-[var(--v3-accent-soft)] hover:shadow-[0_20px_50px_color-mix(in_oklab,var(--ink)_4%,transparent)]">
      {/* Cover Column */}
      <div className="w-full md:w-[220px] shrink-0 p-[24px] md:p-[32px] bg-[var(--bg-2)] flex flex-col items-center">
        <div className="relative w-full aspect-[2/3] rounded-[6px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:scale-[1.04] group-hover:-rotate-1">
          {book.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover_url}
              alt={book.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center font-[family:var(--display-font)] text-[32px] font-normal text-[var(--v3-accent)] tracking-[-0.03em] bg-[color-mix(in_oklab,var(--v3-accent)_10%,var(--bg-2))]"
            >
              <span>{book.title.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
          {/* Subtle spine gradient for book effect */}
          <div className="absolute inset-y-0 left-0 w-[4px] bg-black/10 blur-[1px]" aria-hidden="true" />
        </div>
        
        {book.status === "reading" && (
          <div className="w-full mt-[24px]">
            <ProgressBar value={book.progress} />
          </div>
        )}
      </div>

      {/* Content Column */}
      <div className="flex-1 p-[32px] max-[720px]:p-[24px] border-l border-[var(--rule)] max-[720px]:border-l-0 max-[720px]:border-t">
        <div className="max-w-[640px]">
          {/* Meta */}
          <div className="mb-[32px]">
            <h3 className="m-0 font-[family:var(--display-font)] font-normal text-[36px] max-[720px]:text-[28px] leading-[1.1] tracking-[-0.03em] text-[var(--ink)] mb-[10px] [font-variation-settings:'opsz'_96]">
              {book.title}
            </h3>
            <div className="text-[15px] text-[var(--ink-3)] font-mono tracking-[0.06em] uppercase">
              {book.author}
            </div>
          </div>

          {/* Notes */}
          <div className="pt-[32px] border-t border-[var(--rule)]">
            {hasNotes ? (
              <div className="flex flex-col gap-[40px]">
                {takeaways.length > 0 && (
                  <div className="flex flex-col gap-[16px]">
                    <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--ink-4)] font-bold">
                      Key Takeaways
                    </div>
                    <div className="flex flex-col gap-[12px]">
                      {takeaways.map((n) => <NoteEntry key={n.id} note={n} />)}
                    </div>
                  </div>
                )}
                {quotes.length > 0 && (
                  <div className="flex flex-col gap-[16px]">
                    <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--ink-4)] font-bold">
                      Notable Quotes
                    </div>
                    <div className="flex flex-col gap-[12px]">
                      {quotes.map((n) => <NoteEntry key={n.id} note={n} />)}
                    </div>
                  </div>
                )}
                {notes.length > 0 && (
                  <div className="flex flex-col gap-[16px]">
                    <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--ink-4)] font-bold">
                      Reading Notes
                    </div>
                    <div className="flex flex-col gap-[12px]">
                      {notes.map((n) => <NoteEntry key={n.id} note={n} />)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="m-0 font-[family:var(--display-font)] italic text-[18px] text-[var(--ink-3)] leading-[1.6] [font-variation-settings:'opsz'_96]">
                Notes and takeaways for this title are currently being synthesized. Check back soon for the core insights.
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ReadingPage(): Promise<React.ReactElement> {
  const books = await getPublicBooks()
  const currentlyReading = books.filter((b) => b.status === "reading")
  const completed = books.filter((b) => b.status === "completed")

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      {/* Hero */}
      <section className="pt-[160px] pb-[80px] max-[720px]:pt-[120px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
        <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]">03 — READING LOG</div>
        <h1 className="m-0 font-normal text-[clamp(64px,10vw,120px)] leading-[0.85] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance">
          Curated <em>takeaways.</em>
        </h1>
        <p className="text-[18px] text-[var(--ink-2)] max-w-[52ch] leading-[1.65] m-0">
          A dynamic archive of notes, quotes, and insights from the books I&apos;m currently exploring. Distilled for clarity and recall.
        </p>
      </section>

      {/* Book list */}
      <section className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[80px] pb-[160px] max-[720px]:py-[56px] max-[720px]:pb-[120px]">
        {books.length === 0 && (
          <p className="text-[var(--ink-3)] text-[16px] py-[80px] text-center font-serif italic">
            Nothing tracked yet — check back soon.
          </p>
        )}

        {currentlyReading.length > 0 && (
          <div className="mb-[120px] max-[720px]:mb-[80px]">
            <div className="grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[16px] items-baseline mb-[48px]">
              <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] uppercase pt-[8px]">Active</div>
              <h2 className="m-0 font-normal text-[clamp(44px,6vw,64px)] leading-[0.95] tracking-[-0.03em] text-[var(--ink)]">
                Currently <em>reading.</em>
              </h2>
            </div>
            <div className="flex flex-col gap-[40px]">
              {currentlyReading.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div className="mb-[120px] max-[720px]:mb-[80px]">
            <div className="grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[16px] items-baseline mb-[48px]">
              <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] uppercase pt-[8px]">Archive</div>
              <h2 className="m-0 font-normal text-[clamp(44px,6vw,64px)] leading-[0.95] tracking-[-0.03em] text-[var(--ink)]">
                Finished <em>reading.</em>
              </h2>
            </div>
            <div className="flex flex-col gap-[40px]">
              {completed.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
