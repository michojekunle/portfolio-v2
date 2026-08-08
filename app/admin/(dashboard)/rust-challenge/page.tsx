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
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-8 sm:px-10 sm:py-12 mb-8">
        <span
          aria-hidden
          className="pointer-events-none select-none absolute -right-6 -top-10 text-[10rem] sm:text-[14rem] leading-none opacity-[0.06]"
        >
          🦀
        </span>
        <p className="relative font-mono text-[11px] tracking-[0.2em] uppercase text-orange-600 dark:text-orange-400 font-medium mb-3">
          Day one → day one hundred eighty
        </p>
        <h1 className="relative font-display font-extrabold text-[clamp(32px,5vw,52px)] tracking-tight leading-[1.02] text-(--ink) fvs-display text-balance">
          The 180-Day Rust Challenge
        </h1>
        <p className="relative text-sm sm:text-base text-muted-foreground mt-3 max-w-[52ch] leading-relaxed">
          Aug 5, 2026 → Jan 31, 2027 — systems Rust as the trunk, ZK → zkML as the crown. One rep a day, no exceptions.
        </p>
      </div>
      <div className="mb-8">
        <BigPicture initialMeta={initialMeta} />
      </div>
      <RustChallengeDashboard initialDays={(data ?? []) as RustChallengeDay[]} />
    </div>
  );
}
