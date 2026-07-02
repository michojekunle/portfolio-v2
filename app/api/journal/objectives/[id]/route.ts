import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireJournalAuth } from "@/lib/journal/auth";

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  status: z.enum(["active", "completed", "dropped", "paused"]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(8).optional(),
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
    .from("jo_objectives")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*, jo_milestones(*)")
    .single();

  if (error || !data) {
    console.error("[journal/objectives/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Objective not found or update failed" }, { status: 404 });
  }

  return NextResponse.json({
    objective: { ...data, milestones: (data as any).jo_milestones ?? [] },
  });
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
    .from("jo_objectives")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[journal/objectives/[id]] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete objective" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
