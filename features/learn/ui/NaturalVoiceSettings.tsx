"use client";

import { useEffect, useState, type ReactElement } from "react";
import { toast } from "sonner";
import { useBrowserVoiceEnabled } from "./browser-voice-preference";
import { useLang } from "./lang-context";
import { QuietButton } from "./primitives";
import { speak } from "./speech-io";

type State = { readonly kind: "idle" } | { readonly kind: "downloading"; readonly percent: number } | { readonly kind: "unsupported" };

/** Turn the free, open-source neural voice on or off. Downloads the model once, with progress. */
export function NaturalVoiceSettings(): ReactElement {
  const { pack } = useLang();
  const [enabled, setEnabled] = useBrowserVoiceEnabled(pack.id);
  const [state, setState] = useState<State>({ kind: "idle" });

  useEffect(() => {
    void import("./piper-voice").then(({ piperSupported }) => {
      if (!piperSupported()) setState({ kind: "unsupported" });
    });
  }, []);

  const turnOn = async (): Promise<void> => {
    setState({ kind: "downloading", percent: 0 });
    try {
      const { downloadVoice } = await import("./piper-voice");
      await downloadVoice(pack.piperVoice, ({ loaded, total }) => {
        if (total > 0) setState({ kind: "downloading", percent: Math.min(99, Math.round((loaded / total) * 100)) });
      });
      setEnabled(true);
      setState({ kind: "idle" });
      toast.success("Natural voice is on. It now works offline too.");
      speak(pack.fallbackLessons[0]?.sentences[0]?.fr ?? "", 0.9);
    } catch (error) {
      console.error("[learn] natural voice download failed", error);
      setState({ kind: "idle" });
      toast.error("The voice didn't download. Check your connection and try again.");
    }
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

  if (state.kind === "unsupported") {
    return <p className="fr-ui px-2 py-3 text-sm text-(--fr-soft)">This browser can&apos;t run the natural voice. Chrome, Edge, Safari 17+ and Firefox can.</p>;
  }
  if (state.kind === "downloading") {
    return (
      <div className="px-2 py-2" role="status" aria-live="polite">
        <p className="fr-ui text-sm text-(--fr-ink)">Downloading the voice… {state.percent}%</p>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-(--fr-rule)">
          <div className="h-full bg-(--fr-key) transition-[width]" style={{ width: `${state.percent}%` }} />
        </div>
      </div>
    );
  }
  return enabled ? (
    <div className="flex flex-wrap items-center gap-x-4">
      <p className="fr-ui py-3 pl-2 text-sm text-(--fr-ink)">On — runs on this device.</p>
      <QuietButton onClick={() => void turnOff()}>Turn off</QuietButton>
    </div>
  ) : (
    <QuietButton onClick={() => void turnOn()} className="text-(--fr-ink)">
      Turn on (free, about 60 MB once)
    </QuietButton>
  );
}
