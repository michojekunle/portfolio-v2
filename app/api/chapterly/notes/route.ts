import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const CreateSchema = z.object({
  book_id: z.string().uuid(),
  content_md: z.string().min(1).max(10000),
  chapter_ref: z.string().max(200).optional(),
  chapter_title: z.string().max(200).optional(),
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

  const { book_id, content_md, chapter_ref, chapter_title } = parsed.data;

  const { data: book } = await supabase
    .from("ch_books")
    .select("id")
    .eq("id", book_id)
    .eq("user_id", user.id)
    .single();

  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("ch_notes")
    .insert({ user_id: user.id, book_id, content_md, chapter_ref: chapter_ref ?? null, chapter_title: chapter_title ?? null })
    .select()
    .single();

  if (error) {
    console.error("[chapterly/notes] create error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }

  return NextResponse.json({ note: data }, { status: 201 });
}
