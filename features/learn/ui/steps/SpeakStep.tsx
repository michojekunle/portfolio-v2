"use client";

import { useLang } from "../lang-context";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { Mic, Snail, Square } from "lucide-react";
import { SPEAK_PASS_SCORE, compareSpoken, type SpokenComparison } from "../../domain/speech";
import { ActionButton, QuietButton, SpeakerButton, StepHeading } from "../primitives";
import { canRecognize, listenOnce, speak, type ListenHandle } from "../speech-io";

interface Props {
  readonly line: { readonly fr: string; readonly en: string };
  /** `null` when the browser cannot recognise speech or the learner skipped. */
  readonly onDone: (bestScore: number | null) => void;
}

const MAX_ATTEMPTS = 3;

type Phase = "idle" | "listening" | "scored" | "denied" | "nothing" | "unavailable";

/** Shadowing: hear it, say it, see which words were actually heard. */
export function SpeakStep({ line, onDone }: Props): ReactElement {
  const { copy, pack } = useLang();
  // Feature detection must wait for the browser; the server can't know.
  const [supported, setSupported] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [comparison, setComparison] = useState<SpokenComparison | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const handle = useRef<ListenHandle | null>(null);

  useEffect(() => {
    setSupported(canRecognize());
    return () => handle.current?.stop();
  }, []);

  const attempt = async (): Promise<void> => {
    setPhase("listening");
    const listening = listenOnce();
    handle.current = listening;
    const outcome = await listening.result;
    handle.current = null;

    if (outcome.kind === "denied") return setPhase("denied");
    if (outcome.kind === "error") {
      // e.g. "network": Chrome's recognizer needs its server. Retrying won't help.
      console.warn("[learn] speech recognition error", outcome.message);
      return setPhase("unavailable");
    }
    if (outcome.kind !== "heard") return setPhase("nothing");

    const next = compareSpoken(line.fr, outcome.transcript);
    setComparison(next);
    setAttempts((count) => count + 1);
    setBest((previous) => (previous === null ? next.score : Math.max(previous, next.score)));
    setPhase("scored");
  };

  const passed = best !== null && best >= SPEAK_PASS_SCORE;
  const outOfAttempts = attempts >= MAX_ATTEMPTS;
  const finished = passed || outOfAttempts || phase === "denied" || phase === "unavailable" || supported === false;

  const verdict = (() => {
    if (phase === "scored" && passed) return { mark: copy.saidWell, detail: "Clear enough to be understood. On to writing." };
    if (phase === "scored") return { mark: copy.almost, detail: "Underlined words weren't heard. Listen slowly, then go again." };
    if (phase === "nothing") return { mark: copy.heardNothing, detail: "Nothing came through. Check your mic and try once more." };
    if (phase === "unavailable")
      return { mark: copy.noCheck, detail: "The pronunciation check isn't reachable right now. Say the line aloud three times, then continue." };
    if (phase === "denied") return { mark: copy.micBlocked, detail: "Allow the microphone in your browser settings — or say it aloud anyway and continue." };
    return null;
  })();

  return (
    <section aria-label={copy.steps.speak} className="flex flex-1 flex-col">
      <StepHeading fr={copy.speakHeading} en="Listen once, then say it out loud. Copy the rhythm and melody, not just the words." />

      <div className="fr-row">
        <p lang={pack.id} className="fr-print text-[30px] leading-10 tracking-[-0.01em] text-(--fr-ink) [text-wrap:pretty]">
          {comparison
            ? comparison.words.map((word, i) => (
                <span
                  key={i}
                  className={word.matched ? "" : "text-(--fr-mark) underline decoration-(--fr-mark) decoration-wavy decoration-2 underline-offset-[6px]"}
                >
                  {word.word}{" "}
                </span>
              ))
            : line.fr}
        </p>
        <p className="fr-hand mt-2 text-[20px] leading-8">{line.en}</p>

        <div className="mt-3 flex gap-1">
          <SpeakerButton text={line.fr} label="Hear it at normal speed" />
          <button type="button" onClick={() => speak(line.fr, 0.6)} className="fr-quiet">
            <Snail className="size-4" aria-hidden="true" /> Slowly
          </button>
        </div>
      </div>

      <div className="mt-6 min-h-16" aria-live="polite">
        {verdict ? (
          <div className="fr-enter">
            <p className="fr-mark text-[22px] leading-8">
              {verdict.mark} {phase === "scored" && best !== null ? <span className="fr-ui text-sm font-bold">{Math.round(best * 100)} %</span> : null}
            </p>
            <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">{verdict.detail}</p>
          </div>
        ) : null}
        {supported === false ? (
          <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">
            This browser can&apos;t check pronunciation (Chrome and Safari can). Say the line aloud three times anyway — speaking is the point.
          </p>
        ) : null}
        {supported && attempts > 0 && !finished ? (
          <p className="fr-ui text-xs text-(--fr-soft)">
            Try {attempts + 1} of {MAX_ATTEMPTS}
          </p>
        ) : null}
      </div>

      <div className="mt-auto space-y-2 pt-8">
        {finished ? (
          <ActionButton onClick={() => onDone(best)} meta="→">
            {copy.continue}
          </ActionButton>
        ) : (
          <ActionButton
            onClick={() => (phase === "listening" ? handle.current?.stop() : void attempt())}
            disabled={supported === null}
            aria-label={phase === "listening" ? "Stop listening" : undefined}
            meta={phase === "listening" ? "tap to stop" : "tap, then speak"}
          >
            <span className="inline-flex items-center gap-2">
              {phase === "listening" ? <Square className="size-5" aria-hidden="true" /> : <Mic className="size-5" aria-hidden="true" />}
              {phase === "listening" ? copy.listening : attempts === 0 ? copy.sayIt : copy.sayAgain}
            </span>
          </ActionButton>
        )}
        {!finished ? (
          <QuietButton onClick={() => onDone(best)} className="w-full">
            {attempts > 0 ? "Good enough — continue" : "I can't speak right now — skip"}
          </QuietButton>
        ) : null}
      </div>
    </section>
  );
}
