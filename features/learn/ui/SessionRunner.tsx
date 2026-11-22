"use client";

import { useLang } from "./lang-context";
import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { buildGap, pickTileSentence } from "../domain/exercises";
import { COMMITMENT_STEPS, toCommitment } from "../domain/commitment";
import { STAGE_SHAPE, practiceStage } from "../domain/progression";
import { MAX_SESSION_SECONDS, type SessionComplete } from "../domain/schemas";
import type { CompletePayload, SessionPayload } from "../server/service";
import { ActionButton, QuietButton, Trail, type TrailState } from "./primitives";
import { stopSpeaking } from "./speech-io";
import { LearnStep, type NewCardDto } from "./steps/LearnStep";
import { ReviewStep, type ReviewResult } from "./steps/ReviewStep";
import { SpeakStep } from "./steps/SpeakStep";
import { AskStep } from "./steps/AskStep";
import { DictationStep } from "./steps/DictationStep";
import { GapStep } from "./steps/GapStep";
import { ListenStep } from "./steps/ListenStep";
import { TilesStep } from "./steps/TilesStep";
import { WriteStep, type WriteResult } from "./steps/WriteStep";

type StepId = "review" | "learn" | "listen" | "speak" | "write" | "dictation";



interface Props {
  readonly payload: SessionPayload;
  readonly onExit: () => void;
  /** `null` for guests, whose session isn't saved. */
  readonly onComplete: (result: CompletePayload | null) => void;
}


