import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const UpdateSchema = z.object({
  current_page: z.number().int().min(0).optional(),
  progress_pct: z.number().min(0).max(100).optional(),
  total_pages: z.number().int().min(1).optional(),
  status: z.enum(["unread", "reading", "finished", "abandoned", "on_hold"]).optional(),
  title: z.string().min(1).optional(),
  author: z.string().nullable().optional(),
  cover_url: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookId } = await params;

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

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ch_books")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", bookId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !data) {
    console.error("[chapterly/books] update error:", error);
    return NextResponse.json({ error: "Book not found or update failed" }, { status: 404 });
  }

  return NextResponse.json({ book: data });
}
