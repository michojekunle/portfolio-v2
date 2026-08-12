import {
  Nunito,
  Manrope,
  Sora,
  Plus_Jakarta_Sans,
  Special_Elite,
  Courier_Prime,
  Old_Standard_TT,
  Playfair_Display,
  Poppins,
  DM_Sans,
  Outfit,
  Work_Sans,
  Libre_Baskerville,
  Merriweather,
  PT_Serif,
  Cormorant,
  Space_Mono,
  IBM_Plex_Mono,
} from "next/font/google";
import type { AestheticMood, MoodStyle } from "./types";

// Self-hosted (not a Google Fonts CDN <link>) — the site's CSP locks
// style-src/font-src to 'self', so an external stylesheet would be silently
// blocked. next/font/google bakes these into the app's own origin at build
// time. Scoped to this file/tool only — nothing else on the site uses them.
//
// Using `.style.fontFamily` (the actual resolved family name next/font
// registers), not a CSS variable: canvas's ctx.font has no CSS cascade to
// resolve var(--font-x) against, so a var() reference here would silently
// fail to parse and fall back to the browser default for every export.
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });
const sora = Sora({ subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });
const workSans = Work_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });

const specialElite = Special_Elite({ subsets: ["latin"], weight: "400", display: "swap" });
const courierPrime = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const oldStandard = Old_Standard_TT({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ["400", "700", "800"], display: "swap" });
const libreBaskerville = Libre_Baskerville({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700", "900"], display: "swap" });
const ptSerif = PT_Serif({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const cormorant = Cormorant({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });

const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });

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

// Grouped so the picker can show where each font comes from. "Website" fonts
// are next/font-loaded globally in app/layout.tsx (Inter, Fraunces,
// JetBrains Mono) — zero extra network cost, guaranteed already available.
// "Modern" and "Editorial / Typewriter" are self-hosted via the next/font
// calls above, scoped to this module only, since nothing else on the site
// uses them.
//
// "Mom's Typewriter" and "Old Newspaper Types" (dafont.com freeware) aren't
// included — no font files, and dafont's licensing on typewriter/newspaper
// faces is usually "personal use" or unclear on commercial redistribution,
// so they can't be bundled without the actual files and a checked license.
// Special Elite / Courier Prime / Old Standard TT below hit the same
// aesthetic and are properly OFL/Apache-licensed for this use.
export const FONTS_LIST = [
  { name: "Default (Inherited)", value: "default", group: "Default" },

  { name: "Inter", value: "Inter, sans-serif", group: "Website" },
  { name: "Fraunces", value: "Fraunces, Georgia, serif", group: "Website" },
  { name: "JetBrains Mono", value: "'JetBrains Mono', monospace", group: "Website" },

  { name: "Nunito", value: `${nunito.style.fontFamily}, sans-serif`, group: "Modern" },
  { name: "Manrope", value: `${manrope.style.fontFamily}, sans-serif`, group: "Modern" },
  { name: "Sora", value: `${sora.style.fontFamily}, sans-serif`, group: "Modern" },
  { name: "Plus Jakarta Sans", value: `${plusJakarta.style.fontFamily}, sans-serif`, group: "Modern" },
  { name: "Poppins", value: `${poppins.style.fontFamily}, sans-serif`, group: "Modern" },
  { name: "DM Sans", value: `${dmSans.style.fontFamily}, sans-serif`, group: "Modern" },
  { name: "Outfit", value: `${outfit.style.fontFamily}, sans-serif`, group: "Modern" },
  { name: "Work Sans", value: `${workSans.style.fontFamily}, sans-serif`, group: "Modern" },

  { name: "Special Elite (typewriter)", value: `${specialElite.style.fontFamily}, monospace`, group: "Editorial / Typewriter" },
  { name: "Courier Prime (typewriter)", value: `${courierPrime.style.fontFamily}, monospace`, group: "Editorial / Typewriter" },
  { name: "Old Standard TT (old newspaper)", value: `${oldStandard.style.fontFamily}, serif`, group: "Editorial / Typewriter" },
  { name: "Playfair Display (masthead serif)", value: `${playfairDisplay.style.fontFamily}, serif`, group: "Editorial / Typewriter" },
  { name: "Libre Baskerville", value: `${libreBaskerville.style.fontFamily}, serif`, group: "Editorial / Typewriter" },
  { name: "Merriweather", value: `${merriweather.style.fontFamily}, serif`, group: "Editorial / Typewriter" },
  { name: "PT Serif", value: `${ptSerif.style.fontFamily}, serif`, group: "Editorial / Typewriter" },
  { name: "Cormorant", value: `${cormorant.style.fontFamily}, serif`, group: "Editorial / Typewriter" },
  { name: "Space Mono", value: `${spaceMono.style.fontFamily}, monospace`, group: "Editorial / Typewriter" },
  { name: "IBM Plex Mono", value: `${ibmPlexMono.style.fontFamily}, monospace`, group: "Editorial / Typewriter" },

  { name: "Georgia Serif", value: "Georgia, serif", group: "System" },
  { name: "Courier New Mono", value: "'Courier New', monospace", group: "System" },
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
