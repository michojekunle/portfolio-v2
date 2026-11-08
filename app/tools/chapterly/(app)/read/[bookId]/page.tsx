import { notFound } from "next/navigation";
import { getBook } from "@/lib/chapterly/queries";
import { ChReaderClient } from "@/components/chapterly/ReaderClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ bookId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookId } = await params;
  const book = await getBook(bookId);
  return { title: book ? `Reading: ${book.title}` : "Chapterly Reader" };
}

export default async function ReadPage({ params }: Props): Promise<React.ReactElement> {
  const { bookId } = await params;
  const book = await getBook(bookId);
  if (!book) notFound();

  return <ChReaderClient book={book} />;
}
