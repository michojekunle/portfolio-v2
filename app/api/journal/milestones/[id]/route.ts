import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireJournalAuth } from "@/lib/journal/auth";

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  is_done: z.boolean().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireJournalAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = auth;
  const { id } = await params;

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
    .from("jo_milestones")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !data) {
    console.error("[journal/milestones/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Milestone not found or update failed" }, { status: 404 });
  }

  return NextResponse.json({ milestone: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireJournalAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = auth;
  const { id } = await params;

  const { error } = await supabase
    .from("jo_milestones")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[journal/milestones/[id]] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
