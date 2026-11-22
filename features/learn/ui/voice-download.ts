"use client";

import { useSyncExternalStore } from "react";

/**
 * One shared, long-lived download of the free in-browser voice. Living outside
 * React means the download keeps going while the learner closes Settings and
 * starts their page, and every screen shows the same progress.
 */

export type VoiceDownloadState =
  | { readonly status: "idle" }
  | { readonly status: "downloading"; readonly voiceId: string; readonly loaded: number; readonly total: number; readonly bytesPerSecond: number }
  | { readonly status: "failed"; readonly voiceId: string };

const IDLE: VoiceDownloadState = { status: "idle" };
let state: VoiceDownloadState = IDLE;
let running: Promise<void> | null = null;
let runningVoice: string | null = null;
const listeners = new Set<() => void>();

function set(next: VoiceDownloadState): void {
  state = next;
  for (const listener of listeners) listener();
}

/** Starts (or joins) the download. `onReady` runs once the voice is usable, even if the screen that asked has gone. */
export function startVoiceDownload(voiceId: string, onReady: () => void): Promise<void> {
  if (running) {
    // Asking again for the same voice joins the download in progress; another voice waits its turn.
    if (runningVoice === voiceId) return running;
    return running.catch(() => undefined).then(() => startVoiceDownload(voiceId, onReady));
  }
  runningVoice = voiceId;
  const startedAt = Date.now();
  set({ status: "downloading", voiceId, loaded: 0, total: 0, bytesPerSecond: 0 });
  running = (async (): Promise<void> => {
    try {
      const { downloadVoice } = await import("./piper-voice");
      await downloadVoice(voiceId, ({ loaded, total }) => {
        const seconds = Math.max(1, (Date.now() - startedAt) / 1000);
        set({ status: "downloading", voiceId, loaded, total, bytesPerSecond: loaded / seconds });
      });
      set(IDLE);
      onReady();
    } catch (error) {
      console.error("[learn] natural voice download failed", error);
      set({ status: "failed", voiceId });
      throw error;
    } finally {
      running = null;
      runningVoice = null;
    }
  })();
  return running;
}

export function useVoiceDownload(): VoiceDownloadState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => IDLE
  );
}

/** "42%" plus a plain-language estimate like "about 2 min left". */
export function describeProgress(state: Extract<VoiceDownloadState, { status: "downloading" }>): { readonly percent: number; readonly label: string } {
  const percent = state.total > 0 ? Math.min(99, Math.round((state.loaded / state.total) * 100)) : 0;
  const mb = (bytes: number): string => `${Math.round(bytes / 1_000_000)} MB`;
  if (state.total === 0 || state.bytesPerSecond < 1) return { percent, label: "Starting…" };
  const seconds = Math.max(0, (state.total - state.loaded) / state.bytesPerSecond);
  const left = seconds < 45 ? "less than a minute left" : `about ${Math.round(seconds / 60)} min left`;
  return { percent, label: `${mb(state.loaded)} of ${mb(state.total)} · ${left}` };
}
