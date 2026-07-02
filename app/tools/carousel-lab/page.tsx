"use client";

import React, { useState, useCallback } from "react";

const ACCENT = "#FF6B35";
const ACCENT_SOFT = "rgba(255,107,53,0.12)";
const ACCENT_BORDER = "rgba(255,107,53,0.25)";

const THEMES = ["Minimal", "Dark", "Bold", "Earthy"] as const;
type Theme = (typeof THEMES)[number];

type Slide = {
  title: string;
  content: string;
  emoji?: string;
};

type GenerateResponse =
  | { slides: Slide[]; error?: never }
  | { error: string; slides?: never };

const THEME_STYLES: Record<
  Theme,
  {
    bg: string;
    card: string;
    text: string;
    subtext: string;
    accent: string;
    border: string;
    numberBg: string;
  }
> = {
  Minimal: {
    bg: "#ffffff",
    card: "#f8f8f8",
    text: "#111111",
    subtext: "#555555",
    accent: "#111111",
    border: "#e5e5e5",
    numberBg: "#111111",
  },
  Dark: {
    bg: "#0f0f0f",
    card: "#1a1a1a",
    text: "#ffffff",
    subtext: "#a3a3a3",
    accent: "#FF6B35",
    border: "#2a2a2a",
    numberBg: "#FF6B35",
  },
  Bold: {
    bg: "#6366F1",
    card: "#4F46E5",
    text: "#ffffff",
    subtext: "rgba(255,255,255,0.75)",
    accent: "#ffffff",
    border: "rgba(255,255,255,0.2)",
    numberBg: "#ffffff",
  },
  Earthy: {
    bg: "#faf6f1",
    card: "#f0e8dc",
    text: "#2c1a0e",
    subtext: "#6b4c30",
    accent: "#c85a2c",
    border: "#d4b89a",
    numberBg: "#c85a2c",
  },
};

const THEME_DESCRIPTIONS: Record<Theme, string> = {
  Minimal: "Clean white, maximum clarity",
  Dark: "Sleek dark with orange accents",
  Bold: "Indigo gradient, high impact",
  Earthy: "Warm tones, organic feel",
};

