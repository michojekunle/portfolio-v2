"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square, X, Volume2, ChevronDown, SkipBack, SkipForward } from "lucide-react";

const ACCENT = "#4F6D7A";
const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];

// Rough chars-per-second at 1× speed (avg reading ~200wpm × ~5 chars/word)
const CHARS_PER_SECOND = (200 / 60) * 5;
const SKIP_SECONDS = 15;

interface TtsVoice {
  name: string;
  shortName: string;
  voice: SpeechSynthesisVoice;
}

type PlayState = "idle" | "playing" | "paused";

interface Props {
  text: string;
  onClose: () => void;
  theme?: { bg: string; text: string };
}

function shortVoiceName(fullName: string): string {
  return fullName.replace(/^(Google|Apple|Microsoft)\s+/, "").replace(/\s+Online.*/i, "");
}

export function TtsPlayer({ text, onClose, theme }: Props): React.ReactElement {
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [speed, setSpeed] = useState<Speed>(1);
  const [voices, setVoices] = useState<TtsVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1
  const voiceBtnRef = useRef<HTMLButtonElement>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const charIndexRef = useRef(0);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bg = theme?.bg ?? "var(--bg-2)";
  const fg = theme?.text ?? "var(--ink)";
  const totalChars = text.length;

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

  // Update progress display during playback
  const startProgressTick = useCallback((): void => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      if (totalChars > 0) {
        setProgress(Math.min(charIndexRef.current / totalChars, 1));
      }
    }, 250);
  }, [totalChars]);

  const stopProgressTick = useCallback((): void => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const stop = useCallback((): void => {
    window.speechSynthesis.cancel();
    stopProgressTick();
    charIndexRef.current = 0;
    utteranceRef.current = null;
    setPlayState("idle");
    setProgress(0);
  }, [stopProgressTick]);

  const play = useCallback((resumeFromChar = 0): void => {
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    stopProgressTick();

    const clampedStart = Math.max(0, Math.min(resumeFromChar, totalChars - 1));
    const remainingText = text.slice(clampedStart);
    const utt = new SpeechSynthesisUtterance(remainingText);
    utt.rate = speed;
    if (voices[selectedVoiceIndex]) {
      utt.voice = voices[selectedVoiceIndex].voice;
    }

    utt.onboundary = (e) => {
      if (e.name === "word") {
        charIndexRef.current = clampedStart + e.charIndex;
      }
    };

    utt.onstart = () => {
      setPlayState("playing");
      startProgressTick();
    };
    utt.onpause = () => {
      setPlayState("paused");
      stopProgressTick();
    };
    utt.onresume = () => {
      setPlayState("playing");
      startProgressTick();
    };
    utt.onend = () => {
      stopProgressTick();
      setPlayState("idle");
      setProgress(1);
      charIndexRef.current = 0;
      utteranceRef.current = null;
    };
    utt.onerror = (e) => {
      if (e.error !== "interrupted") {
        console.error("[tts] error:", e.error);
        charIndexRef.current = 0;
      }
      stopProgressTick();
      setPlayState("idle");
      utteranceRef.current = null;
    };

    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [text, speed, voices, selectedVoiceIndex, totalChars, startProgressTick, stopProgressTick]);

  const togglePause = useCallback((): void => {
    if (playState === "playing") {
      window.speechSynthesis.pause();
    } else if (playState === "paused") {
      window.speechSynthesis.resume();
    } else {
      play(charIndexRef.current);
    }
  }, [playState, play]);

  const skipForward = useCallback((): void => {
    const skipChars = Math.round(CHARS_PER_SECOND * SKIP_SECONDS * speed);
    const newChar = Math.min(charIndexRef.current + skipChars, totalChars - 1);
    charIndexRef.current = newChar;
    if (playState !== "idle") play(newChar);
    setProgress(newChar / totalChars);
  }, [playState, play, speed, totalChars]);

  const skipBack = useCallback((): void => {
    const skipChars = Math.round(CHARS_PER_SECOND * SKIP_SECONDS * speed);
    const newChar = Math.max(charIndexRef.current - skipChars, 0);
    charIndexRef.current = newChar;
    if (playState !== "idle") play(newChar);
    setProgress(newChar / totalChars);
  }, [playState, play, speed, totalChars]);

  // Handle mid-playback configuration updates
  const playStateRef = useRef<PlayState>("idle");
  const playRef = useRef(play);
  useEffect(() => { playRef.current = play; });
  useEffect(() => { playStateRef.current = playState; }, [playState]);

  useEffect(() => {
    if (playStateRef.current !== "idle") {
      playRef.current(charIndexRef.current);
    }
  }, [speed, selectedVoiceIndex]);

  // Restart playback index if text content changes
  useEffect(() => {
    if (playStateRef.current === "playing") {
      charIndexRef.current = 0;
      playRef.current(0);
    } else {
      charIndexRef.current = 0;
    }
  }, [text]);

  // Cleanup on unmount
  useEffect(() => () => {
    window.speechSynthesis.cancel();
    stopProgressTick();
  }, [stopProgressTick]);

  const handleClose = (): void => {
    stop();
    onClose();
  };

  const selectedVoice = voices[selectedVoiceIndex];
  const progressPct = Math.round(progress * 100);

  // Minimized Floating Pill
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-[20px] right-[20px] max-[480px]:bottom-[80px] max-[480px]:right-[16px] max-[480px]:left-[16px] z-50 rounded-full shadow-2xl flex items-center gap-[12px] px-[16px] py-[8px] border transition-all duration-300"
        style={{ background: bg, borderColor: `${fg}18`, color: fg }}
      >
        <button
          onClick={togglePause}
          className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer transition-opacity hover:opacity-80"
          style={{ background: ACCENT, color: "#fff" }}
          aria-label={playState === "playing" ? "Pause" : "Play"}
        >
          {playState === "playing" ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
        </button>
        <span className="font-mono text-[9px] tracking-[0.08em] uppercase font-semibold opacity-70 whitespace-nowrap">
          {playState === "playing" ? `Reading… ${progressPct}%` : progressPct > 0 ? `Paused · ${progressPct}%` : "Ready"}
        </span>
        <button
          onClick={() => setIsMinimized(false)}
          className="w-[22px] h-[22px] flex items-center justify-center rounded-full border-none cursor-pointer opacity-50 hover:opacity-80 bg-transparent shrink-0"
          style={{ color: fg }}
          title="Restore player"
        >
          <ChevronDown size={14} style={{ transform: "rotate(180deg)" }} />
        </button>
        <button
          onClick={handleClose}
          className="w-[22px] h-[22px] flex items-center justify-center rounded-full border-none cursor-pointer opacity-50 hover:opacity-80 bg-transparent shrink-0"
          style={{ color: fg }}
          title="Close player"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-[20px] right-[20px] max-[480px]:bottom-[80px] max-[480px]:right-[16px] max-[480px]:left-[16px] z-50 rounded-[16px] shadow-2xl transition-all duration-300"
      style={{ background: bg, border: `1px solid ${fg}18`, minWidth: "280px", maxWidth: "380px" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-[14px] py-[10px] border-b"
        style={{ borderColor: `${fg}12` }}
      >
        <div className="flex items-center gap-[8px]">
          <Volume2 size={13} style={{ color: ACCENT }} />
          <span className="font-mono text-[9px] tracking-[0.12em] uppercase font-semibold" style={{ color: fg, opacity: 0.6 }}>
            Reading aloud
          </span>
        </div>
        <div className="flex items-center gap-[4px]">
          <button
            onClick={() => setIsMinimized(true)}
            className="w-[22px] h-[22px] flex items-center justify-center rounded-full border-none cursor-pointer transition-opacity hover:opacity-80 bg-transparent"
            style={{ color: fg, opacity: 0.4 }}
            title="Minimize"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={handleClose}
            className="w-[22px] h-[22px] flex items-center justify-center rounded-full border-none cursor-pointer transition-opacity hover:opacity-80 bg-transparent"
            style={{ color: fg, opacity: 0.4 }}
            aria-label="Close TTS player"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-[14px] pt-[12px]">
        <div
          className="h-[3px] rounded-full overflow-hidden"
          style={{ background: `${fg}14` }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${ACCENT}, #6B8FA0)` }}
          />
        </div>
        <div className="flex justify-between mt-[4px]">
          <span className="font-mono text-[8px] opacity-40" style={{ color: fg }}>
            {progressPct}%
          </span>
          <span className="font-mono text-[8px] opacity-40" style={{ color: fg }}>
            {totalChars > 0 ? `~${Math.round(totalChars / CHARS_PER_SECOND / 60 * (1 / speed))}m` : ""}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-[14px] pb-[12px] flex items-center gap-[8px]">
        {/* Skip back 15s */}
        <button
          onClick={skipBack}
          disabled={playState === "idle" && charIndexRef.current === 0}
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-20 disabled:cursor-not-allowed bg-transparent"
          style={{ color: fg }}
          aria-label="Skip back 15 seconds"
          title="−15s"
        >
          <SkipBack size={15} />
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePause}
          className="w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer transition-opacity hover:opacity-80"
          style={{ background: ACCENT, color: "#fff" }}
          aria-label={playState === "playing" ? "Pause" : "Play"}
        >
          {playState === "playing" ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>

        {/* Skip forward 15s */}
        <button
          onClick={skipForward}
          disabled={playState === "idle" && progress === 0}
          className="w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 border-none cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-20 disabled:cursor-not-allowed bg-transparent"
          style={{ color: fg }}
          aria-label="Skip forward 15 seconds"
          title="+15s"
        >
          <SkipForward size={15} />
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
        <div className="flex-1 flex justify-end">
          <div
            className="flex items-center rounded-[6px] overflow-hidden border"
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
      </div>

      {/* Voice selector */}
      {voices.length > 0 && (
        <div className="px-[14px] pb-[14px] relative">
          <button
            ref={voiceBtnRef}
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
              className="absolute bottom-[calc(100%-8px)] left-[14px] right-[14px] rounded-[8px] border shadow-xl overflow-y-auto max-h-[180px] z-[9999]"
              style={{ background: bg, borderColor: `${fg}18` }}
              data-lenis-prevent="true"
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
                      ? { color: ACCENT, fontWeight: 600, background: `${ACCENT}10` }
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
