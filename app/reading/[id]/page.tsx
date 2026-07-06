import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { getPublicBookById } from "@/lib/supabase/reading"
import { BookCard } from "@/components/book-card"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const book = await getPublicBookById(id)
  if (!book) return { title: "Book not found" }
  return {
    title: `${book.title} — Reading Notes`,
    description: `Notes, quotes, and takeaways from ${book.title} by ${book.author}.`,
  }
}

export default async function BookDetailPage({ params }: Props): Promise<React.ReactElement> {
  const { id } = await params
  const book = await getPublicBookById(id)
  if (!book) notFound()

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] pt-[160px] pb-[120px] max-[720px]:pt-[100px] max-[720px]:pb-[80px]">
        <Link
          href="/reading"
          className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-3)] hover:text-[var(--v3-accent)] transition-colors no-underline mb-[40px]"
        >
          <ArrowLeft className="w-3 h-3" /> Reading log
        </Link>

        <BookCard book={book} />
      </div>
    </main>
  )
}
