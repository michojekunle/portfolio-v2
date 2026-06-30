import type { Metadata } from "next"
import { getPublicBooks } from "@/lib/supabase/reading"
import { BookCard } from "@/components/book-card"
import { StackedCards } from "@/components/stacked-cards"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Reading",
  description: "Books I'm reading and what I'm taking from them — notes, quotes, and key takeaways.",
}

export default async function ReadingPage(): Promise<React.ReactElement> {
  const books = await getPublicBooks()
  const currentlyReading = books.filter((b) => b.status === "reading")
  const completed = books.filter((b) => b.status === "completed")

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      {/* Hero */}
      <section className="pt-[160px] pb-[80px] max-[720px]:pt-[80px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
        <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]">03 — READING LOG</div>
        <h1 className="m-0 font-display font-light text-[clamp(64px,10vw,120px)] leading-[0.95] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance fvs-display">
          Curated <em className="not-italic italic text-[var(--v3-accent)] fvs-soft">takeaways.</em>
        </h1>
        <p className="text-[18px] text-[var(--ink-2)] max-w-[52ch] leading-[1.65] m-0">
          A dynamic archive of notes, quotes, and insights from the books I&apos;m currently exploring. Distilled for clarity and recall.
        </p>
      </section>

      {/* Book list */}
      <section className="py-[80px] pb-[160px] max-[720px]:py-[56px] max-[720px]:pb-[120px]">
        {books.length === 0 && (
          <p className="text-[var(--ink-3)] text-[16px] py-[80px] text-center font-serif italic">
            Nothing tracked yet — check back soon.
          </p>
        )}

        {currentlyReading.length > 0 && (
          <StackedCards
            title={
              <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[16px] items-baseline relative z-20">
                <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] uppercase pt-[8px]">Active</div>
                <h2 className="m-0 font-display font-normal text-[clamp(44px,6vw,64px)] leading-[0.95] tracking-[-0.03em] text-[var(--ink)] fvs-display">
                  Currently <em className="not-italic italic text-[var(--v3-accent)] fvs-soft">reading.</em>
                </h2>
              </div>
            }
          >
            {currentlyReading.map((b) => <BookCard key={b.id} book={b} />)}
          </StackedCards>
        )}

        {completed.length > 0 && (
          <StackedCards
            title={
              <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[16px] items-baseline relative z-20">
                <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] uppercase pt-[8px]">Archive</div>
                <h2 className="m-0 font-display font-normal text-[clamp(44px,6vw,64px)] leading-[0.95] tracking-[-0.03em] text-[var(--ink)] fvs-display">
                  Finished <em className="not-italic italic text-[var(--v3-accent)] fvs-soft">reading.</em>
                </h2>
              </div>
            }
          >
            {completed.map((b) => <BookCard key={b.id} book={b} />)}
          </StackedCards>
        )}
      </section>
    </main>
  )
}
