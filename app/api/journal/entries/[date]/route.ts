import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireJournalAuth } from "@/lib/journal/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const EntrySchema = z.object({
  top_priorities: z.array(z.string().max(500)).max(10).default([]),
  accomplished: z.array(z.string().max(500)).max(10).default([]),
  blockers: z.string().max(2000).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
  energy_level: z.number().int().min(1).max(5).nullable().optional(),
  objective_ids: z.array(z.string().uuid()).max(20).default([]),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
): Promise<NextResponse> {
  const auth = await requireJournalAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = auth;

  const rl = await checkRateLimit(`journal:entries:get:${user.id}`, { limit: 120, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { date } = await params;

  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "Invalid date format — expected YYYY-MM-DD" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("jo_entries")
    .select("*")
    .eq("date", date)
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[journal/entries/[date]] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch entry" }, { status: 500 });
  }

  return NextResponse.json({ entry: data ?? null });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
): Promise<NextResponse> {
  const auth = await requireJournalAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = auth;

  const rl = await checkRateLimit(`journal:entries:put:${user.id}`, { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { date } = await params;

  if (!DATE_RE.test(date)) {
    return NextResponse.json({ error: "Invalid date format — expected YYYY-MM-DD" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = EntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("jo_entries")
    .upsert(
      {
        ...parsed.data,
        user_id: user.id,
        date,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" }
    )
    .select()
    .single();

  if (error || !data) {
    console.error("[journal/entries/[date]] PUT error:", error);
    return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
  }

  return NextResponse.json({ entry: data });
}
