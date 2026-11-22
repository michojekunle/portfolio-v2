"use client";

/**
 * Free natural voices that run in the learner's browser (Piper, open source).
 * No account, no API key, no per-use cost: the engine and a voice model
 * (~95 MB together) are downloaded once into the browser, then it works offline.
 *
 * The library is imported only when the learner turns this on, so nobody
 * pays its weight by default.
 */

type PiperModule = typeof import("@mintplex-labs/piper-tts-web");

/**
 * The engine's JS glue is committed under public/vendor/piper and its large
 * binaries are fetched at build time by scripts/vendor-piper.mjs, so the voice
 * runs entirely from this site (plus the model from Hugging Face). It is
 * loaded at runtime rather than bundled: its Emscripten loader references
 * Node built-ins that browser bundlers can't resolve, and keeping it out of
 * the bundle means nobody downloads it until they opt in.
 * The npm package is installed for its types only. Versions are pinned.
 */
const ENGINE_BASE = "/vendor/piper";
const PIPER_URL = `${ENGINE_BASE}/piper-tts-web.js`;
const WASM_PATHS = {
  onnxWasm: `${ENGINE_BASE}/ort/`,
  piperData: `${ENGINE_BASE}/piper_phonemize.data`,
  piperWasm: `${ENGINE_BASE}/piper_phonemize.wasm`,
} as const;

/** Engine binaries, fetched once and then served from the browser cache (sizes of the pinned files). */
const ENGINE_FILES: readonly { readonly url: string; readonly bytes: number }[] = [
  { url: WASM_PATHS.piperWasm, bytes: 635_212 },
  { url: WASM_PATHS.piperData, bytes: 18_077_249 },
  { url: `${WASM_PATHS.onnxWasm}ort-wasm-simd-threaded.mjs`, bytes: 24_180 },
  { url: `${WASM_PATHS.onnxWasm}ort-wasm-simd-threaded.wasm`, bytes: 13_479_978 },
];
export const ENGINE_BYTES = ENGINE_FILES.reduce((sum, file) => sum + file.bytes, 0);
/** All three medium voices are this size; used until the real total is reported. */
const TYPICAL_MODEL_BYTES = 63_201_294;

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

async function warmEngineFile(url: string, onBytes: (bytes: number) => void): Promise<void> {
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`engine file ${url} returned HTTP ${response.status}`);
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return;
    onBytes(value.byteLength);
  }
}

/**
 * Prepares a voice: the engine files first (so the first line plays without a
 * pause), then the model. Progress covers both and is reported in bytes.
 * A no-op for pieces that are already stored or cached.
 */
export async function downloadVoice(voiceId: string, onProgress?: (progress: DownloadProgress) => void): Promise<void> {
  const { download, stored } = await loadPiper();
  const haveModel = (await stored()).includes(voiceId);
  let engineLoaded = 0;
  let modelTotal = TYPICAL_MODEL_BYTES;
  let modelLoaded = 0;
  const report = (): void => onProgress?.({ loaded: engineLoaded + modelLoaded, total: ENGINE_BYTES + modelTotal });

  report();
  for (const file of ENGINE_FILES) {
    await warmEngineFile(file.url, (bytes) => {
      engineLoaded += bytes;
      report();
    });
  }
  if (haveModel) return;
  await download(voiceId, (progress) => {
    modelLoaded = progress.loaded;
    if (progress.total > 0) modelTotal = progress.total;
    report();
  });
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
    // The engine's built-in defaults point at a CDN and an older onnxruntime; ours are pinned and self-hosted.
    wasmPaths: { ...WASM_PATHS },
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
