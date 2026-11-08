import { createClient } from "@/lib/supabase/server";
import { ChallengesClient } from "@/components/chapterly/ChallengesClient";
import { PREBUILT_CHALLENGES } from "@/lib/chapterly/challenges";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chapterly — Challenges" };

export default async function ChallengesPage(): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <ChallengesClient prebuilt={PREBUILT_CHALLENGES} customChallenges={[]} entries={[]} />;
  }

  // Fetch custom challenges + all entries in parallel
  const [challengesRes, entriesRes] = await Promise.all([
    supabase.from("ch_challenges").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("ch_challenge_entries").select("*").eq("user_id", user.id),
  ]);

  return (
    <ChallengesClient
      prebuilt={PREBUILT_CHALLENGES}
      customChallenges={challengesRes.data ?? []}
      entries={entriesRes.data ?? []}
    />
  );
}
