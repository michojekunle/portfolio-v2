import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const CreateSchema = z.object({
  highlight_id: z.string().uuid(),
  book_id: z.string().uuid(),
  back: z.string().max(2000).optional(),
});

// GET  /api/chapterly/flashcards  — returns all due cards for today
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("ch_flashcards")
    .select("*, ch_books(title, author)")
    .eq("user_id", user.id)
    .lte("due_at", now)
    .order("due_at", { ascending: true });

  if (error) {
    console.error("[flashcards] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch flashcards" }, { status: 500 });
  }

  return NextResponse.json({ flashcards: data ?? [] });
}

// POST /api/chapterly/flashcards  — create a flashcard from a highlight
export async function POST(req: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { highlight_id, book_id, back } = parsed.data;

  // Verify the highlight belongs to this user
  const { data: highlight } = await supabase
    .from("ch_highlights")
    .select("id, book_id, text, note, is_flashcard")
    .eq("id", highlight_id)
    .eq("user_id", user.id)
    .single();

  if (!highlight) {
    return NextResponse.json({ error: "Highlight not found" }, { status: 404 });
  }

  // Verify the provided book_id actually matches the highlight's book
  if ((highlight.book_id as string) !== book_id) {
    return NextResponse.json({ error: "Highlight does not belong to this book" }, { status: 400 });
  }

  if (highlight.is_flashcard) {
    return NextResponse.json({ error: "Already a flashcard" }, { status: 409 });
  }

  // Initial SM-2 state: interval=1 day, ease=2.5, due tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: flashcard, error: insertError } = await supabase
    .from("ch_flashcards")
    .insert({
      user_id: user.id,
      highlight_id,
      book_id,
      front: (highlight.text as string).slice(0, 2000),
      back: back ?? (highlight.note as string | null) ?? null,
      due_at: tomorrow.toISOString(),
      interval_days: 1,
      ease_factor: 2.5,
      review_count: 0,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[flashcards] insert error:", insertError);
    return NextResponse.json({ error: "Failed to create flashcard" }, { status: 500 });
  }

  // Mark the highlight as a flashcard
  await supabase
    .from("ch_highlights")
    .update({ is_flashcard: true, flashcard_due_at: tomorrow.toISOString() })
    .eq("id", highlight_id)
    .eq("user_id", user.id);

  return NextResponse.json({ flashcard }, { status: 201 });
}
