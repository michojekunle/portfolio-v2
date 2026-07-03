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
  Star,
  CheckSquare,
  Smile,
  Book,
  Rocket,
  Flame,
  Award
} from "lucide-react";

const ACCENT = "#FF6B35";
const ACCENT_SOFT = "rgba(255,107,53,0.12)";
const ACCENT_BORDER = "rgba(255,107,53,0.25)";

const AESTHETIC_MOODS = [
  "Minimalist",
  "Maximalist",
  "Brutalist",
  "Premium Editorial (Zamir)",
  "Light Editorial (Zamir Light)"
] as const;
type AestheticMood = (typeof AESTHETIC_MOODS)[number];

type SlideLayout = "default" | "hook" | "split" | "quote" | "metrics" | "cta";

type Slide = {
  title: string;
  content: string;
  emoji?: string;
  layout?: SlideLayout;
};

type GenerateResponse =
  | { slides: Slide[]; error?: never }
  | { error: string; slides?: never };

interface MoodStyle {
  bg: string;
  text: string;
  accent: string;
  subtext: string;
  border: string;
  borderWidth: number;
  borderRadius: number;
  fontTitle: string;
  fontBody: string;
  isItalicTitle: boolean;
  showDivider: boolean;
  shadow: string;
}

const MOOD_STYLES: Record<AestheticMood, MoodStyle> = {
  "Minimalist": {
    bg: "#ffffff",
    text: "#111111",
    accent: "#FF6B35",
    subtext: "#555555",
    border: "#e5e5e5",
    borderWidth: 1,
    borderRadius: 16,
    fontTitle: "Inter, sans-serif",
    fontBody: "Inter, sans-serif",
    isItalicTitle: false,
    showDivider: false,
    shadow: "none",
  },
  "Maximalist": {
    bg: "#ff007f",
    text: "#111111",
    accent: "#00ffff",
    subtext: "#ffffff",
    border: "#111111",
    borderWidth: 4,
    borderRadius: 24,
    fontTitle: "Impact, sans-serif",
    fontBody: "Inter, sans-serif",
    isItalicTitle: false,
    showDivider: false,
    shadow: "6px 6px 0px #000000",
  },
  "Brutalist": {
    bg: "#f3f4f6",
    text: "#000000",
    accent: "#000000",
    subtext: "#1f2937",
    border: "#000000",
    borderWidth: 5,
    borderRadius: 0,
    fontTitle: "Courier New, monospace",
    fontBody: "Courier New, monospace",
    isItalicTitle: false,
    showDivider: true,
    shadow: "8px 8px 0px #000000",
  },
  "Premium Editorial (Zamir)": {
    bg: "#080809",
    text: "#ffffff",
    accent: "#C5A880",
    subtext: "#a1a1aa",
    border: "#27272a",
    borderWidth: 1,
    borderRadius: 24,
    fontTitle: "Georgia, serif",
    fontBody: "Inter, sans-serif",
    isItalicTitle: true,
    showDivider: true,
    shadow: "none",
  },
  "Light Editorial (Zamir Light)": {
    bg: "#faf8f5",
    text: "#1c1917",
    accent: "#855f2f",
    subtext: "#57534e",
    border: "#e7e2d8",
    borderWidth: 1,
    borderRadius: 24,
    fontTitle: "Georgia, serif",
    fontBody: "Inter, sans-serif",
    isItalicTitle: true,
    showDivider: true,
    shadow: "none",
  }
};

const LOGO_ICONS = ["book", "rocket", "sparkles", "flame", "star"] as const;
type LogoIcon = (typeof LOGO_ICONS)[number];

const FONTS_LIST = [
  { name: "Default (Inherited)", value: "default" },
  { name: "Inter Sans", value: "Inter, sans-serif" },
  { name: "Georgia Serif", value: "Georgia, serif" },
  { name: "Space Mono", value: "Courier New, monospace" },
];

