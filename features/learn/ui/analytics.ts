"use client";

import type { ClientEventName } from "../domain/events";

type Props = Readonly<Record<string, string | number | boolean>>;

/**
 * Fire-and-forget product event to our own server. Skipped when the browser
 * sends Do Not Track / Global Privacy Control. Never throws and never waits.
 */
export function track(name: ClientEventName, props: Props & { readonly language?: "fr" | "es" } = {}): void {
  try {
    if (typeof navigator === "undefined" || navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
    const { language, ...rest } = props;
    const body = JSON.stringify({ name, language, props: Object.keys(rest).length ? rest : undefined });
    void fetch("/api/learn/events", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => undefined);
  } catch {
    // Analytics must never affect the app.
  }
}
