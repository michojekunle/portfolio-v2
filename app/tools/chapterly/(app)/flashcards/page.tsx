import { createClient } from "@/lib/supabase/server";
import { ChFlashcardClient } from "@/components/chapterly/FlashcardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcards — Chapterly",
};

export default async function FlashcardsPage(): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date().toISOString();

  const { data } = user
    ? await supabase
        .from("ch_flashcards")
        .select("*, ch_books(title, author)")
        .eq("user_id", user.id)
        .lte("due_at", now)
        .order("due_at", { ascending: true })
    : { data: [] };

  return <ChFlashcardClient initialCards={(data ?? []) as Parameters<typeof ChFlashcardClient>[0]["initialCards"]} />;
}
