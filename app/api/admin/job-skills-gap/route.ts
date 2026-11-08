import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAuth } from "@/lib/admin/auth";
import { checkRateLimit } from "@/lib/rate-limit";

// Manual add, from the Resources tab — same table the scheduled task's
// POST to /api/job-leads merges into, so an entry added here shows up
// identically to one the task discovered.
export const dynamic = "force-dynamic";

const SkillGapCreateSchema = z.object({
  role: z.enum(["flutter", "rust"]),
  name: z.string().min(1).max(200),
  priority: z.enum(["critical", "high", "medium", "low"]),
  why: z.string().min(1).max(500),
  resource: z.string().url().max(2000),
});

/** POST /api/admin/job-skills-gap — add one skill-gap recommendation manually. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = auth;

  const rl = await checkRateLimit(`job-skills-gap:post:${user.id}`, { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SkillGapCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("job_skills_gap")
    .upsert(parsed.data, { onConflict: "role,name", ignoreDuplicates: false })
    .select()
    .single();

  if (error || !data) {
    console.error("[job-skills-gap] POST error:", error);
    return NextResponse.json({ error: "Failed to save skill" }, { status: 500 });
  }

  return NextResponse.json({ skill: data });
}
