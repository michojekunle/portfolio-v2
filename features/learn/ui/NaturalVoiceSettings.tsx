"use client";

import { useEffect, useState, type ReactElement } from "react";
import { toast } from "sonner";
import { track } from "./analytics";
import { useBrowserVoiceEnabled } from "./browser-voice-preference";
import { useLang } from "./lang-context";
import { QuietButton } from "./primitives";
import { setBrowserVoice, speak } from "./speech-io";
import { describeProgress, startVoiceDownload, useVoiceDownload } from "./voice-download";

/** Turn the free, open-source neural voice on or off. The download runs in the background, with progress. */
export function NaturalVoiceSettings(): ReactElement {
  const { pack } = useLang();
  const [enabled, setEnabled] = useBrowserVoiceEnabled(pack.id);
  const download = useVoiceDownload();
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    void import("./piper-voice").then(({ piperSupported }) => setSupported(piperSupported()));
  }, []);

  const turnOn = (): void => {
    const voiceId = pack.piperVoice;
    const sample = pack.fallbackLessons[0]?.sentences[0]?.fr ?? "";
    track("voice_download_started", { language: pack.id });
    startVoiceDownload(voiceId, () => {
      setEnabled(true);
      // The app switches its speaking voice on the next render; the sample below must not wait for that.
      setBrowserVoice(voiceId);
      track("voice_enabled", { language: pack.id });
      toast.success("Natural voice is on. It runs on your device from now on.");
      speak(sample, 0.9);
    }).catch(() => {
      track("voice_download_failed", { language: pack.id });
      toast.error("The voice didn't download. Check your connection and try again.");
    });
  };

  const turnOff = async (): Promise<void> => {
    setEnabled(false);
    try {
      const { removeVoice } = await import("./piper-voice");
      await removeVoice(pack.piperVoice);
    } catch (error) {
      // Turning it off already worked; freeing the space is a bonus.
      console.warn("[learn] could not remove the voice model", error);
    }
  };

  if (!supported) {
    return <p className="fr-ui px-2 py-3 text-sm text-(--fr-soft)">This browser can&apos;t run the natural voice. Chrome, Edge, Safari 17+ and Firefox can.</p>;
  }
  if (download.status === "downloading") {
    const { percent, label } = describeProgress(download);
    return (
      <div className="px-2 py-2" role="status" aria-live="polite">
        <p className="fr-ui text-sm text-(--fr-ink)">Downloading the voice… {percent}%</p>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-(--fr-rule)">
          <div className="h-full bg-(--fr-key) transition-[width]" style={{ width: `${percent}%` }} />
        </div>
        <p className="fr-ui mt-1 text-xs text-(--fr-soft)">{label}. You can keep using the app; it carries on in the background.</p>
      </div>
    );
  }
  return enabled ? (
    <div className="flex flex-wrap items-center gap-x-4">
      <p className="fr-ui py-3 pl-2 text-sm text-(--fr-ink)">On — runs on this device.</p>
      <QuietButton onClick={() => void turnOff()}>Turn off</QuietButton>
    </div>
  ) : (
    <QuietButton onClick={turnOn} className="text-(--fr-ink)">
      Turn on (free, about 95 MB once)
    </QuietButton>
  );
}
