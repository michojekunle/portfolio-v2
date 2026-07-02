"use client";

import React, { useState, useCallback } from "react";

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
  const [tone, setTone] = useState<Tone>("Educational");
  const [threadLength, setThreadLength] = useState(7);
  const [tweets, setTweets] = useState<string[]>([]);
  const [editedTweets, setEditedTweets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async (): Promise<void> => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setTweets([]);
    setEditedTweets([]);

    try {
      const res = await fetch("/api/thread-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), tone, threadLength }),
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
  }, [topic, tone, threadLength]);

  const updateTweet = useCallback((index: number, value: string): void => {
    setEditedTweets((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const copyAll = useCallback(async (): Promise<void> => {
    const text = editedTweets.join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments where clipboard API is unavailable
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
        className="pt-[140px] pb-[72px] max-[720px]:pt-[100px] max-[720px]:pb-[48px] border-b"
        style={{ borderColor: "var(--rule)" }}
      >
        <div className="max-w-[860px] mx-auto px-[var(--gutter,24px)]">
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
            style={{ fontSize: "clamp(44px,8vw,80px)", color: "var(--ink)" }}
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
            Enter a topic and tone. Get a ready-to-post X thread in seconds.
            Edit each tweet inline, then copy the whole thread with one click.
          </p>
        </div>
      </section>

      {/* Generator */}
      <section className="max-w-[860px] mx-auto px-[var(--gutter,24px)] py-[64px] max-[720px]:py-[48px]">
        {/* Form */}
        <div
          className="rounded-[12px] p-[40px] max-[720px]:p-[24px] mb-[48px]"
          style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
        >
          <div className="mb-[32px]">
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
              className="w-full rounded-[8px] px-[16px] py-[12px] text-[15px] leading-[1.6] resize-none transition-colors duration-150 outline-none"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--rule)",
                color: "var(--ink)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = ACCENT;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--rule)";
              }}
            />
          </div>

          <div className="mb-[32px]">
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
                  className="text-left px-[16px] py-[12px] rounded-[8px] transition-all duration-150 border"
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

          <div className="mb-[32px]">
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
                style={{ accentColor: ACCENT }}
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
            disabled={loading || !topic.trim()}
            className="w-full h-[52px] rounded-[8px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: topic.trim() && !loading ? ACCENT : "var(--rule)",
              color: topic.trim() && !loading ? "#fff" : "var(--ink-4)",
            }}
          >
            {loading ? "Generating thread..." : "Generate thread"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-[8px] px-[20px] py-[16px] mb-[32px] text-[14px] leading-[1.5]"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}

        {/* Thread output */}
        {hasThread && (
          <div>
            <div className="flex items-center justify-between mb-[24px] flex-wrap gap-[12px]">
              <div>
                <div
                  className="font-mono text-[10px] tracking-[0.14em] uppercase mb-[4px]"
                  style={{ color: "var(--ink-4)" }}
                >
                  Your thread
                </div>
                <div className="text-[15px]" style={{ color: "var(--ink-2)" }}>
                  {editedTweets.length} tweets · edit inline before posting
                </div>
              </div>
              <button
                type="button"
                onClick={() => void copyAll()}
                className="inline-flex items-center gap-[8px] h-[40px] px-[20px] rounded-full font-mono text-[10px] uppercase tracking-[0.12em] font-semibold transition-all duration-200"
                style={{
                  background: copied ? "rgba(34,197,94,0.12)" : ACCENT_SOFT,
                  color: copied ? "#16a34a" : ACCENT,
                  border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : ACCENT_BORDER}`,
                }}
              >
                {copied ? "Copied!" : "Copy all tweets"}
              </button>
            </div>

            <div className="flex flex-col gap-[12px]">
              {editedTweets.map((tweet, i) => (
                <TweetCard
                  key={`${tweets[i] ?? i}-${i}`}
                  index={i}
                  value={tweet}
                  onChange={updateTweet}
                  accent={ACCENT}
                  accentSoft={ACCENT_SOFT}
                  accentBorder={ACCENT_BORDER}
                />
              ))}
            </div>

            <div className="mt-[24px] flex justify-end">
              <button
                type="button"
                onClick={() => void copyAll()}
                className="inline-flex items-center gap-[8px] h-[48px] px-[28px] rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-all duration-200"
                style={{
                  background: copied ? "rgba(34,197,94,0.12)" : ACCENT,
                  color: copied ? "#16a34a" : "#fff",
                  border: copied ? "1px solid rgba(34,197,94,0.3)" : "none",
                }}
              >
                {copied ? "Copied to clipboard!" : "Copy all tweets"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function TweetCard({
  index,
  value,
  onChange,
  accent,
  accentSoft,
  accentBorder,
}: {
  index: number;
  value: string;
  onChange: (index: number, value: string) => void;
  accent: string;
  accentSoft: string;
  accentBorder: string;
}): React.ReactElement {
  const charCount = value.length;
  const isOver = charCount > 280;
  const isNearLimit = charCount > 240 && charCount <= 280;

  return (
    <div
      className="rounded-[10px] p-[20px] transition-all duration-150"
      style={{
        background: "var(--bg-2)",
        border: `1px solid ${isOver ? "rgba(239,68,68,0.4)" : "var(--rule)"}`,
      }}
    >
      <div className="flex items-center gap-[10px] mb-[12px]">
        <span
          className="font-mono text-[10px] tracking-[0.1em] uppercase px-[8px] py-[3px] rounded-full font-semibold"
          style={{ background: accentSoft, color: accent, border: `1px solid ${accentBorder}` }}
        >
          {index + 1}
        </span>
        <span
          className="font-mono text-[10px] ml-auto"
          style={{
            color: isOver ? "#dc2626" : isNearLimit ? "#d97706" : "var(--ink-4)",
          }}
        >
          {charCount}/280
        </span>
      </div>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        className="w-full bg-transparent text-[14px] leading-[1.65] resize-none outline-none border-none"
        style={{ color: "var(--ink)" }}
        aria-label={`Tweet ${index + 1}`}
      />
    </div>
  );
}
