import type { Lesson, LessonVocab } from "./lessons";

/** Lower-case, strip accents and edge punctuation — for "close enough?" comparisons only. */
function fold(text: string): string {
  return text
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’]/g, "'")
    .replace(/^[\s«"“(]+|[\s»"”.,!?;:)]+$/g, "")
    .trim();
}

function strict(text: string): string {
  return text.toLocaleLowerCase("fr").replace(/[’]/g, "'").replace(/^[\s«"“(]+|[\s»"”.,!?;:)]+$/g, "").trim();
}

/** Small deterministic PRNG so the same day shuffles the same way (stable across re-renders and reloads). */
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (const char of seed) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// ── Stage 1: build the sentence from tiles ────────────────────────────────

/**
 * Words for tiles. French puts a space before ? ! : ; and inside « », so those
 * marks would otherwise become tiles of their own; they stick to their word.
 */
export function tileWords(sentence: string): string[] {
  const words: string[] = [];
  let pendingOpen = "";
  for (const token of sentence.trim().split(/\s+/).filter(Boolean)) {
    if (/^[«“(¿¡]+$/.test(token)) {
      pendingOpen += token;
    } else if (/^[?!:;»”).,]+$/.test(token) && words.length > 0) {
      words[words.length - 1] = `${words[words.length - 1]}\u00a0${token}`;
    } else {
      words.push(pendingOpen ? `${pendingOpen}\u00a0${token}` : token);
      pendingOpen = "";
    }
  }
  return words;
}

export interface Tile {
  readonly id: number;
  readonly word: string;
}

export function sentenceTiles(sentence: string, seed: string): readonly Tile[] {
  const tiles = tileWords(sentence).map((word, id) => ({ id, word }));
  const random = seededRandom(seed);
  const shuffled = [...tiles];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Never hand over the answer already solved.
  if (shuffled.length > 1 && shuffled.every((tile, i) => tile.id === i)) shuffled.push(shuffled.shift() as Tile);
  return shuffled;
}

/** Compares words, not tile ids: two identical words ("de … de") are interchangeable. */
export function tilesMatch(sentence: string, picked: readonly Tile[]): boolean {
  const target = tileWords(sentence).map(strict);
  return target.length === picked.length && picked.every((tile, i) => strict(tile.word) === target[i]);
}

// ── Stage 2: fill the missing word ───────────────────────────────────────

export interface Gap {
  readonly before: string;
  readonly answer: string;
  readonly after: string;
  /** The English of the whole sentence, so the gap is guessable. */
  readonly sentenceEn: string;
  readonly hint: string;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Finds a lesson sentence containing one of the new words and blanks that word out. */
export function buildGap(lesson: Pick<Lesson, "sentences" | "vocab" | "shadow">, articles: readonly string[]): Gap | null {
  const articlePrefix = new RegExp(`^(${articles.map(escapeRegExp).join("|")})\\s*`, "i");
  const sentences = [lesson.shadow, ...lesson.sentences];
  const vocab: readonly LessonVocab[] = [...lesson.vocab].sort((a, b) => b.fr.length - a.fr.length);
  for (const word of vocab) {
    // Articles in the vocab ("la boulangerie") often appear without them in context; try both.
    const candidates = [word.fr, word.fr.replace(articlePrefix, "")].filter((c) => c.length >= 2);
    for (const candidate of candidates) {
      const pattern = new RegExp(`(^|[\\s'’(«¿¡])(${escapeRegExp(candidate)})(?=$|[\\s.,!?;:»)])`, "iu");
      for (const sentence of sentences) {
        const match = pattern.exec(sentence.fr);
        if (!match) continue;
        const start = match.index + match[1].length;
        return {
          before: sentence.fr.slice(0, start),
          answer: match[2],
          after: sentence.fr.slice(start + match[2].length),
          sentenceEn: sentence.en,
          hint: word.en,
        };
      }
    }
  }
  return null;
}

export type GapVerdict = "correct" | "accents" | "wrong";

export function checkGap(answer: string, input: string): GapVerdict {
  if (strict(input) === strict(answer)) return "correct";
  if (fold(input) === fold(answer)) return "accents";
  return "wrong";
}

/**
 * The sentence for the tile exercise: the line they just said if it's short,
 * otherwise the shortest lesson line with at least three words. Long sentences
 * turn "put these in order" into a puzzle, which isn't the point at stage 1.
 */
export function pickTileSentence(lesson: Pick<Lesson, "sentences" | "shadow">, maxWords = 7): { readonly fr: string; readonly en: string } {
  const count = (fr: string): number => fr.trim().split(/\s+/).filter(Boolean).length;
  if (count(lesson.shadow.fr) <= maxWords) return lesson.shadow;
  const usable = lesson.sentences.filter((s) => count(s.fr) >= 3).sort((a, b) => count(a.fr) - count(b.fr));
  return usable[0] ?? lesson.shadow;
}
