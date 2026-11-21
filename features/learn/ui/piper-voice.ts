"use client";

/**
 * Free natural voices that run in the learner's browser (Piper, open source).
 * No account, no API key, no per-use cost: the voice model (~60 MB) is
 * downloaded once into the browser's private storage, then works offline.
 *
 * The library is imported only when the learner turns this on, so nobody
 * pays its weight by default.
 */

type PiperModule = typeof import("@mintplex-labs/piper-tts-web");

/**
 * Loaded from jsdelivr at runtime rather than bundled: its Emscripten loader
 * references Node built-ins (fs, path) that browser bundlers can't resolve,
 * and keeping it out of the bundle means nobody downloads it until they opt in.
 * The npm package is installed for its types only. Version pinned on purpose.
 */
const PIPER_URL = "https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.5/+esm";

const ONNX_WASM_URL = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/";

let piper: Promise<PiperModule> | null = null;
function loadPiper(): Promise<PiperModule> {
  piper ??= import(/* webpackIgnore: true */ /* turbopackIgnore: true */ PIPER_URL) as Promise<PiperModule>;
  return piper;
}

/** Generated audio per voice+line, so replaying a line is instant. */
const audioCache = new Map<string, string>();
const MAX_CACHED = 200;

export interface DownloadProgress {
  readonly loaded: number;
  readonly total: number;
}

export function piperSupported(): boolean {
  // Needs workers, WebAssembly and the Origin Private File System (where the model is kept).
  return typeof window !== "undefined" && typeof Worker !== "undefined" && typeof WebAssembly !== "undefined" && "storage" in navigator && "getDirectory" in navigator.storage;
}

export async function isVoiceDownloaded(voiceId: string): Promise<boolean> {
  if (!piperSupported()) return false;
  const { stored } = await loadPiper();
  return (await stored()).includes(voiceId);
}

/** Downloads the voice model once (reporting progress); a no-op when it's already stored. */
export async function downloadVoice(voiceId: string, onProgress?: (progress: DownloadProgress) => void): Promise<void> {
  const { download, stored } = await loadPiper();
  if ((await stored()).includes(voiceId)) return;
  await download(voiceId, (progress) => onProgress?.({ loaded: progress.loaded, total: progress.total }));
}

export async function removeVoice(voiceId: string): Promise<void> {
  const { remove } = await loadPiper();
  await remove(voiceId);
  for (const key of [...audioCache.keys()]) if (key.startsWith(`${voiceId}|`)) audioCache.delete(key);
}

/** A playable URL for `text` in the given voice, generated on the device. */
export async function synthesize(voiceId: string, text: string): Promise<string> {
  const key = `${voiceId}|${text}`;
  const cached = audioCache.get(key);
  if (cached) return cached;
  const { TtsSession } = await loadPiper();
  // The library keeps one session; a different voice needs a fresh one (new model).
  const current = (TtsSession as unknown as { _instance: { voiceId?: string } | null })._instance;
  if (current && current.voiceId !== voiceId) (TtsSession as unknown as { _instance: null })._instance = null;
  const session = await TtsSession.create({
    voiceId: voiceId as Parameters<typeof TtsSession.create>[0]["voiceId"],
    // Defaults point at onnxruntime 1.18 on cdnjs, but the jsdelivr build imports 1.27; the wasm must match.
    wasmPaths: { ...TtsSession.WASM_LOCATIONS, onnxWasm: ONNX_WASM_URL },
  });
  const blob = await session.predict(text);
  const url = URL.createObjectURL(blob);
  if (audioCache.size >= MAX_CACHED) {
    const [oldestKey, oldestUrl] = audioCache.entries().next().value ?? [];
    if (oldestKey && oldestUrl) {
      URL.revokeObjectURL(oldestUrl);
      audioCache.delete(oldestKey);
    }
  }
  audioCache.set(key, url);
  return url;
}
