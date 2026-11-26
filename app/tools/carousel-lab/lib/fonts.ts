import {
  Cormorant,
  Courier_Prime,
  DM_Sans,
  Fraunces,
  IBM_Plex_Mono,
  Inter,
  JetBrains_Mono,
  Libre_Baskerville,
  Manrope,
  Merriweather,
  Nunito,
  Old_Standard_TT,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Poppins,
  PT_Serif,
  Sora,
  Space_Mono,
  Special_Elite,
  Work_Sans,
} from "next/font/google";

// Self-hosted via next/font/google so fonts respect the site's 'self' CSP and
// register real @font-face rules with resolved .style.fontFamily names that
// HTML5 <canvas> (ctx.font) can render directly without CSS var() resolution.
// Kept separate from constants.ts so Vitest suites importing constants.ts stay
// pure Node without requiring the Next.js font compiler transform.
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-cl-inter", display: "swap", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"], variable: "--font-cl-fraunces", display: "swap", preload: false });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-cl-jetbrains", display: "swap", preload: false });

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-cl-nunito", display: "swap", preload: false });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-cl-manrope", display: "swap", preload: false });
const sora = Sora({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-cl-sora", display: "swap", preload: false });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-cl-jakarta", display: "swap", preload: false });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-cl-poppins", display: "swap", preload: false });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-cl-dmsans", display: "swap", preload: false });
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-cl-outfit", display: "swap", preload: false });
const workSans = Work_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-cl-worksans", display: "swap", preload: false });

const specialElite = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--font-cl-special-elite", display: "swap", preload: false });
const courierPrime = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-cl-courier-prime", display: "swap", preload: false });
const oldStandard = Old_Standard_TT({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-cl-old-standard", display: "swap", preload: false });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ["400", "700", "800"], style: ["normal", "italic"], variable: "--font-cl-playfair", display: "swap", preload: false });
const libreBaskerville = Libre_Baskerville({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-cl-libre", display: "swap", preload: false });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700", "900"], style: ["normal", "italic"], variable: "--font-cl-merriweather", display: "swap", preload: false });
const ptSerif = PT_Serif({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-cl-ptserif", display: "swap", preload: false });
const cormorant = Cormorant({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"], variable: "--font-cl-cormorant", display: "swap", preload: false });

const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-cl-spacemono", display: "swap", preload: false });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-cl-ibmplex", display: "swap", preload: false });

export const CAROUSEL_FONT_VARIABLES = [
  inter.variable,
  fraunces.variable,
  jetbrainsMono.variable,
  nunito.variable,
  manrope.variable,
  sora.variable,
  plusJakarta.variable,
  poppins.variable,
  dmSans.variable,
  outfit.variable,
  workSans.variable,
  specialElite.variable,
  courierPrime.variable,
  oldStandard.variable,
  playfairDisplay.variable,
  libreBaskerville.variable,
  merriweather.variable,
  ptSerif.variable,
  cormorant.variable,
  spaceMono.variable,
  ibmPlexMono.variable,
].join(" ");

export const CAROUSEL_MONO_FONT = `${jetbrainsMono.style.fontFamily}, ui-monospace, SFMono-Regular, Menlo, monospace`;
export const CAROUSEL_SANS_FONT = `${inter.style.fontFamily}, ui-sans-serif, system-ui, sans-serif`;

const LOADED_FAMILY_MAP: readonly [string, string][] = [
  ["Inter", `${inter.style.fontFamily}, sans-serif`],
  ["Fraunces", `${fraunces.style.fontFamily}, Georgia, serif`],
  ["JetBrains Mono", `${jetbrainsMono.style.fontFamily}, monospace`],
  ["Nunito", `${nunito.style.fontFamily}, sans-serif`],
  ["Manrope", `${manrope.style.fontFamily}, sans-serif`],
  ["Sora", `${sora.style.fontFamily}, sans-serif`],
  ["Plus Jakarta Sans", `${plusJakarta.style.fontFamily}, sans-serif`],
  ["Poppins", `${poppins.style.fontFamily}, sans-serif`],
  ["DM Sans", `${dmSans.style.fontFamily}, sans-serif`],
  ["Outfit", `${outfit.style.fontFamily}, sans-serif`],
  ["Work Sans", `${workSans.style.fontFamily}, sans-serif`],
  ["Special Elite", `${specialElite.style.fontFamily}, monospace`],
  ["Courier Prime", `${courierPrime.style.fontFamily}, monospace`],
  ["Old Standard TT", `${oldStandard.style.fontFamily}, serif`],
  ["Playfair Display", `${playfairDisplay.style.fontFamily}, serif`],
  ["Libre Baskerville", `${libreBaskerville.style.fontFamily}, serif`],
  ["Merriweather", `${merriweather.style.fontFamily}, serif`],
  ["PT Serif", `${ptSerif.style.fontFamily}, serif`],
  ["Cormorant", `${cormorant.style.fontFamily}, serif`],
  ["Space Mono", `${spaceMono.style.fontFamily}, monospace`],
  ["IBM Plex Mono", `${ibmPlexMono.style.fontFamily}, monospace`],
];

/**
 * Maps a display font stack (e.g. "'Poppins', sans-serif") to the actual
 * Next.js self-hosted @font-face family name so DOM and <canvas> exports match.
 */
export function resolveCarouselFont(fontStack: string): string {
  const normalized = fontStack.toLowerCase();
  for (const [token, resolved] of LOADED_FAMILY_MAP) {
    if (normalized.includes(token.toLowerCase())) {
      return resolved;
    }
  }
  return fontStack;
}

/**
 * Forces the browser to download and decode the active slide fonts before
 * drawing onto an offscreen <canvas>, preventing silent system-font fallbacks.
 */
export async function preloadCarouselFonts(titleFont: string, bodyFont: string): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const resolvedTitle = resolveCarouselFont(titleFont);
  const resolvedBody = resolveCarouselFont(bodyFont);
  await Promise.allSettled([
    document.fonts.load(`400 48px ${resolvedTitle}`),
    document.fonts.load(`700 48px ${resolvedTitle}`),
    document.fonts.load(`800 48px ${resolvedTitle}`),
    document.fonts.load(`italic 700 48px ${resolvedTitle}`),
    document.fonts.load(`400 28px ${resolvedBody}`),
    document.fonts.load(`600 28px ${resolvedBody}`),
    document.fonts.load(`700 28px ${resolvedBody}`),
    document.fonts.load(`700 22px ${CAROUSEL_MONO_FONT}`),
    document.fonts.load(`700 24px ${CAROUSEL_SANS_FONT}`),
  ]);
  await document.fonts.ready;
}
