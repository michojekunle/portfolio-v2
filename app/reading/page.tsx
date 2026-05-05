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
    <article className="group relative flex flex-col md:flex-row bg-[var(--paper)] border border-[var(--rule)] rounded-[16px] overflow-hidden transition-all duration-300 hover:border-[var(--ink-4)] hover:shadow-[0_12px_40px_color-mix(in_oklab,var(--ink)_5%,transparent)]">
      {/* Cover */}
      <div className="w-full md:w-[160px] shrink-0 border-b md:border-b-0 md:border-r border-[var(--rule)] bg-[var(--bg-2)] relative overflow-hidden aspect-[4/5] md:aspect-auto">
        {book.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_url}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center font-[family:var(--display-font)] text-[32px] font-normal text-[var(--v3-accent)] tracking-[-0.03em] bg-[color-mix(in_oklab,var(--v3-accent)_10%,var(--bg-2))]"
          >
            <span>{book.title.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-[32px] max-[720px]:p-[24px]">
        {/* Meta */}
        <div className="mb-[24px]">
          <h3 className="m-0 font-[family:var(--display-font)] font-normal text-[clamp(24px,3vw,32px)] leading-[1.15] tracking-[-0.02em] text-[var(--ink)] mb-[8px] [font-variation-settings:'opsz'_96]">
            {book.title}
          </h3>
          <div className="text-[14px] text-[var(--ink-3)] mb-[16px] font-mono tracking-[0.04em]">
            {book.author}
          </div>
          {book.status === "reading" && <ProgressBar value={book.progress} />}
        </div>

        {/* Notes */}
        {hasNotes && (
          <div className="flex flex-col gap-[32px] pt-[24px] border-t border-[var(--rule)]">
            {takeaways.length > 0 && (
              <div className="flex flex-col gap-[12px]">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-4)] mb-[4px]">
                  Takeaways
                </div>
                {takeaways.map((n) => <NoteEntry key={n.id} note={n} />)}
              </div>
            )}
            {quotes.length > 0 && (
              <div className="flex flex-col gap-[12px]">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-4)] mb-[4px]">
                  Quotes
                </div>
                {quotes.map((n) => <NoteEntry key={n.id} note={n} />)}
              </div>
            )}
            {notes.length > 0 && (
              <div className="flex flex-col gap-[12px]">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-4)] mb-[4px]">
                  Notes
                </div>
                {notes.map((n) => <NoteEntry key={n.id} note={n} />)}
              </div>
            )}
          </div>
        )}
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
        <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-2)] mb-[24px]">04 — READING LOG</div>
        <h1 className="m-0 font-[family:var(--display-font)] font-normal text-[clamp(64px,10vw,120px)] leading-[0.85] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance [font-variation-settings:'opsz'_144]">
          What I&apos;m <em className="not-italic italic text-[var(--v3-accent)] [font-variation-settings:'opsz'_144,'SOFT'_100]">reading.</em>
        </h1>
        <p className="text-[18px] text-[var(--ink-2)] max-w-[48ch] leading-[1.65] m-0">
          Notes, quotes, and takeaways from books I&apos;m working through. Updated dynamically as I read.
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
          <div className="mb-[80px]">
            <h2 className="flex items-center gap-[16px] font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--ink-3)] mb-[40px] after:content-[''] after:flex-1 after:h-[1px] after:bg-[var(--rule)]">
              Currently reading
            </h2>
            <div className="flex flex-col gap-[24px]">
              {currentlyReading.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div className="mb-[80px]">
            <h2 className="flex items-center gap-[16px] font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--ink-3)] mb-[40px] after:content-[''] after:flex-1 after:h-[1px] after:bg-[var(--rule)]">
              Finished
            </h2>
            <div className="flex flex-col gap-[24px]">
              {completed.map((b) => <BookCard key={b.id} book={b} />)}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
