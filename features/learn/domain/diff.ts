/**
 * Word-level diff between what the learner wrote and the corrected sentence,
 * so the UI can strike exactly the words that were wrong (red pen) and show
 * which words the correction added.
 */

export type DiffKind = "same" | "removed" | "added";

export interface DiffToken {
  readonly word: string;
  readonly kind: DiffKind;
}

function tokenize(sentence: string): string[] {
  return sentence.trim().split(/\s+/).filter((word) => word.length > 0);
}

/** Ignores case and edge punctuation, but never accents: those are exactly what a learner gets wrong. */
function comparable(word: string): string {
  return word.toLocaleLowerCase("fr").replace(/^[«"“'(]+|[»"”',.!?;:)]+$/g, "");
}

export function diffWords(original: string, corrected: string): readonly DiffToken[] {
  const a = tokenize(original);
  const b = tokenize(corrected);
  const ak = a.map(comparable);
  const bk = b.map(comparable);

  // Classic LCS table, sized for one sentence (≤ 300 chars), so O(n·m) is trivial.
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      lcs[i][j] = ak[i] === bk[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const tokens: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (ak[i] === bk[j]) {
      // Keep the corrected spelling (it may fix punctuation or capitals).
      tokens.push({ word: b[j], kind: "same" });
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      tokens.push({ word: a[i], kind: "removed" });
      i += 1;
    } else {
      tokens.push({ word: b[j], kind: "added" });
      j += 1;
    }
  }
  for (; i < a.length; i += 1) tokens.push({ word: a[i], kind: "removed" });
  for (; j < b.length; j += 1) tokens.push({ word: b[j], kind: "added" });
  return tokens;
}
