import type { Metadata } from "next"
import { getPublicBooks } from "@/lib/supabase/reading"
import { BookTeaserCard } from "@/components/book-card"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Reading",
  description: "Books I'm reading and what I'm taking from them — notes, quotes, and key takeaways.",
}

import { ReadingHeroWidget } from "@/components/reading-hero-widget"

export default async function ReadingPage(): Promise<React.ReactElement> {
  const books = await getPublicBooks()
  const currentlyReading = books.filter((b) => b.status === "reading")
  const completed = books.filter((b) => b.status === "completed")
  const totalNotes = books.reduce((sum, b) => sum + b.notes.length, 0)

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      {/* Hero */}
      <section className="grid grid-cols-1 min-[900px]:grid-cols-[1.4fr_1fr] gap-[48px] items-center pt-[160px] pb-[80px] max-[720px]:pt-[80px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]">03 — READING LOG</div>
          <h1 className="m-0 font-display font-light text-[clamp(48px,8vw,110px)] leading-[0.95] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance fvs-display">
            Curated <em className="not-italic italic text-[var(--v3-accent)] fvs-soft">takeaways.</em>
          </h1>
          <p className="text-[18px] text-[var(--ink-2)] max-w-[52ch] leading-[1.65] m-0">
            A dynamic archive of notes, quotes, and insights from the books I&apos;m currently exploring. Distilled for clarity and recall.
          </p>
        </div>

        <div className="flex justify-start min-[900px]:justify-end w-full">
          <ReadingHeroWidget />
        </div>
      </section>

      {/* Stats strip */}
      {books.length > 0 && (
        <section className="border-b border-[var(--rule)]">
          <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[28px] grid grid-cols-4 max-[600px]:grid-cols-2 gap-[24px]">
            <div>
              <div className="font-display text-[28px] font-normal text-[var(--ink)] fvs-text leading-none">{books.length}</div>
              <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-3)] mt-[6px]">Books logged</div>
            </div>
            <div>
              <div className="font-display text-[28px] font-normal text-[var(--ink)] fvs-text leading-none">{currentlyReading.length}</div>
              <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-3)] mt-[6px]">Currently reading</div>
            </div>
            <div>
              <div className="font-display text-[28px] font-normal text-[var(--ink)] fvs-text leading-none">{completed.length}</div>
              <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-3)] mt-[6px]">Finished</div>
            </div>
            <div>
              <div className="font-display text-[28px] font-normal text-[var(--ink)] fvs-text leading-none">{totalNotes}</div>
              <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-3)] mt-[6px]">Notes & quotes</div>
            </div>
          </div>
        </section>
      )}

      {/* Bookshelf */}
      <section className="py-[80px] max-[720px]:py-[56px]">
        <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)]">
          {books.length === 0 && (
            <p className="text-[var(--ink-3)] text-[16px] py-[80px] text-center font-serif italic">
              Nothing tracked yet — check back soon.
            </p>
          )}

          {currentlyReading.length > 0 && (
            <div className="mb-[64px]">
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--ink-3)] mb-[24px]">
                Currently reading
              </div>
              <div className="grid grid-cols-4 max-[1100px]:grid-cols-3 max-[820px]:grid-cols-2 max-[480px]:grid-cols-1 gap-[20px]">
                {currentlyReading.map((b) => <BookTeaserCard key={b.id} book={b} />)}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--ink-3)] mb-[24px]">
                Archive
              </div>
              <div className="grid grid-cols-4 max-[1100px]:grid-cols-3 max-[820px]:grid-cols-2 max-[480px]:grid-cols-1 gap-[20px]">
                {completed.map((b) => <BookTeaserCard key={b.id} book={b} />)}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
