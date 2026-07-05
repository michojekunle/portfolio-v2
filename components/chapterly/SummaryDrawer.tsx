"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  BookOpen,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  BookMarked,
  Loader2,
  Volume2,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  ChevronDown,
  Plus,
  Check,
} from "lucide-react";

const ACCENT = "#4F6D7A";
const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];
const CHARS_PER_SECOND = (200 / 60) * 5;
const SKIP_SECONDS = 15;

export interface SummaryBook {
  id?: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  previewContent?: string; // pre-built content (daily picks)
}

interface Props {
  book: SummaryBook;
  onClose: () => void;
  /** Optional: saves this summary into the user's library as "Summary: <title>" */
  onAddToLibrary?: () => Promise<void>;
  /** Whether the summary is already saved in the library */
  isAdded?: boolean;
}

// ── Markdown section parser ──────────────────────────────────────────────────

interface ParsedInsight {
  number: string;
  title: string;
  body: string;
}

interface ParsedSummary {
  corePremise: string;
  whyItMatters: string;
  insights: ParsedInsight[];
  quotes: string[];
  actionSteps: string[];
  takeaway: string;
  raw: string;
}

// Headings claimed by the dedicated sections below — everything else is
// treated as a chapter when no explicit "Key Insights" section exists.
const SPECIAL_SECTION_KEYS = ["premise", "core", "why", "matter", "quote", "action", "takeaway", "one-line"];

function parseSummary(text: string): ParsedSummary {
  const lines = text.split("\n");
  let currentSection = "";
  const sections: Record<string, string[]> = {};
  const orderedSections: { key: string; title: string; lines: string[] }[] = [];
  const insightBuffer: { num: string; title: string; lines: string[] }[] = [];
  let currentInsight: { num: string; title: string; lines: string[] } | null = null;

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      if (currentInsight) { insightBuffer.push(currentInsight); currentInsight = null; }
      currentSection = h2[1].toLowerCase();
      sections[currentSection] = sections[currentSection] ?? [];
      orderedSections.push({ key: currentSection, title: h2[1].trim(), lines: sections[currentSection] });
      continue;
    }

    // Numbered insight: "1. **Title**" or "1. Title"
    const insightMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*(.*)/) ?? line.match(/^(\d+)\.\s+(.+)/);
    if (insightMatch && currentSection.includes("insight")) {
      if (currentInsight) insightBuffer.push(currentInsight);
      const title = insightMatch[2] ?? "";
      const rest = insightMatch[3] ?? "";
      currentInsight = { num: insightMatch[1] ?? "", title, lines: rest.trim() ? [rest.trim()] : [] };
      continue;
    }

    if (currentInsight) {
      if (line.trim()) currentInsight.lines.push(line.trim());
      continue;
    }

    if (currentSection && line.trim()) {
      sections[currentSection].push(line);
    }
  }
  if (currentInsight) insightBuffer.push(currentInsight);

  // Fallback for content without a "Key Insights" section (e.g. curated
  // summaries with headings like "## The 4 Laws of Behavior Change"):
  // harvest numbered items from generic sections as chapter cards, and if
  // there are none, use the sections themselves as chapters.
  if (insightBuffer.length === 0) {
    const genericSections = orderedSections.filter(
      (s) => !SPECIAL_SECTION_KEYS.some((k) => s.key.includes(k))
    );
    for (const section of genericSections) {
      for (const raw of section.lines) {
        const m = raw.match(/^(\d+)\.\s+\*\*(.+?)\*\*[:\s]*(.*)/) ?? raw.match(/^(\d+)\.\s+([^:]{2,60}):\s*(.+)/) ?? raw.match(/^(\d+)\.\s+(.+)/);
        if (m) {
          insightBuffer.push({
            num: String(insightBuffer.length + 1),
            title: (m[2] ?? "").replace(/\*\*/g, "").trim(),
            lines: m[3]?.trim() ? [m[3].trim()] : [],
          });
        }
      }
    }
    if (insightBuffer.length === 0) {
      genericSections.forEach((section, i) => {
        const body = section.lines.join(" ").trim();
        if (body) insightBuffer.push({ num: String(i + 1), title: section.title, lines: [body] });
      });
    }
  }

  const getSection = (...keys: string[]): string => {
    for (const key of keys) {
      for (const [k, v] of Object.entries(sections)) {
        if (k.includes(key)) return v.join("\n").trim();
      }
    }
    return "";
  };

  const quotes = Object.entries(sections)
    .filter(([k]) => k.includes("quote"))
    .flatMap(([, lines]) => lines)
    .filter((l) => l.startsWith(">"))
    .map((l) => l.slice(1).trim())
    .filter(Boolean);

  const actionLines = Object.entries(sections)
    .filter(([k]) => k.includes("action"))
    .flatMap(([, lines]) => lines)
    .filter((l) => /^\d+\./.test(l.trim()))
    .map((l) => l.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);

  const insights: ParsedInsight[] = insightBuffer.map((ins) => ({
    number: ins.num,
    title: ins.title.replace(/\*\*/g, ""),
    body: ins.lines.join(" ").trim(),
  }));

  return {
    corePremise: getSection("premise", "core"),
    whyItMatters: getSection("why", "matter"),
    insights,
    quotes,
    actionSteps: actionLines,
    takeaway: getSection("takeaway", "one-line"),
    raw: text,
  };
}

