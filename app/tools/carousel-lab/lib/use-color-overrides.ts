import { useEffect, useState } from "react";

const KEYS = {
  bg: "carousel_lab_custom_bg",
  text: "carousel_lab_custom_text",
  accent: "carousel_lab_custom_accent",
} as const;

/** Persisted BG/text/accent color overrides that survive a page reload. */
export function useColorOverrides(): {
  customBg: string;
  customText: string;
  customAccent: string;
  setCustomBg: (value: string) => void;
  setCustomText: (value: string) => void;
  setCustomAccent: (value: string) => void;
  resetOverrides: () => void;
} {
  const [customBg, setCustomBgState] = useState("");
  const [customText, setCustomTextState] = useState("");
  const [customAccent, setCustomAccentState] = useState("");

  useEffect(() => {
    try {
      const savedBg = localStorage.getItem(KEYS.bg);
      const savedText = localStorage.getItem(KEYS.text);
      const savedAccent = localStorage.getItem(KEYS.accent);
      if (savedBg) setCustomBgState(savedBg);
      if (savedText) setCustomTextState(savedText);
      if (savedAccent) setCustomAccentState(savedAccent);
    } catch {}
  }, []);

  const persist = (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  };

  const setCustomBg = (value: string): void => {
    setCustomBgState(value);
    persist(KEYS.bg, value);
  };
  const setCustomText = (value: string): void => {
    setCustomTextState(value);
    persist(KEYS.text, value);
  };
  const setCustomAccent = (value: string): void => {
    setCustomAccentState(value);
    persist(KEYS.accent, value);
  };

  const resetOverrides = (): void => {
    setCustomBgState("");
    setCustomTextState("");
    setCustomAccentState("");
    try {
      localStorage.removeItem(KEYS.bg);
      localStorage.removeItem(KEYS.text);
      localStorage.removeItem(KEYS.accent);
    } catch {}
  };

  return { customBg, customText, customAccent, setCustomBg, setCustomText, setCustomAccent, resetOverrides };
}
