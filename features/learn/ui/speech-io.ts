/** Browser speech: text-to-speech for listening, SpeechRecognition for the speaking check. */
import { pickBestVoice, type VoiceMatch } from "../domain/voices";

/**
 * One page = one language, so the active locale is module state set once by
 * the app shell (setSpeechLanguage). Keeps every call site a plain speak(text).
 */
let activeLocale = "fr-FR";
let activeVoiceHints: RegExp = /natural|enhanced|premium|online|google/i;

export function setSpeechLanguage(locale: string, voiceHints: RegExp): void {
  activeLocale = locale;
  activeVoiceHints = voiceHints;
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Browsers load voices asynchronously; speaking before they arrive uses the
 * default voice (often English). Wait for them once, briefly.
 */
let voicesReady: Promise<readonly SpeechSynthesisVoice[]> | null = null;
function loadVoices(): Promise<readonly SpeechSynthesisVoice[]> {
  if (!canSpeak()) return Promise.resolve([]);
  const now = window.speechSynthesis.getVoices();
  if (now.length > 0) return Promise.resolve(now);
  voicesReady ??= new Promise((resolve) => {
    const done = (): void => {
      window.speechSynthesis.removeEventListener("voiceschanged", done);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", done);
    // Some browsers never fire the event when there's nothing to load.
    window.setTimeout(done, 1500);
  });
  return voicesReady;
}

/** How well this device can pronounce the active language — shown to the learner when it's not native. */
export async function voiceMatch(): Promise<VoiceMatch> {
  return pickBestVoice(await loadVoices(), activeLocale, activeVoiceHints).match;
}

/** Speak in the active language with the most local, natural voice installed. */
export function speak(text: string, rate = 0.9): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  void loadVoices().then((voices) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = activeLocale;
    utterance.rate = rate;
    const { voice } = pickBestVoice(voices, activeLocale, activeVoiceHints);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}

// ── Speech recognition (not in lib.dom; minimal structural types, no `any`) ──
interface RecognitionAlternative {
  readonly transcript: string;
}
interface RecognitionResultItem {
  readonly [index: number]: RecognitionAlternative;
  readonly length: number;
}
interface RecognitionEvent {
  readonly results: { readonly [index: number]: RecognitionResultItem; readonly length: number };
}
interface RecognitionErrorEvent {
  readonly error: string;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionConstructor = new () => Recognition;

function getRecognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canRecognize(): boolean {
  return getRecognitionConstructor() !== null;
}

export type ListenOutcome =
  | { readonly kind: "heard"; readonly transcript: string }
  | { readonly kind: "nothing" }
  | { readonly kind: "denied" }
  | { readonly kind: "error"; readonly message: string };

export interface ListenHandle {
  readonly result: Promise<ListenOutcome>;
  stop(): void;
}

/** Listens for one utterance in the active language. Always resolves; never throws. */
export function listenOnce(): ListenHandle {
  const Ctor = getRecognitionConstructor();
  if (!Ctor) {
    return { result: Promise.resolve({ kind: "error", message: "Speech recognition is not supported here." }), stop: () => undefined };
  }

  const recognition = new Ctor();
  recognition.lang = activeLocale;
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  const result = new Promise<ListenOutcome>((resolve) => {
    let settled = false;
    const settle = (outcome: ListenOutcome): void => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      settle(transcript ? { kind: "heard", transcript } : { kind: "nothing" });
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") settle({ kind: "denied" });
      else if (event.error === "no-speech" || event.error === "aborted") settle({ kind: "nothing" });
      else settle({ kind: "error", message: event.error });
    };
    recognition.onend = () => settle({ kind: "nothing" });
  });

  try {
    recognition.start();
  } catch (error) {
    return {
      result: Promise.resolve({ kind: "error", message: error instanceof Error ? error.message : "Could not start the microphone." }),
      stop: () => undefined,
    };
  }

  return { result, stop: () => recognition.stop() };
}