export default function CarouselLabPage(): React.ReactElement {
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [theme, setTheme] = useState<Theme>("Dark");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (): Promise<void> => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setSlides([]);

    try {
      const res = await fetch("/api/carousel-lab/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), slideCount, theme }),
      });

      const data = (await res.json()) as GenerateResponse;

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }

      if (!data.slides || data.slides.length === 0) {
        throw new Error("No slides returned from AI");
      }

      setSlides(data.slides);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [topic, slideCount, theme]);

  const themeStyle = THEME_STYLES[theme];
  const hasSlides = slides.length > 0;

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
        <div className="max-w-[960px] mx-auto px-[var(--gutter,24px)]">
          <div
            className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.16em] uppercase mb-[24px] px-[10px] py-[4px] rounded-full"
            style={{
              background: ACCENT_SOFT,
              color: ACCENT,
              border: `1px solid ${ACCENT_BORDER}`,
            }}
          >
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{ background: ACCENT }}
              aria-hidden="true"
            />
            Carousel Lab
          </div>
          <h1
            className="font-display font-normal leading-[0.9] tracking-[-0.04em] fvs-display m-0 mb-[20px]"
            style={{ fontSize: "clamp(44px,8vw,80px)", color: "var(--ink)" }}
          >
            Design scroll-stopping{" "}
            <em className="not-italic italic fvs-soft" style={{ color: ACCENT }}>
              slides.
            </em>
          </h1>
          <p
            className="text-[17px] leading-[1.65] m-0 max-w-[52ch]"
            style={{ color: "var(--ink-2)" }}
          >
            Enter a topic, pick a theme, and get a beautiful slide carousel ready
            for Instagram or LinkedIn. Screenshot each slide or use them as inspiration.
          </p>
        </div>
      </section>

      {/* Generator */}
      <section className="max-w-[960px] mx-auto px-[var(--gutter,24px)] py-[64px] max-[720px]:py-[48px]">
        {/* Form */}
        <div
          className="rounded-[12px] p-[40px] max-[720px]:p-[24px] mb-[48px]"
          style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
        >
          <div className="mb-[32px]">
            <label
              htmlFor="carousel-topic"
              className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-[10px]"
              style={{ color: "var(--ink-3)" }}
            >
              Topic
            </label>
            <input
              id="carousel-topic"
              type="text"
              placeholder="e.g. 5 rules for deep focus, How to build in public, Morning routine that changed my life..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void generate();
              }}
              className="w-full rounded-[8px] px-[16px] h-[52px] text-[15px] outline-none transition-colors duration-150"
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

          <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-[32px] mb-[32px]">
            <div>
              <div
                className="font-mono text-[10px] tracking-[0.14em] uppercase mb-[10px]"
                style={{ color: "var(--ink-3)" }}
              >
                Theme
              </div>
              <div className="flex flex-col gap-[6px]">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className="text-left px-[14px] py-[10px] rounded-[8px] transition-all duration-150 border"
                    style={{
                      background: theme === t ? ACCENT_SOFT : "var(--bg)",
                      borderColor: theme === t ? ACCENT : "var(--rule)",
                      color: theme === t ? ACCENT : "var(--ink-2)",
                    }}
                  >
                    <span className="font-mono text-[11px] tracking-[0.06em] uppercase font-semibold">
                      {t}
                    </span>
                    <span
                      className="text-[11px] ml-[8px]"
                      style={{ color: "var(--ink-4)" }}
                    >
                      {THEME_DESCRIPTIONS[t]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div
                className="font-mono text-[10px] tracking-[0.14em] uppercase mb-[10px]"
                style={{ color: "var(--ink-3)" }}
              >
                Slides — {slideCount}
              </div>
              <div className="flex items-center gap-[16px] mb-[24px]">
                <input
                  type="range"
                  min={3}
                  max={6}
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="flex-1 h-[4px] rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: ACCENT }}
                  aria-label="Number of slides"
                />
                <span
                  className="font-mono text-[16px] font-semibold w-[24px] text-center"
                  style={{ color: ACCENT }}
                >
                  {slideCount}
                </span>
              </div>

              {/* Theme preview strip */}
              <div
                className="rounded-[8px] p-[14px] mt-[16px]"
                style={{
                  background: themeStyle.bg,
                  border: `1px solid ${themeStyle.border}`,
                }}
              >
                <div
                  className="font-mono text-[9px] tracking-[0.12em] uppercase mb-[6px]"
                  style={{ color: themeStyle.subtext }}
                >
                  Preview
                </div>
                <div
                  className="text-[13px] font-semibold leading-[1.3] mb-[4px]"
                  style={{ color: themeStyle.text }}
                >
                  Slide title here
                </div>
                <div className="text-[11px] leading-[1.4]" style={{ color: themeStyle.subtext }}>
                  This is how your content will look in this theme.
                </div>
              </div>
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
            {loading ? "Generating slides..." : "Generate carousel"}
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

        {/* Slides output */}
        {hasSlides && (
          <div>
            <div className="flex items-center justify-between mb-[24px] flex-wrap gap-[12px]">
              <div>
                <div
                  className="font-mono text-[10px] tracking-[0.14em] uppercase mb-[4px]"
                  style={{ color: "var(--ink-4)" }}
                >
                  Your carousel
                </div>
                <div className="text-[15px]" style={{ color: "var(--ink-2)" }}>
                  {slides.length} slides · screenshot each one to post
                </div>
              </div>
              <div
                className="font-mono text-[10px] tracking-[0.1em] uppercase px-[12px] py-[6px] rounded-full"
                style={{
                  background: ACCENT_SOFT,
                  color: ACCENT,
                  border: `1px solid ${ACCENT_BORDER}`,
                }}
              >
                {theme} theme
              </div>
            </div>

            {/* Horizontal scroll container */}
            <div
              className="overflow-x-auto pb-[16px]"
              style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            >
              <div className="flex gap-[16px]" style={{ width: "max-content" }}>
                {slides.map((slide, i) => (
                  <SlideCard
                    key={`${slide.title}-${i}`}
                    slide={slide}
                    index={i}
                    total={slides.length}
                    themeStyle={themeStyle}
                  />
                ))}
              </div>
            </div>

            {/* Full-width vertical view for easier screenshotting */}
            <div className="mt-[48px]">
              <div
                className="font-mono text-[10px] tracking-[0.14em] uppercase mb-[20px]"
                style={{ color: "var(--ink-4)" }}
              >
                Full view — screenshot-ready
              </div>
              <div className="grid grid-cols-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 gap-[16px]">
                {slides.map((slide, i) => (
                  <SlideCard
                    key={`full-${slide.title}-${i}`}
                    slide={slide}
                    index={i}
                    total={slides.length}
                    themeStyle={themeStyle}
                    fullWidth
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function SlideCard({
  slide,
  index,
  total,
  themeStyle,
  fullWidth = false,
}: {
  slide: Slide;
  index: number;
  total: number;
  themeStyle: (typeof THEME_STYLES)[Theme];
  fullWidth?: boolean;
}): React.ReactElement {
  return (
    <div
      className="rounded-[14px] p-[28px] flex flex-col justify-between select-none"
      style={{
        background: themeStyle.bg,
        border: `1px solid ${themeStyle.border}`,
        width: fullWidth ? "100%" : "300px",
        minHeight: "360px",
        scrollSnapAlign: "start",
        flexShrink: 0,
      }}
    >
      {/* Slide number */}
      <div className="flex items-center justify-between mb-[20px]">
        <span
          className="font-mono text-[10px] tracking-[0.12em] uppercase px-[10px] py-[4px] rounded-full font-semibold"
          style={{
            background: themeStyle.numberBg,
            color: themeStyle.bg,
          }}
        >
          {index + 1} / {total}
        </span>
        {slide.emoji && (
          <span className="text-[28px]" aria-hidden="true">
            {slide.emoji}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        <h3
          className="font-display font-normal leading-[1.1] tracking-[-0.02em] mb-[14px] m-0"
          style={{
            fontSize: "clamp(18px,2.5vw,24px)",
            color: themeStyle.text,
          }}
        >
          {slide.title}
        </h3>
        <p
          className="text-[14px] leading-[1.65] m-0"
          style={{ color: themeStyle.subtext }}
        >
          {slide.content}
        </p>
      </div>

      {/* Footer dot indicator */}
      <div className="flex gap-[5px] mt-[20px]">
        {Array.from({ length: total }).map((_, j) => (
          <span
            key={j}
            className="rounded-full transition-all duration-200"
            style={{
              width: j === index ? "16px" : "5px",
              height: "5px",
              background: j === index ? themeStyle.accent : themeStyle.border,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
