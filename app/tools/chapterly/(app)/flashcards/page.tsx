import { createClient } from "@/lib/supabase/server";
import { ChFlashcardClient, type FlashcardWithBook } from "@/components/chapterly/FlashcardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcards — Chapterly",
};

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>;
}): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date().toISOString();
  const { all } = await searchParams;
  const studyAll = all === "true";

  let query = supabase
    .from("ch_flashcards")
    .select("*, ch_books(title, author)")
    .eq("user_id", user?.id || "");

  if (!studyAll) {
    query = query.lte("due_at", now);
  }

  const { data } = user
    ? await query.order("due_at", { ascending: true })
    : { data: [] };

  // Fetch total cards count in collection
  const { count: totalCount } = user
    ? await supabase
        .from("ch_flashcards")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
    : { count: 0 };

  return (
    <ChFlashcardClient
      initialCards={(data ?? []) as FlashcardWithBook[]}
      totalCount={totalCount ?? 0}
      studyAll={studyAll}
    />
  );
}
