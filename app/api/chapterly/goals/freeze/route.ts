import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ChGoal } from "@/lib/chapterly/types";

const MAX_FREEZES = 4;

/** Freeze the streak: protects it through the end of tomorrow. */
export async function POST(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: goal, error: goalError } = await supabase
    .from("ch_goals")
    .select("*")
    .eq("user_id", user.id)
    .single<ChGoal>();

  if (goalError || !goal) {
    return NextResponse.json({ error: "No reading goal found" }, { status: 404 });
  }

  const today = new Date().toISOString().slice(0, 10);
  if (goal.streak_freeze_until && String(goal.streak_freeze_until).slice(0, 10) >= today) {
    return NextResponse.json({ error: "Streak is already frozen" }, { status: 409 });
  }

  if ((goal.streak_freeze_count ?? 0) >= MAX_FREEZES) {
    return NextResponse.json(
      { error: `You've used all ${MAX_FREEZES} streak freezes` },
      { status: 429 }
    );
  }

  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  const { error } = await supabase
    .from("ch_goals")
    .update({
      streak_freeze_until: tomorrow,
      streak_freeze_count: (goal.streak_freeze_count ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("[goals/freeze] update error:", error);
    return NextResponse.json({ error: "Failed to freeze streak" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    streak_freeze_until: tomorrow,
    freezes_used: (goal.streak_freeze_count ?? 0) + 1,
    freezes_max: MAX_FREEZES,
  });
}

/** Unfreeze the streak early. */
export async function DELETE(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("ch_goals")
    .update({ streak_freeze_until: null, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) {
    console.error("[goals/freeze] unfreeze error:", error);
    return NextResponse.json({ error: "Failed to unfreeze streak" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
