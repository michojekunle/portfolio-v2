/**
 * Picking a text-to-speech voice that sounds local. Browsers expose every
 * installed voice; the naive pick ("anything starting with fr") happily lands
 * on Canadian French, Mexican Spanish, a robotic "compact" voice — or, while
 * the list is still loading, the default English voice reading French.
 */

export interface VoiceInfo {
  readonly name: string;
  readonly lang: string;
}

export type VoiceMatch = "native" | "other-region" | "none";

/** Novelty / low-quality voices shipped on macOS and others. Never use them for a language course. */
const NOVELTY = /compact|eloquence|albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|grandma|grandpa|reed|rocko|sandy|shelley|flo\b/i;

/** Network / neural voices that tend to sound the most natural. */
const HIGH_QUALITY = /natural|neural|enhanced|premium|google|online|siri/i;

function normaliseLang(lang: string): string {
  return lang.replace("_", "-").toLowerCase();
}

export function scoreVoice(voice: VoiceInfo, locale: string, preferredNames: RegExp): number {
  const lang = normaliseLang(voice.lang);
  const want = locale.toLowerCase();
  const sameLanguage = lang.slice(0, 2) === want.slice(0, 2);
  if (!sameLanguage) return -Infinity;
  let score = lang === want ? 100 : 40;
  if (preferredNames.test(voice.name)) score += 25;
  if (HIGH_QUALITY.test(voice.name)) score += 15;
  if (NOVELTY.test(voice.name)) score -= 80;
  return score;
}

/** The best voice for a locale, and how well it matches. */
export function pickBestVoice<T extends VoiceInfo>(voices: readonly T[], locale: string, preferredNames: RegExp): { readonly voice: T | null; readonly match: VoiceMatch } {
  let best: T | null = null;
  let bestScore = -Infinity;
  for (const voice of voices) {
    const score = scoreVoice(voice, locale, preferredNames);
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  if (!best || bestScore === -Infinity) return { voice: null, match: "none" };
  return { voice: best, match: normaliseLang(best.lang) === locale.toLowerCase() ? "native" : "other-region" };
}
