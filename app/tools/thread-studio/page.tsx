"use client";

import React, { useState, useCallback } from "react";
import { Sparkles, Trash, Plus, Copy, Check, ArrowUp, ArrowDown, Smartphone, ChevronRight } from "lucide-react";

const ACCENT = "#6366F1";
const ACCENT_SOFT = "rgba(99,102,241,0.12)";
const ACCENT_BORDER = "rgba(99,102,241,0.25)";

const TONES = ["Educational", "Storytelling", "Controversial", "Technical"] as const;
type Tone = (typeof TONES)[number];

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  Educational: "Clear, informative, teaches the reader something valuable",
  Storytelling: "Narrative-driven, emotional, keeps readers hooked",
  Controversial: "Bold takes, challenges assumptions, sparks debate",
  Technical: "Deep-dive, precise, targets experts and builders",
};

type GenerateResponse = {
  tweets: string[];
  error?: never;
} | {
  error: string;
  tweets?: never;
};

export default function ThreadStudioPage(): React.ReactElement {
  const [topic, setTopic] = useState("");
  const [roughNotes, setRoughNotes] = useState("");
  const [inputMode, setInputMode] = useState<"topic" | "refine" | "manual">("topic");
  const [tone, setTone] = useState<Tone>("Educational");
  const [threadLength, setThreadLength] = useState(7);
  const [tweets, setTweets] = useState<string[]>([]);
  const [editedTweets, setEditedTweets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Customize profile details for mockup
  const [creatorName, setCreatorName] = useState("Michael Ojekunle");
  const [creatorHandle, setCreatorHandle] = useState("@michojekunle");

  // Re-number helper to maintain prefix order (e.g. 1/5 text...)
  const renumberTweets = (list: string[]): string[] => {
    const total = list.length;
    return list.map((tweet, i) => {
      const regex = /^\d+\/\d+\s*/;
      const cleanTweet = tweet.replace(regex, "");
      return `${i + 1}/${total} ${cleanTweet}`;
    });
  };

  const generate = useCallback(async (): Promise<void> => {
    const inputContent = inputMode === "refine" ? roughNotes.trim() : topic.trim();
    if (!inputContent) return;

    setLoading(true);
    setError(null);
    setTweets([]);
    setEditedTweets([]);

    try {
      const res = await fetch("/api/thread-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic: inputContent, 
          tone, 
          threadLength,
          mode: inputMode === "manual" ? "topic" : inputMode 
        }),
      });

      const data = (await res.json()) as GenerateResponse;

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }

      if (!data.tweets || data.tweets.length === 0) {
        throw new Error("No tweets returned from AI");
      }

      setTweets(data.tweets);
      setEditedTweets([...data.tweets]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [topic, roughNotes, tone, threadLength, inputMode]);

  const updateTweet = useCallback((index: number, value: string): void => {
    setEditedTweets((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  // Tweet card actions
  const addTweet = (index: number): void => {
    setEditedTweets((prev) => {
      const next = [...prev];
      const nextNum = next.length + 1;
      next.splice(index + 1, 0, `${index + 2}/${nextNum} New tweet draft...`);
      return renumberTweets(next);
    });
  };

  const deleteTweet = (index: number): void => {
    if (editedTweets.length <= 1) return;
    setEditedTweets((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return renumberTweets(next);
    });
  };

  const moveTweet = (index: number, direction: "up" | "down"): void => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === editedTweets.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    setEditedTweets((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return renumberTweets(next);
    });
  };

  const initManualThread = (): void => {
    const blank = [
      "1/3 Enter hook tweet content here...",
      "2/3 Add support metrics or narrative detail...",
      "3/3 CTA link or final thought to close the thread."
    ];
    setTweets(blank);
    setEditedTweets(blank);
  };

  const copyTweet = async (index: number, text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      setError("Could not copy tweet — please copy manually.");
    }
  };

  const copyAll = useCallback(async (): Promise<void> => {
    const text = editedTweets.join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard — please select and copy manually.");
    }
  }, [editedTweets]);

  const hasThread = editedTweets.length > 0;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="outline-none min-h-screen"
      style={{ background: "var(--bg)" }}
    >
      {/* Hero */}
      <section
        className="pt-[140px] pb-[60px] max-[720px]:pt-[100px] max-[720px]:pb-[36px] border-b"
        style={{ borderColor: "var(--rule)" }}
      >
        <div className="max-w-[1240px] mx-auto px-[var(--gutter,24px)] flex items-center justify-between gap-[32px] max-[720px]:flex-col max-[720px]:items-start">
          <div>
            <div
              className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.16em] uppercase mb-[24px] px-[10px] py-[4px] rounded-full"
              style={{ background: ACCENT_SOFT, color: ACCENT, border: `1px solid ${ACCENT_BORDER}` }}
            >
              <span
                className="w-[5px] h-[5px] rounded-full"
                style={{ background: ACCENT }}
                aria-hidden="true"
              />
              Thread Studio
            </div>
            <h1
              className="font-display font-normal leading-[0.9] tracking-[-0.04em] fvs-display m-0 mb-[20px]"
              style={{ fontSize: "clamp(44px,7vw,80px)", color: "var(--ink)" }}
            >
              Engineer viral{" "}
              <em className="not-italic italic fvs-soft" style={{ color: ACCENT }}>
                threads.
              </em>
            </h1>
            <p
              className="text-[17px] leading-[1.65] m-0 max-w-[50ch]"
              style={{ color: "var(--ink-2)" }}
            >
              Convert topic pitches or rough transcripts into highly optimized, viral threads. Preview in real-time and export to clipboard.
            </p>
          </div>

          <div
            className="flex items-center gap-[12px] p-[16px] rounded-[12px] max-w-[340px]"
            style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
          >
            <Smartphone className="shrink-0" size={24} style={{ color: ACCENT }} />
            <div className="text-[12px] leading-[1.4] text-[var(--ink-3)]">
              <strong>X Live Feed Preview:</strong> Experience your threads formatted as they would appear on Twitter with real-time length limit flags!
            </div>
          </div>
        </div>
      </section>

      {/* Workspace */}
      <section className="max-w-[1240px] mx-auto px-[var(--gutter,24px)] py-[48px]">
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-[40px] max-[960px]:grid-cols-1">
          {/* Left Column: Editor */}
          <div className="space-y-[32px]">
            {/* Input Config Card */}
            <div
              className="rounded-[16px] p-[32px] max-[720px]:p-[20px] space-y-[24px]"
              style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
            >
              {/* Modes Tabs */}
              <div className="flex border-b border-[var(--rule)] pb-[1px] gap-[24px] overflow-x-auto">
                {[
                  { id: "topic", label: "From Topic" },
                  { id: "refine", label: "Refine Raw Draft" },
                  { id: "manual", label: "Start Manually" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setInputMode(tab.id as "topic" | "refine" | "manual");
                      if (tab.id === "manual") initManualThread();
                    }}
                    className="pb-[12px] font-mono text-[10px] uppercase tracking-[0.14em] font-semibold cursor-pointer border-b-2 transition-colors duration-150 shrink-0"
                    style={{
                      color: inputMode === tab.id ? ACCENT : "var(--ink-3)",
                      borderColor: inputMode === tab.id ? ACCENT : "transparent",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {inputMode === "topic" && (
                <div className="space-y-[20px]">
                  <div>
                    <label
                      htmlFor="topic"
                      className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-[10px]"
                      style={{ color: "var(--ink-3)" }}
                    >
                      Topic
                    </label>
                    <textarea
                      id="topic"
                      rows={3}
                      placeholder="e.g. How compound interest actually works, Why most todo apps fail, The psychology of viral content..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full rounded-[10px] px-[16px] py-[12px] text-[15px] leading-[1.6] resize-none transition-colors duration-150 outline-none"
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--rule)",
                        color: "var(--ink)",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--rule)"; }}
                    />
                  </div>
                </div>
              )}

              {inputMode === "refine" && (
                <div className="space-y-[20px]">
                  <div>
                    <label
                      htmlFor="notes"
                      className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-[10px]"
                      style={{ color: "var(--ink-3)" }}
                    >
                      Rough Notes / Transcript / Copy Outline
                    </label>
                    <textarea
                      id="notes"
                      rows={5}
                      placeholder="Paste your rough outline ideas, transcript paragraphs, raw copy notes, or brainstorm concepts here (up to 5,000 characters). AI will structure and write a viral thread stack from it."
                      value={roughNotes}
                      onChange={(e) => setRoughNotes(e.target.value)}
                      className="w-full rounded-[10px] px-[16px] py-[12px] text-[14px] leading-[1.6] resize-none transition-colors duration-150 outline-none font-sans"
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--rule)",
                        color: "var(--ink)",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "var(--rule)"; }}
                    />
                  </div>
                </div>
              )}

              {inputMode !== "manual" && (
                <>
                  <div>
                    <div
                      className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-[10px]"
                      style={{ color: "var(--ink-3)" }}
                    >
                      Tone
                    </div>
                    <div className="grid grid-cols-2 max-[520px]:grid-cols-1 gap-[8px]">
                      {TONES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTone(t)}
                          className="text-left px-[16px] py-[12px] rounded-[8px] transition-all duration-150 border cursor-pointer"
                          style={{
                            background: tone === t ? ACCENT_SOFT : "var(--bg)",
                            borderColor: tone === t ? ACCENT : "var(--rule)",
                            color: tone === t ? ACCENT : "var(--ink-2)",
                          }}
                        >
                          <div className="font-mono text-[11px] tracking-[0.08em] uppercase font-semibold mb-[2px]">
                            {t}
                          </div>
                          <div className="text-[12px] leading-[1.4]" style={{ color: "var(--ink-3)" }}>
                            {TONE_DESCRIPTIONS[t]}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="thread-length"
                      className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-[10px]"
                      style={{ color: "var(--ink-3)" }}
                    >
                      Thread length — {threadLength} tweets
                    </label>
                    <div className="flex items-center gap-[16px]">
                      <input
                        id="thread-length"
                        type="range"
                        min={3}
                        max={15}
                        value={threadLength}
                        onChange={(e) => setThreadLength(Number(e.target.value))}
                        className="flex-1 h-[4px] rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(90deg, ${ACCENT} ${((threadLength - 3) / (15 - 3)) * 100}%, var(--rule) ${((threadLength - 3) / (15 - 3)) * 100}%)`,
                          accentColor: ACCENT
                        }}
                      />
                      <span
                        className="font-mono text-[14px] font-semibold w-[28px] text-center"
                        style={{ color: ACCENT }}
                      >
                        {threadLength}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void generate()}
                    disabled={loading || (inputMode === "topic" ? !topic.trim() : !roughNotes.trim())}
                    className="w-full h-[52px] rounded-[8px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white"
                    style={{
                      background: (inputMode === "topic" ? topic.trim() : roughNotes.trim()) && !loading ? ACCENT : "var(--rule)",
                    }}
                  >
                    {loading ? "Generating thread..." : "Generate thread"}
                  </button>
                </>
              )}

              {inputMode === "manual" && (
                <div className="p-[16px] rounded-[10px] border border-[var(--rule)] bg-[var(--bg)] flex items-center gap-[12px]">
                  <ChevronRight size={16} style={{ color: ACCENT }} />
                  <span className="text-[12px] text-[var(--ink-2)]">
                    Create tweets manually using the list tools below. Your prefixes will automatically synchronize!
                  </span>
                </div>
              )}
            </div>

            {/* Custom Brand Mockup Setup */}
            <div
              className="rounded-[16px] p-[24px] space-y-[16px]"
              style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
            >
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
                Mockup Identity Settings
              </div>
              <div className="grid grid-cols-2 gap-[16px] max-[520px]:grid-cols-1">
                <div>
                  <label htmlFor="mock-name" className="block text-[11px] text-[var(--ink-3)] mb-[6px]">Display Name</label>
                  <input
                    id="mock-name"
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="w-full h-[40px] px-[12px] rounded-[8px] text-[13px] outline-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink)" }}
                  />
                </div>
                <div>
                  <label htmlFor="mock-handle" className="block text-[11px] text-[var(--ink-3)] mb-[6px]">Twitter @Handle</label>
                  <input
                    id="mock-handle"
                    type="text"
                    value={creatorHandle}
                    onChange={(e) => setCreatorHandle(e.target.value)}
                    className="w-full h-[40px] px-[12px] rounded-[8px] text-[13px] outline-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink)" }}
                  />
                </div>
              </div>
            </div>

            {/* Error output */}
            {error && (
              <div
                className="rounded-[8px] px-[20px] py-[16px] text-[14px] leading-[1.5]"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#dc2626",
                }}
              >
                {error}
              </div>
            )}

            {/* Thread Editor output list */}
            {hasThread && (
              <div className="space-y-[20px]">
                <div className="flex items-center justify-between border-b pb-[12px] border-[var(--rule)]">
                  <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
                    Tweet Stack Editor
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyAll()}
                    className="inline-flex items-center gap-[8px] px-[16px] py-[8px] rounded-full font-mono text-[9px] uppercase tracking-[0.12em] font-semibold transition-all duration-200 cursor-pointer"
                    style={{
                      background: copied ? "rgba(34,197,94,0.12)" : ACCENT_SOFT,
                      color: copied ? "#16a34a" : ACCENT,
                      border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : ACCENT_BORDER}`,
                    }}
                  >
                    {copied ? "Copied All!" : "Copy Full Thread"}
                  </button>
                </div>

                <div className="flex flex-col gap-[16px]">
                  {editedTweets.map((tweet, i) => (
                    <TweetCard
                      key={i}
                      index={i}
                      value={tweet}
                      onChange={updateTweet}
                      onAdd={() => addTweet(i)}
                      onDelete={() => deleteTweet(i)}
                      onMoveUp={() => moveTweet(i, "up")}
                      onMoveDown={() => moveTweet(i, "down")}
                      onCopy={() => copyTweet(i, tweet)}
                      copied={copiedIndex === i}
                      accent={ACCENT}
                      accentSoft={ACCENT_SOFT}
                      accentBorder={ACCENT_BORDER}
                      totalCount={editedTweets.length}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Feed Mockup */}
          <div>
            <div 
              className="rounded-[16px] border p-[24px] sticky top-[110px] space-y-[20px]"
              style={{ background: "var(--bg-2)", borderColor: "var(--rule)" }}
            >
              <div className="flex items-center justify-between border-b pb-[14px] border-[var(--rule)]">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-2)]">
                  Live Feed Preview
                </span>
                <div className="flex items-center gap-[6px]">
                  <div className="w-[8px] h-[8px] rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-green-500 font-semibold uppercase">Realtime</span>
                </div>
              </div>

              {/* X Feed scroll container */}
              <div className="max-h-[520px] overflow-y-auto pr-[4px] space-y-0 relative scrollbar-custom">
                {editedTweets.map((tweet, i) => (
                  <div key={i} className="flex gap-[12px] relative group">
                    {/* Left: Avatar & connecting thread line */}
                    <div className="flex flex-col items-center shrink-0">
                      <div 
                        className="w-[36px] h-[36px] rounded-full flex items-center justify-center font-display text-[14px] font-semibold select-none shrink-0"
                        style={{ background: ACCENT_SOFT, color: ACCENT, border: `1px solid ${ACCENT_BORDER}` }}
                      >
                        {creatorName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)}
                      </div>
                      {i < editedTweets.length - 1 && (
                        <div 
                          className="w-[2px] flex-1 my-[4px]"
                          style={{ background: "var(--rule)" }}
                        />
                      )}
                    </div>

                    {/* Right: Tweet Content */}
                    <div className="flex-1 pb-[24px]">
                      <div className="flex items-center gap-[6px] mb-[4px]">
                        <span className="font-bold text-[14px] text-[var(--ink)] leading-none">
                          {creatorName}
                        </span>
                        <span className="text-[12px] text-[var(--ink-3)] leading-none">
                          {creatorHandle}
                        </span>
                        <span className="text-[12px] text-[var(--ink-4)] leading-none">· 1m</span>
                      </div>

                      <p className="text-[14px] leading-[1.5] m-0 text-[var(--ink-2)] whitespace-pre-wrap font-sans">
                        {tweet}
                      </p>
                    </div>
                  </div>
                ))}
                {editedTweets.length === 0 && (
                  <div className="py-[64px] text-center text-[12px] font-mono text-[var(--ink-4)]">
                    Draft or generate a thread to preview it in realtime.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

interface TweetCardProps {
  index: number;
  value: string;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onCopy: () => void;
  copied: boolean;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  totalCount: number;
}

function TweetCard({
  index,
  value,
  onChange,
  onAdd,
  onDelete,
  onMoveUp,
  onMoveDown,
  onCopy,
  copied,
  accent,
  accentSoft,
  accentBorder,
  totalCount,
}: TweetCardProps): React.ReactElement {
  const charCount = value.length;
  const isOver = charCount > 280;
  const isNearLimit = charCount > 240 && charCount <= 280;

  return (
    <div
      className="rounded-[12px] p-[20px] transition-all duration-150 space-y-[12px]"
      style={{
        background: "var(--bg-2)",
        border: `1px solid ${isOver ? "rgba(239,68,68,0.4)" : "var(--rule)"}`,
      }}
    >
      <div className="flex items-center gap-[10px]">
        <span
          className="font-mono text-[10px] tracking-[0.1em] uppercase px-[8px] py-[3px] rounded-full font-semibold"
          style={{ background: accentSoft, color: accent, border: `1px solid ${accentBorder}` }}
        >
          {index + 1}
        </span>
        
        {/* Helper Action Buttons */}
        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-[6px] rounded hover:bg-[var(--bg)] transition-colors duration-100 disabled:opacity-30 cursor-pointer"
            title="Move Up"
          >
            <ArrowUp size={12} className="text-[var(--ink-3)]" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalCount - 1}
            className="p-[6px] rounded hover:bg-[var(--bg)] transition-colors duration-100 disabled:opacity-30 cursor-pointer"
            title="Move Down"
          >
            <ArrowDown size={12} className="text-[var(--ink-3)]" />
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="p-[6px] rounded hover:bg-[var(--bg)] transition-colors duration-100 cursor-pointer"
            title="Add Tweet After"
          >
            <Plus size={12} className="text-[var(--ink-2)]" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={totalCount <= 1}
            className="p-[6px] rounded hover:bg-[var(--bg)] transition-colors duration-100 disabled:opacity-30 cursor-pointer"
            title="Delete Tweet"
          >
            <Trash size={12} className="text-red-500" />
          </button>
        </div>

        <div className="flex items-center gap-[12px] ml-auto">
          <span
            className="font-mono text-[10px]"
            style={{
              color: isOver ? "#dc2626" : isNearLimit ? "#d97706" : "var(--ink-4)",
              fontWeight: isOver || isNearLimit ? "bold" : "normal"
            }}
          >
            {charCount}/280
          </span>
          
          <button
            type="button"
            onClick={onCopy}
            className="p-[6px] rounded hover:bg-[var(--bg)] transition-colors duration-100 cursor-pointer flex items-center gap-[4px] font-mono text-[9px] uppercase tracking-[0.05em] font-semibold"
            style={{ color: copied ? "#16a34a" : "var(--ink-3)" }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        className="w-full bg-[var(--bg)] text-[14px] leading-[1.65] resize-none outline-none border border-[var(--rule)] rounded-[8px] p-[12px] focus:border-[var(--ink-3)] transition-colors font-sans"
        style={{ color: "var(--ink)" }}
        aria-label={`Tweet ${index + 1}`}
      />
    </div>
  );
}
