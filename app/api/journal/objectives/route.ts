import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireJournalAuth } from "@/lib/journal/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import type { JoObjective, JoMilestone } from "@/lib/journal/types";

type ObjectiveRow = JoObjective & { jo_milestones?: JoMilestone[] };

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

  const rl = checkRateLimit(`journal:objectives:get:${user.id}`, { limit: 120, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const { data, error } = await supabase
    .from("jo_objectives")
    .select("*, jo_milestones(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[journal/objectives] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch objectives" }, { status: 500 });
  }

  const objectives = (data ?? []).map((obj) => {
    const row = obj as ObjectiveRow;
    return { ...obj, milestones: row.jo_milestones ?? [] };
  });

  return NextResponse.json({ objectives });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireJournalAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = auth;

  const rl = checkRateLimit(`journal:objectives:post:${user.id}`, { limit: 30, windowMs: 60_000 });
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
