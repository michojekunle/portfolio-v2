import { notFound } from "next/navigation";
import { getBook } from "@/lib/chapterly/queries";
import { ChChatClient } from "@/components/chapterly/ChatClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ bookId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookId } = await params;
  const book = await getBook(bookId);
  return { title: book ? `AI Chat: ${book.title}` : "Chapterly AI Chat" };
}

export default async function ChatPage({ params }: Props): Promise<React.ReactElement> {
  const { bookId } = await params;
  const book = await getBook(bookId);
  if (!book) notFound();

  return <ChChatClient book={book} />;
}
