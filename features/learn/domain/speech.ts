/**
 * Scores what the speech recognizer heard against the target sentence.
 *
 * Comparison ignores case, accents, punctuation and apostrophes: browser ASR
 * output varies on all four ("j'ai" / "j ai" / "jai"), and penalising that
 * would punish the learner for the recognizer's formatting, not their speech.
 * Word order still matters — matching uses the longest common subsequence.
 */

export interface ComparedWord {
  readonly word: string;
  readonly matched: boolean;
}

export interface SpokenComparison {
  /** Fraction of target words heard, in order, 0..1. */
  readonly score: number;
  readonly words: readonly ComparedWord[];
}

function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['’`]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .map(normalizeToken)
    .filter((token) => token.length > 0);
}

export function compareSpoken(target: string, heard: string): SpokenComparison {
  const targetDisplay = target.split(/\s+/).filter((word) => normalizeToken(word).length > 0);
  const targetTokens = targetDisplay.map(normalizeToken);
  const heardTokens = tokenize(heard);

  if (targetTokens.length === 0) return { score: 0, words: [] };

  // Longest-common-subsequence table over target × heard.
  const rows = targetTokens.length + 1;
  const cols = heardTokens.length + 1;
  const table: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      table[i][j] =
        targetTokens[i - 1] === heardTokens[j - 1]
          ? table[i - 1][j - 1] + 1
          : Math.max(table[i - 1][j], table[i][j - 1]);
    }
  }

  // Walk back to find which target words were part of the match.
  const matched = new Array<boolean>(targetTokens.length).fill(false);
  let i = targetTokens.length;
  let j = heardTokens.length;
  while (i > 0 && j > 0) {
    if (targetTokens[i - 1] === heardTokens[j - 1]) {
      matched[i - 1] = true;
      i -= 1;
      j -= 1;
    } else if (table[i - 1][j] >= table[i][j - 1]) {
      i -= 1;
    } else {
      j -= 1;
    }
  }

  const hits = matched.filter(Boolean).length;
  return {
    score: hits / targetTokens.length,
    words: targetDisplay.map((word, index) => ({ word, matched: matched[index] })),
  };
}

/** Pass mark for "good enough to move on" — strict enough to catch skipped words. */
export const SPEAK_PASS_SCORE = 0.7;
