"use client";

import { useEffect, useState, type ReactElement } from "react";
import { Volume2 } from "lucide-react";
import type { VoiceMatch } from "../domain/voices";
import { useBrowserVoiceEnabled } from "./browser-voice-preference";
import { useLang } from "./lang-context";
import { QuietButton } from "./primitives";
import { voiceMatch } from "./speech-io";

/**
 * The app can only sound as local as the voices installed on the device. When
 * the best available voice isn't from the right region (or there is none),
 * say so plainly and show how to add one — it's a one-time, two-minute fix.
 */
export function VoiceNotice(): ReactElement | null {
  const { pack } = useLang();
  const [match, setMatch] = useState<VoiceMatch>("native");
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [browserVoiceOn] = useBrowserVoiceEnabled(pack.id);

  useEffect(() => {
    let alive = true;
    voiceMatch()
      .then((result) => {
        if (alive) setMatch(result);
      })
      .catch((error: unknown) => console.warn("[learn] could not check voices", error));
    try {
      setDismissed(window.localStorage.getItem(`${pack.id}-voice-notice-dismissed`) === "1");
    } catch (error) {
      console.warn("[learn] could not read voice notice state", error);
    }
    return () => {
      alive = false;
    };
  }, [pack.id]);

  if (match === "native" || dismissed || browserVoiceOn) return null;

  const dismiss = (): void => {
    setDismissed(true);
    try {
      window.localStorage.setItem(`${pack.id}-voice-notice-dismissed`, "1");
    } catch (error) {
      console.warn("[learn] could not save voice notice state", error);
    }
  };

  const language = `${pack.name} (${pack.accentRegion})`;

  return (
    <aside className="fr-enter mt-6 border-y border-(--fr-rule) py-3" aria-label="Voice quality">
      <p className="fr-ui flex items-start gap-2 text-[15px] leading-6 text-(--fr-ink)">
        <Volume2 className="mt-1 size-4 shrink-0 text-(--fr-mark)" aria-hidden="true" />
        <span>
          {match === "none"
            ? `This device has no ${pack.name} voice, so the audio won't sound right.`
            : `This device's ${pack.name} voice isn't from ${pack.accentRegion}, so the accent will be a little off.`}{" "}
          Turn on the free natural voice in settings, or add a {language} voice to your device (two minutes).
        </span>
      </p>
      {open ? (
        <ul className="fr-ui mt-2 space-y-1 pl-6 text-sm leading-6 text-(--fr-soft)">
          <li>
            <strong className="text-(--fr-ink)">iPhone / iPad:</strong> Settings → Accessibility → Spoken Content → Voices → {pack.name} → pick a {pack.accentRegion} voice
            (an “Enhanced” one if offered).
          </li>
          <li>
            <strong className="text-(--fr-ink)">Android:</strong> Settings → System → Languages → Text-to-speech → Speech Services by Google → Install voice data → {language}.
          </li>
          <li>
            <strong className="text-(--fr-ink)">Mac:</strong> System Settings → Accessibility → Spoken Content → System voice → Manage Voices → {pack.name}.
          </li>
          <li>
            <strong className="text-(--fr-ink)">Windows:</strong> Settings → Time &amp; language → Speech → Add voices → {language}. Then reload this page.
          </li>
        </ul>
      ) : null}
      <div className="flex gap-4 pl-6">
        <QuietButton onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          {open ? "Hide steps" : "Show me how"}
        </QuietButton>
        <QuietButton onClick={dismiss}>Got it</QuietButton>
      </div>
    </aside>
  );
}
