"use client";

import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { Keyboard, Mic, Snail, Square } from "lucide-react";
import { diffWords } from "../../domain/diff";
import { meaningOf, normaliseWord, type WordMeaning } from "../../domain/glossary";
import type { Lesson } from "../../domain/lessons";
import { compareSpoken, type SpokenComparison } from "../../domain/speech";
import { registerBadgeText } from "../../domain/tracks";
import { AccentKeys, insertAtCaret } from "../AccentKeys";
import { useLang } from "../lang-context";
import { NO_WRITING_TOOLS, ActionButton, QuietButton, SpeakerButton } from "../primitives";
import { RedPen } from "../RedPen";
import { canRecognize, listenOnce, speak, type ListenHandle } from "../speech-io";

export interface NewCardDto {
  readonly french: string;
  readonly english: string;
  readonly notes?: string;
  readonly source: "lesson" | "error";
}

interface Props {
  readonly lesson: Lesson;
  /** Stage 1 shows the English under each line; later stages hide it behind a tap. */
  readonly englishShown: boolean;
  readonly onDone: (newCards: readonly NewCardDto[]) => void;
}

/** How the learner proved they took the line in. Every line needs one before moving on. */
type Practice =
  | { readonly kind: "none" }
  | { readonly kind: "listening" }
  | { readonly kind: "spoken"; readonly result: SpokenComparison }
  | { readonly kind: "typing"; readonly text: string }
  | { readonly kind: "typed"; readonly text: string; readonly exact: boolean }
  | { readonly kind: "mic-problem"; readonly message: string };

const isPracticed = (p: Practice): boolean => p.kind === "spoken" || p.kind === "typed";

/**
 * Comprehensible input, then output, one line at a time:
 * hear it → understand it (tap any word) → say it back or type it from memory.
 * Listening alone feels like learning; producing the line is what makes it stick.
 */
