import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/admin/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import type { JobRole } from "@/lib/admin/job-search-data";

const LeadSchema = z.object({
  company: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  board: z.string().max(100).optional().nullable(),
  url: z.string().url().max(2000).optional().nullable(),
  tip: z.string().max(1000).optional().nullable(),
});

const LeadsPayloadSchema = z.object({
  flutter: z.array(LeadSchema).max(20).default([]),
  rust: z.array(LeadSchema).max(20).default([]),
});

export interface JobLead {
  id: string;
  role: JobRole;
  company: string;
  title: string;
  board: string | null;
  url: string | null;
  tip: string | null;
  created_at: string;
}

/** POST /api/job-leads — the scheduled task posts new leads here, bearer-token authenticated (no user session involved). */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate-limit by IP before checking the secret — this is the only guard
  // standing between the internet and JOB_LEADS_API_SECRET, so it must
  // limit unauthenticated attempts, not just successful ones.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = await checkRateLimit(`job-leads:post:${ip}`, { limit: 20, windowMs: 60_000 });
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

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, inserted: 0 });
  }

  const supabase = await createClient();
  // Upsert on url so a lead spotted again on a later run refreshes its tip/board
  // instead of duplicating; leads without a url (rare) always insert as new.
  const { error } = await supabase.from("job_leads").upsert(rows, { onConflict: "url", ignoreDuplicates: false });

  if (error) {
    console.error("[job-leads] POST error:", error);
    return NextResponse.json({ error: "Failed to store leads" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inserted: rows.length, updatedAt: new Date().toISOString() });
}

/** GET /api/job-leads — the admin dashboard's client-side refresh button/auto-refresh, admin-session gated. */
export async function GET(): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("job_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    console.error("[job-leads] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }

  const leads = (data ?? []) as JobLead[];
  const updatedAt = leads.length > 0 ? leads[0].created_at : null;

  return NextResponse.json({
    updatedAt,
    flutter: leads.filter((l) => l.role === "flutter").slice(0, 20),
    rust: leads.filter((l) => l.role === "rust").slice(0, 20),
  });
}
