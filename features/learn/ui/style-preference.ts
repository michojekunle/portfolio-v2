"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import type { LanguageId } from "../domain/language";

// Layout effect on the client so a saved style is applied before first paint (no flash); plain effect on the server.
const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Two paper worlds per language. "notebook" is the school exercise book
 * (Seyès cahier for French, cuadrícula for Spanish); "dictionary" is the
 * reference-book page. Labels come from the language copy.
 */
export const PAGE_STYLES = ["notebook", "dictionary"] as const;
export type PageStyle = (typeof PAGE_STYLES)[number];

const DEFAULT_STYLE: PageStyle = "notebook";
// French kept its original key (and values) so existing learners keep their choice.
const LEGACY_FRENCH_VALUES: Record<string, PageStyle> = { cahier: "notebook", dictionnaire: "dictionary" };

function storageKey(lang: LanguageId): string {
  return `${lang}-style`;
}

function readStoredStyle(lang: LanguageId): PageStyle {
  try {
    const stored = window.localStorage.getItem(storageKey(lang));
    if (stored === "notebook" || stored === "dictionary") return stored;
    return stored !== null && stored in LEGACY_FRENCH_VALUES ? LEGACY_FRENCH_VALUES[stored] : DEFAULT_STYLE;
  } catch (error) {
    // Private mode / blocked storage: the default style is a fine answer.
    console.warn("[learn] could not read style preference", error);
    return DEFAULT_STYLE;
  }
}

/** A per-device, per-language visual preference. Not worth a database row. */
export function usePageStyle(lang: LanguageId): readonly [PageStyle, (next: PageStyle) => void] {
  // Start from the default on both server and client so hydration matches.
  const [style, setStyleState] = useState<PageStyle>(DEFAULT_STYLE);

  useClientLayoutEffect(() => {
    setStyleState(readStoredStyle(lang));
  }, [lang]);

  const setStyle = useCallback(
    (next: PageStyle): void => {
      setStyleState(next);
      try {
        window.localStorage.setItem(storageKey(lang), next);
      } catch (error) {
        console.warn("[learn] could not save style preference", error);
      }
    },
    [lang]
  );

  return [style, setStyle] as const;
}
