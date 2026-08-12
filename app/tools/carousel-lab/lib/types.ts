export const AESTHETIC_MOODS = [
  "Minimalist",
  "Maximalist",
  "Brutalist",
  "Premium Editorial (Zamir)",
  "Light Editorial (Zamir Light)",
] as const;
export type AestheticMood = (typeof AESTHETIC_MOODS)[number];

export type SlideLayout = "default" | "hook" | "split" | "quote" | "metrics" | "cta";

export type Slide = {
  title: string;
  content: string;
  emoji?: string;
  layout?: SlideLayout;
};

export type GenerateResponse = { slides: Slide[]; error?: never } | { error: string; slides?: never };

export interface MoodStyle {
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

export type BackgroundStyle = "solid" | "gradient" | "mesh";
export type AspectRatio = "square" | "portrait";
export type ExportKind = "png" | "zip" | "pdf";
export type InputMode = "topic" | "refine" | "manual";

// Fully resolved style values a slide is rendered with — computed once in the
// page from aesthetic + overrides, then threaded into both the live preview
// and the canvas exporter so they can never independently drift.
export interface ActiveStyle {
  bg: string;
  text: string;
  accent: string;
  subtext: string;
  border: string;
  borderWidth: number;
  borderRadius: number;
  fontTitle: string;
  fontBody: string;
  titleScale: number;
  bodyScale: number;
  italic: boolean;
  divider: boolean;
  shadow: string;
}

// Which drawn mark fills the logo badge when no image is uploaded.
export type LogoMark = "mo" | "amd" | "initial";

// Brand identity shown in the header/footer of every slide.
export interface BrandConfig {
  showBranding: boolean;
  logoText: string;
  logoImage: HTMLImageElement | null;
  logoMark: LogoMark;
  topRightTag: string;
  creatorName: string;
  creatorHandle: string;
}
