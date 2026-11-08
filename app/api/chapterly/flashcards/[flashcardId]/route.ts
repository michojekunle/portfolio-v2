import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// rating: 0=Again, 1=Hard, 2=Good, 3=Easy
const ReviewSchema = z.object({
  rating: z.number().int().min(0).max(3),
});

// PATCH /api/chapterly/flashcards/[flashcardId]  — record a review result
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ flashcardId: string }> }
): Promise<NextResponse> {
  const { flashcardId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await req.json();
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { rating } = parsed.data;

  const { data: card } = await supabase
    .from("ch_flashcards")
    .select("interval_days, ease_factor, review_count")
    .eq("id", flashcardId)
    .eq("user_id", user.id)
    .single();

  if (!card) {
    return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });
  }

  const { newInterval, newEase } = sm2(
    rating,
    card.interval_days as number,
    card.ease_factor as number
  );

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + newInterval);

  const { error: updateError } = await supabase
    .from("ch_flashcards")
    .update({
      interval_days: newInterval,
      ease_factor: newEase,
      due_at: dueAt.toISOString(),
      review_count: (card.review_count as number) + 1,
    })
    .eq("id", flashcardId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("[flashcards] update error:", updateError);
    return NextResponse.json({ error: "Failed to record review" }, { status: 500 });
  }

  return NextResponse.json({ interval_days: newInterval, due_at: dueAt.toISOString() });
}

// DELETE /api/chapterly/flashcards/[flashcardId]  — remove a flashcard permanently
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ flashcardId: string }> }
): Promise<NextResponse> {
  const { flashcardId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch highlight_id before deleting so we can reset is_flashcard on the parent highlight
  const { data: card } = await supabase
    .from("ch_flashcards")
    .select("highlight_id")
    .eq("id", flashcardId)
    .eq("user_id", user.id)
    .single();

  const { error } = await supabase
    .from("ch_flashcards")
    .delete()
    .eq("id", flashcardId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[flashcards] delete error:", error);
    return NextResponse.json({ error: "Failed to delete flashcard" }, { status: 500 });
  }

  // Reset the parent highlight so it can be converted to a flashcard again
  if (card?.highlight_id) {
    await supabase
      .from("ch_highlights")
      .update({ is_flashcard: false, flashcard_due_at: null })
      .eq("id", card.highlight_id as string)
      .eq("user_id", user.id);
  }

  return NextResponse.json({ ok: true });
}

// Simplified SM-2 algorithm
function sm2(
  rating: number,
  intervalDays: number,
  easeFactor: number
): { newInterval: number; newEase: number } {
  let newEase = easeFactor;
  let newInterval = intervalDays;

  if (rating === 0) {
    // Again — reset to 1 day, reduce ease
    newEase = Math.max(1.3, easeFactor - 0.2);
    newInterval = 1;
  } else if (rating === 1) {
    // Hard — shorter interval, reduce ease
    newEase = Math.max(1.3, easeFactor - 0.15);
    newInterval = Math.max(1, Math.ceil(intervalDays * 1.2));
  } else if (rating === 2) {
    // Good — standard interval growth
    newInterval = Math.max(1, Math.ceil(intervalDays * easeFactor));
  } else {
    // Easy — faster growth, increase ease
    newEase = easeFactor + 0.15;
    newInterval = Math.max(1, Math.ceil(intervalDays * easeFactor * 1.3));
  }

  return { newInterval, newEase };
}
