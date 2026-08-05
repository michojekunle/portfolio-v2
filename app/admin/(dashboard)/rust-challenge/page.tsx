import { createClient } from "@/lib/supabase/server";
import { RustChallengeDashboard } from "@/components/admin/rust-challenge/RustChallengeDashboard";
import { BigPicture } from "@/components/admin/rust-challenge/BigPicture";
import type { RustChallengeDay } from "@/app/api/admin/rust-challenge/route";
import type { RustChallengeMeta } from "@/app/api/admin/rust-challenge/meta/route";

// Admin mutates completion/notes/X-post-url independent of this render —
// without this, Next's fetch cache could serve stale progress here.
export const dynamic = "force-dynamic";

export default async function RustChallengePage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  const [{ data }, { data: metaRow }] = await Promise.all([
    supabase.from("rust_challenge_days").select("*").order("day_number", { ascending: true }),
    supabase.from("rust_challenge_meta").select("why_started, quotes").eq("id", 1).maybeSingle(),
  ]);

  const initialMeta: RustChallengeMeta = {
    why_started: metaRow?.why_started ?? null,
    quotes: (metaRow?.quotes ?? []) as RustChallengeMeta["quotes"],
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">180-Day Rust Challenge</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aug 5, 2026 → Jan 31, 2027 — systems Rust → ZK → zkML, one day at a time
        </p>
      </div>
      <div className="mb-8">
        <BigPicture initialMeta={initialMeta} />
      </div>
      <RustChallengeDashboard initialDays={(data ?? []) as RustChallengeDay[]} />
    </div>
  );
}
