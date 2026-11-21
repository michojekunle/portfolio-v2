"use client";

import { useLang } from "./lang-context";
import { useEffect, useState, type ReactElement } from "react";
import type { Level } from "../domain/lessons";
import type { LevelSuggestion } from "../domain/level-up";
import { OutlineButton, QuietButton } from "./primitives";

const DISMISS_KEY = (lang: string, level: Level): string => `${lang}-levelup-dismissed-${level}`;
// "Not yet" holds for a week, then the evidence gets another look.
const DISMISS_DAYS = 7;

function readDismissed(lang: string, level: Level): boolean {
  try {
    const at = Number(window.localStorage.getItem(DISMISS_KEY(lang, level)));
    return Number.isFinite(at) && at > 0 && Date.now() - at < DISMISS_DAYS * 86_400_000;
  } catch (error) {
    console.warn("[learn] could not read level-up dismissal", error);
    return false;
  }
}

interface Props {
  readonly suggestion: LevelSuggestion;
  readonly busy: boolean;
  readonly onAccept: (level: Level) => void;
}

/** The teacher's note in the margin: evidence first, then a choice that stays the learner's. */
export function LevelUpNote({ suggestion, busy, onAccept }: Props): ReactElement | null {
  const { copy, pack } = useLang();
  // Hidden until we've read the dismissal, so it never flashes in and out.
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => setDismissed(readDismissed(pack.id, suggestion.next)), [pack.id, suggestion.next]);

  if (dismissed) return null;

  const dismiss = (): void => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY(pack.id, suggestion.next), String(Date.now()));
    } catch (error) {
      console.warn("[learn] could not save level-up dismissal", error);
    }
  };

  return (
    <aside aria-label={`Suggestion: move up to ${suggestion.next}`} className="fr-enter fr-row mt-8 border-y border-(--fr-rule) py-4">
      <p lang={pack.id} className="fr-mark text-[24px] leading-8">
        {copy.readyFor(suggestion.next)}
      </p>
      <p className="fr-ui mt-1 text-[15px] leading-6 text-(--fr-ink)">
        Over your last {suggestion.sessionsAtLevel} pages you remembered {Math.round(suggestion.recallRate * 100)}% of your reviews, and your speaking
        and writing held up. {pack.levelUpChanges[suggestion.next]}
      </p>
      <p className="fr-ui mt-1 text-sm leading-6 text-(--fr-soft)">It starts with tomorrow&apos;s scene. You can always step back in {copy.settings}.</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <OutlineButton onClick={() => onAccept(suggestion.next)} disabled={busy} className="border-(--fr-key) text-(--fr-key)">
          Move up to {suggestion.next}
        </OutlineButton>
        <QuietButton onClick={dismiss}>Not yet</QuietButton>
      </div>
    </aside>
  );
}
