import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ highlightId: string }> }
): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { highlightId } = await params;

  const { error } = await supabase
    .from("ch_highlights")
    .delete()
    .eq("id", highlightId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[chapterly/highlights] delete error:", error);
    return NextResponse.json({ error: "Failed to delete highlight" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
