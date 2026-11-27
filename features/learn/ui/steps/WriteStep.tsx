"use client";

import { useLang } from "../lang-context";
import { useRef, useState, type ReactElement } from "react";
import { Loader2 } from "lucide-react";
import type { Lesson, Level } from "../../domain/lessons";
import { CARD_NOTES_MAX, CARD_TEXT_MAX, clipText, type Feedback } from "../../domain/schemas";
import { registerBadgeText } from "../../domain/tracks";
import { NO_WRITING_TOOLS, ActionButton, QuietButton, StepHeading } from "../primitives";
import { AccentKeys, insertAtCaret } from "../AccentKeys";
import { RedPen } from "../RedPen";
import type { GoalFeedbackContext } from "./AskStep";
import type { NewCardDto } from "./LearnStep";

export interface WriteResult {
  /** `null` when feedback wasn't available — never counts for or against the learner. */
  readonly correct: boolean | null;
  /** A card built from the learner's own mistake, if they made one. */
  readonly errorCard: NewCardDto | null;
}

interface Props {
  readonly write: Lesson["write"];
  readonly level: Level;
  readonly guest: boolean;
  readonly goalContext?: GoalFeedbackContext;
  readonly onDone: (result: WriteResult) => void;
}

type FeedbackResponse = { readonly available: true; readonly feedback: Feedback } | { readonly available: false };

/** The signature moment: the learner writes in their own ink, the correction comes back in red pen. */
function Correction({ original, feedback, targetWord }: { readonly original: string; readonly feedback: Feedback; readonly targetWord: string }): ReactElement {
  const { copy, pack } = useLang();
  return (
    <div className="fr-row mt-2" aria-live="polite">
      <RedPen original={original} corrected={feedback.corrected} correct={feedback.isCorrect} />

      <p className="fr-mark mt-4 text-[20px] leading-8">{feedback.isCorrect ? (feedback.usedTarget ? copy.perfect : copy.rightBut) : copy.toFix}</p>
      <p className="fr-ui text-[15px] leading-6 text-(--fr-ink)">{feedback.explanation}</p>
      <p className="fr-ui mt-1 text-sm leading-6 text-(--fr-soft)">“{feedback.translation}”</p>
      {!feedback.usedTarget ? (
        <p className="fr-ui mt-2 text-sm leading-6 text-(--fr-mark)">
          It didn&apos;t use <span lang={pack.id} className="font-bold">{targetWord}</span> — try working it in next time.
        </p>
      ) : null}
      {!feedback.isCorrect && feedback.errorTag !== "none" ? (
        <p className="fr-ui mt-2 text-sm leading-6 text-(--fr-soft)">The corrected sentence goes into your deck, so you&apos;ll meet it again.</p>
      ) : null}
    </div>
  );
}

function shortcutLabel(): string {
  if (typeof navigator === "undefined") return "Ctrl ↵";
  return /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent) ? "⌘ ↵" : "Ctrl ↵";
}

