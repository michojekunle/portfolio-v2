import { Inria_Sans, Playwrite_ES, Playwrite_FR_Moderne, Spectral } from "next/font/google";

/**
 * Spectral (Production Type, Paris) sets the printed text; it covers Spanish
 * as well as French. Inria Sans (Black[Foundry] for Inria) carries the UI.
 * The hand is each country's own school cursive model from Google's
 * Playwrite project: FR Moderne for French, ES for Spanish. Both bind the
 * same CSS variable, so the stylesheet never needs to know which language.
 */
const spectral = Spectral({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fr-print",
  display: "swap",
});

const inriaSans = Inria_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-fr-ui",
  display: "swap",
});

// Playwrite publishes no subsets; next/font handles that (no preload) itself.
const frenchHand = Playwrite_FR_Moderne({ weight: ["300", "400"], variable: "--font-fr-hand", display: "swap" });
const spanishHand = Playwrite_ES({ weight: ["300", "400"], variable: "--font-fr-hand", display: "swap" });

export const frenchFontVariables = `${spectral.variable} ${inriaSans.variable} ${frenchHand.variable}`;
export const spanishFontVariables = `${spectral.variable} ${inriaSans.variable} ${spanishHand.variable}`;
