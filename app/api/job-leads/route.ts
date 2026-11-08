import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import type { JobRole } from "@/lib/admin/job-search-data";
import { JOB_LEADS_PAGE_SIZE } from "@/lib/admin/job-leads-constants";

// POST is written by an external cron job; GET is polled by the dashboard's
// refresh button. Neither should ever be served from Next's fetch cache.
export const dynamic = "force-dynamic";

const ProjectSchema = z.object({
  name: z.string().min(1).max(200),
  desc: z.string().max(1000),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  weeks: z.number().int().min(1).max(52),
});

const LeadSchema = z.object({
  company: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  board: z.string().max(100).optional().nullable(),
  url: z.string().url().max(2000).optional().nullable(),
  tip: z.string().max(1000).optional().nullable(),
  salary: z.string().max(200).optional().nullable(),
  requirements: z.string().max(2000).optional().nullable(),
  skills: z.array(z.string().min(1).max(100)).max(30).optional(),
  projects: z.array(ProjectSchema).max(20).optional(),
});

// Recommendations, not leads — "Skills to Add" / "Proof of Work Projects" on
// the Resources tab. Same shape whether they arrive from the scheduled
// task's POST or get typed in manually via the dashboard's "+ Add" dialogs.
const SkillGapSchema = z.object({
  name: z.string().min(1).max(200),
  priority: z.enum(["critical", "high", "medium", "low"]),
  why: z.string().min(1).max(500),
  resource: z.string().url().max(2000),
});

const ProjectToBuildSchema = z.object({
  name: z.string().min(1).max(200),
  desc: z.string().min(1).max(1000),
  skills: z.array(z.string().min(1).max(100)).max(20).default([]),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  weeks: z.number().int().min(1).max(52),
});

// 50 is a generous, arbitrary cap (not tied to any external API limit) —
// just a sanity bound on how many leads one scheduled-task run can submit.
const LeadsPayloadSchema = z.object({
  flutter: z.array(LeadSchema).max(50).default([]),
  rust: z.array(LeadSchema).max(50).default([]),
  skillsGap: z
    .object({
      flutter: z.array(SkillGapSchema).max(50).default([]),
      rust: z.array(SkillGapSchema).max(50).default([]),
    })
    .optional(),
  projectsToBuild: z
    .object({
      flutter: z.array(ProjectToBuildSchema).max(50).default([]),
      rust: z.array(ProjectToBuildSchema).max(50).default([]),
    })
    .optional(),
});

export interface JobProject {
  name: string;
  desc: string;
  difficulty: "Easy" | "Medium" | "Hard";
  weeks: number;
}

export interface JobSkillGap {
  id: string;
  role: JobRole;
  name: string;
  priority: "critical" | "high" | "medium" | "low";
  why: string;
  resource: string;
  created_at: string;
}

export interface JobProjectToBuild {
  id: string;
  role: JobRole;
  name: string;
  description: string;
  skills: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  weeks: number;
  created_at: string;
}

const MAX_LIMIT = 200;

export interface JobLead {
  id: string;
  role: JobRole;
  company: string;
  title: string;
  board: string | null;
  url: string | null;
  tip: string | null;
  salary: string | null;
  requirements: string | null;
  skills: string[];
  projects: JobProject[];
  created_at: string;
}

/** POST /api/job-leads — the scheduled task posts new leads here, bearer-token authenticated (no user session involved). */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate-limit by IP before checking the secret — this is the only guard
  // standing between the internet and JOB_LEADS_API_SECRET, so it must
  // limit unauthenticated attempts, not just successful ones.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await checkRateLimit(`job-leads:post:${ip}`, { limit: 50, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const secret = process.env.JOB_LEADS_API_SECRET;

  if (!secret || token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = LeadsPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const rows = [
    ...parsed.data.flutter.map((lead) => ({ ...lead, role: "flutter" as const })),
    ...parsed.data.rust.map((lead) => ({ ...lead, role: "rust" as const })),
  ];

  const supabase = await createClient();

  if (rows.length > 0) {
    // Upsert on url so a lead spotted again on a later run refreshes its tip/board
    // instead of duplicating; leads without a url (rare) always insert as new.
    const { error } = await supabase.from("job_leads").upsert(rows, { onConflict: "url", ignoreDuplicates: false });
    if (error) {
      console.error("[job-leads] POST error:", error);
      return NextResponse.json({ error: "Failed to store leads" }, { status: 500 });
    }
  }

  // Skills/projects merge in too — upsert on (role, name) so the task only
  // needs to send what it found in that run; nothing already stored is ever
  // removed by omission.
  const skillRows = [
    ...(parsed.data.skillsGap?.flutter ?? []).map((s) => ({ ...s, role: "flutter" as const })),
    ...(parsed.data.skillsGap?.rust ?? []).map((s) => ({ ...s, role: "rust" as const })),
  ];
  if (skillRows.length > 0) {
    const { error } = await supabase.from("job_skills_gap").upsert(skillRows, { onConflict: "role,name", ignoreDuplicates: false });
    if (error) {
      console.error("[job-leads] POST skillsGap error:", error);
      return NextResponse.json({ error: "Failed to store skills gap" }, { status: 500 });
    }
  }

  const projectRows = [
    ...(parsed.data.projectsToBuild?.flutter ?? []).map((p) => ({ role: "flutter" as const, name: p.name, description: p.desc, skills: p.skills, difficulty: p.difficulty, weeks: p.weeks })),
    ...(parsed.data.projectsToBuild?.rust ?? []).map((p) => ({ role: "rust" as const, name: p.name, description: p.desc, skills: p.skills, difficulty: p.difficulty, weeks: p.weeks })),
  ];
  if (projectRows.length > 0) {
    const { error } = await supabase.from("job_projects_to_build").upsert(projectRows, { onConflict: "role,name", ignoreDuplicates: false });
    if (error) {
      console.error("[job-leads] POST projectsToBuild error:", error);
      return NextResponse.json({ error: "Failed to store projects to build" }, { status: 500 });
    }
  }

  if (rows.length === 0 && skillRows.length === 0 && projectRows.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0 });
  }

  return NextResponse.json({ ok: true, inserted: rows.length, updatedAt: new Date().toISOString() });
}

