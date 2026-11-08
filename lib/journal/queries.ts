import { createClient } from "@/lib/supabase/server";
import type { JoEntry, JoMilestone, JoObjectiveWithMilestones } from "./types";

// Flat queries joined in JS rather than a PostgREST embedded select
// (`jo_objectives(*, jo_milestones(*))`) — the embed depends on the FK
// being present in PostgREST's schema cache and 500s otherwise.
export async function getObjectivesWithMilestones(): Promise<JoObjectiveWithMilestones[]> {
  const supabase = await createClient();
  const { data: objectives } = await supabase
    .from("jo_objectives")
    .select("*")
    .order("created_at", { ascending: false });
  if (!objectives || objectives.length === 0) return [];

  const { data: milestones } = await supabase
    .from("jo_milestones")
    .select("*")
    .in("objective_id", objectives.map((o) => o.id as string));

  const milestonesByObjective = new Map<string, JoMilestone[]>();
  for (const m of (milestones ?? []) as JoMilestone[]) {
    const list = milestonesByObjective.get(m.objective_id) ?? [];
    list.push(m);
    milestonesByObjective.set(m.objective_id, list);
  }

  return objectives.map((obj) => ({
    ...obj,
    milestones: milestonesByObjective.get(obj.id as string) ?? [],
  })) as JoObjectiveWithMilestones[];
}

export async function getRecentEntries(limit = 14): Promise<JoEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jo_entries")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);
  return (data ?? []) as JoEntry[];
}

export async function getEntryForDate(date: string): Promise<JoEntry | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jo_entries")
    .select("*")
    .eq("date", date)
    .single();
  return (data ?? null) as JoEntry | null;
}
