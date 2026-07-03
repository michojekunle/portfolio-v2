"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Edit3,
  Check,
  Type,
  Palette,
  Layout,
  Layers,
  FileText,
  HelpCircle,
  Undo2,
  Smartphone,
  Maximize2
} from "lucide-react";

const ACCENT = "#FF6B35";
const ACCENT_SOFT = "rgba(255,107,53,0.12)";
const ACCENT_BORDER = "rgba(255,107,53,0.25)";

const THEMES = ["Minimal", "Dark", "Cyber", "Cream", "Midnight", "Terracotta"] as const;
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
    fontTitle: string;
    fontBody: string;
  }
> = {
  Minimal: {
    bg: "#ffffff",
    card: "#fafafa",
    text: "#111111",
    subtext: "#555555",
    accent: "#FF6B35",
    border: "#e5e5e5",
    numberBg: "#111111",
    fontTitle: "Inter, sans-serif",
    fontBody: "Inter, sans-serif",
  },
  Dark: {
    bg: "#0f0f0f",
    card: "#161616",
    text: "#ffffff",
    subtext: "#a3a3a3",
    accent: "#FF6B35",
    border: "#262626",
    numberBg: "#FF6B35",
    fontTitle: "Inter, sans-serif",
    fontBody: "Inter, sans-serif",
  },
  Cyber: {
    bg: "#0b0c10",
    card: "#1f2833",
    text: "#66fcf1",
    subtext: "#c5c6c7",
    accent: "#45f3ff",
    border: "#1f2833",
    numberBg: "#45f3ff",
    fontTitle: "Space Mono, monospace",
    fontBody: "Inter, sans-serif",
  },
  Cream: {
    bg: "#faf6f0",
    card: "#f4ede2",
    text: "#2c1d11",
    subtext: "#6b5442",
    accent: "#c85a2c",
    border: "#e4d9c7",
    numberBg: "#2c1d11",
    fontTitle: "Georgia, serif",
    fontBody: "Georgia, serif",
  },
  Midnight: {
    bg: "#0a1128",
    card: "#001f54",
    text: "#ffffff",
    subtext: "#8da9c4",
    accent: "#1282a2",
    border: "#001f54",
    numberBg: "#1282a2",
    fontTitle: "Inter, sans-serif",
    fontBody: "Inter, sans-serif",
  },
  Terracotta: {
    bg: "#e07a5f",
    card: "#f4f1de",
    text: "#3d405b",
    subtext: "#5d6284",
    accent: "#f2cc8f",
    border: "#3d405b33",
    numberBg: "#3d405b",
    fontTitle: "Georgia, serif",
    fontBody: "Inter, sans-serif",
  },
};

const THEME_DESCRIPTIONS: Record<Theme, string> = {
  Minimal: "Clean light, maximum clarity",
  Dark: "Sleek dark with orange accent",
  Cyber: "Cyberpunk neon & dark tones",
  Cream: "Warm editorial paper tones",
  Midnight: "Deep blue and neon accents",
  Terracotta: "Vibrant earthy warm colors",
};