export default function CarouselLabPage(): React.ReactElement {
  const [inputMode, setInputMode] = useState<"topic" | "refine" | "manual">("topic");
  const [topic, setTopic] = useState("");
  const [roughNotes, setRoughNotes] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Brand Personalization State
  const [aesthetic, setAesthetic] = useState<AestheticMood>("Premium Editorial (Zamir)");
  const [creatorName, setCreatorName] = useState("Michael");
  const [creatorHandle, setCreatorHandle] = useState("play.zamir.app");
  const [showBranding, setShowBranding] = useState(true);
  const [topRightTag, setTopRightTag] = useState("Verse of the Day");
  const [logoText, setLogoText] = useState("ZAMIR");
  const [logoIcon, setLogoIcon] = useState<LogoIcon>("book");

  // Customization controls
  const [backgroundStyle, setBackgroundStyle] = useState<"solid" | "gradient" | "mesh">("mesh");
  const [aspectRatio, setAspectRatio] = useState<"square" | "portrait">("portrait");
  const [fontTitle, setFontTitle] = useState("default");
  const [fontBody, setFontBody] = useState("default");

  // Color Overrides
  const [customBg, setCustomBg] = useState("");
  const [customText, setCustomText] = useState("");
  const [customAccent, setCustomAccent] = useState("");

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeSlide = slides[activeSlideIndex] ?? null;

  const generate = useCallback(async (): Promise<void> => {
    const activeTextSource = inputMode === "refine" ? roughNotes.trim() : topic.trim();
    if (!activeTextSource) return;
    setLoading(true);
    setError(null);
    setSlides([]);
    setActiveSlideIndex(0);

    try {
      const res = await fetch("/api/carousel-lab/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: activeTextSource,
          slideCount,
          theme: aesthetic === "Premium Editorial (Zamir)" ? "Dark" : "Minimal",
          mode: inputMode === "refine" ? "refine" : "topic",
        }),
      });

      const data = (await res.json()) as GenerateResponse;

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }

      if (!data.slides || data.slides.length === 0) {
        throw new Error("No slides returned from AI");
      }

      // Automatically construct first as Cover Hook, rest as Default, last as CTA
      const mapped = data.slides.map((s, idx) => ({
        ...s,
        layout: idx === 0
          ? ("hook" as SlideLayout)
          : idx === data.slides.length - 1
          ? ("cta" as SlideLayout)
          : ("default" as SlideLayout),
      }));

      setSlides(mapped);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [topic, roughNotes, inputMode, slideCount, aesthetic]);

  const startManualDeck = (): void => {
    setError(null);
    const manualSlides: Slide[] = [
      {
        title: "The Ultimate Hook Title",
        content: "Tap 'Edit Slide Content' in the sidebar below to customize this text directly.",
        layout: "hook",
      },
      {
        title: "Key Point 01",
        content: "Illustrate your first concept or instruction in 2-3 clean, punchy sentences.",
        layout: "default",
      },
      {
        title: "Let's connect!",
        content: "Customize this call to action layout to redirect swipers to your personal brand site.",
        layout: "cta",
      }
    ];
    setSlides(manualSlides);
    setActiveSlideIndex(0);
  };

  const activeMoodStyle = MOOD_STYLES[aesthetic];

  // Resolve current active colors & typography
  const activeBg = customBg || activeMoodStyle.bg;
  const activeText = customText || activeMoodStyle.text;
  const activeAccent = customAccent || activeMoodStyle.accent;
  const activeSubtext = activeMoodStyle.subtext;
  const activeBorder = activeMoodStyle.border;
  const activeBorderWidth = activeMoodStyle.borderWidth;
  const activeBorderRadius = activeMoodStyle.borderRadius;
  const activeFontTitle = fontTitle !== "default" ? fontTitle : activeMoodStyle.fontTitle;
  const activeFontBody = fontBody !== "default" ? fontBody : activeMoodStyle.fontBody;
  const activeItalic = activeMoodStyle.isItalicTitle;
  const activeDivider = activeMoodStyle.showDivider;
  const activeShadow = activeMoodStyle.shadow;

  const hasSlides = slides.length > 0;

  // Slide actions handlers
  const updateActiveSlide = (field: keyof Slide, value: string): void => {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === activeSlideIndex ? { ...s, [field]: value } : s))
    );
  };

  const addSlide = (): void => {
    const newSlide: Slide = {
      title: "New Key Takeaway",
      content: "Describe this main concept or point in a short, scroll-stopping sentence.",
      emoji: "💡",
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

    // Dynamic scale factor relative to the CSS preview card dimensions
    // Portrait preview is 360 wide, Square preview is 420 wide
    const scale = width / (aspectRatio === "square" ? 420 : 360);

    const margin = 36 * scale;
    const contentWidth = width - margin * 2;

    // 1. Draw Background
    if (backgroundStyle === "gradient") {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, activeBg);
      grad.addColorStop(1, activeAccent + "1a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (backgroundStyle === "mesh") {
      ctx.fillStyle = activeBg;
      ctx.fillRect(0, 0, width, height);
      
      // Top mesh glow
      const grad1 = ctx.createRadialGradient(width * 0.2, height * 0.2, 50 * scale, width * 0.2, height * 0.2, width * 0.7);
      grad1.addColorStop(0, activeAccent + "20");
      grad1.addColorStop(1, "transparent");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);
      
      // Bottom mesh glow
      const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.8, 50 * scale, width * 0.8, height * 0.8, width * 0.7);
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
    ctx.lineWidth = activeBorderWidth * scale;
    ctx.strokeRect(0, 0, width, height);

    // Text Wrapping Helper
    const getWrappedLines = (
      text: string,
      maxWidth: number,
      fontStr: string
    ): string[] => {
      ctx.font = fontStr;
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + " ";
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth && n > 0) {
          lines.push(currentLine.trim());
          currentLine = words[n] + " ";
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine.trim());
      return lines;
    };

    const drawLines = (
      lines: string[],
      x: number,
      startY: number,
      lineHeight: number,
      color: string,
      align: CanvasTextAlign = "left"
    ): number => {
      ctx.fillStyle = color;
      ctx.textAlign = align;
      let y = startY;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y);
        y += lineHeight;
      }
      ctx.textAlign = "left"; // reset
      return y;
    };

    // Calculate Y Boundaries for Center Container
    const logoSize = 28 * scale;
    const headerBottom = showBranding && layout !== "cta" 
      ? margin + logoSize + 10 * scale 
      : margin;

    const footerHeight = activeDivider && layout !== "split"
      ? 20 * scale + 30 * scale
      : 20 * scale;
    const footerTop = height - margin - footerHeight;

    const centerHeight = footerTop - headerBottom;
    const centerY = headerBottom + centerHeight / 2;

    // 2. Creator Branding Header (Top)
    if (showBranding && layout !== "cta") {
      // Draw Logo Icon Badge
      ctx.fillStyle = activeAccent + "1a";
      ctx.beginPath();
      ctx.roundRect(margin, margin, logoSize, logoSize, 8 * scale);
      ctx.fill();
      
      // Draw inner icon symbol
      ctx.fillStyle = activeAccent;
      ctx.font = "bold " + Math.round(12 * scale) + "px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("🕮", margin + logoSize / 2, margin + logoSize / 2 + 4 * scale);
      ctx.textAlign = "left"; // reset

      // Draw Logo Brand text
      ctx.fillStyle = activeAccent;
      ctx.font = "bold " + Math.round(12 * scale) + "px Inter, sans-serif";
      const spacedLogo = logoText.split("").join(" ");
      ctx.fillText(spacedLogo, margin + logoSize + 8 * scale, margin + logoSize / 2 + 4 * scale);

      // Top Right tag info
      ctx.fillStyle = activeText + "80";
      ctx.font = "bold " + Math.round(9 * scale) + "px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(topRightTag, width - margin, margin + logoSize / 2 + 4 * scale);
      ctx.textAlign = "left"; // reset

      // Header bottom border
      ctx.strokeStyle = activeBorder;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(margin, margin + logoSize + 10 * scale);
      ctx.lineTo(width - margin, margin + logoSize + 10 * scale);
      ctx.stroke();
    }

    // 3. Draw Layout Content (Vertically Centered)
    if (layout === "hook") {
      const titleFont = `${activeItalic ? "italic " : ""}bold ${Math.round(28 * scale)}px ${activeFontTitle}`;
      const titleLineHeight = 34 * scale;
      const bodyFont = `${Math.round(14 * scale)}px ${activeFontBody}`;
      const bodyLineHeight = 22 * scale;
      const spacing = 16 * scale;

      const titleLines = getWrappedLines(slide.title, contentWidth, titleFont);
      const contentLines = getWrappedLines(slide.content, contentWidth, bodyFont);

      const titleH = titleLines.length * titleLineHeight;
      const bodyH = contentLines.length * bodyLineHeight;
      const totalH = titleH + spacing + bodyH;
      const startY = centerY - totalH / 2;

      drawLines(titleLines, margin, startY + titleLineHeight - 8 * scale, titleLineHeight, activeText);
      drawLines(contentLines, margin, startY + titleH + spacing + bodyLineHeight - 6 * scale, bodyLineHeight, activeSubtext);
    } 
    else if (layout === "split") {
      // Split layout container background
      ctx.fillStyle = activeAccent + "08";
      ctx.fillRect(margin - 12 * scale, headerBottom + 12 * scale, width / 2 - margin, centerHeight - 24 * scale);

      // Left split (Title)
      const leftWidth = width / 2 - margin - 20 * scale;
      const titleFont = `bold ${Math.round(20 * scale)}px ${activeFontTitle}`;
      const titleLineHeight = 26 * scale;
      const titleLines = getWrappedLines(slide.title, leftWidth, titleFont);
      const titleH = titleLines.length * titleLineHeight;
      const leftStartY = centerY - titleH / 2;
      drawLines(titleLines, margin, leftStartY + titleLineHeight - 6 * scale, titleLineHeight, activeText);

      // Right split (Content)
      const rightWidth = width / 2 - margin - 20 * scale;
      const bodyFont = `${Math.round(13 * scale)}px ${activeFontBody}`;
      const bodyLineHeight = 19 * scale;
      const contentLines = getWrappedLines(slide.content, rightWidth, bodyFont);
      const contentH = contentLines.length * bodyLineHeight;
      const rightStartY = centerY - contentH / 2;
      drawLines(contentLines, width / 2 + 10 * scale, rightStartY + bodyLineHeight - 4 * scale, bodyLineHeight, activeText);
    }
    else if (layout === "quote") {
      // Big background quote mark
      ctx.fillStyle = activeAccent + "1a";
      ctx.font = `italic bold ${Math.round(72 * scale)}px Georgia, serif`;
      ctx.fillText("“", margin, centerY - 60 * scale);

      const bodyFont = `italic 500 ${Math.round(16 * scale)}px ${activeFontTitle}`;
      const bodyLineHeight = 26 * scale;
      const contentLines = getWrappedLines(slide.content, contentWidth - 20 * scale, bodyFont);
      const contentH = contentLines.length * bodyLineHeight;

      const badgeHeight = 28 * scale;
      const spacing = 16 * scale;
      const totalH = contentH + (slide.title ? spacing + badgeHeight : 0);
      const startY = centerY - totalH / 2;

      drawLines(contentLines, margin + 12 * scale, startY + bodyLineHeight - 6 * scale, bodyLineHeight, activeText);

      if (slide.title) {
        const badgeY = startY + contentH + spacing;
        const badgeText = slide.title.toUpperCase();
        const badgeFont = `bold ${Math.round(10 * scale)}px Inter, sans-serif`;
        ctx.font = badgeFont;
        const textW = ctx.measureText(badgeText).width;
        const badgeW = textW + 28 * scale;

        ctx.strokeStyle = activeAccent + "40";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.roundRect(margin + 12 * scale, badgeY, badgeW, badgeHeight, badgeHeight / 2);
        ctx.stroke();

        ctx.fillStyle = activeAccent;
        ctx.textAlign = "center";
        ctx.fillText(badgeText, margin + 12 * scale + badgeW / 2, badgeY + badgeHeight / 2 + 4 * scale);
        ctx.textAlign = "left"; // reset
      }
    }
    else if (layout === "metrics") {
      const numFont = `bold ${Math.round(56 * scale)}px Space Mono, Courier New, monospace`;
      const numLineHeight = 56 * scale;
      const titleFont = `bold ${Math.round(20 * scale)}px ${activeFontTitle}`;
      const titleLineHeight = 26 * scale;
      const bodyFont = `${Math.round(13 * scale)}px ${activeFontBody}`;
      const bodyLineHeight = 19 * scale;
      const spacing = 12 * scale;

      const titleLines = getWrappedLines(slide.title, contentWidth, titleFont);
      const contentLines = getWrappedLines(slide.content, contentWidth, bodyFont);

      const titleH = titleLines.length * titleLineHeight;
      const bodyH = contentLines.length * bodyLineHeight;
      const totalH = numLineHeight + spacing + titleH + spacing + bodyH;
      const startY = centerY - totalH / 2;

      ctx.fillStyle = activeAccent;
      ctx.font = numFont;
      ctx.fillText(`0${index + 1}`, margin, startY + numLineHeight - 8 * scale);

      drawLines(titleLines, margin, startY + numLineHeight + spacing + titleLineHeight - 6 * scale, titleLineHeight, activeText);
      drawLines(contentLines, margin, startY + numLineHeight + spacing + titleH + spacing + bodyLineHeight - 4 * scale, bodyLineHeight, activeSubtext);
    }
    else if (layout === "cta") {
      // Background card
      const cardWidth = contentWidth;
      const cardHeight = centerHeight - 20 * scale;
      const cardX = margin;
      const cardY = headerBottom + 10 * scale;

      ctx.fillStyle = activeAccent + "08";
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 24 * scale);
      ctx.fill();

      const avatarRadius = 30 * scale;
      const titleFont = `bold ${Math.round(20 * scale)}px ${activeFontTitle}`;
      const bodyFont = `${Math.round(12 * scale)}px ${activeFontBody}`;
      const btnFont = `bold ${Math.round(12 * scale)}px Inter, sans-serif`;
      const btnHeight = 36 * scale;
      
      const titleLines = getWrappedLines(slide.title || "Let's connect!", cardWidth - 40 * scale, titleFont);
      const contentLines = getWrappedLines(slide.content || "Follow for daily guides and resources.", cardWidth - 40 * scale, bodyFont);

      const spacing1 = 20 * scale;
      const spacing2 = 12 * scale;
      const spacing3 = 20 * scale;

      const titleH = titleLines.length * 26 * scale;
      const bodyH = contentLines.length * 18 * scale;
      const totalH = (avatarRadius * 2) + spacing1 + titleH + spacing2 + bodyH + spacing3 + btnHeight;
      const startY = (cardY + cardHeight / 2) - totalH / 2;

      // Avatar
      ctx.fillStyle = activeAccent;
      ctx.beginPath();
      ctx.arc(width / 2, startY + avatarRadius, avatarRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = activeBg;
      ctx.font = `bold ${Math.round(16 * scale)}px Inter, sans-serif`;
      ctx.textAlign = "center";
      const initials = creatorName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      ctx.fillText(initials, width / 2, startY + avatarRadius + 6 * scale);

      // Title
      const titleY = startY + (avatarRadius * 2) + spacing1;
      drawLines(titleLines, width / 2, titleY + 20 * scale, 26 * scale, activeText, "center");

      // Content
      const bodyY = titleY + titleH + spacing2;
      drawLines(contentLines, width / 2, bodyY + 14 * scale, 18 * scale, activeSubtext, "center");

      // Button
      const btnY = bodyY + bodyH + spacing3;
      ctx.font = btnFont;
      const btnText = creatorHandle.toLowerCase();
      const textW = ctx.measureText(btnText).width;
      const btnW = textW + 48 * scale;

      ctx.fillStyle = activeAccent;
      ctx.beginPath();
      ctx.roundRect(width / 2 - btnW / 2, btnY, btnW, btnHeight, btnHeight / 2);
      ctx.fill();

      ctx.fillStyle = activeBg;
      ctx.textAlign = "center";
      ctx.fillText(btnText, width / 2, btnY + btnHeight / 2 + 4 * scale);
      ctx.textAlign = "left"; // reset
    }
    else {
      // Default Centered slide
      const titleFont = `bold ${Math.round(24 * scale)}px ${activeFontTitle}`;
      const titleLineHeight = 30 * scale;
      const bodyFont = `${Math.round(14 * scale)}px ${activeFontBody}`;
      const bodyLineHeight = 22 * scale;
      const spacing = 12 * scale;

      const titleLines = getWrappedLines(slide.title, contentWidth, titleFont);
      const contentLines = getWrappedLines(slide.content, contentWidth, bodyFont);

      const emojiHeight = slide.emoji ? 50 * scale : 0;
      const totalH = (titleLines.length * titleLineHeight) + spacing + (contentLines.length * bodyLineHeight) + (slide.emoji ? spacing + emojiHeight : 0);
      const startY = centerY - totalH / 2;

      let currentY = drawLines(titleLines, margin, startY + titleLineHeight - 6 * scale, titleLineHeight, activeText);
      currentY = drawLines(contentLines, margin, currentY + spacing, bodyLineHeight, activeSubtext);

      if (slide.emoji) {
        ctx.font = `${Math.round(36 * scale)}px Arial`;
        ctx.fillText(slide.emoji, margin, currentY + spacing + 30 * scale);
      }
    }

    // 4. Divider Line (Zamir style)
    if (activeDivider && layout !== "split") {
      ctx.strokeStyle = activeBorder;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(margin, footerTop);
      ctx.lineTo(width - margin, footerTop);
      ctx.stroke();
    }

    // 5. Creator Name (Bottom Left)
    ctx.fillStyle = activeText + "80";
    ctx.font = "bold " + Math.round(10 * scale) + "px Space Mono, Courier New, monospace";
    ctx.fillText(creatorName, margin, height - margin);

    // 6. Brand Website Link (Bottom Right)
    ctx.fillStyle = activeText;
    ctx.font = "bold " + Math.round(11 * scale) + "px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(creatorHandle.toLowerCase(), width - margin, height - margin);
    ctx.textAlign = "left"; // reset
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
          {/* Creation Mode Tabs */}
          <div className="flex border-b border-[var(--rule)] pb-[1px] gap-[24px] overflow-x-auto">
            {[
              { id: "topic", label: "From Topic" },
              { id: "refine", label: "Refine Raw Draft" },
              { id: "manual", label: "Start Manually" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setInputMode(tab.id as "topic" | "refine" | "manual")}
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
                  placeholder="e.g. 5 Rules for Focus, How to Write Copy that Sells..."
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
          )}

          {inputMode === "refine" && (
            <div className="flex gap-[16px] max-[720px]:flex-col">
              <div className="flex-1">
                <label
                  htmlFor="carousel-notes"
                  className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-[10px]"
                  style={{ color: "var(--ink-3)" }}
                >
                  Rough Notes / Copy Draft / Ideas Outline
                </label>
                <textarea
                  id="carousel-notes"
                  placeholder="Paste your rough outline, outline points, draft notes, or bullet lists here for AI to clean up..."
                  value={roughNotes}
                  onChange={(e) => setRoughNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-[10px] p-[16px] text-[14px] outline-none transition-colors duration-150 resize-none font-sans"
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
                <div className="flex items-center gap-[12px] h-[96px] px-[12px] rounded-[10px] border border-[var(--rule)] bg-[var(--bg)]">
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
          )}

          {inputMode === "manual" && (
            <div className="p-[24px] rounded-[10px] border border-[var(--rule)] bg-[var(--bg)] text-center">
              <p className="text-[13px] leading-[1.65] text-[var(--ink-2)] m-0">
                🚀 Skip AI generation entirely! Start with a default empty 3-slide template (Hook Cover, Body Point, Brand CTA Card) and craft your layout parameters, brand initials logo, and custom content slides directly in the sidebar design panels.
              </p>
            </div>
          )}



          {inputMode === "manual" ? (
            <button
              type="button"
              onClick={startManualDeck}
              className="w-full h-[52px] rounded-[10px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-all duration-200 text-white flex items-center justify-center gap-[8px] cursor-pointer"
              style={{ background: ACCENT }}
            >
              <Plus size={14} /> Start Designer Canvas
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void generate()}
              disabled={loading || (inputMode === "topic" ? !topic.trim() : !roughNotes.trim())}
              className="w-full h-[52px] rounded-[10px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-[8px] cursor-pointer"
              style={{
                background: (inputMode === "topic" ? topic.trim() : roughNotes.trim()) && !loading ? ACCENT : "var(--rule)",
              }}
            >
              <Sparkles size={14} />
              {loading ? "Generating slides..." : "Generate carousel"}
            </button>
          )}
        </div>

        {/* Customization Workspace */}
        {hasSlides && (
          <div className="grid grid-cols-[330px_1fr_260px] max-[1120px]:grid-cols-[290px_1fr] max-[800px]:grid-cols-1 gap-[32px]">
            
            {/* Left Controls Panel */}
            <div className="space-y-[24px] max-[800px]:order-2">
              
              {/* Creator Branding */}
              <div className="rounded-[16px] p-[24px] border border-[var(--rule)] bg-[var(--bg-2)] space-y-[16px]">
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] border-b pb-[10px] border-[var(--rule)]">
                  Creator Branding & Logo
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--ink-2)]">Show Profile Branding</span>
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
                        Brand Logo Text
                      </label>
                      <input
                        type="text"
                        value={logoText}
                        onChange={(e) => setLogoText(e.target.value)}
                        className="w-full h-[36px] px-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] text-[12px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[8px] tracking-[0.1em] uppercase mb-[6px] text-[var(--ink-3)]">
                        Top Right Header Tag
                      </label>
                      <input
                        type="text"
                        value={topRightTag}
                        onChange={(e) => setTopRightTag(e.target.value)}
                        className="w-full h-[36px] px-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] text-[12px] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[8px] tracking-[0.1em] uppercase mb-[6px] text-[var(--ink-3)]">
                        Bottom Left Creator Name
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
                        Bottom Right Link / URL
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

              <div className="rounded-[16px] p-[24px] border border-[var(--rule)] bg-[var(--bg-2)] space-y-[20px]">
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] border-b pb-[10px] border-[var(--rule)]">
                  Canvas Customizer
                </div>

                {/* Aesthetic Mood Selector */}
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.1em] uppercase mb-[8px] text-[var(--ink-3)]">
                    Aesthetic Mood Style
                  </label>
                  <select
                    value={aesthetic}
                    onChange={(e) => {
                      const t = e.target.value as AestheticMood;
                      setAesthetic(t);
                      setCustomBg("");
                      setCustomText("");
                      setCustomAccent("");
                    }}
                    className="w-full h-[36px] px-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] text-[12px] outline-none focus:border-[var(--ink-3)]"
                  >
                    {AESTHETIC_MOODS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
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
                  <div className="grid grid-cols-6 gap-[6px] max-[480px]:grid-cols-2">
                    {[
                      { id: "default", label: "Default" },
                      { id: "hook", label: "Hook Cover" },
                      { id: "split", label: "Split Screen" },
                      { id: "quote", label: "Quote Card" },
                      { id: "metrics", label: "Big number" },
                      { id: "cta", label: "Brand CTA" }
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
                    className="shadow-2xl overflow-hidden flex flex-col justify-between p-[36px] relative select-none transition-all duration-300 border"
                    style={{
                      background: backgroundStyle === "gradient"
                        ? `linear-gradient(135deg, ${activeBg} 0%, ${activeAccent}18 100%)`
                        : activeBg,
                      borderColor: activeBorder,
                      borderWidth: `${activeBorderWidth}px`,
                      borderRadius: `${activeBorderRadius}px`,
                      width: aspectRatio === "square" ? "420px" : "360px",
                      height: aspectRatio === "square" ? "420px" : "450px",
                      boxShadow: activeShadow,
                    }}
                  >
                    {/* Header Branding (Header top) */}
                    {showBranding && (activeSlide.layout || "default") !== "cta" && (
                      <div className="flex items-center justify-between border-b pb-[10px]" style={{ borderColor: activeBorder }}>
                        <div className="flex items-center gap-[8px]">
                          {/* Logo badge */}
                          <div
                            className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center text-[12px] font-bold"
                            style={{ background: activeAccent + "20", color: activeAccent }}
                          >
                            🕮
                          </div>
                          <div className="text-[12px] font-bold tracking-[0.1em] uppercase" style={{ color: activeAccent }}>
                            {logoText}
                          </div>
                        </div>
                        {/* Tagline */}
                        <div className="font-mono text-[9px] tracking-[0.05em] uppercase" style={{ color: activeText + "80" }}>
                          {topRightTag}
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
                              fontFamily: activeFontTitle,
                              fontSize: "clamp(22px,3.5vw,30px)",
                              color: activeText,
                              fontStyle: activeItalic ? "italic" : "normal",
                            }}
                          >
                            {activeSlide.title}
                          </h3>
                          <p
                            className="text-[14px] leading-[1.6] m-0 font-sans"
                            style={{
                              fontFamily: activeFontBody,
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
                                fontFamily: activeFontTitle,
                                fontSize: "clamp(18px,2.5vw,22px)",
                                color: activeText,
                              }}
                            >
                              {activeSlide.title}
                            </h3>
                          </div>
                          <div className="pl-[4px]">
                            <p
                              className="text-[12px] leading-[1.5] m-0 font-sans"
                              style={{
                                fontFamily: activeFontBody,
                                color: activeText,
                              }}
                            >
                              {activeSlide.content}
                            </p>
                          </div>
                        </div>
                      )}

                      {(activeSlide.layout || "default") === "quote" && (
                        <div className="relative space-y-[12px]">
                          <Quote className="absolute -top-[24px] -left-[16px] opacity-10" size={56} style={{ color: activeAccent }} />
                          <p
                            className="text-[16px] leading-[1.6] italic m-0 font-medium pl-[12px]"
                            style={{
                              fontFamily: activeFontTitle,
                              color: activeText,
                            }}
                          >
                            &ldquo;{activeSlide.content}&rdquo;
                          </p>
                          
                          {/* Quote Badge Reference */}
                          {activeSlide.title && (
                            <div className="pt-[4px]">
                              <span
                                className="inline-block px-[14px] py-[6px] rounded-full border text-[10px] font-mono font-bold tracking-[0.1em] uppercase"
                                style={{ borderColor: activeAccent + "40", color: activeAccent }}
                              >
                                {activeSlide.title}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {(activeSlide.layout || "default") === "metrics" && (
                        <div className="space-y-[8px]">
                          <div className="font-mono text-[56px] font-bold leading-[1]" style={{ color: activeAccent }}>
                            0{activeSlideIndex + 1}
                          </div>
                          <h3
                            className="font-bold leading-[1.2] tracking-[-0.02em] m-0"
                            style={{
                              fontFamily: activeFontTitle,
                              fontSize: "20px",
                              color: activeText,
                            }}
                          >
                            {activeSlide.title}
                          </h3>
                          <p
                            className="text-[13px] leading-[1.5] m-0 font-sans"
                            style={{
                              fontFamily: activeFontBody,
                              color: activeSubtext,
                            }}
                          >
                            {activeSlide.content}
                          </p>
                        </div>
                      )}

                      {(activeSlide.layout || "default") === "cta" && (
                        <div className="text-center space-y-[20px] p-[20px] rounded-[16px]" style={{ background: activeAccent + "08" }}>
                          {/* Centered initials avatar */}
                          <div
                            className="w-[60px] h-[60px] rounded-full mx-auto flex items-center justify-center text-[18px] font-bold shadow-sm"
                            style={{ background: activeAccent, color: activeBg }}
                          >
                            {creatorName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <h3 className="text-[20px] font-bold m-0 mb-[4px]" style={{ fontFamily: activeFontTitle, color: activeText }}>
                              {activeSlide.title || "Let's connect!"}
                            </h3>
                            <p className="text-[12px] leading-[1.5] m-0" style={{ fontFamily: activeFontBody, color: activeSubtext }}>
                              {activeSlide.content || "Follow for daily guides and resources."}
                            </p>
                          </div>
                          {/* Giant link CTA button */}
                          <div>
                            <span
                              className="inline-block px-[24px] py-[10px] rounded-full text-[13px] font-bold font-mono tracking-[0.05em] shadow-sm uppercase"
                              style={{ background: activeAccent, color: activeBg }}
                            >
                              {creatorHandle.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      )}

                      {(activeSlide.layout || "default") === "default" && (
                        <div>
                          <h3
                            className="font-bold leading-[1.2] tracking-[-0.03em] mb-[10px] m-0"
                            style={{
                              fontFamily: activeFontTitle,
                              fontSize: "24px",
                              color: activeText,
                            }}
                          >
                            {activeSlide.title}
                          </h3>
                          <p
                            className="text-[14px] leading-[1.65] m-0 font-sans"
                            style={{
                              fontFamily: activeFontBody,
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

                    {/* Divider Line */}
                    {activeDivider && (activeSlide.layout || "default") !== "split" && (
                      <div className="h-[1px] w-full" style={{ background: activeBorder }} />
                    )}

                    {/* Footer indicators */}
                    <div className="flex items-center justify-between pt-[6px]">
                      <span className="font-mono text-[10px] tracking-[0.05em] font-semibold" style={{ color: activeText + "80" }}>
                        {creatorName}
                      </span>
                      <span className="font-mono text-[11px] font-bold" style={{ color: activeText }}>
                        {creatorHandle.toLowerCase()}
                      </span>
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
                        Slide Title / Badge
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
                      Slide Description / Body
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
