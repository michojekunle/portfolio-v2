import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { getPublicBookById } from "@/lib/supabase/reading"
import { BookCard } from "@/components/book-card"

interface Props {
  params: Promise<{ id: string }>
}

const SITE = "https://michaelojekunle.dev"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const book = await getPublicBookById(id)
  if (!book) return { title: "Book not found" }

  const url = `${SITE}/reading/${id}`
  const ogImageUrl = `${SITE}/reading/${id}/opengraph-image`
  const desc = `Notes, quotes, and takeaways from ${book.title} by ${book.author}.`

  return {
    title: `${book.title} — Reading Notes`,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: `${book.title} — Reading Notes`,
      description: desc,
      url,
      type: "article",
      siteName: "Michael Ojekunle",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${book.title} — Reading Notes`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${book.title} — Reading Notes`,
      description: desc,
      images: [ogImageUrl],
      creator: "@devvmichael",
    },
  }
}

export default async function BookDetailPage({ params }: Props): Promise<React.ReactElement> {
  const { id } = await params
  const book = await getPublicBookById(id)
  if (!book) notFound()

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <div className="max-w-(--maxw) mx-auto px-(--gutter) pt-40 pb-30 max-[720px]:pt-[100px] max-[720px]:pb-20">
        <Link
          href="/reading"
          className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-(--v3-accent) transition-colors no-underline mb-10"
        >
          <ArrowLeft className="w-3 h-3" /> Reading log
        </Link>

        <BookCard book={book} />
      </div>
    </main>
  )
}
