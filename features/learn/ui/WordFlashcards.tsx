"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type ReactElement } from "react";
import { ArrowLeftRight, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { TRACKS, registerBadgeText } from "../domain/tracks";
import type { WordDto } from "../server/service";
import { useLang } from "./lang-context";
import { ActionButton, OutlineButton, QuietButton, SpeakerButton } from "./primitives";
import { speak } from "./speech-io";
import { clampCardIndex, orderDeck, shuffleWordIds } from "./words-deck";

const STRENGTH_LABEL: Record<WordDto["strength"], string> = {
  new: "new",
  learning: "learning",
  known: "known",
};

interface Props {
  readonly words: readonly WordDto[];
  readonly resetKey: string;
  readonly busyId: string | null;
  readonly onAction: (word: WordDto, action: "known" | "again") => Promise<void>;
}

/**
 * Tactile flashcard deck over the learner's filtered words.
 * Supports card flipping, front-side swapping, shuffling, swipe gestures, and keyboard shortcuts.
 */
export function WordFlashcards({ words, resetKey, busyId, onAction }: Props): ReactElement {
  const { pack } = useLang();
  const [index, setIndex] = useState(0);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const [shuffledIds, setShuffledIds] = useState<readonly string[] | null>(null);
  const [frontSide, setFrontSide] = useState<"target" | "english">("target");

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setIndex(0);
    setFlippedId(null);
  }

  const frontBtnRef = useRef<HTMLButtonElement>(null);
  const backBtnRef = useRef<HTMLButtonElement>(null);
  const swipeStart = useRef<{ readonly x: number; readonly y: number } | null>(null);
  const suppressClick = useRef(false);

  const deck = useMemo(() => orderDeck(words, shuffledIds), [words, shuffledIds]);
  const safeIndex = clampCardIndex(index, deck.length);
  const card = deck[safeIndex];
  const flipped = card !== undefined && flippedId === card.id;

  const toggleFlip = useCallback(
    (source: "front" | "back" | "button" | "keyboard"): void => {
      if (suppressClick.current) {
        suppressClick.current = false;
        return;
      }
      if (!card) return;
      const nextFlipped = flippedId !== card.id;
      setFlippedId(nextFlipped ? card.id : null);
      if (source === "front" && nextFlipped) {
        requestAnimationFrame(() => backBtnRef.current?.focus());
      } else if (source === "back" && !nextFlipped) {
        requestAnimationFrame(() => frontBtnRef.current?.focus());
      }
    },
    [card, flippedId]
  );

  const step = useCallback(
    (delta: -1 | 1, preserveCardFocus = false): void => {
      if (deck.length === 0) return;
      const nextIndex = clampCardIndex(safeIndex + delta, deck.length);
      if (nextIndex === safeIndex) return;
      setIndex(nextIndex);
      setFlippedId(null);
      if (preserveCardFocus) {
        requestAnimationFrame(() => frontBtnRef.current?.focus());
      }
    },
    [deck.length, safeIndex]
  );

  const shuffle = (): void => {
    setShuffledIds(shuffleWordIds(words));
    setIndex(0);
    setFlippedId(null);
  };

  const swapDirection = (): void => {
    setFrontSide((prev) => (prev === "target" ? "english" : "target"));
    setFlippedId(null);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!card) return;
      if (
        event.target instanceof HTMLElement &&
        (/input|textarea|select/i.test(event.target.tagName) || event.target.closest('[role="radiogroup"]'))
      ) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const onCardFace =
        event.target === frontBtnRef.current || event.target === backBtnRef.current;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1, onCardFace);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1, onCardFace);
      } else if (event.key === " " || event.key === "Enter") {
        // Native buttons handle their own Space/Enter activation.
        if (event.target instanceof HTMLButtonElement) return;
        event.preventDefault();
        toggleFlip("keyboard");
      } else if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        speak(card.text);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [card, step, toggleFlip]);

  if (!card) return <></>;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType !== "touch") return;
    swipeStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType !== "touch" || !swipeStart.current) return;
    const dx = event.clientX - swipeStart.current.x;
    const dy = event.clientY - swipeStart.current.y;
    swipeStart.current = null;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      suppressClick.current = true;
      step(dx < 0 ? 1 : -1);
    }
  };

  const onPointerCancel = (): void => {
    swipeStart.current = null;
  };

  const frontText = frontSide === "target" ? card.text : card.english;
  const backText = frontSide === "target" ? card.english : card.text;
  const progressPercent = ((safeIndex + 1) / deck.length) * 100;

  return (
    <div className="fr-enter mt-2 flex flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <p className="fr-ui text-xs font-bold tabular-nums text-(--fr-soft)">
          Card {safeIndex + 1} of {deck.length}
        </p>
        <div className="flex items-center gap-3">
          <QuietButton
            onClick={swapDirection}
            aria-label={`Switch front side. Currently ${frontSide === "target" ? `${pack.name} first` : "English first"}`}
            className="text-xs"
          >
            <ArrowLeftRight className="size-3.5" aria-hidden="true" />
            {frontSide === "target" ? `${pack.name} → English` : `English → ${pack.name}`}
          </QuietButton>
          {deck.length > 1 ? (
            <QuietButton onClick={shuffle} className="text-xs">
              <Shuffle className="size-3.5" aria-hidden="true" /> Shuffle
            </QuietButton>
          ) : null}
        </div>
      </div>

      <div className="mb-4 h-0.5 w-full overflow-hidden rounded-full bg-(--fr-rule)" aria-hidden="true">
        <div
          className="h-full rounded-full bg-(--fr-key) transition-[width] duration-200 motion-reduce:transition-none"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div
        key={card.id}
        className="fr-flashcard-scene fr-enter relative"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {frontSide === "target" || flipped ? (
          <div className="absolute right-2 top-1 z-10">
            <SpeakerButton text={card.text} label={`Hear “${card.text}”`} />
          </div>
        ) : null}

        <div className={`fr-flashcard-inner ${flipped ? "is-flipped" : ""}`}>
          <button
            ref={frontBtnRef}
            type="button"
            onClick={() => toggleFlip("front")}
            inert={flipped || undefined}
            aria-hidden={flipped || undefined}
            aria-label={`Show answer for ${frontText}`}
            className="fr-flashcard-face fr-flashcard-front"
          >
            <div className="fr-flashcard-rule flex min-h-13 w-full items-center justify-between gap-2 px-4 py-2 pr-14 text-left">
              <span className="fr-ui text-xs text-(--fr-soft)">
                {STRENGTH_LABEL[card.strength]}
                {card.source === "error"
                  ? " · from a correction"
                  : card.source === "custom"
                    ? " · your line"
                    : card.source === "starter" && card.track
                      ? ` · ${TRACKS[card.track].label}`
                      : ""}
                {card.register ? ` · ${registerBadgeText(pack.id, card.register)}` : ""}
              </span>
              <span className="fr-ui text-[11px] font-bold uppercase tracking-wider text-(--fr-soft)">
                {frontSide === "target" ? pack.name : "English"}
              </span>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
              {frontSide === "target" ? (
                <span
                  lang={pack.id}
                  className="fr-word block text-[32px] leading-[40px] tracking-[-0.02em] [overflow-wrap:anywhere] sm:text-[40px] sm:leading-[48px]"
                >
                  {card.text}
                </span>
              ) : (
                <span className="fr-hand block text-[26px] leading-[34px] [overflow-wrap:anywhere] sm:text-[32px] sm:leading-[40px]">
                  {card.english}
                </span>
              )}
            </div>

            <div className="px-4 pb-4">
              <span className="fr-ui text-xs text-(--fr-soft)">
                Tap card <span className="fr-kbd">or press Space</span> to flip
              </span>
            </div>
          </button>

          <button
            ref={backBtnRef}
            type="button"
            onClick={() => toggleFlip("back")}
            inert={!flipped || undefined}
            aria-hidden={!flipped || undefined}
            aria-label={`Show prompt for ${backText}`}
            className="fr-flashcard-face fr-flashcard-back"
          >
            <div className="fr-flashcard-rule flex min-h-13 w-full items-center justify-between gap-2 px-4 py-2 pr-14 text-left">
              <span
                lang={frontSide === "target" ? pack.id : undefined}
                className="fr-ui min-w-0 truncate text-xs text-(--fr-soft)"
              >
                {frontText}
              </span>
              <span className="fr-ui shrink-0 text-[11px] font-bold uppercase tracking-wider text-(--fr-key)">
                {frontSide === "target" ? "English" : pack.name}
              </span>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
              {frontSide === "target" ? (
                <span className="fr-hand block text-[26px] leading-[34px] [overflow-wrap:anywhere] sm:text-[32px] sm:leading-[40px]">
                  {card.english}
                </span>
              ) : (
                <span
                  lang={pack.id}
                  className="fr-word block text-[32px] leading-[40px] tracking-[-0.02em] [overflow-wrap:anywhere] sm:text-[38px] sm:leading-[46px]"
                >
                  {card.text}
                </span>
              )}
              {card.notes ? (
                <span className="fr-ui mt-3 block max-w-[38ch] text-sm leading-6 text-(--fr-soft) [overflow-wrap:anywhere]">
                  {card.notes}
                </span>
              ) : null}
            </div>

            <div className="px-4 pb-4">
              <span className="fr-ui text-xs text-(--fr-soft)">Tap to flip back</span>
            </div>
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {flipped
          ? `${frontSide === "target" ? "English" : pack.name}: ${backText}${card.notes ? `. ${card.notes}` : ""}`
          : `Card ${safeIndex + 1} of ${deck.length}: ${frontText}`}
      </p>

      <div className="mt-5 flex items-center gap-2">
        <OutlineButton
          onClick={() => step(-1)}
          disabled={safeIndex === 0}
          aria-label="Previous card"
          className="min-w-12 px-3 disabled:opacity-40"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </OutlineButton>
        <ActionButton compact onClick={() => toggleFlip("button")} className="flex-1">
          {flipped ? "Flip back" : "Flip card"}
        </ActionButton>
        <OutlineButton
          onClick={() => step(1)}
          disabled={safeIndex >= deck.length - 1}
          aria-label="Next card"
          className="min-w-12 px-3 disabled:opacity-40"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </OutlineButton>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="fr-ui fr-kbd text-xs text-(--fr-soft)" aria-hidden="true">
          ← → step · Space flip · S hear
        </p>
        <QuietButton
          onClick={() => void onAction(card, card.strength === "known" ? "again" : "known")}
          disabled={busyId === card.id}
          className="ml-auto text-xs"
        >
          {card.strength === "known" ? "Practise again" : "I know this"}
        </QuietButton>
      </div>
    </div>
  );
}
