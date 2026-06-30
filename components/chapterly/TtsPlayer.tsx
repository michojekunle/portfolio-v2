"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square, X, Volume2, ChevronDown } from "lucide-react";

const ACCENT = "#4F6D7A";
const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];

interface TtsVoice {
  name: string;
  shortName: string;
  voice: SpeechSynthesisVoice;
}

type PlayState = "idle" | "playing" | "paused";

interface Props {
  text: string;
  /** Called when the player is dismissed. */
  onClose: () => void;
  theme?: { bg: string; text: string };
}

function shortVoiceName(fullName: string): string {
  // "Google US English" → "US English", "Alex" → "Alex"
  return fullName.replace(/^(Google|Apple|Microsoft)\s+/, "").replace(/\s+Online.*/i, "");
}

export function TtsPlayer({ text, onClose, theme }: Props): React.ReactElement {
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [speed, setSpeed] = useState<Speed>(1);
  const [voices, setVoices] = useState<TtsVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const bg = theme?.bg ?? "var(--bg-2)";
  const fg = theme?.text ?? "var(--ink)";

  // Load available voices
  useEffect(() => {
    const load = (): void => {
      const available = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.startsWith("en"))
        .map((v) => ({ name: v.name, shortName: shortVoiceName(v.name), voice: v }));

      if (available.length > 0) setVoices(available);
    };

    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  const stop = useCallback((): void => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setPlayState("idle");
  }, []);

  const play = useCallback((): void => {
    if (!text.trim()) return;
    window.speechSynthesis.cancel();

    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = speed;
    if (voices[selectedVoiceIndex]) {
      utt.voice = voices[selectedVoiceIndex].voice;
    }
    utt.onstart = () => setPlayState("playing");
    utt.onpause = () => setPlayState("paused");
    utt.onresume = () => setPlayState("playing");
    utt.onend = () => {
      setPlayState("idle");
      utteranceRef.current = null;
    };
    utt.onerror = (e) => {
      // "interrupted" fires when we cancel() intentionally — not a real error
      if (e.error !== "interrupted") {
        console.error("[tts] error:", e.error);
      }
      setPlayState("idle");
      utteranceRef.current = null;
    };

    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [text, speed, voices, selectedVoiceIndex]);

  const togglePause = useCallback((): void => {
    if (playState === "playing") {
      window.speechSynthesis.pause();
    } else if (playState === "paused") {
      window.speechSynthesis.resume();
    } else {
      play();
    }
  }, [playState, play]);

  // When speed or voice changes mid-playback, restart with the new settings.
  // We read playState and call play() via refs to avoid the stale-closure trap:
  // both values are captured at call time, not at effect-registration time.
  const playStateRef = useRef<PlayState>("idle");
  const playRef = useRef(play);
  useEffect(() => { playRef.current = play; });
  useEffect(() => { playStateRef.current = playState; }, [playState]);

  useEffect(() => {
    if (playStateRef.current !== "idle") {
      playRef.current();
    }
  }, [speed, selectedVoiceIndex]);

  // Clean up on unmount
  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const handleClose = (): void => {
    stop();
    onClose();
  };

  const selectedVoice = voices[selectedVoiceIndex];

  return (
    <div
      className="fixed bottom-[20px] right-[20px] z-50 rounded-[16px] shadow-2xl overflow-hidden"
      style={{
        background: bg,
        border: `1px solid ${fg}18`,
        minWidth: "260px",
        maxWidth: "360px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-[14px] py-[10px] border-b"
        style={{ borderColor: `${fg}12` }}
      >
        <div className="flex items-center gap-[8px]" style={{ color: ACCENT }}>
          <Volume2 size={13} />
          <span
            className="font-mono text-[9px] tracking-[0.12em] uppercase font-semibold"
            style={{ color: fg, opacity: 0.6 }}
          >
            Reading aloud
          </span>
        </div>
        <button
          onClick={handleClose}
          className="w-[22px] h-[22px] flex items-center justify-center rounded-full border-none cursor-pointer transition-opacity hover:opacity-80 bg-transparent"
          style={{ color: fg, opacity: 0.4 }}
          aria-label="Close TTS player"
        >
          <X size={12} />
        </button>
      </div>

      {/* Controls */}
      <div className="px-[14px] py-[12px] flex items-center gap-[10px]">
        {/* Play / Pause */}
        <button
          onClick={togglePause}
          className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer transition-opacity hover:opacity-80"
          style={{ background: ACCENT, color: "#fff" }}
          aria-label={playState === "playing" ? "Pause" : "Play"}
        >
          {playState === "playing" ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
        </button>

        {/* Stop */}
        <button
          onClick={stop}
          disabled={playState === "idle"}
          className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-20 disabled:cursor-not-allowed bg-transparent"
          style={{ color: fg }}
          aria-label="Stop"
        >
          <Square size={12} fill="currentColor" />
        </button>

        {/* Speed buttons */}
        <div
          className="flex items-center rounded-[6px] overflow-hidden border shrink-0"
          style={{ borderColor: `${fg}20` }}
        >
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className="h-[28px] px-[7px] font-mono text-[9px] font-semibold border-none cursor-pointer transition-all"
              style={
                speed === s
                  ? { background: ACCENT, color: "#fff" }
                  : { background: "transparent", color: fg, opacity: 0.5 }
              }
              aria-label={`${s}× speed`}
              aria-pressed={speed === s}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Voice selector */}
      {voices.length > 0 && (
        <div className="px-[14px] pb-[12px] relative">
          <button
            onClick={() => setShowVoiceMenu((v) => !v)}
            className="w-full flex items-center justify-between px-[10px] py-[6px] rounded-[6px] border cursor-pointer text-left transition-colors bg-transparent"
            style={{ borderColor: `${fg}18`, color: fg }}
          >
            <span className="font-mono text-[9px] tracking-[0.06em] truncate opacity-70">
              {selectedVoice?.shortName ?? "Default voice"}
            </span>
            <ChevronDown
              size={11}
              style={{
                color: fg,
                opacity: 0.4,
                transform: showVoiceMenu ? "rotate(180deg)" : undefined,
                transition: "transform 0.15s",
              }}
            />
          </button>

          {showVoiceMenu && (
            <div
              className="absolute left-[14px] right-[14px] bottom-full mb-[4px] rounded-[8px] border shadow-xl overflow-y-auto max-h-[160px] z-10"
              style={{ background: bg, borderColor: `${fg}18` }}
            >
              {voices.map((v, i) => (
                <button
                  key={v.name}
                  onClick={() => {
                    setSelectedVoiceIndex(i);
                    setShowVoiceMenu(false);
                  }}
                  className="w-full text-left px-[12px] py-[8px] font-mono text-[9px] tracking-[0.06em] cursor-pointer border-none bg-transparent transition-colors hover:opacity-70"
                  style={
                    i === selectedVoiceIndex
                      ? { color: ACCENT, fontWeight: 600 }
                      : { color: fg, opacity: 0.7 }
                  }
                >
                  {v.shortName}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
