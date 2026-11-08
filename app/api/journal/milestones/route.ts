import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireJournalAuth } from "@/lib/journal/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const CreateSchema = z.object({
  objective_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireJournalAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = auth;

  const rl = await checkRateLimit(`journal:milestones:post:${user.id}`, { limit: 60, windowMs: 60_000 });
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

  // Verify user owns the objective
  const { data: obj } = await supabase
    .from("jo_objectives")
    .select("id")
    .eq("id", parsed.data.objective_id)
    .eq("user_id", user.id)
    .single();

  if (!obj) {
    return NextResponse.json({ error: "Objective not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("jo_milestones")
    .insert({ ...parsed.data, user_id: user.id, is_done: false })
    .select()
    .single();

  if (error || !data) {
    console.error("[journal/milestones] POST error:", error);
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }

  return NextResponse.json({ milestone: data }, { status: 201 });
}