export function WriteStep({ write, level, guest, goalContext, onDone }: Props): ReactElement {
  const { copy, pack } = useLang();
  const [text, setText] = useState("");
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitted, setSubmitted] = useState("");
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  /** Insert at the caret, not at the end — accents land mid-word. */
  const insertAccent = (char: string): void => {
    const el = field.current;
    const { next, caret } = insertAtCaret(el, text, char, 300);
    setText(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  };

  const check = async (): Promise<void> => {
    const sentence = text.trim();
    setChecking(true);
    setError(null);
    try {
      const response = await fetch(`${pack.api}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentence,
          targetWord: write.targetWord,
          level,
          ...(goalContext?.track ? { track: goalContext.track } : {}),
          ...(goalContext?.goalFocus ? { goalFocus: goalContext.goalFocus } : {}),
          ...(goalContext?.goalNote ? { goalNote: goalContext.goalNote } : {}),
          ...(goalContext?.expectedRegister ? { expectedRegister: goalContext.expectedRegister } : {}),
          ...(goalContext?.contextBrief ? { contextBrief: goalContext.contextBrief } : {}),
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch((parseError: unknown) => {
          console.warn("[learn] feedback error body was not JSON", parseError);
          return {};
        })) as { error?: string };
        throw new Error(body.error ?? "Your sentence couldn't be checked.");
      }
      const data = (await response.json()) as FeedbackResponse;
      setSubmitted(sentence);
      if (data.available) setFeedback(data.feedback);
      else setUnavailable(true);
    } catch (caught) {
      console.error("[learn] feedback request failed", caught);
      setError(caught instanceof Error ? `${caught.message} Try again, or continue without it.` : "Your sentence couldn't be checked.");
    } finally {
      setChecking(false);
    }
  };

  const finish = (): void => {
    if (!feedback) return onDone({ correct: null, errorCard: null });
    const mistaken = !feedback.isCorrect && feedback.errorTag !== "none";
    onDone({
      correct: feedback.isCorrect && feedback.usedTarget,
      errorCard: mistaken
        ? {
            french: clipText(feedback.corrected, CARD_TEXT_MAX),
            english: clipText(feedback.translation, CARD_TEXT_MAX),
            notes: clipText(`You wrote: “${submitted}” — ${feedback.explanation}`, CARD_NOTES_MAX),
            source: "error",
          }
        : null,
    });
  };

  const checked = feedback !== null || unavailable;
  const canCheck = text.trim().length >= 2;

  return (
    <section aria-label={copy.steps.write} className="flex flex-1 flex-col">
      <StepHeading fr={write.prompt} en="Write one sentence of your own. It doesn't need to be clever — mistakes are the useful part." />

      <p className="fr-ui -mt-4 mb-6 text-sm leading-8 text-(--fr-soft)">
        Use the word <span lang={pack.id} className="fr-word text-[19px] text-(--fr-key)">{write.targetWord}</span>
        {goalContext?.expectedRegister ? (
          <span> · <span className="text-(--fr-ink)">{registerBadgeText(pack.id, goalContext.expectedRegister)}</span></span>
        ) : null}
      </p>

      {feedback ? (
        <Correction original={submitted} feedback={feedback} targetWord={write.targetWord} />
      ) : (
        <>
          <label htmlFor="fr-write" className="sr-only">
            Your sentence
          </label>
          <textarea
            id="fr-write"
            ref={field}
            lang={pack.id}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey) && canCheck && !guest && !checked) {
                event.preventDefault();
                void check();
              }
            }}
            readOnly={checked || checking}
            rows={3}
            maxLength={300}
            spellCheck={false}
            {...NO_WRITING_TOOLS}
            autoCapitalize="sentences"
            placeholder={copy.writePlaceholder}
            className="fr-field is-lined fr-hand resize-none text-[24px] leading-8"
          />

          <AccentKeys onInsert={insertAccent} disabled={checked || checking} />
        </>
      )}

      <div className="mt-6 space-y-3" aria-live="polite">
        {unavailable ? (
          <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">
            Corrections are offline for the moment. Read your sentence aloud once and compare it with today&apos;s lines.
          </p>
        ) : null}
        {guest && !checked ? (
          <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">
            Red-pen corrections come with a free account. Write it anyway — producing it is most of the work.
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="fr-ui text-[15px] leading-6 text-(--fr-mark)">
            {error}
          </p>
        ) : null}
      </div>

      <div className="mt-auto space-y-2 pt-8">
        {checked || guest ? (
          <ActionButton onClick={finish} meta="→">
            {copy.finishPage}
          </ActionButton>
        ) : (
          <>
            <ActionButton onClick={() => void check()} disabled={checking || !canCheck} meta={checking ? "" : <span className="fr-kbd">{shortcutLabel()}</span>}>
              <span className="inline-flex items-center gap-2">
                {checking ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : null}
                {checking ? copy.teacherReading : copy.correct}
              </span>
            </ActionButton>
            <QuietButton onClick={() => onDone({ correct: null, errorCard: null })} className="w-full">
              Skip writing today
            </QuietButton>
          </>
        )}
      </div>
    </section>
  );
}
