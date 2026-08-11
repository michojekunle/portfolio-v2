import type { AestheticMood, MoodStyle } from "./types";

export const MOOD_STYLES: Record<AestheticMood, MoodStyle> = {
  Minimalist: {
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
  Maximalist: {
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
  Brutalist: {
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
  },
};

export const FONTS_LIST = [
  { name: "Default (Inherited)", value: "default" },
  { name: "Inter Sans", value: "Inter, sans-serif" },
  { name: "Georgia Serif", value: "Georgia, serif" },
  { name: "Space Mono", value: "Courier New, monospace" },
];

// These match Tailwind's default `font-mono`/`font-sans` stacks used by the
// live preview — canvas export needs the exact same family strings since it
// has no CSS cascade to inherit them from. Also sidesteps a real canvas bug:
// an explicit ctx.font naming a font the browser hasn't loaded (e.g. "Inter"
// before next/font finishes) or a glyph the named font lacks (an emoji drawn
// with ctx.font = "...Georgia, serif") can render as tofu — system-stack
// fonts are always already available, so this never happens with them.
export const FONT_MONO_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
export const FONT_SANS_STACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const LAYOUT_OPTIONS: { id: import("./types").SlideLayout; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "hook", label: "Hook Cover" },
  { id: "split", label: "Split Screen" },
  { id: "quote", label: "Quote Card" },
  { id: "metrics", label: "Big number" },
  { id: "cta", label: "Brand CTA" },
];

export const EXPORT_WIDTH = 1080;
export const exportHeight = (aspectRatio: import("./types").AspectRatio): number => (aspectRatio === "square" ? 1080 : 1350);