function clampLimit(raw: string | null): number {
  const n = raw ? parseInt(raw, 10) : NaN;
  if (!Number.isFinite(n) || n < 1) return JOB_LEADS_PAGE_SIZE;
  return Math.min(n, MAX_LIMIT);
}

/**
 * GET /api/job-leads — the admin dashboard's initial load, refresh button,
 * auto-refresh, and "Load more" button, admin-session gated.
 *
 * `flutterLimit`/`rustLimit` query params control how many of each role to
 * return (default JOB_LEADS_PAGE_SIZE). The dashboard re-requests with its
 * *currently loaded* count on every refresh — not just the page size — so
 * refreshing never collapses a list the admin has already expanded via
 * "Load more". `flutterHasMore`/`rustHasMore` tell the client whether more
 * rows exist beyond what was returned, via the classic "fetch limit+1, check
 * if the extra row came back" trick — cheaper than a separate COUNT query.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase } = auth;

  const { searchParams } = new URL(request.url);
  const flutterLimit = clampLimit(searchParams.get("flutterLimit"));
  const rustLimit = clampLimit(searchParams.get("rustLimit"));

  // Fetch each role separately (rather than one combined query sliced
  // afterward) so a burst of leads on one track can never crowd out the
  // other's share of a shared row limit.
  const [
    { data: flutterData, error: flutterError },
    { data: rustData, error: rustError },
    { data: skillsGapData, error: skillsGapError },
    { data: projectsToBuildData, error: projectsToBuildError },
  ] = await Promise.all([
    supabase.from("job_leads").select("*").eq("role", "flutter").order("created_at", { ascending: false }).limit(flutterLimit + 1),
    supabase.from("job_leads").select("*").eq("role", "rust").order("created_at", { ascending: false }).limit(rustLimit + 1),
    supabase.from("job_skills_gap").select("*").order("created_at", { ascending: true }),
    supabase.from("job_projects_to_build").select("*").order("created_at", { ascending: true }),
  ]);

  if (flutterError || rustError || skillsGapError || projectsToBuildError) {
    console.error("[job-leads] GET error:", flutterError ?? rustError ?? skillsGapError ?? projectsToBuildError);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }

  const flutterRows = (flutterData ?? []) as JobLead[];
  const rustRows = (rustData ?? []) as JobLead[];
  const flutter = flutterRows.slice(0, flutterLimit);
  const rust = rustRows.slice(0, rustLimit);
  const updatedAt = [flutter[0]?.created_at, rust[0]?.created_at].filter(Boolean).sort().reverse()[0] ?? null;

  const skillsGapRows = (skillsGapData ?? []) as JobSkillGap[];
  const projectsToBuildRows = (projectsToBuildData ?? []) as JobProjectToBuild[];

  return NextResponse.json({
    updatedAt,
    flutter,
    rust,
    flutterHasMore: flutterRows.length > flutterLimit,
    rustHasMore: rustRows.length > rustLimit,
    skillsGap: {
      flutter: skillsGapRows.filter((s) => s.role === "flutter"),
      rust: skillsGapRows.filter((s) => s.role === "rust"),
    },
    projectsToBuild: {
      flutter: projectsToBuildRows.filter((p) => p.role === "flutter"),
      rust: projectsToBuildRows.filter((p) => p.role === "rust"),
    },
  });
}