// ── Inline markdown renderer (bold only) ─────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

// ── Read tab ─────────────────────────────────────────────────────────────────

function ReadTab({ summary }: { summary: ParsedSummary }): React.ReactElement {
  const [insightIdx, setInsightIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const insights = summary.insights;
  const current = insights[insightIdx];

  const prev = (): void => setInsightIdx((i) => Math.max(0, i - 1));
  const next = (): void => setInsightIdx((i) => Math.min(insights.length - 1, i + 1));

  const onTouchStart = (e: React.TouchEvent): void => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent): void => {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  return (
    <div className="flex flex-col gap-[24px]">
      {/* Core Premise */}
      {summary.corePremise && (
        <section>
          <div className="font-mono text-[9px] tracking-[0.18em] uppercase font-bold mb-[8px]" style={{ color: "var(--ch-accent)" }}>
            Core Premise
          </div>
          <p className="text-[14px] leading-[1.75] text-[var(--ink-2)] m-0">
            {renderInline(summary.corePremise)}
          </p>
        </section>
      )}

      {/* Why It Matters */}
      {summary.whyItMatters && (
        <section>
          <div className="font-mono text-[9px] tracking-[0.18em] uppercase font-bold mb-[8px]" style={{ color: "var(--ch-accent)" }}>
            Why This Book Matters
          </div>
          <p className="text-[14px] leading-[1.75] text-[var(--ink-2)] m-0">
            {renderInline(summary.whyItMatters)}
          </p>
        </section>
      )}

      {/* Key Insights — swipeable cards */}
      {insights.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-[12px]">
            <div className="font-mono text-[9px] tracking-[0.18em] uppercase font-bold" style={{ color: "var(--ch-accent)" }}>
              Key Insights
            </div>
            <span className="font-mono text-[9px] text-[var(--ink-3)]">
              {insightIdx + 1} / {insights.length}
            </span>
          </div>

          {/* Card */}
          <div
            ref={cardsRef}
            className="rounded-[14px] border border-[var(--rule)] bg-[var(--bg-2)] p-[20px] select-none"
            style={{ minHeight: "160px" }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {current && (
              <div>
                <div
                  className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center mb-[12px] font-display text-[16px] font-bold"
                  style={{ background: `${ACCENT}18`, color: ACCENT }}
                >
                  {current.number}
                </div>
                <div className="text-[15px] font-semibold text-[var(--ink)] mb-[8px] leading-[1.35]">
                  {current.title}
                </div>
                <p className="text-[13px] leading-[1.7] text-[var(--ink-2)] m-0">
                  {current.body}
                </p>
              </div>
            )}
          </div>

          {/* Nav dots + arrows */}
          <div className="flex items-center justify-between mt-[10px]">
            <button
              onClick={prev}
              disabled={insightIdx === 0}
              className="w-[32px] h-[32px] rounded-full flex items-center justify-center border-none cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-20 bg-transparent"
              style={{ color: "var(--ink-2)" }}
              aria-label="Previous insight"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-[5px]">
              {insights.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setInsightIdx(i)}
                  className="rounded-full border-none cursor-pointer transition-all"
                  style={{
                    width: i === insightIdx ? "18px" : "6px",
                    height: "6px",
                    background: i === insightIdx ? ACCENT : "var(--rule)",
                  }}
                  aria-label={`Insight ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              disabled={insightIdx === insights.length - 1}
              className="w-[32px] h-[32px] rounded-full flex items-center justify-center border-none cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-20 bg-transparent"
              style={{ color: "var(--ink-2)" }}
              aria-label="Next insight"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
      )}

      {/* Memorable Quotes */}
      {summary.quotes.length > 0 && (
        <section>
          <div className="font-mono text-[9px] tracking-[0.18em] uppercase font-bold mb-[12px]" style={{ color: "var(--ch-accent)" }}>
            Memorable Quotes
          </div>
          <div className="flex flex-col gap-[12px]">
            {summary.quotes.map((q, i) => (
              <blockquote
                key={i}
                className="m-0 rounded-[10px] px-[16px] py-[12px] text-[13px] leading-[1.7] italic text-[var(--ink-2)]"
                style={{ background: `${ACCENT}0d` }}
              >
                &ldquo;{q}&rdquo;
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* Action Steps */}
      {summary.actionSteps.length > 0 && (
        <section>
          <div className="font-mono text-[9px] tracking-[0.18em] uppercase font-bold mb-[12px]" style={{ color: "var(--ch-accent)" }}>
            Action Steps
          </div>
          <ol className="m-0 p-0 list-none flex flex-col gap-[10px]">
            {summary.actionSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-[12px]">
                <span
                  className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center font-mono text-[9px] font-bold mt-[1px]"
                  style={{ background: `${ACCENT}18`, color: ACCENT }}
                >
                  {i + 1}
                </span>
                <span className="text-[13px] leading-[1.7] text-[var(--ink-2)]">
                  {renderInline(step)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* One-Line Takeaway */}
      {summary.takeaway && (
        <section
          className="rounded-[14px] px-[20px] py-[16px]"
          style={{ background: `${ACCENT}10` }}
        >
          <div className="font-mono text-[9px] tracking-[0.18em] uppercase font-bold mb-[8px]" style={{ color: "var(--ch-accent)" }}>
            One-Line Takeaway
          </div>
          <p className="text-[15px] font-semibold text-[var(--ink)] leading-[1.5] m-0 italic">
            &ldquo;{summary.takeaway}&rdquo;
          </p>
        </section>
      )}
    </div>
  );
}

// ── Listen tab — embedded TTS ─────────────────────────────────────────────────

function ListenTab({ text }: { text: string }): React.ReactElement {
  const [playState, setPlayState] = useState<"idle" | "playing" | "paused">("idle");
  const [speed, setSpeed] = useState<Speed>(1);
  const [voices, setVoices] = useState<{ name: string; short: string; voice: SpeechSynthesisVoice }[]>([]);
  const [voiceIdx, setVoiceIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showVoices, setShowVoices] = useState(false);
  const charRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalChars = text.length;

  useEffect(() => {
    const load = (): void => {
      const available = window.speechSynthesis
        .getVoices()
        .filter((v) => v.lang.startsWith("en"))
        .map((v) => ({
          name: v.name,
          short: v.name.replace(/^(Google|Apple|Microsoft)\s+/, "").replace(/\s+Online.*/i, ""),
          voice: v,
        }));
      if (available.length > 0) setVoices(available);
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  const stopTick = useCallback((): void => {
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
  }, []);

  const startTick = useCallback((): void => {
    stopTick();
    tickRef.current = setInterval(() => {
      if (totalChars > 0) setProgress(Math.min(charRef.current / totalChars, 1));
    }, 250);
  }, [totalChars, stopTick]);

  const stop = useCallback((): void => {
    window.speechSynthesis.cancel();
    stopTick();
    charRef.current = 0;
    setPlayState("idle");
    setProgress(0);
  }, [stopTick]);

  const play = useCallback((fromChar = 0): void => {
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    stopTick();
    const utt = new SpeechSynthesisUtterance(text.slice(Math.max(0, fromChar)));
    utt.rate = speed;
    if (voices[voiceIdx]) utt.voice = voices[voiceIdx].voice;
    utt.onboundary = (e) => { if (e.name === "word") charRef.current = fromChar + e.charIndex; };
    utt.onstart = () => { setPlayState("playing"); startTick(); };
    utt.onpause = () => { setPlayState("paused"); stopTick(); };
    utt.onresume = () => { setPlayState("playing"); startTick(); };
    utt.onend = () => { stopTick(); setPlayState("idle"); setProgress(1); charRef.current = 0; };
    utt.onerror = (e) => {
      if (e.error !== "interrupted") { console.error("[tts]", e.error); charRef.current = 0; }
      stopTick(); setPlayState("idle");
    };
    window.speechSynthesis.speak(utt);
  }, [text, speed, voices, voiceIdx, startTick, stopTick]);

  const toggle = useCallback((): void => {
    if (playState === "playing") window.speechSynthesis.pause();
    else if (playState === "paused") window.speechSynthesis.resume();
    else play(charRef.current);
  }, [playState, play]);

  const skipForward = (): void => {
    const skipChars = Math.round(CHARS_PER_SECOND * SKIP_SECONDS * speed);
    const newChar = Math.min(charRef.current + skipChars, totalChars - 1);
    charRef.current = newChar;
    if (playState !== "idle") play(newChar);
    setProgress(newChar / totalChars);
  };

  const skipBack = (): void => {
    const skipChars = Math.round(CHARS_PER_SECOND * SKIP_SECONDS * speed);
    const newChar = Math.max(charRef.current - skipChars, 0);
    charRef.current = newChar;
    if (playState !== "idle") play(newChar);
    setProgress(newChar / totalChars);
  };

  // Re-play when speed or voice changes mid-playback
  const playStateRef = useRef<"idle" | "playing" | "paused">("idle");
  const playRef = useRef(play);
  useEffect(() => { playRef.current = play; });
  useEffect(() => { playStateRef.current = playState; }, [playState]);
  useEffect(() => { if (playStateRef.current !== "idle") playRef.current(charRef.current); }, [speed, voiceIdx]);
  useEffect(() => () => { window.speechSynthesis.cancel(); stopTick(); }, [stopTick]);

  const progressPct = Math.round(progress * 100);
  const estMinutes = totalChars > 0 ? Math.ceil(totalChars / CHARS_PER_SECOND / 60 * (1 / speed)) : 0;

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Progress + time estimate */}
      <div>
        <div className="flex justify-between items-center mb-[8px]">
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--ink-3)]">
            {playState === "playing" ? "Playing…" : playState === "paused" ? "Paused" : "Ready to play"}
          </span>
          <span className="font-mono text-[9px] text-[var(--ink-3)]">
            ~{estMinutes}m {progressPct > 0 ? `· ${progressPct}%` : ""}
          </span>
        </div>
        <div className="h-[4px] rounded-full overflow-hidden" style={{ background: "var(--rule)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${ACCENT}, #6B8FA0)` }}
          />
        </div>
      </div>

      {/* Main controls */}
      <div className="flex items-center justify-center gap-[16px]">
        <button
          onClick={skipBack}
          className="w-[44px] h-[44px] rounded-full flex items-center justify-center border border-[var(--rule)] cursor-pointer transition-colors hover:border-[var(--ink-2)] bg-transparent"
          style={{ color: "var(--ink-2)" }}
          aria-label="Skip back 15s"
          title="−15s"
        >
          <SkipBack size={18} />
        </button>

        <button
          onClick={toggle}
          className="w-[56px] h-[56px] rounded-full flex items-center justify-center border-none cursor-pointer transition-opacity hover:opacity-85 shadow-lg"
          style={{ background: ACCENT, color: "#fff" }}
          aria-label={playState === "playing" ? "Pause" : "Play"}
        >
          {playState === "playing" ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>

        <button
          onClick={skipForward}
          className="w-[44px] h-[44px] rounded-full flex items-center justify-center border border-[var(--rule)] cursor-pointer transition-colors hover:border-[var(--ink-2)] bg-transparent"
          style={{ color: "var(--ink-2)" }}
          aria-label="Skip forward 15s"
          title="+15s"
        >
          <SkipForward size={18} />
        </button>

        <button
          onClick={stop}
          disabled={playState === "idle"}
          className="w-[36px] h-[36px] rounded-full flex items-center justify-center border border-[var(--rule)] cursor-pointer transition-colors hover:border-[var(--ink-2)] disabled:opacity-25 disabled:cursor-not-allowed bg-transparent"
          style={{ color: "var(--ink-2)" }}
          aria-label="Stop"
        >
          <Square size={13} fill="currentColor" />
        </button>
      </div>

      {/* Speed + Voice */}
      <div className="flex items-center gap-[10px]">
        {/* Speed selector */}
        <div className="flex items-center rounded-[8px] overflow-hidden border border-[var(--rule)]">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className="h-[32px] px-[9px] font-mono text-[9px] font-semibold border-none cursor-pointer transition-all"
              style={
                speed === s
                  ? { background: ACCENT, color: "#fff" }
                  : { background: "transparent", color: "var(--ink-3)" }
              }
              aria-pressed={speed === s}
            >
              {s}×
            </button>
          ))}
        </div>

        {/* Voice */}
        {voices.length > 0 && (
          <div className="relative flex-1">
            <button
              onClick={() => setShowVoices((v) => !v)}
              className="w-full flex items-center justify-between px-[10px] py-[6px] rounded-[8px] border cursor-pointer text-left transition-colors bg-transparent"
              style={{ borderColor: "var(--rule)", color: "var(--ink-2)" }}
            >
              <span className="font-mono text-[9px] truncate opacity-80">
                {voices[voiceIdx]?.short ?? "Default"}
              </span>
              <ChevronDown size={11} className="opacity-50 shrink-0" style={{ transform: showVoices ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }} />
            </button>
            {showVoices && (
              <div className="absolute bottom-[calc(100%+4px)] left-0 right-0 rounded-[8px] border border-[var(--rule)] shadow-xl overflow-y-auto max-h-[160px] z-10 bg-[var(--bg)]">
                {voices.map((v, i) => (
                  <button
                    key={v.name}
                    onClick={() => { setVoiceIdx(i); setShowVoices(false); }}
                    className="w-full text-left px-[12px] py-[8px] font-mono text-[9px] tracking-[0.06em] cursor-pointer border-none bg-transparent transition-colors hover:bg-[var(--bg-2)]"
                    style={i === voiceIdx ? { color: ACCENT, fontWeight: 600 } : { color: "var(--ink-2)" }}
                  >
                    {v.short}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="m-0 text-[12px] leading-[1.5] text-[var(--ink-3)] text-center">
        The full summary will be read aloud. Use skip buttons to jump ±15 seconds.
      </p>
    </div>
  );
}

// ── Loading state ─────────────────────────────────────────────────────────────

function LoadingPulse(): React.ReactElement {
  return (
    <div className="flex flex-col gap-[16px] pt-[8px]">
      {[80, 60, 100, 70, 90].map((w, i) => (
        <div
          key={i}
          className="h-[14px] rounded-full animate-pulse"
          style={{ width: `${w}%`, background: "var(--rule)" }}
        />
      ))}
    </div>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────

export function SummaryDrawer({ book, onClose, onAddToLibrary, isAdded }: Props): React.ReactElement {
  const [activeTab, setActiveTab] = useState<"read" | "listen">("read");
  const [loading, setLoading] = useState(!book.previewContent);
  const [error, setError] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState(book.previewContent ?? "");
  const [summary, setSummary] = useState<ParsedSummary | null>(
    book.previewContent ? parseSummary(book.previewContent) : null
  );
  const [addState, setAddState] = useState<"idle" | "adding" | "added">(isAdded ? "added" : "idle");

  const handleAddToLibrary = async (): Promise<void> => {
    if (!onAddToLibrary || addState !== "idle") return;
    setAddState("adding");
    try {
      await onAddToLibrary();
      setAddState("added");
    } catch (err) {
      console.error("[summary-drawer] add to library error:", err);
      setAddState("idle");
    }
  };

  // Stream summary from API if no preview content
  useEffect(() => {
    if (book.previewContent) return;
    if (!book.id) { setError("No book ID available to generate summary."); setLoading(false); return; }

    let cancelled = false;
    let accumulated = "";

    const stream = async (): Promise<void> => {
      try {
        const res = await fetch("/api/chapterly/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ book_id: book.id }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(d.error ?? "Failed to generate summary");
        }
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;
          accumulated += decoder.decode(value, { stream: true });
          setRawContent(accumulated);
          setSummary(parseSummary(accumulated));
        }
        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error("[summary-drawer] stream error:", err);
          setError(err instanceof Error ? err.message : "Failed to load summary");
          setLoading(false);
        }
      }
    };

    void stream();
    return () => { cancelled = true; };
  }, [book.id, book.previewContent]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden shadow-2xl"
        style={{
          width: "min(480px, 100vw)",
          background: "var(--bg)",
          borderLeft: "1px solid var(--rule)",
          animation: "slideInRight 0.28s cubic-bezier(0.16,1,0.3,1)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Summary: ${book.title}`}
      >
        {/* ── Header ── */}
        <div
          className="shrink-0 flex items-center justify-between px-[20px] py-[16px] border-b border-[var(--rule)]"
        >
          <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
            Book Summary
          </div>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
            aria-label="Close summary"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Book cover + info ── */}
        <div className="shrink-0 flex items-center gap-[16px] px-[20px] py-[20px] border-b border-[var(--rule)]">
          <div
            className="w-[72px] h-[96px] rounded-[10px] flex items-center justify-center overflow-hidden shrink-0 shadow-md"
            style={{ background: `${ACCENT}20` }}
          >
            {book.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookMarked size={28} style={{ color: ACCENT, opacity: 0.6 }} />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold leading-[1.3] text-[var(--ink)] m-0 mb-[4px] line-clamp-2">
              {book.title}
            </h2>
            {book.author && (
              <div className="font-mono text-[10px] tracking-[0.08em] text-[var(--ink-3)] mb-[10px]">
                {book.author}
              </div>
            )}
            <div className="flex items-center gap-[8px] flex-wrap">
              <div
                className="inline-flex items-center gap-[5px] font-mono text-[8px] tracking-[0.1em] uppercase px-[8px] py-[3px] rounded-full"
                style={{ background: `${ACCENT}14`, color: ACCENT }}
              >
                <Lightbulb size={9} />
                AI Summary
              </div>
              {onAddToLibrary && (
                <button
                  onClick={() => void handleAddToLibrary()}
                  disabled={addState !== "idle"}
                  className="inline-flex items-center gap-[5px] font-mono text-[8px] tracking-[0.1em] uppercase px-[8px] py-[3px] rounded-full border cursor-pointer transition-all disabled:cursor-default"
                  style={
                    addState === "added"
                      ? { background: "#16A34A14", color: "#16A34A", borderColor: "#16A34A40" }
                      : { background: "transparent", color: ACCENT, borderColor: `${ACCENT}50` }
                  }
                  title={addState === "added" ? "Saved to your library" : "Save this summary to your library"}
                >
                  {addState === "adding" ? (
                    <Loader2 size={9} className="animate-spin" />
                  ) : addState === "added" ? (
                    <Check size={9} />
                  ) : (
                    <Plus size={9} />
                  )}
                  {addState === "added" ? "In Library" : "Save to Library"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="shrink-0 flex border-b border-[var(--rule)]">
          {(["read", "listen"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 flex items-center justify-center gap-[8px] h-[44px] font-mono text-[9px] tracking-[0.12em] uppercase font-semibold border-none cursor-pointer transition-all bg-transparent"
              style={
                activeTab === tab
                  ? { color: ACCENT, boxShadow: `inset 0 -2px 0 ${ACCENT}` }
                  : { color: "var(--ink-3)" }
              }
            >
              {tab === "read" ? <BookOpen size={12} /> : <Volume2 size={12} />}
              {tab === "read" ? "Read" : "Listen"}
            </button>
          ))}
        </div>

        {/* ── Tab content (scrollable) ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-[20px] py-[24px]">
          {loading && !summary && <LoadingPulse />}
          {error && (
            <div
              className="rounded-[10px] px-[16px] py-[14px] text-[13px]"
              style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}
            >
              {error}
            </div>
          )}
          {summary && activeTab === "read" && <ReadTab summary={summary} />}
          {activeTab === "listen" && rawContent && <ListenTab text={rawContent} />}
          {activeTab === "listen" && !rawContent && !loading && (
            <p className="text-[13px] text-[var(--ink-3)] text-center py-[40px]">
              Summary is still loading — switch to Read tab and come back.
            </p>
          )}
          {activeTab === "listen" && loading && !rawContent && <LoadingPulse />}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1;   }
        }
      `}</style>
    </>
  );
}
