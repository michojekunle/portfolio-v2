"use client";

import { useLang } from "../lang-context";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { Snail } from "lucide-react";
import { diffWords } from "../../domain/diff";
import { CARD_NOTES_MAX, clipText } from "../../domain/schemas";
import { AccentKeys, insertAtCaret } from "../AccentKeys";
import { NO_WRITING_TOOLS, ActionButton, OutlineButton, QuietButton, StepHeading } from "../primitives";
import { RedPen } from "../RedPen";
import { speak } from "../speech-io";
import type { NewCardDto } from "./LearnStep";

interface Props {
  readonly sentence: { readonly fr: string; readonly en: string };
  readonly onDone: (errorCard: NewCardDto | null) => void;
}

/**
 * La dictée: hear a sentence, write exactly what you heard. It joins the ear
 * to the spelling — silent letters, accents, agreements — which is where
 * reading and writing French really get hard.
 */
export function DictationStep({ sentence, onDone }: Props): ReactElement {
  const { copy, pack } = useLang();
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const field = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    speak(sentence.fr, 0.85);
  }, [sentence.fr]);

  const exact = checked && diffWords(text, sentence.fr).every((token) => token.kind === "same");

  const insertAccent = (char: string): void => {
    const el = field.current;
    const { next, caret } = insertAtCaret(el, text, char, 240);
    setText(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  };

  return (
    <section aria-label={copy.steps.dictation} className="flex flex-1 flex-col">
      <StepHeading fr={copy.dictationHeading} en="Listen, then write exactly what you hear — accents included. Replay as often as you like." />

      <div className="flex flex-wrap items-center gap-x-4">
        <OutlineButton onClick={() => speak(sentence.fr, 0.85)} className="border-(--fr-key) text-(--fr-key)">
          Play again
        </OutlineButton>
        <button type="button" onClick={() => speak(sentence.fr, 0.6)} className="fr-quiet">
          <Snail className="size-4" aria-hidden="true" /> Slowly
        </button>
      </div>

      {checked ? (
        <div className="fr-row mt-8" aria-live="polite">
          <RedPen original={text} corrected={sentence.fr} correct={exact} />
          <p className="fr-mark mt-3 text-[20px] leading-8">{exact ? copy.noMistakes : copy.almost}</p>
          <p className="fr-ui text-sm leading-6 text-(--fr-soft)">“{sentence.en}”</p>
        </div>
      ) : (
        <>
          <label htmlFor="fr-dictee" className="sr-only">
            What you heard
          </label>
          <textarea
            id="fr-dictee"
            ref={field}
            lang={pack.id}
            value={text}
            onChange={(event) => setText(event.target.value.slice(0, 240))}
            rows={2}
            spellCheck={false}
            {...NO_WRITING_TOOLS}
            autoCapitalize="sentences"
            placeholder={copy.dictationPlaceholder}
            className="fr-field is-lined fr-hand mt-6 resize-none text-[24px] leading-8"
          />
          <AccentKeys onInsert={insertAccent} />
        </>
      )}

      <div className="mt-auto space-y-2 pt-8">
        {checked ? (
          <ActionButton
            onClick={() =>
              onDone(exact ? null : { french: sentence.fr, english: sentence.en, notes: clipText(`${copy.steps.dictation} — you wrote: “${text.trim()}”`, CARD_NOTES_MAX), source: "error" })
            }
            meta="→"
          >
            {copy.finishPage}
          </ActionButton>
        ) : (
          <>
            <ActionButton onClick={() => setChecked(true)} disabled={text.trim().length < 2} meta="→">
              {copy.check}
            </ActionButton>
            <QuietButton onClick={() => onDone(null)} className="w-full">
              Skip the dictation today
            </QuietButton>
          </>
        )}
      </div>
    </section>
  );
}