const FONTS_LIST = [
  { name: "Default Sans", value: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" },
  { name: "Editorial Serif", value: "Georgia, 'Times New Roman', serif" },
  { name: "Monospace Code", value: "Space Mono, Courier New, monospace" },
  { name: "Impact Bold", value: "Impact, Haettenschweiler, sans-serif" },
];

export default function CarouselLabPage(): React.ReactElement {
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [theme, setTheme] = useState<Theme>("Dark");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customization Overrides
  const [customBg, setCustomBg] = useState("");
  const [customText, setCustomText] = useState("");
  const [customAccent, setCustomAccent] = useState("");
  const [fontTitle, setFontTitle] = useState(FONTS_LIST[0].value);
  const [fontBody, setFontBody] = useState(FONTS_LIST[0].value);
  const [aspectRatio, setAspectRatio] = useState<"square" | "portrait">("portrait");

  // Selected Slide Index for Editing
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const generate = useCallback(async (): Promise<void> => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setSlides([]);
    setActiveSlideIndex(0);

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

  const activeThemeStyle = THEME_STYLES[theme];

  // Resolve current active colors
  const activeBg = customBg || activeThemeStyle.bg;
  const activeText = customText || activeThemeStyle.text;
  const activeAccent = customAccent || activeThemeStyle.accent;
  const activeSubtext = activeThemeStyle.subtext;
  const activeBorder = activeThemeStyle.border;

  const hasSlides = slides.length > 0;

  // Slide actions handlers
  const updateActiveSlide = (field: keyof Slide, value: string): void => {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === activeSlideIndex ? { ...s, [field]: value } : s))
    );
  };

  const addSlide = (): void => {
    const newSlide: Slide = {
      title: "New Slide title",
      content: "Add your main content here in punchy sentences.",
      emoji: "💡",
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const deleteSlide = (index: number): void => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, idx) => idx !== index));
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const duplicateSlide = (index: number): void => {
    const target = slides[index];
    if (!target) return;
    const duplicated: Slide = { ...target };
    setSlides((prev) => [
      ...prev.slice(0, index + 1),
      duplicated,
      ...prev.slice(index + 1),
    ]);
    setActiveSlideIndex(index + 1);
  };

  const reorderSlide = (index: number, direction: "up" | "down"): void => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    setSlides((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setActiveSlideIndex(targetIndex);
  };

  // Canvas Exporter
  const exportSlideAsPNG = (index: number): void => {
    const slide = slides[index];
    if (!slide) return;

    const width = 1080;
    const height = aspectRatio === "square" ? 1080 : 1350;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = activeBg;
    ctx.fillRect(0, 0, width, height);

    // Subtle pattern or light glow
    ctx.fillStyle = activeAccent + "05";
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = activeBorder;
    ctx.lineWidth = 20;
    ctx.strokeRect(0, 0, width, height);

    // Slide Number (Top Left)
    ctx.fillStyle = activeText;
    ctx.font = "bold 28px Space Mono, Courier New, monospace";
    ctx.fillText(`${index + 1} / ${slides.length}`, 80, 100);

    // Emoji (Top Right)
    if (slide.emoji) {
      ctx.font = "90px Arial";
      ctx.textAlign = "right";
      ctx.fillText(slide.emoji, width - 80, 130);
      ctx.textAlign = "left"; // reset
    }

    // Main text drawing helper
    const drawWrappedText = (
      text: string,
      x: number,
      startY: number,
      maxWidth: number,
      lineHeight: number,
      fontStr: string,
      color: string
    ): number => {
      ctx.fillStyle = color;
      ctx.font = fontStr;
      const words = text.split(" ");
      let line = "";
      let y = startY;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + " ";
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y);
      return y + lineHeight;
    };

    // Draw Title
    let currentY = height / 3;
    const titleFont = `bold 64px ${fontTitle}`;
    currentY = drawWrappedText(slide.title, 80, currentY, width - 160, 80, titleFont, activeText);

    // Draw Body / Content
    const bodyFont = `34px ${fontBody}`;
    drawWrappedText(slide.content, 80, currentY + 30, width - 160, 52, bodyFont, activeSubtext);

    // Footer dot indicators
    const dotSpacing = 24;
    const dotY = height - 100;
    const totalDotsWidth = (slides.length - 1) * dotSpacing;
    const startX = (width - totalDotsWidth) / 2;

    for (let j = 0; j < slides.length; j++) {
      ctx.fillStyle = j === index ? activeAccent : activeBorder;
      ctx.beginPath();
      ctx.arc(startX + j * dotSpacing, dotY, j === index ? 10 : 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Trigger download
    const link = document.createElement("a");
    link.download = `slide-${index + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const exportAllAsPNG = (): void => {
    slides.forEach((_, idx) => {
      setTimeout(() => {
        exportSlideAsPNG(idx);
      }, idx * 300); // Stagger downloads to prevent browser blocking
    });
  };

  const activeSlide = slides[activeSlideIndex] ?? null;

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
        <div className="max-w-[1200px] mx-auto px-[var(--gutter,24px)] flex items-center justify-between gap-[32px] max-[720px]:flex-col max-[720px]:items-start">
          <div>
            <div
              className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.16em] uppercase mb-[20px] px-[10px] py-[4px] rounded-full"
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
              Carousel Lab 2.0
            </div>
            <h1
              className="font-display font-normal leading-[0.9] tracking-[-0.04em] fvs-display m-0 mb-[16px]"
              style={{ fontSize: "clamp(44px,7vw,72px)", color: "var(--ink)" }}
            >
              Custom slide{" "}
              <em className="not-italic italic fvs-soft" style={{ color: ACCENT }}>
                creator.
              </em>
            </h1>
            <p
              className="text-[16px] leading-[1.6] m-0 max-w-[500px]"
              style={{ color: "var(--ink-2)" }}
            >
              Generate high-converting carousels. Tweak colors, edit text, customize fonts, and export high-resolution PNG slides natively.
            </p>
          </div>

          <div
            className="flex items-center gap-[12px] p-[16px] rounded-[12px] max-w-[340px]"
            style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
          >
            <Smartphone className="shrink-0" size={24} style={{ color: ACCENT }} />
            <div className="text-[12px] leading-[1.4] text-[var(--ink-3)]">
              <strong>Tip:</strong> Choose aspect ratio and download slides to upload directly to Instagram or LinkedIn!
            </div>
          </div>
        </div>
      </section>

      {/* Generator & Builder */}
      <section className="max-w-[1200px] mx-auto px-[var(--gutter,24px)] py-[48px]">
        {/* Form input */}
        <div
          className="rounded-[16px] p-[32px] max-[720px]:p-[20px] mb-[40px] space-y-[24px]"
          style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
        >
          <div className="flex gap-[16px] max-[720px]:flex-col">
            <div className="flex-1">
              <label
                htmlFor="carousel-topic"
                className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-[10px]"
                style={{ color: "var(--ink-3)" }}
              >
                Topic or Content Pitch
              </label>
              <input
                id="carousel-topic"
                type="text"
                placeholder="e.g. 5 Rules for Deep Focus, How to Write Copy that Sells..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void generate();
                }}
                className="w-full rounded-[10px] px-[16px] h-[52px] text-[15px] outline-none transition-colors duration-150"
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

            <div className="w-[200px] max-[720px]:w-full">
              <label
                className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-[10px]"
                style={{ color: "var(--ink-3)" }}
              >
                Slides ({slideCount})
              </label>
              <div className="flex items-center gap-[12px] h-[52px] px-[12px] rounded-[10px] border border-[var(--rule)] bg-[var(--bg)]">
                <input
                  type="range"
                  min={3}
                  max={8}
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="flex-1 h-[4px] rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: ACCENT }}
                  aria-label="Number of slides"
                />
                <span className="font-mono text-[15px] font-semibold text-[var(--ink)]">
                  {slideCount}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-6 max-[960px]:grid-cols-3 max-[560px]:grid-cols-2 gap-[12px]">
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTheme(t);
                  setCustomBg("");
                  setCustomText("");
                  setCustomAccent("");
                }}
                className="flex flex-col items-center justify-between p-[12px] rounded-[12px] border text-center cursor-pointer transition-all h-[90px]"
                style={{
                  background: theme === t ? "var(--bg)" : "transparent",
                  borderColor: theme === t ? ACCENT : "var(--rule)",
                }}
              >
                <div
                  className="w-[24px] h-[24px] rounded-full border border-white/20 shadow-sm"
                  style={{ background: THEME_STYLES[t].bg }}
                />
                <div>
                  <div className="font-mono text-[9px] tracking-[0.05em] uppercase font-semibold text-[var(--ink)]">
                    {t}
                  </div>
                  <div className="text-[8px] text-[var(--ink-3)] line-clamp-1">
                    {THEME_DESCRIPTIONS[t]}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void generate()}
            disabled={loading || !topic.trim()}
            className="w-full h-[52px] rounded-[10px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-[8px]"
            style={{
              background: topic.trim() && !loading ? ACCENT : "var(--rule)",
            }}
          >
            <Sparkles size={14} />
            {loading ? "Generating slides..." : "Generate carousel"}
          </button>
        </div>

        {/* Error message */}
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

        {/* Customization Workspace */}
        {hasSlides && (
          <div className="grid grid-cols-[320px_1fr_260px] max-[1120px]:grid-cols-[280px_1fr] max-[800px]:grid-cols-1 gap-[32px]">
            
            {/* Left Controls Panel */}
            <div className="space-y-[28px] max-[800px]:order-2">
              <div
                className="rounded-[16px] p-[24px] border border-[var(--rule)] bg-[var(--bg-2)] space-y-[24px]"
              >
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] border-b pb-[10px] border-[var(--rule)]">
                  Canvas Customizer
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[8px] text-[var(--ink-3)]">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-[8px]">
                    {[
                      { id: "portrait", label: "Portrait 4:5" },
                      { id: "square", label: "Square 1:1" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setAspectRatio(opt.id as "square" | "portrait")}
                        className="py-[10px] rounded-[8px] border text-[11px] font-mono uppercase tracking-[0.05em] cursor-pointer"
                        style={{
                          background: aspectRatio === opt.id ? "var(--bg)" : "transparent",
                          borderColor: aspectRatio === opt.id ? ACCENT : "var(--rule)",
                          color: aspectRatio === opt.id ? ACCENT : "var(--ink-2)"
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-[16px]">
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[8px] text-[var(--ink-3)]">
                      Title Font
                    </label>
                    <select
                      value={fontTitle}
                      onChange={(e) => setFontTitle(e.target.value)}
                      className="w-full h-[40px] px-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] text-[12px] outline-none"
                    >
                      {FONTS_LIST.map((f) => (
                        <option key={f.name} value={f.value}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[8px] text-[var(--ink-3)]">
                      Body Font
                    </label>
                    <select
                      value={fontBody}
                      onChange={(e) => setFontBody(e.target.value)}
                      className="w-full h-[40px] px-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] text-[12px] outline-none"
                    >
                      {FONTS_LIST.map((f) => (
                        <option key={f.name} value={f.value}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom Color Overrides */}
                <div className="space-y-[12px]">
                  <label className="block font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
                    Color Overrides
                  </label>
                  <div className="grid grid-cols-3 gap-[8px]">
                    <div className="space-y-[4px]">
                      <div className="text-[8px] font-mono text-[var(--ink-3)]">BG</div>
                      <input
                        type="color"
                        value={activeBg}
                        onChange={(e) => setCustomBg(e.target.value)}
                        className="w-full h-[32px] rounded-[6px] border-none bg-transparent cursor-pointer"
                      />
                    </div>
                    <div className="space-y-[4px]">
                      <div className="text-[8px] font-mono text-[var(--ink-3)]">Text</div>
                      <input
                        type="color"
                        value={activeText}
                        onChange={(e) => setCustomText(e.target.value)}
                        className="w-full h-[32px] rounded-[6px] border-none bg-transparent cursor-pointer"
                      />
                    </div>
                    <div className="space-y-[4px]">
                      <div className="text-[8px] font-mono text-[var(--ink-3)]">Accent</div>
                      <input
                        type="color"
                        value={activeAccent}
                        onChange={(e) => setCustomAccent(e.target.value)}
                        className="w-full h-[32px] rounded-[6px] border-none bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                  {(customBg || customText || customAccent) && (
                    <button
                      onClick={() => {
                        setCustomBg("");
                        setCustomText("");
                        setCustomAccent("");
                      }}
                      className="w-full font-mono text-[8px] uppercase tracking-[0.05em] py-[6px] rounded-[6px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)]"
                    >
                      Reset overrides
                    </button>
                  )}
                </div>
              </div>

              {/* Slide content inline editor */}
              {activeSlide && (
                <div className="rounded-[16px] p-[24px] border border-[var(--rule)] bg-[var(--bg-2)] space-y-[16px]">
                  <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] border-b pb-[10px] border-[var(--rule)]">
                    Edit Active Slide
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[6px] text-[var(--ink-3)]">
                      Slide Emoji
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={activeSlide.emoji || ""}
                      onChange={(e) => updateActiveSlide("emoji", e.target.value)}
                      className="w-[60px] h-[36px] text-center rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[16px] outline-none focus:border-[var(--ink-3)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[6px] text-[var(--ink-3)]">
                      Slide Title
                    </label>
                    <input
                      type="text"
                      value={activeSlide.title}
                      onChange={(e) => updateActiveSlide("title", e.target.value)}
                      className="w-full h-[36px] px-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] text-[13px] outline-none focus:border-[var(--ink-3)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[6px] text-[var(--ink-3)]">
                      Slide Content
                    </label>
                    <textarea
                      value={activeSlide.content}
                      onChange={(e) => updateActiveSlide("content", e.target.value)}
                      rows={4}
                      className="w-full p-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] text-[13px] outline-none focus:border-[var(--ink-3)] resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Center Panel (Live Slide Preview Mockup) */}
            <div className="space-y-[24px]">
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b pb-[14px] border-[var(--rule)] flex-wrap gap-[12px]">
                <div className="flex items-center gap-[10px]">
                  <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-[var(--ink)]">
                    Slide {activeSlideIndex + 1} of {slides.length}
                  </span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <button
                    onClick={() => exportSlideAsPNG(activeSlideIndex)}
                    className="inline-flex items-center gap-[6px] font-mono text-[9px] tracking-[0.1em] uppercase font-semibold px-[12px] py-[6px] rounded-[6px] border border-[var(--rule)] bg-transparent text-[var(--ink)] cursor-pointer hover:border-[var(--ink-2)]"
                  >
                    <Download size={11} /> Export PNG
                  </button>
                  <button
                    onClick={exportAllAsPNG}
                    className="inline-flex items-center gap-[6px] font-mono text-[9px] tracking-[0.1em] uppercase font-semibold px-[12px] py-[6px] rounded-[6px] border-none text-white cursor-pointer hover:opacity-90"
                    style={{ background: ACCENT }}
                  >
                    <Layers size={11} /> Export All Slides
                  </button>
                </div>
              </div>

              {/* Device Mockup Wrapper */}
              <div className="flex items-center justify-center p-[20px] rounded-[20px] border border-[var(--rule)] bg-[color-mix(in_oklab,var(--bg)_80%,var(--bg-2))] min-h-[460px]">
                {activeSlide && (
                  <div
                    className="shadow-2xl rounded-[20px] overflow-hidden flex flex-col justify-between p-[36px] relative select-none transition-all duration-300 border"
                    style={{
                      background: activeBg,
                      borderColor: activeBorder,
                      width: aspectRatio === "square" ? "420px" : "360px",
                      height: aspectRatio === "square" ? "420px" : "450px",
                    }}
                  >
                    {/* Top strip */}
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono text-[10px] tracking-[0.12em] uppercase px-[10px] py-[4px] rounded-full font-semibold"
                        style={{
                          background: activeText,
                          color: activeBg,
                        }}
                      >
                        {activeSlideIndex + 1} / {slides.length}
                      </span>
                      {activeSlide.emoji && (
                        <span className="text-[32px]">{activeSlide.emoji}</span>
                      )}
                    </div>

                    {/* Middle title and text */}
                    <div className="flex-1 flex flex-col justify-center py-[20px]">
                      <h3
                        className="font-normal leading-[1.15] tracking-[-0.03em] mb-[12px] m-0"
                        style={{
                          fontFamily: fontTitle,
                          fontSize: "clamp(22px,3vw,30px)",
                          color: activeText,
                        }}
                      >
                        {activeSlide.title}
                      </h3>
                      <p
                        className="text-[14px] leading-[1.65] m-0"
                        style={{
                          fontFamily: fontBody,
                          color: activeSubtext,
                        }}
                      >
                        {activeSlide.content}
                      </p>
                    </div>

                    {/* Pagination indicators */}
                    <div className="flex gap-[6px] justify-center mt-[12px]">
                      {slides.map((_, idx) => (
                        <span
                          key={idx}
                          className="rounded-full transition-all duration-200"
                          style={{
                            width: idx === activeSlideIndex ? "18px" : "6px",
                            height: "6px",
                            background: idx === activeSlideIndex ? activeAccent : activeBorder,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Slider Nav controls */}
              <div className="flex items-center justify-between bg-[var(--bg-2)] p-[12px] rounded-[12px] border border-[var(--rule)]">
                <button
                  disabled={activeSlideIndex === 0}
                  onClick={() => setActiveSlideIndex((prev) => prev - 1)}
                  className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] border border-[var(--rule)] bg-transparent cursor-pointer disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex gap-[4px] flex-wrap justify-center">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className="w-[28px] h-[28px] rounded-[6px] font-mono text-[10px] border cursor-pointer font-semibold"
                      style={{
                        background: idx === activeSlideIndex ? ACCENT : "transparent",
                        borderColor: idx === activeSlideIndex ? ACCENT : "var(--rule)",
                        color: idx === activeSlideIndex ? "#fff" : "var(--ink-2)",
                      }}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={activeSlideIndex === slides.length - 1}
                  onClick={() => setActiveSlideIndex((prev) => prev + 1)}
                  className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] border border-[var(--rule)] bg-transparent cursor-pointer disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Panel (All slides timeline list) */}
            <div className="space-y-[16px] max-[1120px]:col-span-2 max-[800px]:col-span-1">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
                  Slide Stack
                </div>
                <button
                  onClick={addSlide}
                  className="inline-flex items-center gap-[4px] font-mono text-[9px] uppercase tracking-[0.08em] font-semibold text-[var(--ink)] cursor-pointer bg-transparent border-none"
                >
                  <Plus size={10} /> Add Slide
                </button>
              </div>

              <div className="space-y-[12px] max-h-[580px] overflow-y-auto pr-[4px]">
                {slides.map((s, idx) => {
                  const isActive = idx === activeSlideIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className="group/item relative rounded-[12px] p-[14px] border cursor-pointer transition-all flex flex-col justify-between"
                      style={{
                        background: isActive ? "var(--bg-2)" : "var(--bg)",
                        borderColor: isActive ? ACCENT : "var(--rule)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-[8px] mb-[6px]">
                        <div className="font-mono text-[9px] text-[var(--ink-3)]">
                          Slide {idx + 1}
                        </div>
                        <div className="flex items-center gap-[4px] opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateSlide(idx);
                            }}
                            className="w-[20px] h-[20px] flex items-center justify-center rounded border-none bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)]"
                            title="Duplicate"
                          >
                            <Copy size={10} />
                          </button>
                          <button
                            disabled={slides.length <= 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSlide(idx);
                            }}
                            className="w-[20px] h-[20px] flex items-center justify-center rounded border-none bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-red-500 disabled:opacity-30"
                            title="Delete"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                      <div className="text-[12px] font-semibold text-[var(--ink)] truncate mb-[2px]">
                        {s.title}
                      </div>
                      <div className="text-[11px] text-[var(--ink-3)] line-clamp-1">
                        {s.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </section>
    </main>
  );
}
