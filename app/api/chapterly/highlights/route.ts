import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { HighlightColor } from "@/lib/chapterly/types";

const CreateSchema = z.object({
  book_id: z.string().uuid(),
  text: z.string().min(1).max(5000),
  color: z.enum(["yellow", "green", "blue", "pink"]),
  note: z.string().max(2000).optional(),
  page_number: z.number().int().min(1).optional(),
  cfi_range: z.string().max(500).optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { book_id, text, color, note, page_number, cfi_range } = parsed.data;

  const { data: book } = await supabase
    .from("ch_books")
    .select("id")
    .eq("id", book_id)
    .eq("user_id", user.id)
    .single();

  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("ch_highlights")
    .insert({
      user_id: user.id,
      book_id,
      text,
      color: color as HighlightColor,
      note: note ?? null,
      page_number: page_number ?? null,
      cfi_range: cfi_range ?? null,
      is_flashcard: false,
    })
    .select()
    .single();

  if (error) {
    console.error("[chapterly/highlights] create error:", error);
    return NextResponse.json({ error: "Failed to save highlight" }, { status: 500 });
  }

  return NextResponse.json({ highlight: data }, { status: 201 });
}
