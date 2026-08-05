import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export interface RustChallengeDay {
  id: string;
  day_number: number;
  challenge_date: string;
  phase: number;
  week_number: number;
  week_focus: string;
  daily_task: string;
  dsa_rep: string;
  completed: boolean;
  completed_at: string | null;
  x_post_url: string | null;
  notes: string | null;
  created_at: string;
}

const UpdateSchema = z.object({
  day_number: z.number().int().min(1).max(180),
  completed: z.boolean().optional(),
  x_post_url: z.string().url().max(2000).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

/** GET /api/admin/rust-challenge — all 180 days, admin-session gated. */
export async function GET(): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("rust_challenge_days")
    .select("*")
    .order("day_number", { ascending: true });

  if (error) {
    console.error("[rust-challenge] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch challenge days" }, { status: 500 });
  }

  return NextResponse.json({ days: (data ?? []) as RustChallengeDay[] });
}

/** PATCH /api/admin/rust-challenge — update a single day's completion/post/notes. */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const { day_number, completed, x_post_url, notes } = parsed.data;
  if (completed === undefined && x_post_url === undefined && notes === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (completed !== undefined) {
    update.completed = completed;
    update.completed_at = completed ? new Date().toISOString() : null;
  }
  if (x_post_url !== undefined) update.x_post_url = x_post_url;
  if (notes !== undefined) update.notes = notes;

  const { data, error } = await supabase
    .from("rust_challenge_days")
    .update(update)
    .eq("day_number", day_number)
    .select();

  if (error) {
    console.error("[rust-challenge] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update day" }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 });
  }

  return NextResponse.json({ day: data[0] as RustChallengeDay });
}
