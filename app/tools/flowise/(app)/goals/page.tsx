import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { FwGoal } from "@/lib/flowise/types";
import { GoalsClient } from "@/components/flowise/GoalsClient";

export const metadata: Metadata = { title: "Flowise — Goals" };

export default async function GoalsPage(): Promise<React.ReactElement> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fw_goals")
    .select("*")
    .order("created_at", { ascending: true });

  const goals = (data ?? []) as FwGoal[];

  return (
    <Suspense>
      <GoalsClient initialGoals={goals} />
    </Suspense>
  );
}
