"use client";

import { useLang } from "../lang-context";
import { useMemo, useState, type ReactElement } from "react";
import { Check, X } from "lucide-react";
import { sentenceTiles, tilesMatch, type Tile } from "../../domain/exercises";
import { ActionButton, QuietButton, SpeakerButton, StepHeading } from "../primitives";
import type { WriteResult } from "./WriteStep";

interface Props {
  readonly sentence: { readonly fr: string; readonly en: string };
  readonly seed: string;
  readonly onDone: (result: WriteResult) => void;
}

type Verdict = "building" | "right" | "wrong" | "revealed";

/**
 * Stage 1 writing: rebuild a sentence you've just heard and said, from its own words.
 * No blank page, no typing, nothing to get "creatively" wrong — just word order.
 */
export function TilesStep({ sentence, seed, onDone }: Props): ReactElement {
  const { copy, pack } = useLang();
  const bank = useMemo(() => sentenceTiles(sentence.fr, seed), [sentence.fr, seed]);
  const [placed, setPlaced] = useState<readonly Tile[]>([]);
  const [verdict, setVerdict] = useState<Verdict>("building");
  const [attempts, setAttempts] = useState(0);

  const available = bank.filter((tile) => !placed.some((p) => p.id === tile.id));
  const complete = available.length === 0;
  const locked = verdict === "right" || verdict === "revealed";

  const check = (): void => {
    const ok = tilesMatch(sentence.fr, placed);
    setAttempts((n) => n + 1);
    setVerdict(ok ? "right" : attempts >= 1 ? "revealed" : "wrong");
  };

  const finish = (): void => {
    const firstTry = verdict === "right" && attempts === 1;
    onDone({
      correct: firstTry,
      errorCard:
        verdict === "revealed"
          ? { french: sentence.fr, english: sentence.en, notes: "Word order — rebuild it in your head before you flip.", source: "error" }
          : null,
    });
  };

  return (
    <section aria-label={copy.steps.write} className="flex flex-1 flex-col">
      <StepHeading fr={copy.tilesHeading} en="Tap the words to rebuild the sentence. Tap a placed word to take it back." />

      <p className="fr-hand text-[22px] leading-8">{sentence.en}</p>

      {/* The answer line sits on the page's own ruling. */}
      <div className="fr-row mt-6">
        {verdict === "right" || verdict === "revealed" ? (
          <span className="fr-note leading-10" aria-hidden="true">
            {verdict === "right" ? <Check className="ml-auto size-5" strokeWidth={2.5} /> : <X className="ml-auto size-5" strokeWidth={2.5} />}
          </span>
        ) : null}
        <div
          lang={pack.id}
          aria-label="Your sentence"
          aria-live="polite"
          className="flex min-h-12 flex-wrap items-end gap-x-2 gap-y-1 border-b-2 border-(--fr-key) pb-1"
        >
          {placed.length === 0 ? <span className="fr-ui pb-1 text-sm text-(--fr-soft)">Your sentence goes here…</span> : null}
          {placed.map((tile) => (
            <button
              key={tile.id}
              type="button"
              disabled={locked}
              onClick={() => {
                setPlaced(placed.filter((p) => p.id !== tile.id));
                setVerdict("building");
              }}
              className="fr-hand min-h-10 text-[24px] leading-8"
            >
              {tile.word}
            </button>
          ))}
        </div>
        {verdict === "revealed" ? (
          <p lang={pack.id} className="fr-mark fr-written mt-2 text-[24px] leading-8">
            → {sentence.fr}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-2" aria-label="Words to place">
        {available.map((tile) => (
          <button
            key={tile.id}
            type="button"
            disabled={locked}
            onClick={() => {
              setPlaced([...placed, tile]);
              setVerdict("building");
            }}
            lang={pack.id}
            className="fr-outline fr-print min-h-12 px-4 text-[19px] font-normal"
          >
            {tile.word}
          </button>
        ))}
      </div>

      <div className="mt-6 min-h-16" aria-live="polite">
        {verdict === "right" ? (
          <div className="fr-enter flex items-center gap-2">
            <p className="fr-mark text-[22px] leading-8">{attempts === 1 ? copy.perfect : copy.thereYouGo}</p>
            <SpeakerButton text={sentence.fr} label="Hear the sentence" />
          </div>
        ) : null}
        {verdict === "wrong" ? <p className="fr-mark text-[22px] leading-8">{copy.notQuite} Move a word and try again.</p> : null}
        {verdict === "revealed" ? (
          <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">Here&apos;s the order. It goes into your deck so it comes back.</p>
        ) : null}
      </div>

      <div className="mt-auto space-y-2 pt-8">
        {locked ? (
          <ActionButton onClick={finish} meta="→">
            {copy.finishPage}
          </ActionButton>
        ) : (
          <>
            <ActionButton onClick={check} disabled={!complete} meta={complete ? "→" : `${available.length} left`}>
              {copy.check}
            </ActionButton>
            {placed.length > 0 ? (
              <QuietButton
                onClick={() => {
                  setPlaced([]);
                  setVerdict("building");
                }}
                className="w-full"
              >
                Start over
              </QuietButton>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
