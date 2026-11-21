"use client";

import { useLang } from "../lang-context";
import { useRef, useState, type ReactElement } from "react";
import { Check, X } from "lucide-react";
import { checkGap, type Gap, type GapVerdict } from "../../domain/exercises";
import { AccentKeys, insertAtCaret } from "../AccentKeys";
import { ActionButton, QuietButton, StepHeading } from "../primitives";
import type { WriteResult } from "./WriteStep";

interface Props {
  readonly gap: Gap;
  readonly onDone: (result: WriteResult) => void;
}

type State = { readonly kind: "typing" } | { readonly kind: "checked"; readonly verdict: GapVerdict; readonly final: boolean };

/**
 * Stage 2 writing: the sentence is given, one of today's words is missing.
 * Recall plus spelling, without the weight of composing a whole sentence.
 */
export function GapStep({ gap, onDone }: Props): ReactElement {
  const { copy, pack } = useLang();
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>({ kind: "typing" });
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const final = state.kind === "checked" && state.final;
  const accepted = state.kind === "checked" && state.verdict !== "wrong";

  const check = (): void => {
    const verdict = checkGap(gap.answer, value);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    // Two tries, then show it: being stuck teaches nothing.
    setState({ kind: "checked", verdict, final: verdict !== "wrong" || nextAttempts >= 2 });
  };

  const finish = (): void => {
    const missed = state.kind === "checked" && state.verdict === "wrong";
    onDone({
      correct: state.kind === "checked" && state.verdict === "correct" && attempts === 1,
      errorCard: missed
        ? { french: `${gap.before}${gap.answer}${gap.after}`, english: gap.sentenceEn, notes: `The missing word was “${gap.answer}” (${gap.hint}).`, source: "error" }
        : null,
    });
  };

  const insertAccent = (char: string): void => {
    const { next, caret } = insertAtCaret(input.current, value, char, 60);
    setValue(next);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(caret, caret);
    });
  };

  // em, not ch: the cursive's "0" is very wide, so ch-based widths balloon to the whole line.
  const width = `${(Math.max(gap.answer.length, value.length, 4) * 0.62 + 1).toFixed(2)}em`;

  return (
    <section aria-label={copy.steps.write} className="flex flex-1 flex-col">
      <StepHeading fr={copy.gapHeading} en="Type the missing word — it's one you met today." />

      <p className="fr-hand text-[22px] leading-8">{gap.sentenceEn}</p>

      <div className="fr-row mt-6">
        {final ? (
          <span className="fr-note leading-10" aria-hidden="true">
            {accepted ? <Check className="ml-auto size-5" strokeWidth={2.5} /> : <X className="ml-auto size-5" strokeWidth={2.5} />}
          </span>
        ) : null}
        <p lang={pack.id} className="fr-print text-[26px] leading-10 text-(--fr-ink) md:text-[30px] md:leading-[48px]">
          {gap.before}
          <label htmlFor="fr-gap" className="sr-only">
            Missing word
          </label>
          <input
            id="fr-gap"
            ref={input}
            lang={pack.id}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (state.kind === "checked" && !state.final) setState({ kind: "typing" });
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && value.trim() && !final) {
                event.preventDefault();
                check();
              }
            }}
            readOnly={final}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
            style={{ width, maxWidth: "100%" }}
            className="fr-hand mx-1 inline-block border-0 border-b-2 border-(--fr-key) bg-transparent px-1 text-center text-[26px] leading-9 focus:outline-none"
          />
          {gap.after}
        </p>
        {final && state.kind === "checked" && state.verdict !== "correct" ? (
          <p lang={pack.id} className="fr-mark fr-written mt-1 text-[24px] leading-8">
            → {gap.answer}
          </p>
        ) : null}
      </div>

      {!final ? <AccentKeys onInsert={insertAccent} /> : null}

      <div className="mt-6 min-h-16" aria-live="polite">
        {state.kind === "checked" && state.verdict === "correct" ? <p className="fr-mark text-[22px] leading-8">{attempts === 1 ? copy.perfect : copy.thereYouGo}</p> : null}
        {state.kind === "checked" && state.verdict === "accents" ? (
          <p className="fr-mark text-[22px] leading-8">
            {copy.rightBut} mind the accents: <span lang={pack.id}>{gap.answer}</span>
          </p>
        ) : null}
        {state.kind === "checked" && state.verdict === "wrong" && !state.final ? (
          <p className="fr-mark text-[22px] leading-8">{copy.notQuite} One more try?</p>
        ) : null}
        {state.kind === "checked" && state.verdict === "wrong" && state.final ? (
          <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">
            It was <span lang={pack.id} className="font-bold text-(--fr-ink)">{gap.answer}</span> — {gap.hint}. It goes into your deck.
          </p>
        ) : null}
        {!final && hint ? (
          <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">
            Starts with <span className="fr-print text-(--fr-ink)">“{gap.answer.charAt(0)}”</span>, {gap.answer.length} letters — means “{gap.hint}”.
          </p>
        ) : null}
      </div>

      <div className="mt-auto space-y-2 pt-8">
        {final ? (
          <ActionButton onClick={finish} meta="→">
            {copy.finishPage}
          </ActionButton>
        ) : (
          <>
            <ActionButton onClick={check} disabled={!value.trim()} meta={<span className="fr-kbd">↵</span>}>
              {copy.check}
            </ActionButton>
            {!hint ? (
              <QuietButton onClick={() => setHint(true)} className="w-full">
                A little hint
              </QuietButton>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
