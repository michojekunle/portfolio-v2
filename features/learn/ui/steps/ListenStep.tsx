"use client";

import { useLang } from "../lang-context";
import { useMemo, useState, type ReactElement } from "react";
import { Check, Play, Snail, X } from "lucide-react";
import type { Lesson } from "../../domain/lessons";
import { spokenForm } from "../../domain/reductions";
import { ActionButton, OutlineButton, StepHeading } from "../primitives";
import { speak } from "../speech-io";

interface Props {
  readonly lesson: Lesson;
  readonly seed: string;
  readonly onDone: () => void;
}

/** Natural speech runs faster than the learning voice. */
const NATURAL_RATE = 1.15;

function seededIndex(seed: string, length: number): number {
  let h = 0;
  for (const char of seed) h = (h * 31 + char.charCodeAt(0)) >>> 0;
  return length === 0 ? 0 : h % length;
}

/**
 * Real-speed listening: hear the whole scene the way people actually talk,
 * answer one gist question, then see how the lines really sound ("chuis", "y a").
 */
export function ListenStep({ lesson, seed, onDone }: Props): ReactElement {
  const { copy, pack } = useLang();
  const [played, setPlayed] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  // The quiz plays ONE line on its own — every option is from the scene, so "which did you hear?" only works for a single line.
  const [linePlayed, setLinePlayed] = useState(false);

  const scene = lesson.sentences.map((s) => s.fr).join(" ");

  // One line to check, with two other lines' English as plausible distractors.
  const quiz = useMemo(() => {
    const target = seededIndex(seed, lesson.sentences.length);
    const others = lesson.sentences.map((_, i) => i).filter((i) => i !== target);
    const distractors = [others[seededIndex(`${seed}a`, others.length)], others[(seededIndex(`${seed}a`, others.length) + 1) % others.length]].filter(
      (i, pos, all) => i !== undefined && all.indexOf(i) === pos
    );
    const options = [target, ...distractors];
    // Deterministic order so the right answer isn't always first.
    const rotate = seededIndex(`${seed}r`, options.length);
    return { target, options: [...options.slice(rotate), ...options.slice(0, rotate)] };
  }, [lesson.sentences, seed]);

  const reductions = lesson.sentences.map((s) => ({ ...s, ...spokenForm(s.fr, pack.reductions) })).filter((s) => s.changes.length > 0);
  const answered = answer !== null;
  const correct = answer === quiz.target;

  return (
    <section aria-label={copy.steps.listen} className="flex flex-1 flex-col">
      <StepHeading fr={copy.listenHeading} en="Hear the scene the way people actually say it. Catch the gist; you don't need every word." />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <OutlineButton
          onClick={() => {
            speak(scene, NATURAL_RATE);
            setPlayed(true);
          }}
          className="border-(--fr-key) text-(--fr-key)"
        >
          <Play className="size-4" aria-hidden="true" /> {played ? "Play again" : "Play the scene"}
        </OutlineButton>
        {played ? (
          <button type="button" onClick={() => speak(scene, 0.75)} className="fr-quiet">
            <Snail className="size-4" aria-hidden="true" /> Slower
          </button>
        ) : null}
      </div>

      {played ? (
        <div className="fr-enter mt-8">
          <p className="fr-print text-xl font-semibold leading-8 text-(--fr-ink)">Now one line, on its own.</p>
          <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">Play it, then pick what it means.</p>
          <OutlineButton
            onClick={() => {
              const line = lesson.sentences[quiz.target];
              if (line) speak(line.fr, NATURAL_RATE);
              setLinePlayed(true);
            }}
            className="mt-2"
          >
            <Play className="size-4" aria-hidden="true" /> {linePlayed ? "Hear the line again" : "Play the line"}
          </OutlineButton>
          {linePlayed ? (
          <div className="mt-3 grid gap-2" role="group" aria-label="Pick what the line means">
            {quiz.options.map((i) => {
              const isRight = i === quiz.target;
              const chosen = answer === i;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={answered}
                  onClick={() => setAnswer(i)}
                  aria-pressed={chosen}
                  className={`fr-outline fr-ui min-h-12 justify-between px-4 text-left text-[15px] font-normal ${
                    answered && isRight ? "border-(--fr-key)" : answered && chosen ? "border-(--fr-mark)" : ""
                  }`}
                >
                  <span>{lesson.sentences[i]?.en}</span>
                  {answered && isRight ? <Check className="size-4 shrink-0 text-(--fr-key)" aria-label="Correct" /> : null}
                  {answered && chosen && !isRight ? <X className="size-4 shrink-0 text-(--fr-mark)" aria-label="Not this one" /> : null}
                </button>
              );
            })}
          </div>
          ) : null}
          {answered ? (
            <p className="fr-mark mt-3 text-[22px] leading-8" aria-live="polite">
              {correct ? copy.heardRight : copy.heardWrong}
            </p>
          ) : null}
        </div>
      ) : null}

      {answered && reductions.length > 0 ? (
        <div className="fr-enter mt-8">
          <p className="fr-print text-xl font-semibold leading-8 text-(--fr-ink)">How it really sounds</p>
          <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">{pack.spokenNote}</p>
          <ul className="mt-3 space-y-3">
            {reductions.map((line) => (
              <li key={line.fr}>
                <p lang={pack.id} className="fr-print text-[17px] leading-6 text-(--fr-soft)">{line.fr}</p>
                <button type="button" onClick={() => speak(line.fr, NATURAL_RATE)} lang={pack.id} className="fr-hand text-left text-[22px] leading-8">
                  → {line.spoken}
                </button>
                <p className="fr-ui text-xs leading-5 text-(--fr-soft)">
                  {line.changes.map((c) => `${c.written} → ${c.spoken}: ${c.why}`).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-auto pt-10">
        <ActionButton onClick={onDone} disabled={!answered} meta="→">
          {copy.continue}
        </ActionButton>
      </div>
    </section>
  );
}