export function SessionRunner({ payload, onExit, onComplete }: Props): ReactElement {
  const { copy, pack } = useLang();
  const reduceMotion = useReducedMotion();
  // The core page is the same for everyone; a bigger daily commitment adds real-speed listening and dictation.
  const extras = COMMITMENT_STEPS[toCommitment(payload.profile.dailyMinutes)];
  const steps = useMemo<readonly StepId[]>(
    () => [
      ...(payload.due.length > 0 ? (["review"] as const) : []),
      "learn",
      ...(extras.listen ? (["listen"] as const) : []),
      "speak",
      "write",
      ...(extras.dictation ? (["dictation"] as const) : []),
    ],
    [payload.due.length, extras.listen, extras.dictation]
  );

  // Support shrinks as the learner advances: shorter scene, English shown and word tiles at first; free writing later.
  const stage = practiceStage(payload.profile.level, payload.streak.totalCompletions);
  const shape = STAGE_SHAPE[stage];
  const lesson = useMemo(
    () => ({ ...payload.lesson, sentences: payload.lesson.sentences.slice(0, shape.sentences), vocab: payload.lesson.vocab.slice(0, shape.newWords) }),
    [payload.lesson, shape.sentences, shape.newWords]
  );
  const gap = useMemo(() => (shape.write === "tiles" ? null : buildGap(payload.lesson, pack.articles)), [shape.write, payload.lesson]);
  // Free writing needs the AI corrector, which guests don't get — give them the checkable exercise instead.
  const writeMode = shape.write === "free" && payload.guest ? (gap ? "gap" : "tiles") : shape.write === "gap" && !gap ? "tiles" : shape.write;

  // A mid-length line that isn't the one already repeated aloud.
  const dictationSentence = useMemo(() => {
    const words = (fr: string): number => fr.split(/\s+/).length;
    const candidates = payload.lesson.sentences.filter((s) => s.fr !== payload.lesson.shadow.fr && words(s.fr) >= 4 && words(s.fr) <= 12);
    return candidates[candidates.length - 1] ?? payload.lesson.shadow;
  }, [payload.lesson]);

  const [stepIndex, setStepIndex] = useState(0);
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  const [reviews, setReviews] = useState<readonly ReviewResult[]>([]);
  const [newCards, setNewCards] = useState<readonly NewCardDto[]>([]);
  const [speakScore, setSpeakScore] = useState<number | null>(null);
  const [writeResult, setWriteResult] = useState<WriteResult | null>(null);

  const [pending, setPending] = useState<SessionComplete | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const startedAt = useRef(Date.now());
  // One id per session: a retried save is recognised server-side, never double-applied.
  const clientSessionId = useRef(crypto.randomUUID());


  useEffect(() => {
    // Each step starts at the top of the page, like turning to it.
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    return stopSpeaking;
  }, [stepIndex, reduceMotion]);

  // Closing the tab mid-session loses the work; let the browser ask first.
  const hasProgress = stepIndex > 0 || pending !== null;
  useEffect(() => {
    if (!hasProgress) return;
    const warn = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasProgress]);

  const step = steps[stepIndex];
  // Advance only from the step that finished: a double-tap on a step's last button would otherwise skip the next step.
  const advanceFrom = (from: StepId): void =>
    setStepIndex((index) => (steps[index] === from ? Math.min(index + 1, steps.length - 1) : index));

  const save = async (body: SessionComplete): Promise<void> => {
    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`${pack.api}/session/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as CompletePayload | { error?: string };
      if (!response.ok) throw new Error("error" in data && data.error ? data.error : "Your session couldn't be saved.");
      onComplete(data as CompletePayload);
    } catch (caught) {
      console.error("[learn] session save failed", caught);
      setSaveError(caught instanceof Error ? caught.message : "Your session couldn't be saved.");
    } finally {
      setSaving(false);
    }
  };

  const afterWrite = (write: WriteResult): void => {
    if (steps.includes("dictation")) {
      setWriteResult(write);
      advanceFrom("write");
      return;
    }
    finish(write, null);
  };

  const finished = useRef(false);
  const finish = (write: WriteResult, dictationCard: NewCardDto | null): void => {
    if (finished.current) return;
    finished.current = true;
    const allNewCards = [...newCards, ...(write.errorCard ? [write.errorCard] : []), ...(dictationCard ? [dictationCard] : [])];
    if (payload.guest) {
      onComplete(null);
      return;
    }
    const body: SessionComplete = {
      clientSessionId: clientSessionId.current,
      timezone: payload.profile.timezone,
      durationSeconds: Math.min(MAX_SESSION_SECONDS, Math.max(1, Math.round((Date.now() - startedAt.current) / 1000))),
      reviews: [...reviews],
      newCards: allNewCards.map((card) => ({ ...card })),
      speakScore,
      writingCorrect: write.correct,
    };
    setPending(body);
    void save(body);
  };

  const trail = steps.map((id, i) => ({
    label: copy.steps[id],
    state: (i < stepIndex ? "done" : i === stepIndex ? "current" : "todo") as TrailState,
  }));

  return (
    <div className="fr-sheet">
      <header className="fr-head flex min-h-12 items-center justify-between gap-3 pb-1">
        <p className="fr-hand text-[19px] leading-8">
          {copy.steps[step]} <span className="fr-ui text-xs font-normal text-(--fr-soft) not-italic">· {stepIndex + 1} / {steps.length}</span>
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setConfirmingLeave(true)}
            aria-label="Leave session"
            className="grid size-11 place-items-center rounded-full text-(--fr-soft) transition-colors hover:text-(--fr-ink)"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="fr-trail-slot">
        <Trail items={trail} />
      </div>

      {confirmingLeave ? (
        <div role="alertdialog" aria-labelledby="fr-leave" className="fr-enter mt-4 border-y border-(--fr-rule) py-4">
          <p id="fr-leave" className="fr-ui text-[15px] leading-6 text-(--fr-ink)">
            Leave this page? What you&apos;ve done in this session won&apos;t be saved.
          </p>
          <div className="mt-2 flex gap-6">
            <QuietButton onClick={() => setConfirmingLeave(false)} autoFocus>
              Keep going
            </QuietButton>
            <QuietButton onClick={onExit}>Leave</QuietButton>
          </div>
        </div>
      ) : null}

      <main className="flex flex-1 flex-col pt-8">
        {saving || pending ? (
          <div role="status" className="flex flex-1 flex-col justify-center py-16">
            {saveError ? (
              <>
                <p className="fr-print text-[28px] font-semibold leading-8 text-(--fr-ink)">Not saved yet.</p>
                <p role="alert" className="fr-ui mt-2 text-[15px] leading-6 text-(--fr-soft)">
                  {saveError} Your answers are still here — try again, it won&apos;t count twice.
                </p>
                <div className="mt-8 space-y-2">
                  <ActionButton onClick={() => pending && void save(pending)} disabled={saving} meta="→">
                    Try saving again
                  </ActionButton>
                  <QuietButton onClick={onExit} className="w-full">
                    Discard this session
                  </QuietButton>
                </div>
              </>
            ) : (
              <div className="text-center">
                <Loader2 className="mx-auto size-7 animate-spin text-(--fr-key)" aria-hidden="true" />
                <p className="fr-hand mt-4 text-[20px] leading-8">On range la page…</p>
                <p className="fr-ui text-sm text-(--fr-soft)">Saving your session</p>
              </div>
            )}
          </div>
        ) : (
          // popLayout: the next step mounts immediately; a stalled exit animation (backgrounded tab, slow device) can never block it.
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={step}
              className="flex flex-1 flex-col"
              initial={reduceMotion ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === "review" ? (
                <ReviewStep
                  cards={payload.due}
                  onDone={(results) => {
                    setReviews(results);
                    advanceFrom("review");
                  }}
                />
              ) : null}
              {step === "learn" ? (
                <LearnStep
                  lesson={lesson}
                  englishShown={shape.englishShown}
                  onDone={(cards) => {
                    setNewCards(cards);
                    advanceFrom("learn");
                  }}
                />
              ) : null}
              {step === "listen" ? <ListenStep lesson={lesson} seed={payload.today} onDone={() => advanceFrom("listen")} /> : null}
              {step === "speak" ? (
                // Stage 1 repeats a line (mouth training); from stage 2 the learner answers a question in their own words.
                stage === 1 ? (
                  <SpeakStep
                    line={payload.lesson.shadow}
                    onDone={(score) => {
                      setSpeakScore(score);
                      advanceFrom("speak");
                    }}
                  />
                ) : (
                  <AskStep question={payload.lesson.ask ?? copy.fallbackQuestion} level={payload.profile.level} guest={payload.guest} onDone={() => advanceFrom("speak")} />
                )
              ) : null}
              {step === "write" ? (
                writeMode === "tiles" ? (
                  <TilesStep sentence={pickTileSentence(payload.lesson)} seed={payload.today} onDone={afterWrite} />
                ) : writeMode === "gap" && gap ? (
                  <GapStep gap={gap} onDone={afterWrite} />
                ) : (
                  <WriteStep write={payload.lesson.write} level={payload.profile.level} guest={payload.guest} onDone={afterWrite} />
                )
              ) : null}
              {step === "dictation" ? (
                <DictationStep
                  sentence={dictationSentence}
                  onDone={(card) => finish(writeResult ?? { correct: null, errorCard: null }, card)}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
