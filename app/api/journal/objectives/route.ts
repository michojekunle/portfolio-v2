import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireJournalAuth } from "@/lib/journal/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import type { JoMilestone } from "@/lib/journal/types";

const CreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#7C3AED"),
  icon: z.string().max(8).default("🎯"),
});

export async function GET(): Promise<NextResponse> {
  const auth = await requireJournalAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = auth;

  const rl = await checkRateLimit(`journal:objectives:get:${user.id}`, { limit: 120, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { data: objectiveRows, error: objectivesError } = await supabase
    .from("jo_objectives")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (objectivesError) {
    console.error("[journal/objectives] GET objectives error:", objectivesError);
    return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 });
  }

  const objectiveIds = (objectiveRows ?? []).map((o) => o.id as string);

  // Fetched as a flat query and joined in JS rather than a PostgREST embedded
  // select (`jo_objectives(*, jo_milestones(*))`) — the embed depends on the
  // FK being present in PostgREST's schema cache and 500s otherwise.
  let milestoneRows: JoMilestone[] = [];
  if (objectiveIds.length > 0) {
    const { data, error: milestonesError } = await supabase
      .from("jo_milestones")
      .select("*")
      .eq("user_id", user.id)
      .in("objective_id", objectiveIds);

    if (milestonesError) {
      console.error("[journal/objectives] GET milestones error:", milestonesError);
      return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 });
    }
    milestoneRows = data ?? [];
  }

  const milestonesByObjective = new Map<string, JoMilestone[]>();
  for (const m of milestoneRows) {
    const list = milestonesByObjective.get(m.objective_id) ?? [];
    list.push(m);
    milestonesByObjective.set(m.objective_id, list);
  }

  const objectives = (objectiveRows ?? []).map((obj) => ({
    ...obj,
    milestones: milestonesByObjective.get(obj.id as string) ?? [],
  }));

  return NextResponse.json({ objectives });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireJournalAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = auth;

  const rl = await checkRateLimit(`journal:objectives:post:${user.id}`, { limit: 30, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("jo_objectives")
    .insert({ ...parsed.data, user_id: user.id, status: "active" })
    .select()
    .single();

  if (error || !data) {
    console.error("[journal/objectives] POST error:", error);
    return NextResponse.json({ error: "Failed to create objective" }, { status: 500 });
  }

  return NextResponse.json({ objective: { ...data, milestones: [] } }, { status: 201 });
}
