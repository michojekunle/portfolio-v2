import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { HighlightColor } from "@/lib/chapterly/types";

const CreateSchema = z.object({
  book_id: z.string().uuid(),
  text: z.string().min(1).max(5000),
  color: z.enum(["yellow", "green", "blue", "pink"]),
  style: z.enum(["highlight", "underline"]).optional(),
  note: z.string().max(2000).optional(),
  page_number: z.number().int().min(1).optional(),
  cfi_range: z.string().max(500).optional(),
});

const UpdateSchema = z.object({
  id: z.string().uuid(),
  color: z.enum(["yellow", "green", "blue", "pink"]).optional(),
  style: z.enum(["highlight", "underline"]).optional(),
});

/** GET /api/chapterly/highlights?book_id=… — all highlights for one book */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookId = new URL(request.url).searchParams.get("book_id");
  if (!bookId || !z.string().uuid().safeParse(bookId).success) {
    return NextResponse.json({ error: "Valid book_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ch_highlights")
    .select("id, text, color, style, note, page_number, cfi_range, created_at")
    .eq("user_id", user.id)
    .eq("book_id", bookId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[chapterly/highlights] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch highlights" }, { status: 500 });
  }

  return NextResponse.json({ highlights: data ?? [] });
}

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

  const { book_id, text, color, style, note, page_number, cfi_range } = parsed.data;

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
      style: style ?? "highlight",
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

/** PATCH /api/chapterly/highlights — recolor or restyle (highlight/underline) an existing highlight */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
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

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const { id, color, style } = parsed.data;
  if (color === undefined && style === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Not .single() — an update matching zero rows (wrong owner or bad id) is a
  // valid outcome we want to report as 404, not have PostgREST turn into an error.
  const { data, error } = await supabase
    .from("ch_highlights")
    .update({ ...(color !== undefined && { color }), ...(style !== undefined && { style }) })
    .eq("id", id)
    .eq("user_id", user.id)
    .select();

  if (error) {
    console.error("[chapterly/highlights] update error:", error);
    return NextResponse.json({ error: "Failed to update highlight" }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Highlight not found" }, { status: 404 });
  }

  return NextResponse.json({ highlight: data[0] });
}

/** DELETE /api/chapterly/highlights?id=… — remove a highlight */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id || !z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Valid id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("ch_highlights")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[chapterly/highlights] delete error:", error);
    return NextResponse.json({ error: "Failed to delete highlight" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
