import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { FREE_GOAL_LIMIT } from "@/lib/flowise/types";

const CreateSchema = z.object({
  name: z.string().min(1).max(80),
  target_amount: z.number().positive(),
  current_amount: z.number().min(0).default(0),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  linked_account_id: z.string().uuid().nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#16A34A"),
  icon: z.string().max(4).default("🎯"),
});

const UpdateSchema = CreateSchema.partial().extend({
  id: z.string().uuid(),
  is_completed: z.boolean().optional(),
});

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("fw_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[flowise/goals] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }

  return NextResponse.json({ goals: data ?? [] });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { count } = await supabase
    .from("fw_goals")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_completed", false);

  if ((count ?? 0) >= FREE_GOAL_LIMIT) {
    return NextResponse.json(
      { error: `Free plan is limited to ${FREE_GOAL_LIMIT} active goals.` },
      { status: 403 },
    );
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("fw_goals")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("[flowise/goals] POST error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }

  return NextResponse.json({ goal: data }, { status: 201 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { id, ...updates } = parsed.data;

  const { data, error } = await supabase
    .from("fw_goals")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[flowise/goals] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }

  return NextResponse.json({ goal: data });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id param required" }, { status: 400 });

  const { error } = await supabase
    .from("fw_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[flowise/goals] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
