"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ readonly outcome: "accepted" | "dismissed" }>;
}

export type InstallMode =
  /** Chromium: we hold the browser's install prompt and can trigger it. */
  | "prompt"
  /** iOS Safari: no prompt API; the learner adds it via Share → Add to Home Screen. */
  | "ios"
  | null;

export interface InstallState {
  readonly mode: InstallMode;
  /** The learner said "not now" recently — don't nag on the Done screen. */
  readonly snoozed: boolean;
  install(): Promise<boolean>;
  snooze(): void;
}

// Per app: each language installs separately, so "not now" for one shouldn't silence the other.
const snoozeKey = (appRoute: string): string => `install-snoozed-at:${appRoute}`;
const SNOOZE_DAYS = 14;

function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia("(display-mode: standalone)").matches;
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return false;
  // iPadOS reports itself as a Mac; touch support is what gives it away.
  const ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  // Other iOS browsers can't add to home screen the same way; Safari is the reliable path.
  return ios && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
}

function readSnoozed(appRoute: string): boolean {
  try {
    const at = Number(window.localStorage.getItem(snoozeKey(appRoute)));
    return Number.isFinite(at) && at > 0 && Date.now() - at < SNOOZE_DAYS * 86_400_000;
  } catch (error) {
    console.warn("[learn] could not read install snooze", error);
    return false;
  }
}

export function useInstall(appRoute: string): InstallState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<InstallMode>(null);
  const [snoozed, setSnoozed] = useState(true);

  useEffect(() => {
    setSnoozed(readSnoozed(appRoute));
    if (isStandalone()) return;
    if (isIosSafari()) setMode("ios");

    const onPrompt = (event: Event): void => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setMode("prompt");
    };
    const onInstalled = (): void => {
      setDeferred(null);
      setMode(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [appRoute]);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferred) return false;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      // A prompt can only be used once either way.
      setDeferred(null);
      setMode(null);
      return outcome === "accepted";
    } catch (error) {
      console.warn("[learn] install prompt failed", error);
      return false;
    }
  }, [deferred]);

  const snooze = useCallback((): void => {
    setSnoozed(true);
    try {
      window.localStorage.setItem(snoozeKey(appRoute), String(Date.now()));
    } catch (error) {
      console.warn("[learn] could not save install snooze", error);
    }
  }, [appRoute]);

  return { mode, snoozed, install, snooze };
}
