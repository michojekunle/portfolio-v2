"use client";

import { useEffect, useState, type ReactElement } from "react";
import { toast } from "sonner";
import { REMINDER_TIMES } from "../domain/reminders";
import { ChoiceGroup } from "./ChoiceGroup";
import { useLang } from "./lang-context";

const OFF = "off";
const OPTIONS = [OFF, ...REMINDER_TIMES] as const;
type Option = (typeof OPTIONS)[number];
const LABELS: Record<Option, string> = {
  off: "Off",
  "07:00": "7h",
  "08:00": "8h",
  "12:00": "12h",
  "18:00": "18h",
  "20:00": "20h",
  "21:00": "21h",
  "22:00": "22h",
};

interface Settings {
  readonly time: string | null;
  readonly email: boolean;
  readonly push: boolean;
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padded = `${base64Url}${"=".repeat((4 - (base64Url.length % 4)) % 4)}`.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

/** Subscribe this device to push for this app's scope. Null when unsupported, denied or not configured. */
async function subscribeToPush(scope: string): Promise<PushSubscriptionJSON | null> {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return null;
  const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  if (permission !== "granted") return null;
  const registration = (await navigator.serviceWorker.getRegistration(scope)) ?? (await navigator.serviceWorker.register("/sw.js", { scope }));
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ?? (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToUint8Array(key) }));
  return subscription.toJSON();
}

/** The daily reminder row inside settings: a time (or off), and email as a fallback. */
export function ReminderSettings(): ReactElement {
  const { pack } = useLang();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`${pack.api}/reminder`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Reminder request failed with ${response.status}`);
        const data = (await response.json()) as Settings;
        if (alive) setSettings(data);
      })
      .catch((error: unknown) => {
        console.warn("[learn] could not load reminder", error);
        if (alive) setSettings({ time: null, email: false, push: false });
      });
    return () => {
      alive = false;
    };
  }, [pack.api]);

  const save = async (time: string | null, email: boolean): Promise<void> => {
    setBusy(true);
    try {
      let push: PushSubscriptionJSON | null | undefined;
      if (time !== null && !settings?.push) {
        push = await subscribeToPush(pack.route);
        if (!push && !email) {
          toast.message("Notifications are off for this site, so I'll email you instead.");
          email = true;
        }
      }
      const response = await fetch(`${pack.api}/reminder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time, email, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, ...(push !== undefined ? { push } : {}) }),
      });
      if (!response.ok) throw new Error(`Reminder update failed with ${response.status}`);
      setSettings((await response.json()) as Settings);
      toast.success(time ? `Reminder set for ${time.replace(":00", "h")} — only on days you haven't done your page.` : "Reminder off.");
    } catch (error) {
      console.error("[learn] could not save reminder", error);
      toast.error("The reminder didn't save. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!settings) return <p className="fr-ui px-2 py-3 text-sm text-(--fr-soft)">Loading…</p>;

  const current: Option = OPTIONS.find((option) => option === settings.time) ?? OFF;

  return (
    <div className={busy ? "pointer-events-none opacity-60" : ""}>
      <ChoiceGroup label="Daily reminder time" options={OPTIONS} labels={LABELS} value={current} onChange={(next) => void save(next === OFF ? null : next, settings.email)} />
      {settings.time ? (
        <label className="fr-ui flex min-h-11 items-center gap-2 px-2 text-sm text-(--fr-ink)">
          <input type="checkbox" checked={settings.email} onChange={(event) => void save(settings.time, event.target.checked)} className="size-4 accent-(--fr-key)" />
          Also email me
          {settings.push ? <span className="text-(--fr-soft)">· notifications on this device</span> : null}
        </label>
      ) : null}
    </div>
  );
}
