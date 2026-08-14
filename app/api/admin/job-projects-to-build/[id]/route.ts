import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/auth";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** DELETE /api/admin/job-projects-to-build/[id] — removes a manually- or task-added project idea. */
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

  const { error } = await supabase.from("job_projects_to_build").delete().eq("id", id);

  if (error) {
    console.error("[job-projects-to-build] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
