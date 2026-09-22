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
  frontend_task: string | null;
  system_design_task: string | null;
  rust_completed: boolean;
  dsa_completed: boolean;
  frontend_completed: boolean;
  system_design_completed: boolean;
  subtasks_completed: string[];
  completed: boolean;
  completed_at: string | null;
  x_post_url: string | null;
  notes: string | null;
  created_at: string;
}

const UpdateSchema = z.object({
  day_number: z.number().int().min(1).max(188),
  completed: z.boolean().optional(),
  rust_completed: z.boolean().optional(),
  dsa_completed: z.boolean().optional(),
  frontend_completed: z.boolean().optional(),
  system_design_completed: z.boolean().optional(),
  subtasks_completed: z.array(z.string()).optional(),
  system_design_task: z.string().optional().nullable(),
  x_post_url: z.string().url().max(2000).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

/** GET /api/admin/rust-challenge — all 188 days, admin-session gated. */
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

  // Normalize defaults for older records
  const normalized = (data ?? []).map((row) => ({
    ...row,
    rust_completed: Boolean(row.rust_completed || row.completed),
    dsa_completed: Boolean(row.dsa_completed || row.completed),
    frontend_completed: Boolean(row.frontend_completed || (row.completed && row.frontend_task)),
    system_design_completed: Boolean(row.system_design_completed || (row.completed && row.system_design_task)),
    subtasks_completed: Array.isArray(row.subtasks_completed) ? row.subtasks_completed : [],
  })) as RustChallengeDay[];

  return NextResponse.json({ days: normalized });
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
  const {
    day_number,
    completed,
    rust_completed,
    dsa_completed,
    frontend_completed,
    system_design_completed,
    subtasks_completed,
    system_design_task,
    x_post_url,
    notes,
  } = parsed.data;

  const hasAnyField =
    completed !== undefined ||
    rust_completed !== undefined ||
    dsa_completed !== undefined ||
    frontend_completed !== undefined ||
    system_design_completed !== undefined ||
    subtasks_completed !== undefined ||
    system_design_task !== undefined ||
    x_post_url !== undefined ||
    notes !== undefined;

  if (!hasAnyField) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};

  if (completed !== undefined) {
    update.completed = completed;
    if (completed) {
      update.rust_completed = true;
      update.dsa_completed = true;
      update.frontend_completed = true;
      update.system_design_completed = true;
      update.completed_at = new Date().toISOString();
    } else {
      update.rust_completed = false;
      update.dsa_completed = false;
      update.frontend_completed = false;
      update.system_design_completed = false;
      update.completed_at = null;
    }
  }

  if (rust_completed !== undefined) update.rust_completed = rust_completed;
  if (dsa_completed !== undefined) update.dsa_completed = dsa_completed;
  if (frontend_completed !== undefined) update.frontend_completed = frontend_completed;
  if (system_design_completed !== undefined) update.system_design_completed = system_design_completed;
  if (subtasks_completed !== undefined) update.subtasks_completed = subtasks_completed;
  if (system_design_task !== undefined) update.system_design_task = system_design_task;
  if (x_post_url !== undefined) update.x_post_url = x_post_url;
  if (notes !== undefined) update.notes = notes;

  // If any subtask is marked done, stamp completed_at to preserve the streak
  const anySubtaskDone =
    update.rust_completed === true ||
    update.dsa_completed === true ||
    update.frontend_completed === true ||
    update.system_design_completed === true ||
    (Array.isArray(update.subtasks_completed) && update.subtasks_completed.length > 0);

  if (anySubtaskDone && update.completed === undefined) {
    update.completed_at = new Date().toISOString();
  }

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

  const row = data[0];
  const normalizedDay: RustChallengeDay = {
    ...row,
    rust_completed: Boolean(row.rust_completed || row.completed),
    dsa_completed: Boolean(row.dsa_completed || row.completed),
    frontend_completed: Boolean(row.frontend_completed || (row.completed && row.frontend_task)),
    system_design_completed: Boolean(row.system_design_completed || (row.completed && row.system_design_task)),
    subtasks_completed: Array.isArray(row.subtasks_completed) ? row.subtasks_completed : [],
  };

  return NextResponse.json({ day: normalizedDay });
}
