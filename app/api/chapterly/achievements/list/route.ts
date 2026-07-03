import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ChAchievement } from "@/lib/chapterly/types";

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("ch_achievements")
    .select("*")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false });

  return NextResponse.json({ achievements: (data ?? []) as ChAchievement[] });
}
