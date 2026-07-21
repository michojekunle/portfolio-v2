import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAuth } from "@/lib/admin/auth";

const ApplicationPatchSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  role: z.enum(["flutter", "rust"]).optional(),
  company: z.string().min(1).max(200).optional(),
  board: z.string().max(100).nullable().optional(),
  status: z.enum(["toapply", "applied", "interviewing", "offer", "rejected", "ghosted"]).optional(),
  followup: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  url: z.string().url().max(2000).nullable().optional().or(z.literal("")),
  notes: z.string().max(4000).nullable().optional(),
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** PATCH /api/admin/job-applications/[id] — status changes from the drawer, or any field edit. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase } = auth;

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ApplicationPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("job_applications")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    console.error("[job-applications] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }

  return NextResponse.json({ application: data });
}

/** DELETE /api/admin/job-applications/[id] */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase } = auth;

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { error } = await supabase.from("job_applications").delete().eq("id", id);

  if (error) {
    console.error("[job-applications] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
