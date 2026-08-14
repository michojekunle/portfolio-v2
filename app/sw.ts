import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// ── Type scaffolding ──────────────────────────────────────────────────────────
// serwist needs WorkerGlobalScope for __SW_MANIFEST. SW-specific APIs
// (push, notificationclick, clients, registration) are not in the standard
// dom lib so we use `swSelf: any` to bypass TS checking for those calls —
// the runtime is correct, only the types are missing from the lib.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const swSelf = self as any;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// ── Web Push: handle incoming push events ─────────────────────────────────────
swSelf.addEventListener("push", (event: { data?: { json(): unknown; text(): string }; waitUntil(p: Promise<unknown>): void }) => {
  let data: { title?: string; body?: string; url?: string } = {};
  try {
    data = (event.data?.json() as typeof data) ?? {};
  } catch {
    data = { body: event.data?.text() ?? "Time for your French challenge!" };
  }

  const title = data.title ?? "🇫🇷 Daily French Challenge";
  const body  = data.body  ?? "Tap to complete today's task and keep your streak alive!";
  const url   = data.url   ?? "/french";

  const options = {
    body,
    icon:     "/icons/icon-192x192.png",
    badge:    "/icons/badge-72x72.png",
    tag:      "french-daily",
    renotify: true,
    data:     { url },
    actions:  [
      { action: "open",    title: "Start Challenge" },
      { action: "dismiss", title: "Later" },
    ],
  };

  event.waitUntil(swSelf.registration.showNotification(title, options));
});

// ── Open /french when the notification is tapped ──────────────────────────────
swSelf.addEventListener("notificationclick", (event: {
  notification: { close(): void; data: { url?: string }; action: string };
  action?: string;
  waitUntil(p: Promise<unknown>): void;
}) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const url: string = event.notification.data?.url ?? "/french";

  event.waitUntil(
    swSelf.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients: { url: string; focus(): Promise<unknown> }[]) => {
        const existing = clients.find((c) => c.url.includes("/french"));
        if (existing) return existing.focus();
        return swSelf.clients.openWindow(url);
      })
  );
});
