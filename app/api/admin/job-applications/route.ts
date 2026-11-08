import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAuth } from "@/lib/admin/auth";
import { checkRateLimit } from "@/lib/rate-limit";

// Same fetch-cache pitfall as /api/job-leads — never serve a stale list here.
export const dynamic = "force-dynamic";

const ApplicationCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  role: z.enum(["flutter", "rust"]),
  company: z.string().min(1).max(200),
  board: z.string().max(100).optional().nullable(),
  status: z.enum(["toapply", "applied", "interviewing", "offer", "rejected", "ghosted"]).default("applied"),
  followup: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  url: z.string().url().max(2000).optional().nullable().or(z.literal("")),
  notes: z.string().max(4000).optional().nullable(),
});

/** GET /api/admin/job-applications — full application list for the tracker table. */
export async function GET(): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("[job-applications] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }

  return NextResponse.json({ applications: data ?? [] });
}

/** POST /api/admin/job-applications — log a new application (manual entry or "+ Log" from a lead card). */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = auth;

  const rl = await checkRateLimit(`job-applications:post:${user.id}`, { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ApplicationCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("job_applications")
    .insert({
      ...parsed.data,
      url: parsed.data.url || null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[job-applications] POST error:", error);
    return NextResponse.json({ error: "Failed to save application" }, { status: 500 });
  }

  return NextResponse.json({ application: data });
}
