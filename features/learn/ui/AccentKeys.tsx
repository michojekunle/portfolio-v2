"use client";

import { useLang } from "./lang-context";
import type { ReactElement } from "react";


/** Letters most keyboards hide (from the language pack). pointerdown is cancelled so the text field keeps focus (and the phone keyboard stays up). */
export function AccentKeys({ onInsert, disabled = false }: { readonly onInsert: (char: string) => void; readonly disabled?: boolean }): ReactElement {
  const { pack } = useLang();
  return (
    <div className="mt-3 flex flex-wrap gap-1" role="group" aria-label="Insert an accented letter">
      {pack.accents.map((char) => (
        <button
          key={char}
          type="button"
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => onInsert(char)}
          disabled={disabled}
          aria-label={`Insert ${char}`}
          className="fr-print grid size-11 place-items-center rounded-(--fr-radius) text-xl text-(--fr-ink) transition-colors hover:bg-[color-mix(in_srgb,var(--fr-key)_10%,transparent)] disabled:opacity-40"
        >
          {char}
        </button>
      ))}
    </div>
  );
}

/** Inserts text at the caret of an input/textarea and returns the new value plus where the caret should go. */
export function insertAtCaret(el: HTMLInputElement | HTMLTextAreaElement | null, value: string, char: string, maxLength: number): { readonly next: string; readonly caret: number } {
  const start = el?.selectionStart ?? value.length;
  const end = el?.selectionEnd ?? value.length;
  return { next: (value.slice(0, start) + char + value.slice(end)).slice(0, maxLength), caret: Math.min(start + char.length, maxLength) };
}