export function LearnStep({ lesson, englishShown, onDone }: Props): ReactElement {
  const { copy, pack } = useLang();
  const [index, setIndex] = useState(0);
  const [englishOpen, setEnglishOpen] = useState(englishShown);
  const [picked, setPicked] = useState<{ readonly token: string; readonly meaning: WordMeaning | null } | null>(null);
  const [practice, setPractice] = useState<Practice>({ kind: "none" });
  const [micSupported, setMicSupported] = useState(false);
  const listening = useRef<ListenHandle | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  const reviewingWords = index >= lesson.sentences.length;
  const sentence = lesson.sentences[index];

  useEffect(() => {
    setMicSupported(canRecognize());
    return () => listening.current?.stop();
  }, []);

  useEffect(() => {
    if (sentence) speak(sentence.fr);
    setEnglishOpen(englishShown);
    setPicked(null);
    setPractice({ kind: "none" });
  }, [sentence, englishShown]);

  const cards = useMemo(
    () => lesson.vocab.map((word) => ({ french: word.fr, english: word.en, notes: word.note, source: "lesson" as const })),
    [lesson.vocab]
  );

  if (reviewingWords) {
    return (
      <section aria-label={copy.steps.learn} className="fr-enter flex flex-1 flex-col">
        <header className="mb-6">
          <h2 lang={pack.id} className="fr-print text-[28px] font-semibold leading-8 text-(--fr-ink) md:text-[36px] md:leading-[44px]">
            {copy.wordsToKeep}
          </h2>
          <p className="fr-ui mt-2 text-[15px] leading-6 text-(--fr-soft)">You&apos;ll see these again tomorrow, then less and less often.</p>
        </header>
        <dl>
          {lesson.vocab.map((word) => (
            <div key={word.fr} className="flex items-baseline gap-x-3 border-b border-(--fr-rule) py-2 last:border-b-0">
              <dt className="shrink-0">
                <button type="button" onClick={() => speak(word.fr)} lang={pack.id} className="fr-word text-[22px] leading-8">
                  {word.fr}
                </button>
              </dt>
              <dd className="fr-ui min-w-0 text-[15px] leading-6 text-(--fr-ink)">
                {word.en}
                {word.note ? <span className="text-(--fr-soft)"> — {word.note}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto pt-10">
          <ActionButton onClick={() => onDone(cards)} meta="→">
            {copy.keepWords}
          </ActionButton>
        </div>
      </section>
    );
  }

  const isLast = index === lesson.sentences.length - 1;
  const hidden = practice.kind === "typing";
  const done = isPracticed(practice);

  const sayBack = async (): Promise<void> => {
    setPractice({ kind: "listening" });
    const handle = listenOnce();
    listening.current = handle;
    const outcome = await handle.result;
    listening.current = null;
    if (outcome.kind === "heard") setPractice({ kind: "spoken", result: compareSpoken(sentence.fr, outcome.transcript) });
    else if (outcome.kind === "nothing") setPractice({ kind: "mic-problem", message: "Nothing came through. Try again, or type it instead." });
    else setPractice({ kind: "mic-problem", message: "The microphone isn't available here. Type the line from memory instead." });
  };

  const insertAccent = (char: string): void => {
    if (practice.kind !== "typing") return;
    const { next, caret } = insertAtCaret(field.current, practice.text, char, 240);
    setPractice({ kind: "typing", text: next });
    requestAnimationFrame(() => {
      field.current?.focus();
      field.current?.setSelectionRange(caret, caret);
    });
  };

  const checkTyped = (): void => {
    if (practice.kind !== "typing") return;
    const exact = diffWords(practice.text, sentence.fr).every((token) => token.kind === "same");
    setPractice({ kind: "typed", text: practice.text, exact });
  };

  // Words of the line: each is tappable for its meaning; today's new words are underlined.
  const tokens = sentence.fr.split(/\s+/).filter(Boolean);
  const spokenWords = practice.kind === "spoken" ? practice.result.words : null;

  return (
    <section aria-label={copy.steps.learn} className="flex flex-1 flex-col">
      <header className="mb-8 flex items-baseline justify-between gap-4">
        <div>
          <h2 lang={pack.id} className="fr-print text-[22px] font-semibold leading-8 text-(--fr-ink) md:text-[28px]">
            {lesson.title}
          </h2>
          {lesson.contextBrief || lesson.register ? (
            <p className="fr-ui mt-1 text-xs leading-5 text-(--fr-soft)">
              {lesson.contextBrief ? <span>{lesson.contextBrief}</span> : null}
              {lesson.contextBrief && lesson.register ? " · " : null}
              {lesson.register ? <span className="text-(--fr-ink)">{registerBadgeText(pack.id, lesson.register)}</span> : null}
            </p>
          ) : null}
        </div>
        <p className="fr-ui shrink-0 text-xs tabular-nums text-(--fr-soft)" aria-label={`Line ${index + 1} of ${lesson.sentences.length}`}>
          {index + 1} / {lesson.sentences.length}
        </p>
      </header>

      <div key={index} className="fr-enter fr-row">
        <span className="fr-note leading-10">{index + 1}</span>

        {hidden ? (
          <p className="fr-ui text-[15px] leading-10 text-(--fr-soft)">The line is hidden — write what you heard.</p>
        ) : (
          <p lang={pack.id} className="fr-print text-[28px] leading-10 tracking-[-0.01em] text-(--fr-ink) [text-wrap:pretty] md:text-[34px] md:leading-[48px]">
            {tokens.map((token, i) => {
              const meaning = meaningOf(token, lesson.vocab, sentence.gloss);
              // By position when the comparison kept the line's shape (repeated words stay distinct), else by word.
              const heard =
                spokenWords && spokenWords.length === tokens.length ? spokenWords[i] : spokenWords?.find((w) => normaliseWord(w.word) === normaliseWord(token));
              const missed = spokenWords !== null && heard !== undefined && !heard.matched;
              return (
                <span key={i}>
                  <button
                    type="button"
                    onClick={() => {
                      setPicked({ token, meaning });
                      speak(meaning?.phrase ?? token);
                    }}
                    className={`rounded-sm transition-colors hover:bg-[color-mix(in_srgb,var(--fr-key)_10%,transparent)] ${
                      meaning?.isNew ? "fr-word underline decoration-(--fr-key)/50 decoration-2 underline-offset-[6px]" : ""
                    } ${missed ? "text-(--fr-mark) underline decoration-(--fr-mark) decoration-wavy decoration-2 underline-offset-[6px]" : ""}`}
                  >
                    {token}
                  </button>{" "}
                </span>
              );
            })}
          </p>
        )}

        <div className="mt-2 min-h-8" aria-live="polite">
          {picked && !hidden ? (
            <p className="fr-ui text-[15px] leading-6">
              <span lang={pack.id} className="fr-word font-bold">
                {picked.meaning?.phrase ?? picked.token}
              </span>{" "}
              <span className="text-(--fr-ink)">— {picked.meaning?.meaning ?? "see the English for the whole line"}</span>
              {picked.meaning?.note ? <span className="text-(--fr-soft)"> · {picked.meaning.note}</span> : null}
            </p>
          ) : null}
          {!hidden && englishOpen ? <p className="fr-hand text-[20px] leading-8">{sentence.en}</p> : null}
          {!hidden && !englishOpen ? <QuietButton onClick={() => setEnglishOpen(true)}>Show the English</QuietButton> : null}
        </div>

        <div className="mt-1 flex items-center gap-1">
          <SpeakerButton text={sentence.fr} label="Hear it again" />
          <button type="button" onClick={() => speak(sentence.fr, 0.6)} className="fr-quiet">
            <Snail className="size-4" aria-hidden="true" /> Slowly
          </button>
        </div>
        {index === 0 && practice.kind === "none" ? (
          <p className="fr-ui mt-1 text-xs leading-5 text-(--fr-soft)">Tap any word for its meaning. Underlined words are new.</p>
        ) : null}
      </div>

      {/* Practice: the line has to come back out of the learner before moving on. */}
      <div className="mt-6" aria-live="polite">
        {practice.kind === "typing" ? (
          <>
            <label htmlFor="fr-echo" className="sr-only">
              Type the line from memory
            </label>
            <textarea
              id="fr-echo"
              ref={field}
              lang={pack.id}
              autoFocus
              value={practice.text}
              onChange={(event) => setPractice({ kind: "typing", text: event.target.value.slice(0, 240) })}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && practice.text.trim()) {
                  event.preventDefault();
                  checkTyped();
                }
              }}
              rows={2}
              spellCheck={false}
              {...NO_WRITING_TOOLS}
              autoCapitalize="sentences"
              placeholder={copy.dictationPlaceholder}
              className="fr-field is-lined fr-hand resize-none text-[22px] leading-8"
            />
            <AccentKeys onInsert={insertAccent} />
          </>
        ) : null}

        {practice.kind === "typed" ? (
          <div className="fr-row">
            <RedPen original={practice.text} corrected={sentence.fr} correct={practice.exact} />
            <p className="fr-mark mt-1 text-[20px] leading-8">{practice.exact ? copy.perfect : copy.almost}</p>
          </div>
        ) : null}

        {practice.kind === "spoken" ? (
          <p className="fr-mark text-[20px] leading-8">
            {practice.result.score >= 0.7 ? copy.saidWell : copy.almost}{" "}
            <span className="fr-ui text-sm font-bold">{Math.round(practice.result.score * 100)} %</span>
            {practice.result.score < 0.7 ? <span className="fr-ui block text-sm font-normal text-(--fr-soft)">Red words weren&apos;t heard. One more go?</span> : null}
          </p>
        ) : null}

        {practice.kind === "mic-problem" ? <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">{practice.message}</p> : null}

        {practice.kind !== "typing" ? (
          <div className="flex flex-wrap gap-2">
            {micSupported ? (
              <button
                type="button"
                onClick={() => (practice.kind === "listening" ? listening.current?.stop() : void sayBack())}
                className="fr-outline fr-ui gap-2"
                aria-label={practice.kind === "listening" ? "Stop listening" : undefined}
              >
                {practice.kind === "listening" ? <Square className="size-4" aria-hidden="true" /> : <Mic className="size-4" aria-hidden="true" />}
                {practice.kind === "listening" ? copy.listening : copy.sayBack}
              </button>
            ) : null}
            {practice.kind !== "listening" ? (
              <button type="button" onClick={() => setPractice({ kind: "typing", text: "" })} className="fr-outline fr-ui gap-2">
                <Keyboard className="size-4" aria-hidden="true" /> {copy.typeBack}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-auto flex items-center gap-4 pt-8">
        {index > 0 ? (
          <QuietButton onClick={() => setIndex(index - 1)} aria-label="Previous line">
            ←
          </QuietButton>
        ) : null}
        {practice.kind === "typing" ? (
          <ActionButton onClick={checkTyped} disabled={!practice.text.trim()} meta="↵">
            {copy.check}
          </ActionButton>
        ) : (
          <ActionButton
            onClick={() => setIndex(index + 1)}
            disabled={!done}
            meta={done ? (isLast ? "→" : `${lesson.sentences.length - index - 1} left`) : micSupported ? "say or type it first" : "type it first"}
          >
            {isLast ? copy.seeWords : copy.next}
          </ActionButton>
        )}
      </div>
    </section>
  );
}
