import { normaliseWord } from "../domain/glossary";
import type { WordDto } from "../server/service";

export const WORD_FILTERS = ["all", "learning", "known", "mistakes"] as const;
export type WordFilter = (typeof WORD_FILTERS)[number];

export function matchesWord(word: WordDto, query: string, filter: WordFilter): boolean {
  if (filter === "learning" && word.strength === "known") return false;
  if (filter === "known" && word.strength !== "known") return false;
  if (filter === "mistakes" && word.source !== "error") return false;
  if (!query) return true;
  const q = normaliseWord(query);
  return normaliseWord(word.text).includes(q) || word.english.toLowerCase().includes(query.toLowerCase());
}

export function filterWords(words: readonly WordDto[], query: string, filter: WordFilter): readonly WordDto[] {
  const trimmed = query.trim();
  return words.filter((word) => matchesWord(word, trimmed, filter));
}

/** Fisher-Yates shuffle returning word IDs so live card status updates stay in sync. */
export function shuffleWordIds(words: readonly WordDto[], random: () => number = Math.random): readonly string[] {
  const ids = words.map((word) => word.id);
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

/** Applies an optional shuffled ID order while keeping filtered/updated cards consistent. */
export function orderDeck(words: readonly WordDto[], shuffledIds: readonly string[] | null): readonly WordDto[] {
  if (!shuffledIds || shuffledIds.length === 0) return words;
  const rank = new Map<string, number>();
  shuffledIds.forEach((id, idx) => rank.set(id, idx));
  return [...words].sort((a, b) => {
    const ra = rank.get(a.id);
    const rb = rank.get(b.id);
    if (ra !== undefined && rb !== undefined) return ra - rb;
    if (ra !== undefined) return -1;
    if (rb !== undefined) return 1;
    return 0;
  });
}

export function clampCardIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return Math.min(Math.max(0, index), length - 1);
}
