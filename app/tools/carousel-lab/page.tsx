"use client";

import React, { useState, useCallback } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Layers,
  Smartphone,
  Check,
  Type,
  Palette,
  FileText,
  HelpCircle,
  FolderHeart,
  Quote,
  Star
} from "lucide-react";

const ACCENT = "#FF6B35";
const ACCENT_SOFT = "rgba(255,107,53,0.12)";
const ACCENT_BORDER = "rgba(255,107,53,0.25)";

const THEMES = ["Minimal", "Dark", "Cyber", "Cream", "Midnight", "Terracotta"] as const;
type Theme = (typeof THEMES)[number];

type SlideLayout = "default" | "hook" | "split" | "quote" | "metrics";

type Slide = {
  title: string;
  content: string;
  emoji?: string;
  layout?: SlideLayout;
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
    fontTitle: "Courier New, monospace",
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
    subtext: "#f4f1deee",
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
  { name: "Default Sans (Inter)", value: "Inter, sans-serif" },
  { name: "Editorial Serif (Georgia)", value: "Georgia, serif" },
  { name: "Monospace Code (Space Mono)", value: "Courier New, monospace" },
];

export default function CarouselLabPage(): React.ReactElement {
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [theme, setTheme] = useState<Theme>("Dark");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customization controls
  const [creatorName, setCreatorName] = useState("Michael Ojekunle");
  const [creatorHandle, setCreatorHandle] = useState("@michojekunle");
  const [showBranding, setShowBranding] = useState(true);
  const [backgroundStyle, setBackgroundStyle] = useState<"solid" | "gradient" | "mesh">("mesh");
  const [aspectRatio, setAspectRatio] = useState<"square" | "portrait">("portrait");
  const [fontTitle, setFontTitle] = useState(FONTS_LIST[0].value);
  const [fontBody, setFontBody] = useState(FONTS_LIST[0].value);

  // Color Overrides
  const [customBg, setCustomBg] = useState("");
  const [customText, setCustomText] = useState("");
  const [customAccent, setCustomAccent] = useState("");

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

      // Add default layout (first is hook, rest are default, last is quote/cta fallback)
      const mapped = data.slides.map((s, idx) => ({
        ...s,
        layout: idx === 0 ? ("hook" as SlideLayout) : idx === data.slides.length - 1 ? ("quote" as SlideLayout) : ("default" as SlideLayout),
      }));

      setSlides(mapped);
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
      title: "New Key Point",
      content: "Explain the key takeaway here in 1-2 punchy sentences.",
      emoji: "⚡",
      layout: "default",
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

  // Reusable drawing function for high resolution Canvas rendering
  const drawSlideToCanvas = (
    ctx: CanvasRenderingContext2D,
    index: number,
    width: number,
    height: number
  ): void => {
    const slide = slides[index];
    if (!slide) return;
    const layout = slide.layout || "default";

    // 1. Draw Background
    if (backgroundStyle === "gradient") {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, activeBg);
      grad.addColorStop(1, activeAccent + "18");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (backgroundStyle === "mesh") {
      ctx.fillStyle = activeBg;
      ctx.fillRect(0, 0, width, height);
      
      // Top mesh glow
      const grad1 = ctx.createRadialGradient(width * 0.2, height * 0.2, 50, width * 0.2, height * 0.2, width * 0.7);
      grad1.addColorStop(0, activeAccent + "20");
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);
      
      // Bottom mesh glow
      const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.8, 50, width * 0.8, height * 0.8, width * 0.7);
      grad2.addColorStop(0, activeText + "0b");
      grad2.addColorStop(1, "transparent");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = activeBg;
      ctx.fillRect(0, 0, width, height);
    }

    // Border
    ctx.strokeStyle = activeBorder;
    ctx.lineWidth = 20;
    ctx.strokeRect(0, 0, width, height);

    // Helper text wrapper
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

    // 2. Creator Branding Header (Top)
    if (showBranding && layout !== "split") {
      ctx.fillStyle = activeText;
      ctx.font = "bold 24px Inter, sans-serif";
      ctx.fillText(creatorName, 80, 85);
      
      ctx.fillStyle = activeAccent;
      ctx.font = "20px Space Mono, monospace";
      ctx.fillText(creatorHandle, 80, 115);

      // Simple text initials avatar
      ctx.fillStyle = activeAccent;
      ctx.beginPath();
      ctx.arc(width - 100, 95, 25, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = activeBg;
      ctx.font = "bold 20px Inter, sans-serif";
      ctx.textAlign = "center";
      const initials = creatorName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      ctx.fillText(initials, width - 100, 102);
      ctx.textAlign = "left"; // reset
    }

    // 3. Draw Layout Content
    if (layout === "hook") {
      // Hook Cover layout
      let y = height / 2.7;
      const titleFont = `bold 68px ${fontTitle}`;
      y = drawWrappedText(slide.title, 80, y, width - 160, 84, titleFont, activeText);
      
      const bodyFont = `34px ${fontBody}`;
      drawWrappedText(slide.content, 80, y + 40, width - 160, 52, bodyFont, activeSubtext);
    } 
    else if (layout === "split") {
      // Split layout
      ctx.fillStyle = activeAccent + "1a";
      ctx.fillRect(20, 20, width / 2 - 20, height - 40);

      // Title in split left
      const titleFont = `bold 54px ${fontTitle}`;
      drawWrappedText(slide.title, 60, height / 2 - 120, width / 2 - 100, 70, titleFont, activeText);

      // Content in split right
      const bodyFont = `32px ${fontBody}`;
      drawWrappedText(slide.content, width / 2 + 60, height / 2 - 100, width / 2 - 120, 50, bodyFont, activeText);
    }
    else if (layout === "quote") {
      // Quote layout
      ctx.fillStyle = activeAccent + "20";
      ctx.font = "bold 220px Georgia, serif";
      ctx.fillText("“", 80, height / 3 + 20);

      let y = height / 3 + 10;
      const bodyFont = `italic 34px ${fontBody}`;
      y = drawWrappedText(`"${slide.content}"`, 120, y, width - 240, 54, bodyFont, activeText);

      // Signature
      ctx.fillStyle = activeAccent;
      ctx.font = "bold 26px Inter, sans-serif";
      ctx.fillText(`— ${slide.title}`, 120, y + 40);
    }
    else if (layout === "metrics") {
      // Metrics list layout
      ctx.fillStyle = activeAccent;
      ctx.font = "bold 130px Space Mono, Courier New, monospace";
      ctx.fillText(`0${index + 1}`, 80, height / 3 + 20);

      let y = height / 3 + 90;
      const titleFont = `bold 50px ${fontTitle}`;
      y = drawWrappedText(slide.title, 80, y, width - 160, 64, titleFont, activeText);

      const bodyFont = `30px ${fontBody}`;
      drawWrappedText(slide.content, 80, y + 30, width - 160, 48, bodyFont, activeSubtext);
    }
    else {
      // Default
      let y = height / 2.7;
      const titleFont = `bold 54px ${fontTitle}`;
      y = drawWrappedText(slide.title, 80, y, width - 160, 72, titleFont, activeText);

      const bodyFont = `30px ${fontBody}`;
      drawWrappedText(slide.content, 80, y + 36, width - 160, 48, bodyFont, activeSubtext);

      if (slide.emoji) {
        ctx.font = "72px Arial";
        ctx.fillText(slide.emoji, 80, height - 170);
      }
    }

    // 4. Slide Number Indicator (Bottom Left)
    ctx.fillStyle = activeText + "90";
    ctx.font = "bold 22px Space Mono, Courier New, monospace";
    ctx.fillText(`${index + 1} / ${slides.length}`, 80, height - 60);

    // 5. Pagination dots (Bottom Right)
    const dotSpacing = 24;
    const dotY = height - 68;
    const startX = width - 80 - (slides.length - 1) * dotSpacing;

    for (let j = 0; j < slides.length; j++) {
      ctx.fillStyle = j === index ? activeAccent : activeBorder;
      ctx.beginPath();
      ctx.arc(startX + j * dotSpacing, dotY, j === index ? 9 : 5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

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

    drawSlideToCanvas(ctx, index, width, height);

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
      }, idx * 300);
    });
  };

  // LinkedIn Multi-page PDF compiler
  const exportAsPDF = async (): Promise<void> => {
    const { jsPDF } = (await import("jspdf")) as any;
    
    const width = 1080;
    const height = aspectRatio === "square" ? 1080 : 1350;
    
    // Construct jsPDF
    const pdf = new jsPDF({
      orientation: "p",
      unit: "px",
      format: [width, height],
    });

    for (let idx = 0; idx < slides.length; idx++) {
      if (idx > 0) {
        pdf.addPage([width, height]);
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawSlideToCanvas(ctx, idx, width, height);
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 0, 0, width, height);
      }
    }

    pdf.save(`${topic.slice(0, 16) || "carousel-lab"}-swipe.pdf`);
  };

  const activeSlide = slides[activeSlideIndex] ?? null;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="outline-none min-h-screen"
      style={{ background: "var(--bg)" }}
    >
      {/* Header Banner */}
      <section
        className="pt-[140px] pb-[60px] max-[720px]:pt-[100px] max-[720px]:pb-[36px] border-b"
        style={{ borderColor: "var(--rule)" }}
      >
        <div className="max-w-[1240px] mx-auto px-[var(--gutter,24px)] flex items-center justify-between gap-[32px] max-[720px]:flex-col max-[720px]:items-start">
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
              Carousel Lab Suite
            </div>
            <h1
              className="font-display font-normal leading-[0.9] tracking-[-0.04em] fvs-display m-0 mb-[16px]"
              style={{ fontSize: "clamp(44px,7vw,72px)", color: "var(--ink)" }}
            >
              Design world-class{" "}
              <em className="not-italic italic fvs-soft" style={{ color: ACCENT }}>
                content.
              </em>
            </h1>
            <p
              className="text-[16px] leading-[1.65] m-0 max-w-[500px]"
              style={{ color: "var(--ink-2)" }}
            >
              Generate high-impact content carousels. Mix layouts, customize branding, toggle styling elements, and export as native PDF/PNG.
            </p>
          </div>

          <div
            className="flex items-center gap-[12px] p-[16px] rounded-[12px] max-w-[340px]"
            style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
          >
            <Smartphone className="shrink-0" size={24} style={{ color: ACCENT }} />
            <div className="text-[12px] leading-[1.4] text-[var(--ink-3)]">
              <strong>LinkedIn PDF:</strong> We support compiling your slides directly into LinkedIn-compatible multi-page swipeable PDFs!
            </div>
          </div>
        </div>
      </section>

      {/* Generator & Builder */}
      <section className="max-w-[1240px] mx-auto px-[var(--gutter,24px)] py-[48px]">
        {/* Input area */}
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

        {/* Customization Workspace */}
        {hasSlides && (
          <div className="grid grid-cols-[330px_1fr_260px] max-[1120px]:grid-cols-[290px_1fr] max-[800px]:grid-cols-1 gap-[32px]">
            
            {/* Left Controls Panel */}
            <div className="space-y-[24px] max-[800px]:order-2">
              
              {/* Creator Branding */}
              <div className="rounded-[16px] p-[24px] border border-[var(--rule)] bg-[var(--bg-2)] space-y-[16px]">
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] border-b pb-[10px] border-[var(--rule)]">
                  Creator Branding
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--ink-2)]">Show Profile Header</span>
                  <input
                    type="checkbox"
                    checked={showBranding}
                    onChange={(e) => setShowBranding(e.target.checked)}
                    className="w-[36px] h-[20px] rounded-full appearance-none cursor-pointer relative bg-[var(--bg)] border border-[var(--rule)] checked:bg-[var(--accent)] transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[14px] after:h-[14px] after:rounded-full after:bg-[var(--ink-3)] checked:after:translate-x-[16px] after:transition-transform"
                    style={{ "--accent": ACCENT } as React.CSSProperties}
                  />
                </div>
                {showBranding && (
                  <div className="space-y-[12px]">
                    <div>
                      <label className="block font-mono text-[8px] tracking-[0.1em] uppercase mb-[6px] text-[var(--ink-3)]">
                        Profile Name
                      </label>
                      <input
                        type="text"
                        value={creatorName}
                        onChange={(e) => setCreatorName(e.target.value)}
                        className="w-full h-[36px] px-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] text-[12px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[8px] tracking-[0.1em] uppercase mb-[6px] text-[var(--ink-3)]">
                        Profile @Handle
                      </label>
                      <input
                        type="text"
                        value={creatorHandle}
                        onChange={(e) => setCreatorHandle(e.target.value)}
                        className="w-full h-[36px] px-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] text-[12px] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Design settings */}
              <div className="rounded-[16px] p-[24px] border border-[var(--rule)] bg-[var(--bg-2)] space-y-[20px]">
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
                        className="py-[10px] rounded-[8px] border text-[10px] font-mono uppercase tracking-[0.05em] cursor-pointer"
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

                {/* Background style */}
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[8px] text-[var(--ink-3)]">
                    Background Style
                  </label>
                  <div className="grid grid-cols-3 gap-[6px]">
                    {[
                      { id: "solid", label: "Solid" },
                      { id: "gradient", label: "Grad" },
                      { id: "mesh", label: "Mesh" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setBackgroundStyle(opt.id as "solid" | "gradient" | "mesh")}
                        className="py-[8px] rounded-[8px] border text-[9px] font-mono uppercase tracking-[0.05em] cursor-pointer"
                        style={{
                          background: backgroundStyle === opt.id ? "var(--bg)" : "transparent",
                          borderColor: backgroundStyle === opt.id ? ACCENT : "var(--rule)",
                          color: backgroundStyle === opt.id ? ACCENT : "var(--ink-2)"
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography select */}
                <div className="space-y-[12px]">
                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[6px] text-[var(--ink-3)]">
                      Title Font
                    </label>
                    <select
                      value={fontTitle}
                      onChange={(e) => setFontTitle(e.target.value)}
                      className="w-full h-[36px] px-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] text-[12px] outline-none"
                    >
                      {FONTS_LIST.map((f) => (
                        <option key={f.name} value={f.value}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[6px] text-[var(--ink-3)]">
                      Body Font
                    </label>
                    <select
                      value={fontBody}
                      onChange={(e) => setFontBody(e.target.value)}
                      className="w-full h-[36px] px-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] text-[12px] outline-none"
                    >
                      {FONTS_LIST.map((f) => (
                        <option key={f.name} value={f.value}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Color Pickers */}
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
                </div>
              </div>
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
                    className="inline-flex items-center gap-[6px] font-mono text-[9px] tracking-[0.15em] uppercase font-semibold px-[14px] py-[8px] rounded-[8px] border border-[var(--rule)] bg-transparent text-[var(--ink)] cursor-pointer hover:border-[var(--ink-2)]"
                  >
                    <Download size={11} /> Export PNG
                  </button>
                  <button
                    onClick={exportAsPDF}
                    className="inline-flex items-center gap-[6px] font-mono text-[9px] tracking-[0.15em] uppercase font-semibold px-[14px] py-[8px] rounded-[8px] border-none text-white cursor-pointer hover:opacity-90"
                    style={{ background: ACCENT }}
                  >
                    <FileText size={11} /> LinkedIn PDF
                  </button>
                </div>
              </div>

              {/* Slide Layout Selector (Apply to active slide) */}
              {activeSlide && (
                <div className="p-[16px] rounded-[12px] border border-[var(--rule)] bg-[var(--bg-2)]">
                  <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[8px] text-[var(--ink-3)]">
                    Active Slide Template Layout
                  </label>
                  <div className="grid grid-cols-5 gap-[6px] max-[480px]:grid-cols-2">
                    {[
                      { id: "default", label: "Default" },
                      { id: "hook", label: "Hook Cover" },
                      { id: "split", label: "Split screen" },
                      { id: "quote", label: "Quote Card" },
                      { id: "metrics", label: "Big number" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => updateActiveSlide("layout", opt.id)}
                        className="py-[8px] rounded-[6px] border text-[9px] font-mono uppercase tracking-[0.05em] cursor-pointer"
                        style={{
                          background: (activeSlide.layout || "default") === opt.id ? "var(--bg)" : "transparent",
                          borderColor: (activeSlide.layout || "default") === opt.id ? ACCENT : "var(--rule)",
                          color: (activeSlide.layout || "default") === opt.id ? ACCENT : "var(--ink-2)"
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Device Mockup Wrapper */}
              <div className="flex items-center justify-center p-[20px] rounded-[24px] border border-[var(--rule)] bg-[color-mix(in_oklab,var(--bg)_80%,var(--bg-2))] min-h-[500px] relative overflow-hidden">
                {/* Ambient glowing circles if mesh background style selected */}
                {backgroundStyle === "mesh" && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
                    <div
                      className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[80px]"
                      style={{ background: activeAccent }}
                    />
                    <div
                      className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[80px]"
                      style={{ background: activeText }}
                    />
                  </div>
                )}

                {activeSlide && (
                  <div
                    className="shadow-2xl rounded-[20px] overflow-hidden flex flex-col justify-between p-[36px] relative select-none transition-all duration-300 border"
                    style={{
                      background: backgroundStyle === "gradient"
                        ? `linear-gradient(135deg, ${activeBg} 0%, ${activeAccent}18 100%)`
                        : activeBg,
                      borderColor: activeBorder,
                      width: aspectRatio === "square" ? "420px" : "360px",
                      height: aspectRatio === "square" ? "420px" : "450px",
                    }}
                  >
                    {/* Header Branding (Header top) */}
                    {showBranding && (activeSlide.layout || "default") !== "split" && (
                      <div className="flex items-center justify-between border-b pb-[10px]" style={{ borderColor: activeBorder }}>
                        <div>
                          <div className="text-[12px] font-bold" style={{ color: activeText }}>
                            {creatorName}
                          </div>
                          <div className="font-mono text-[9px] tracking-[0.05em] uppercase" style={{ color: activeAccent }}>
                            {creatorHandle}
                          </div>
                        </div>
                        {/* Text Initials Avatar */}
                        <div
                          className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ background: activeAccent, color: activeBg }}
                        >
                          {creatorName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                      </div>
                    )}

                    {/* Middle Card layouts based on active layout type */}
                    <div className="flex-1 flex flex-col justify-center py-[10px]">
                      {(activeSlide.layout || "default") === "hook" && (
                        <div>
                          <h3
                            className="font-bold leading-[1.15] tracking-[-0.03em] mb-[12px] m-0"
                            style={{
                              fontFamily: fontTitle,
                              fontSize: "clamp(24px,3.5vw,32px)",
                              color: activeText,
                            }}
                          >
                            {activeSlide.title}
                          </h3>
                          <p
                            className="text-[14px] leading-[1.6] m-0"
                            style={{
                              fontFamily: fontBody,
                              color: activeSubtext,
                            }}
                          >
                            {activeSlide.content}
                          </p>
                        </div>
                      )}

                      {(activeSlide.layout || "default") === "split" && (
                        <div className="grid grid-cols-2 h-full items-center gap-[12px] -mx-[36px] my-0 px-[36px] bg-[color-mix(in_oklab,var(--bg-2)_20%,transparent)]">
                          <div className="h-full flex items-center border-r pr-[12px]" style={{ borderColor: activeBorder }}>
                            <h3
                              className="font-bold leading-[1.2] tracking-[-0.02em] m-0"
                              style={{
                                fontFamily: fontTitle,
                                fontSize: "clamp(18px,2.5vw,22px)",
                                color: activeText,
                              }}
                            >
                              {activeSlide.title}
                            </h3>
                          </div>
                          <div className="pl-[4px]">
                            <p
                              className="text-[12px] leading-[1.5] m-0"
                              style={{
                                fontFamily: fontBody,
                                color: activeText,
                              }}
                            >
                              {activeSlide.content}
                            </p>
                          </div>
                        </div>
                      )}

                      {(activeSlide.layout || "default") === "quote" && (
                        <div className="relative">
                          <Quote className="absolute -top-[24px] -left-[16px] opacity-10" size={56} style={{ color: activeAccent }} />
                          <p
                            className="text-[15px] leading-[1.65] italic m-0 font-medium pl-[12px]"
                            style={{
                              fontFamily: fontBody,
                              color: activeText,
                            }}
                          >
                            &ldquo;{activeSlide.content}&rdquo;
                          </p>
                          <div className="font-mono text-[11px] uppercase tracking-[0.05em] mt-[12px] text-right font-bold" style={{ color: activeAccent }}>
                            — {activeSlide.title}
                          </div>
                        </div>
                      )}

                      {(activeSlide.layout || "default") === "metrics" && (
                        <div className="space-y-[8px]">
                          <div className="font-mono text-[64px] font-bold leading-[1] text-[var(--accent)]" style={{ color: activeAccent }}>
                            0{activeSlideIndex + 1}
                          </div>
                          <h3
                            className="font-bold leading-[1.2] tracking-[-0.02em] m-0"
                            style={{
                              fontFamily: fontTitle,
                              fontSize: "20px",
                              color: activeText,
                            }}
                          >
                            {activeSlide.title}
                          </h3>
                          <p
                            className="text-[13px] leading-[1.5] m-0"
                            style={{
                              fontFamily: fontBody,
                              color: activeSubtext,
                            }}
                          >
                            {activeSlide.content}
                          </p>
                        </div>
                      )}

                      {(activeSlide.layout || "default") === "default" && (
                        <div>
                          <h3
                            className="font-bold leading-[1.2] tracking-[-0.03em] mb-[10px] m-0"
                            style={{
                              fontFamily: fontTitle,
                              fontSize: "24px",
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
                          {activeSlide.emoji && (
                            <div className="text-[40px] mt-[16px]">{activeSlide.emoji}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Pagination indicators bottom */}
                    <div className="flex items-center justify-between pt-[10px]" style={{ borderTop: `1px solid ${activeBorder}` }}>
                      <span className="font-mono text-[10px] tracking-[0.05em] font-semibold" style={{ color: activeText + "90" }}>
                        {activeSlideIndex + 1} / {slides.length}
                      </span>
                      <div className="flex gap-[5px]">
                        {slides.map((_, idx) => (
                          <span
                            key={idx}
                            className="rounded-full transition-all duration-200"
                            style={{
                              width: idx === activeSlideIndex ? "16px" : "5px",
                              height: "5px",
                              background: idx === activeSlideIndex ? activeAccent : activeBorder,
                            }}
                          />
                        ))}
                      </div>
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

              {/* Quick Slide content inline editing fields */}
              {activeSlide && (
                <div className="rounded-[16px] p-[24px] border border-[var(--rule)] bg-[var(--bg-2)] space-y-[16px]">
                  <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] border-b pb-[10px] border-[var(--rule)]">
                    Edit Slide Content
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-[12px]">
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
                        Emoji
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={activeSlide.emoji || ""}
                        onChange={(e) => updateActiveSlide("emoji", e.target.value)}
                        className="w-[60px] h-[36px] text-center rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[16px] outline-none focus:border-[var(--ink-3)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[6px] text-[var(--ink-3)]">
                      Slide Description
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

            {/* Right Panel (All slides list) */}
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
                          Slide {idx + 1} · <span className="capitalize">{s.layout || "default"}</span>
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
                      <div className="text-[11px] text-[var(--ink-3)] line-clamp-1 font-sans">
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
