import type { ReductionRule } from "./language";

/**
 * How everyday speech actually sounds. Textbook audio says "je ne sais pas";
 * people say "chais pas". Showing the spoken form next to the written one is
 * what turns fast speech from a wall of sound into words.
 *
 * Rules come from the language pack, ordered: multi-word reductions first,
 * then single elisions.
 */

export interface Reduction {
  readonly written: string;
  readonly spoken: string;
  readonly why: string;
}

/** Returns the line as it is typically spoken, plus each change and why. */
export function spokenForm(written: string, rules: readonly ReductionRule[]): { readonly spoken: string; readonly changes: readonly Reduction[] } {
  let spoken = written;
  const changes: Reduction[] = [];
  for (const rule of rules) {
    spoken = spoken.replace(rule.pattern, (match: string, ...args: unknown[]) => {
      // Expand $1… from this match's capture groups (re-running the pattern on the
      // match alone would lose lookarounds like "je" before a consonant).
      const groups = args.filter((arg): arg is string | undefined => typeof arg === "string" || arg === undefined);
      const replaced = rule.spoken.replace(/\$(\d)/g, (_token, index: string) => groups[Number(index) - 1] ?? "");
      changes.push({ written: match, spoken: replaced || "—", why: rule.why });
      return replaced;
    });
  }
  // Tidy spaces left by removed words and the j' contraction ("j' veux" → "j'veux").
  spoken = spoken.replace(/\s{2,}/g, " ").replace(/j' /gi, "j'").trim();
  return { spoken, changes };
}
