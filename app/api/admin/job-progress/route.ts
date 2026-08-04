import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAuth } from "@/lib/admin/auth";

// Shared, deduped-by-name tracking across all job leads — marking "Rust
// async" learnt from one posting's detail view marks it learnt on every
// other posting that lists it too.
export const dynamic = "force-dynamic";

const ToggleSchema = z.object({
  kind: z.enum(["skill", "project"]),
  name: z.string().min(1).max(200),
});

/** GET /api/admin/job-progress — every skill/project currently marked done. */
export async function GET(): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase } = auth;

  const [{ data: skills, error: skillsError }, { data: projects, error: projectsError }] = await Promise.all([
    supabase.from("job_skills_learned").select("skill"),
    supabase.from("job_projects_built").select("project"),
  ]);

  if (skillsError || projectsError) {
    console.error("[job-progress] GET error:", skillsError ?? projectsError);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }

  return NextResponse.json({
    skills: (skills ?? []).map((s) => s.skill as string),
    projects: (projects ?? []).map((p) => p.project as string),
  });
}

/** POST /api/admin/job-progress — toggles a skill/project: marks done if absent, un-marks if present. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ToggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const { kind, name } = parsed.data;
  const table = kind === "skill" ? "job_skills_learned" : "job_projects_built";
  const column = kind === "skill" ? "skill" : "project";

  const { data: existing } = await supabase.from(table).select(column).eq(column, name).maybeSingle();

  if (existing) {
    const { error } = await supabase.from(table).delete().eq(column, name);
    if (error) {
      console.error("[job-progress] POST delete error:", error);
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
    }
    return NextResponse.json({ done: false });
  }

  const { error } = await supabase.from(table).insert({ [column]: name });
  if (error) {
    console.error("[job-progress] POST insert error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
  return NextResponse.json({ done: true });
}
