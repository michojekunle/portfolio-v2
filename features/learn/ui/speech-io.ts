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

/**
 * Plus: natural neural recordings served by the app (cached per line). When
 * enabled, speak() plays those and only falls back to the device voice if a
 * recording can't be fetched.
 */
let naturalApi: string | null = null;
const naturalUrls = new Map<string, string>();
let player: HTMLAudioElement | null = null;

/**
 * Every speak()/stopSpeaking() bumps this. Audio is fetched or generated
 * asynchronously, so a slow older line must not start over a newer one or
 * after the learner moved on.
 */
let speechToken = 0;
const isCurrent = (token: number): boolean => token === speechToken;

class StaleSpeechError extends Error {}
class NaturalVoiceError extends Error {}

async function playUrl(url: string, token: number, rate?: number): Promise<void> {
  if (!isCurrent(token)) throw new StaleSpeechError("superseded");
  player?.pause();
  player = new Audio(url);
  if (rate !== undefined) {
    // Piper has no speed control, so slow playback stretches time while keeping pitch.
    player.playbackRate = Math.min(1.25, Math.max(0.6, rate / 0.9));
    player.preservesPitch = true;
  }
  await player.play();
}

export function setNaturalVoices(api: string | null): void {
  naturalApi = api;
}

/** Free in-browser voice (Piper) id when the learner has turned it on, else null. */
let browserVoiceId: string | null = null;
export function setBrowserVoice(voiceId: string | null): void {
  browserVoiceId = voiceId;
}

async function playBrowserVoice(voiceId: string, text: string, rate: number, token: number): Promise<void> {
  const { synthesize } = await import("./piper-voice");
  await playUrl(await synthesize(voiceId, text), token, rate);
}

async function playNatural(text: string, rate: number, token: number): Promise<void> {
  if (!naturalApi) throw new NaturalVoiceError("natural voices off");
  const key = `${activeLocale}|${rate}|${text}`;
  let url = naturalUrls.get(key);
  if (!url) {
    const params = new URLSearchParams({ text, rate: String(rate), locale: activeLocale });
    const response = await fetch(`${naturalApi}/tts?${params.toString()}`);
    if (!response.ok) throw new NaturalVoiceError(`tts ${response.status}`);
    url = ((await response.json()) as { url: string }).url;
    naturalUrls.set(key, url);
  }
  await playUrl(url, token);
}

/**
 * Speak in the active language. Order: the free in-browser neural voice if
 * the learner turned it on, then a Plus recording, then the device voice.
 * Any failure falls through to the next, so audio never just stops.
 */
export function speak(text: string, rate = 0.9): void {
  speechToken += 1;
  const token = speechToken;
  const device = (): void => {
    if (isCurrent(token)) speakWithDevice(text, rate);
  };
  const fallback = (label: string, next: () => void) => (error: unknown): void => {
    if (error instanceof StaleSpeechError || !isCurrent(token)) return;
    console.warn(`[learn] ${label} unavailable, falling back`, error);
    next();
  };
  const natural = (): void => {
    void playNatural(text, rate, token).catch(fallback("natural voice", device));
  };

  if (browserVoiceId) {
    if (canSpeak()) window.speechSynthesis.cancel();
    void playBrowserVoice(browserVoiceId, text, rate, token).catch(fallback("in-browser voice", naturalApi ? natural : device));
    return;
  }
  if (naturalApi) {
    if (canSpeak()) window.speechSynthesis.cancel();
    natural();
    return;
  }
  speakWithDevice(text, rate);
}

function speakWithDevice(text: string, rate: number): void {
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
  speechToken += 1;
  player?.pause();
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
