"use client";

import { useLang } from "../lang-context";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import type { Level } from "../../domain/lessons";
import type { Feedback } from "../../domain/schemas";
import { ActionButton, QuietButton, SpeakerButton, StepHeading } from "../primitives";
import { RedPen } from "../RedPen";
import { canRecognize, listenOnce, speak, type ListenHandle } from "../speech-io";

interface Props {
  readonly question: { readonly fr: string; readonly en: string };
  readonly level: Level;
  readonly guest: boolean;
  readonly onDone: () => void;
}

type Phase =
  | { readonly kind: "ready" }
  | { readonly kind: "listening" }
  | { readonly kind: "heard"; readonly transcript: string }
  | { readonly kind: "checking"; readonly transcript: string }
  | { readonly kind: "corrected"; readonly transcript: string; readonly feedback: Feedback }
  | { readonly kind: "problem"; readonly message: string };

type FeedbackResponse = { readonly available: true; readonly feedback: Feedback } | { readonly available: false };

const MAX_TRIES = 3;

/**
 * Speaking for real: a question, and the learner answers in their own words.
 * Repeating a line trains the mouth; answering trains the thing people
 * actually freeze on — building a sentence on the spot.
 */
export function AskStep({ question, level, guest, onDone }: Props): ReactElement {
  const { copy, pack } = useLang();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "ready" });
  const [tries, setTries] = useState(0);
  const handle = useRef<ListenHandle | null>(null);

  useEffect(() => {
    setSupported(canRecognize());
    speak(question.fr);
    return () => handle.current?.stop();
  }, [question.fr]);

  const correct = async (transcript: string): Promise<void> => {
    if (guest) return;
    setPhase({ kind: "checking", transcript });
    try {
      const response = await fetch(`${pack.api}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: transcript, level, mode: "spoken", question: question.fr }),
      });
      if (!response.ok) throw new Error(`Feedback request failed with ${response.status}`);
      const data = (await response.json()) as FeedbackResponse;
      setPhase(data.available ? { kind: "corrected", transcript, feedback: data.feedback } : { kind: "heard", transcript });
    } catch (error) {
      // Corrections are a bonus here: having answered aloud is the win, so fall back to just showing what was heard.
      console.error("[learn] spoken answer feedback failed", error);
      setPhase({ kind: "heard", transcript });
    }
  };

  const answer = async (): Promise<void> => {
    setPhase({ kind: "listening" });
    const listening = listenOnce();
    handle.current = listening;
    const outcome = await listening.result;
    handle.current = null;
    setTries((n) => n + 1);
    if (outcome.kind === "heard") {
      setPhase({ kind: "heard", transcript: outcome.transcript });
      void correct(outcome.transcript);
    } else if (outcome.kind === "denied") {
      setPhase({ kind: "problem", message: "Microphone access is blocked. Answer aloud anyway, then continue." });
    } else if (outcome.kind === "error") {
      setPhase({ kind: "problem", message: "The speech check isn't reachable right now. Answer aloud anyway, then continue." });
    } else {
      setPhase({ kind: "problem", message: "Nothing came through. Take a breath and try again — one short sentence is plenty." });
    }
  };

  const answered = phase.kind === "heard" || phase.kind === "corrected";
  const canRetry = tries < MAX_TRIES;

  return (
    <section aria-label={copy.steps.speak} className="flex flex-1 flex-col">
      <StepHeading fr={copy.askHeading} en="Answer in your own words. One short sentence is enough — mistakes are welcome." />

      <div className="flex items-start gap-1">
        <p lang={pack.id} className="fr-print min-w-0 flex-1 text-[28px] leading-10 text-(--fr-ink) md:text-[32px] md:leading-[44px]">
          {question.fr}
        </p>
        <SpeakerButton text={question.fr} label="Hear the question again" />
      </div>
      <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">{question.en}</p>

      <div className="fr-row mt-8 min-h-24" aria-live="polite">
        {phase.kind === "corrected" ? (
          <>
            <RedPen original={phase.transcript} corrected={phase.feedback.corrected} correct={phase.feedback.isCorrect} />
            <p className="fr-mark mt-3 text-[20px] leading-8">{phase.feedback.isCorrect ? copy.answeredWell : copy.niceTry}</p>
            <p className="fr-ui text-[15px] leading-6 text-(--fr-ink)">{phase.feedback.explanation}</p>
          </>
        ) : null}
        {phase.kind === "heard" || phase.kind === "checking" ? (
          <>
            <p className="fr-ui text-xs text-(--fr-soft)">I heard:</p>
            <p lang={pack.id} className="fr-hand text-[24px] leading-8">{phase.transcript}</p>
            {phase.kind === "checking" ? (
              <p className="fr-ui mt-2 flex items-center gap-2 text-sm text-(--fr-soft)">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" /> The teacher is listening back…
              </p>
            ) : null}
            {phase.kind === "heard" && guest ? (
              <p className="fr-ui mt-2 text-sm leading-6 text-(--fr-soft)">You answered out loud — that&apos;s the hard part. Corrections come with a free account.</p>
            ) : null}
          </>
        ) : null}
        {phase.kind === "problem" ? <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">{phase.message}</p> : null}
        {supported === false ? (
          <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">
            This browser can&apos;t listen (Chrome and Safari can). Answer out loud anyway — saying it is what counts.
          </p>
        ) : null}
      </div>

      <div className="mt-auto space-y-2 pt-8">
        {answered || supported === false || phase.kind === "problem" || (!canRetry && phase.kind !== "listening") ? (
          <ActionButton onClick={onDone} disabled={phase.kind === "checking"} meta="→">
            {copy.continue}
          </ActionButton>
        ) : (
          <ActionButton
            onClick={() => (phase.kind === "listening" ? handle.current?.stop() : void answer())}
            disabled={supported === null || phase.kind === "checking"}
            meta={phase.kind === "listening" ? "tap to stop" : "tap, then answer"}
          >
            <span className="inline-flex items-center gap-2">
              {phase.kind === "listening" ? <Square className="size-5" aria-hidden="true" /> : <Mic className="size-5" aria-hidden="true" />}
              {phase.kind === "listening" ? copy.listening : copy.answer}
            </span>
          </ActionButton>
        )}
        {(phase.kind === "corrected" || phase.kind === "heard" || phase.kind === "problem") && canRetry && supported ? (
          <QuietButton onClick={() => void answer()} className="w-full">
            Answer again
          </QuietButton>
        ) : null}
        {!answered && phase.kind !== "problem" && supported ? (
          <QuietButton onClick={onDone} className="w-full">
            I can&apos;t speak right now — skip
          </QuietButton>
        ) : null}
      </div>
    </section>
  );
}
