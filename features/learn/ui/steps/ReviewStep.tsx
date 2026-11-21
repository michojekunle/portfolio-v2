"use client";

import { useLang } from "../lang-context";
import { useCallback, useEffect, useState, type ReactElement } from "react";
import type { Grade } from "../../domain/srs";
import type { DueCardDto } from "../../server/service";
import { ActionButton, OutlineButton, SpeakerButton, StepHeading } from "../primitives";
import { speak } from "../speech-io";

export interface ReviewResult {
  readonly cardId: string;
  readonly grade: Grade;
}

interface Props {
  readonly cards: readonly DueCardDto[];
  readonly onDone: (results: readonly ReviewResult[]) => void;
}

// Two honest answers beat three: "too easy" vs "got it" is a judgement call that slows every card down,
// and pass/fail grading schedules almost as well.
const GRADES: readonly { readonly grade: Grade; readonly label: "forgot" | "knewIt"; readonly en: string; readonly key: string }[] = [
  { grade: "again", label: "forgot", en: "Show it again soon", key: "1" },
  { grade: "good", label: "knewIt", en: "Space it out", key: "2" },
];

/** Retrieval practice: see the word, recall the meaning yourself, *then* reveal. */
export function ReviewStep({ cards, onDone }: Props): ReactElement {
  const { copy, pack } = useLang();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<readonly ReviewResult[]>([]);

  const card = cards[index];

  useEffect(() => {
    if (card) speak(card.french);
  }, [card]);

  const grade = useCallback(
    (value: Grade): void => {
      if (!card) return;
      const next = [...results, { cardId: card.id, grade: value }];
      if (index + 1 >= cards.length) {
        onDone(next);
        return;
      }
      setResults(next);
      setIndex(index + 1);
      setRevealed(false);
    },
    [card, cards.length, index, onDone, results]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.target instanceof HTMLElement && /input|textarea/i.test(event.target.tagName)) return;
      // A focused button already answers Space/Enter itself.
      if (event.target instanceof HTMLButtonElement && (event.key === " " || event.key === "Enter")) return;
      if (!revealed && (event.key === " " || event.key === "Enter")) {
        event.preventDefault();
        setRevealed(true);
        return;
      }
      if (!revealed) return;
      const match = GRADES.find((option) => option.key === event.key);
      if (match) grade(match.grade);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [grade, revealed]);

  if (!card) return <></>;

  return (
    <section aria-label={copy.steps.review} className="flex flex-1 flex-col">
      <StepHeading fr={copy.reviewHeading} en="Think of the meaning, then check.">
        <p className="fr-ui mt-1 text-xs text-(--fr-soft)">
          Word {index + 1} of {cards.length}
        </p>
      </StepHeading>

      <div key={card.id} className="fr-enter fr-row">
        <span className="fr-note leading-10">{index + 1}</span>
        <div className="flex items-start gap-1">
          <p lang={pack.id} className="fr-word min-w-0 flex-1 text-[40px] leading-[48px] tracking-[-0.02em] [overflow-wrap:anywhere]">
            {card.french}
          </p>
          <SpeakerButton text={card.french} label={`Hear “${card.french}”`} />
        </div>

        <div className="mt-4 min-h-24" aria-live="polite">
          {revealed ? (
            <div className="fr-enter">
              <p className="fr-hand text-[26px] leading-8">{card.english}</p>
              {card.notes ? <p className="fr-ui mt-2 text-[15px] leading-6 text-(--fr-soft)">{card.notes}</p> : null}
            </div>
          ) : (
            <p className="fr-ui text-[15px] leading-8 text-(--fr-soft)">
              Got it in your head? <span className="fr-kbd">Press Space to check.</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-auto pt-8">
        {revealed ? (
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Did you know it?">
            {GRADES.map((option) =>
              option.grade === "good" ? (
                <ActionButton
                  key={option.grade}
                  compact
                  onClick={() => grade(option.grade)}
                  aria-label={`${copy[option.label]}: ${option.en}`}
                  className="min-h-14 whitespace-nowrap px-2 text-[18px] leading-tight"
                >
                  {copy[option.label]}
                </ActionButton>
              ) : (
                <OutlineButton key={option.grade} onClick={() => grade(option.grade)} aria-label={`${copy[option.label]}: ${option.en}`} className="fr-print min-h-14 whitespace-nowrap px-2 text-[18px] leading-tight">
                  {copy[option.label]}
                </OutlineButton>
              )
            )}
            {GRADES.map((option) => (
              <p key={`${option.grade}-hint`} className="fr-ui text-center text-[11px] leading-4 text-(--fr-soft)" aria-hidden="true">
                {option.en} <span className="fr-kbd">· {option.key}</span>
              </p>
            ))}
          </div>
        ) : (
          <ActionButton onClick={() => setRevealed(true)} meta={<span className="fr-kbd">Space</span>}>
            {copy.check}
          </ActionButton>
        )}
      </div>
    </section>
  );
}
