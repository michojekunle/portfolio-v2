import { getBook, getBookNotes, getBookHighlights } from "@/lib/chapterly/queries";
import { ChNotesClient } from "@/components/chapterly/NotesClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ bookId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookId } = await params;
  const book = await getBook(bookId);
  return { title: book ? `Notes — ${book.title} — Chapterly` : "Notes — Chapterly" };
}

export default async function NotesPage({ params }: Props): Promise<React.ReactElement> {
  const { bookId } = await params;
  const [book, notes, highlights] = await Promise.all([
    getBook(bookId),
    getBookNotes(bookId),
    getBookHighlights(bookId),
  ]);

  if (!book) notFound();

  return <ChNotesClient book={book} initialNotes={notes} initialHighlights={highlights} />;
}
