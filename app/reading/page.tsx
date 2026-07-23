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
      <section className="grid grid-cols-1 min-[900px]:grid-cols-[1.4fr_1fr] gap-12 items-center pt-40 pb-20 max-180:pt-20 max-180:pb-14 max-w-(--maxw) mx-auto px-(--gutter) border-b border-(--rule)">
        <div>
          <div className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground mb-6">03 — READING LOG</div>
          <h1 className="m-0 font-display font-light text-[clamp(48px,8vw,110px)] leading-[0.95] tracking-[-0.04em] text-(--ink) mb-8 text-balance fvs-display">
            Curated <em className="not-italic italic text-(--v3-accent) fvs-soft">takeaways.</em>
          </h1>
          <p className="text-[18px] text-secondary-foreground max-w-[52ch] leading-[1.65] m-0">
            A dynamic archive of notes, quotes, and insights from the books I&apos;m currently exploring. Distilled for clarity and recall.
          </p>
        </div>

        <div className="flex justify-start min-[900px]:justify-end w-full">
          <ReadingHeroWidget />
        </div>
      </section>

      {/* Stats strip */}
      {books.length > 0 && (
        <section className="border-b border-(--rule)">
          <div className="max-w-(--maxw) mx-auto px-(--gutter) py-7 grid grid-cols-4 max-[600px]:grid-cols-2 gap-6">
            <div>
              <div className="font-display text-[28px] font-normal text-(--ink) fvs-text leading-none">{books.length}</div>
              <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground mt-1.5">Books logged</div>
            </div>
            <div>
              <div className="font-display text-[28px] font-normal text-(--ink) fvs-text leading-none">{currentlyReading.length}</div>
              <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground mt-1.5">Currently reading</div>
            </div>
            <div>
              <div className="font-display text-[28px] font-normal text-(--ink) fvs-text leading-none">{completed.length}</div>
              <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground mt-1.5">Finished</div>
            </div>
            <div>
              <div className="font-display text-[28px] font-normal text-(--ink) fvs-text leading-none">{totalNotes}</div>
              <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground mt-1.5">Notes & quotes</div>
            </div>
          </div>
        </section>
      )}

      {/* Bookshelf */}
      <section className="py-20 max-180:py-14">
        <div className="max-w-(--maxw) mx-auto px-(--gutter)">
          {books.length === 0 && (
            <p className="text-muted-foreground text-[16px] py-20 text-center font-serif italic">
              Nothing tracked yet — check back soon.
            </p>
          )}

          {currentlyReading.length > 0 && (
            <div className="mb-16">
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-6">
                Currently reading
              </div>
              <div className="grid grid-cols-4 max-[1100px]:grid-cols-3 max-[820px]:grid-cols-2 max-[480px]:grid-cols-1 gap-5">
                {currentlyReading.map((b) => <BookTeaserCard key={b.id} book={b} />)}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-6">
                Archive
              </div>
              <div className="grid grid-cols-4 max-[1100px]:grid-cols-3 max-[820px]:grid-cols-2 max-[480px]:grid-cols-1 gap-5">
                {completed.map((b) => <BookTeaserCard key={b.id} book={b} />)}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
