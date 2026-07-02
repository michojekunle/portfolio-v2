import { createClient } from "@/lib/supabase/server";
import type { JoEntry, JoObjectiveWithMilestones } from "./types";

export async function getObjectivesWithMilestones(): Promise<JoObjectiveWithMilestones[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jo_objectives")
    .select("*, jo_milestones(*)")
    .order("created_at", { ascending: false });
  if (!data) return [];
  return data.map((obj) => ({
    ...obj,
    milestones: (obj.jo_milestones ?? []),
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
