"use client";

import { useCallback, useEffect, useState } from "react";
import type { LanguageId } from "../domain/language";

const EVENT = "learn:browser-voice";
const key = (lang: LanguageId): string => `${lang}-browser-voice`;

function read(lang: LanguageId): boolean {
  try {
    return window.localStorage.getItem(key(lang)) === "on";
  } catch (error) {
    console.warn("[learn] could not read natural voice preference", error);
    return false;
  }
}

/** Whether the learner turned on the free in-browser voice on this device (per language). Shared across components. */
export function useBrowserVoiceEnabled(lang: LanguageId): readonly [boolean, (on: boolean) => void] {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(read(lang));
    const sync = (): void => setEnabled(read(lang));
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [lang]);

  const set = useCallback(
    (on: boolean): void => {
      try {
        window.localStorage.setItem(key(lang), on ? "on" : "off");
      } catch (error) {
        console.warn("[learn] could not save natural voice preference", error);
      }
      setEnabled(on);
      window.dispatchEvent(new Event(EVENT));
    },
    [lang]
  );

  return [enabled, set] as const;
}
