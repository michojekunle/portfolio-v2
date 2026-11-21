import type { Gloss, LessonVocab } from "./lessons";

export interface WordMeaning {
  /** The phrase the meaning belongs to (may be longer than the tapped word: "s'il vous plaît"). */
  readonly phrase: string;
  readonly meaning: string;
  readonly note?: string;
  /** True for today's words to keep, so the UI can mark them. */
  readonly isNew: boolean;
}

/** Lower-case and strip edge punctuation (incl. ¿¡«»), keeping inner apostrophes: "¿Algo" → "algo", "s'il" → "s'il". */
export function normaliseWord(token: string): string {
  return token
    .toLocaleLowerCase()
    .replace(/[’]/g, "'")
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function wordsOf(phrase: string): string[] {
  return phrase.split(/\s+/).map(normaliseWord).filter(Boolean);
}

/**
 * The meaning of a tapped word: today's vocabulary first (it carries notes),
 * then the line's glossary. Phrases match on whole words, so tapping "plaît"
 * explains "s'il vous plaît" and tapping "un" never explains "une".
 */
export function meaningOf(token: string, vocab: readonly LessonVocab[], gloss: readonly Gloss[] = []): WordMeaning | null {
  const word = normaliseWord(token);
  if (!word) return null;
  const hit = <T extends { fr: string }>(entries: readonly T[]): T | undefined =>
    // Prefer the shortest phrase containing the word: the most specific meaning.
    [...entries].filter((entry) => wordsOf(entry.fr).includes(word)).sort((a, b) => a.fr.length - b.fr.length)[0];

  const fromVocab = hit(vocab);
  if (fromVocab) return { phrase: fromVocab.fr, meaning: fromVocab.en, note: fromVocab.note, isNew: true };
  const fromGloss = hit(gloss);
  if (fromGloss) return { phrase: fromGloss.fr, meaning: fromGloss.en, isNew: false };
  return null;
}
