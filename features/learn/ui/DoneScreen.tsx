"use client";

import { useLang } from "./lang-context";
import type { ReactElement } from "react";
import { Download, Flame, Share, Snowflake } from "lucide-react";
import type { Stage } from "../domain/progression";
import type { CompletePayload } from "../server/service";
import { ActionButton, QuietButton } from "./primitives";
import type { Copy } from "./copy";
import type { InstallState } from "./use-install";

interface Props {
  /** `null` for a guest session, which isn't saved. */
  readonly result: CompletePayload | null;
  readonly onClose: () => void;
  readonly onSignIn: () => void;
  readonly install: InstallState;
  /** Set when this page moved the learner up a stage — tomorrow asks a little more. */
  readonly unlocked: Stage | null;
}

/** What a new stage changes, in English; the headline comes from the language copy. */
const UNLOCK_COPY: Record<Stage, { readonly en: string }> = {
  1: { en: "" },
  2: { en: "From tomorrow you'll type a missing word instead of arranging tiles, and English hides until you ask." },
  3: { en: "From tomorrow you write a sentence of your own and get it corrected in red." },
};

/** Right after a finished page is when "one tap a day" is believable — ask then, once per fortnight at most. */
function InstallNudge({ install }: { readonly install: InstallState }): ReactElement | null {
  const { copy, pack } = useLang();
  if (!install.mode || install.snoozed) return null;
  return (
    <aside aria-label="Install the app" className="fr-enter mt-10 border-t border-(--fr-rule) pt-4">
      <p className="fr-print text-xl font-semibold leading-8 text-(--fr-ink)">Same time tomorrow?</p>
      {install.mode === "prompt" ? (
        <>
          <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">Put {pack.appName} on your home screen or dock — it opens straight to today&apos;s page.</p>
          <div className="mt-2 flex flex-wrap gap-x-6">
            <QuietButton onClick={() => void install.install()} className="text-(--fr-ink)">
              <Download className="size-4" aria-hidden="true" /> Install the app
            </QuietButton>
            <QuietButton onClick={install.snooze}>Not now</QuietButton>
          </div>
        </>
      ) : (
        <>
          <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">
            Add it to your home screen: tap <Share className="inline size-4 align-[-2px]" aria-label="Share" /> below, then{" "}
            <strong className="text-(--fr-ink)">Add to Home Screen</strong>.
          </p>
          <QuietButton onClick={install.snooze}>Got it</QuietButton>
        </>
      )}
    </aside>
  );
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** The teacher's verdict, written at the bottom of the page. */
function verdict(copy: Copy, recallRate: number | null): string {
  if (recallRate === null || recallRate >= 85) return copy.veryGood;
  if (recallRate >= 60) return copy.goodWork;
  return copy.keepGoing;
}

export function DoneScreen({ result, onClose, onSignIn, install, unlocked }: Props): ReactElement {
  const { copy, pack } = useLang();
  if (result === null) {
    return (
      <div className="fr-sheet">
        <main className="fr-enter flex flex-1 flex-col justify-center py-10">
          <p className="fr-mark text-[40px] leading-[48px]">
            <span className="fr-underline-drawn">{copy.veryGood}</span>
          </p>
          <h1 className="fr-print mt-6 text-[40px] font-semibold leading-[48px] tracking-[-0.02em] text-(--fr-ink)">That was a whole page.</h1>
          <p className="fr-ui mt-4 max-w-[38ch] text-base leading-8 text-(--fr-soft)">
            About ten minutes, and you used what you learned straight away. Guest pages aren&apos;t kept; with a free account, every page from your next one on
            remembers your words, your mistakes and your streak.
          </p>
          <div className="mt-10 space-y-2">
            <ActionButton onClick={onSignIn} meta="free →">
              {copy.keepProgress}
            </ActionButton>
            <QuietButton onClick={onClose} className="w-full">
              Not now
            </QuietButton>
          </div>
          <InstallNudge install={install} />
        </main>
      </div>
    );
  }

  const { streak, stats, tomorrowDue } = result;
  const recallRate = stats.reviews > 0 ? Math.round((stats.recalled / stats.reviews) * 100) : null;

  return (
    <div className="fr-sheet">
      <main className="fr-enter flex flex-1 flex-col justify-center py-10">
        <p className="fr-ui text-sm leading-8 text-(--fr-soft)">{result.alreadyCompleted ? "Extra page — saved, streak unchanged." : "Page saved."}</p>
        <p className="fr-mark text-[40px] leading-[48px]">
          <span className="fr-underline-drawn">{verdict(copy, recallRate)}</span>
        </p>

        <div className="fr-row mt-8 flex items-baseline gap-3">
          <span className="fr-note leading-[64px]" aria-hidden="true">
            <Flame className="ml-auto size-5" />
          </span>
          <p className="fr-print text-[64px] font-semibold leading-16 tracking-[-0.03em] text-(--fr-ink)">{streak.current}</p>
          <p className="fr-ui text-base text-(--fr-soft)">
            day{streak.current === 1 ? "" : "s"} in a row{streak.current === 1 ? " — the first is the hardest" : ""}
          </p>
        </div>

        <p className="fr-hand mt-6 max-w-[30ch] text-[22px] leading-8">
          {copy.newCards(stats.newWords)}
          {recallRate !== null ? `, ${copy.recalled(recallRate)}` : ""}. {copy.cardsTomorrow(tomorrowDue)}.
        </p>
        <p className="fr-ui text-sm leading-6 text-(--fr-soft)">
          {stats.newWords} new card{stats.newWords === 1 ? "" : "s"} (words plus any corrections)
          {recallRate !== null ? `, ${recallRate}% recalled` : ""}; {tomorrowDue} card{tomorrowDue === 1 ? "" : "s"} due tomorrow.
        </p>

        {streak.freezesUsed > 0 ? (
          <p className="fr-ui mt-6 flex items-center gap-2 text-[15px] leading-6 text-(--fr-soft)">
            <Snowflake className="size-4 shrink-0" aria-hidden="true" /> A streak freeze covered {plural(streak.freezesUsed, "missed day", "missed days")}.
          </p>
        ) : null}
        {streak.freezeEarned ? (
          <p className="fr-ui mt-6 flex items-center gap-2 text-[15px] leading-6 text-(--fr-ink)">
            <Snowflake className="size-4 shrink-0 text-(--fr-key)" aria-hidden="true" /> You earned a streak freeze — a missed day won&apos;t break your run.
          </p>
        ) : null}

        {unlocked && unlocked > 1 ? (
          <div className="fr-enter mt-8 border-t border-(--fr-rule) pt-4">
            <p lang={pack.id} className="fr-mark text-[22px] leading-8">{copy.unlocked[unlocked]}</p>
            <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">{UNLOCK_COPY[unlocked].en}</p>
          </div>
        ) : null}

        <div className="mt-12">
          <ActionButton onClick={onClose} meta="→">
            {copy.seeYouTomorrow.replace(/\.$/, "")}
          </ActionButton>
        </div>
        <InstallNudge install={install} />
      </main>
    </div>
  );
}
