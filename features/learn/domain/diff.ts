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

/**
 * Indexes of "added" tokens that are pure omissions: words the learner left out,
 * with no struck word beside them to show where the fix goes. (An added word right
 * next to a removed one is a replacement, and the strike-through already points at it.)
 * Without marking these, a learner sees nothing wrong with the part they wrote and
 * never learns that something was missing.
 */
export function omissionIndexes(tokens: readonly DiffToken[]): ReadonlySet<number> {
  const omissions = new Set<number>();
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i].kind !== "added") {
      i += 1;
      continue;
    }
    // A whole run of added words stands or falls together: "un bon" -> "une bonne" is a run
    // of two replacements, not one replacement and one omission.
    let end = i;
    while (end + 1 < tokens.length && tokens[end + 1].kind === "added") end += 1;
    const replacesSomething = tokens[i - 1]?.kind === "removed" || tokens[end + 1]?.kind === "removed";
    if (!replacesSomething) for (let k = i; k <= end; k += 1) omissions.add(k);
    i = end + 1;
  }
  return omissions;
}
