import { describe, expect, it } from "vitest";
import { diffWords, omissionIndexes } from "./diff";

const kinds = (original: string, corrected: string): string =>
  diffWords(original, corrected)
    .map((t) => (t.kind === "same" ? t.word : t.kind === "removed" ? `-${t.word}` : `+${t.word}`))
    .join(" ");

describe("diffWords", () => {
  it("marks nothing when the sentence is already correct", () => {
    expect(kinds("Le film était long.", "Le film était long.")).toBe("Le film était long.");
  });

  it("strikes a word that the correction removes", () => {
    expect(kinds("un film un peu de long", "un film un peu long")).toBe("un film un peu -de long");
  });

  it("shows a replaced word as removed then added", () => {
    expect(kinds("je suis mangé", "j'ai mangé")).toBe("-je -suis +j'ai mangé");
  });

  it("treats a missing accent as a real mistake", () => {
    expect(kinds("il a mange", "il a mangé")).toBe("il a -mange +mangé");
  });

  it("ignores capitalisation and trailing punctuation differences", () => {
    expect(kinds("hier soir j'ai mangé", "Hier soir, j'ai mangé.")).toBe("Hier soir, j'ai mangé.");
  });

  it("handles empty input without throwing", () => {
    expect(diffWords("", "Bonjour.")).toEqual([{ word: "Bonjour.", kind: "added" }]);
    expect(diffWords("Bonjour", "")).toEqual([{ word: "Bonjour", kind: "removed" }]);
  });
});

describe("omissionIndexes", () => {
  const omitted = (original: string, corrected: string): string[] => {
    const tokens = diffWords(original, corrected);
    const marked = omissionIndexes(tokens);
    return tokens.filter((_, i) => marked.has(i)).map((t) => t.word);
  };

  it("finds a word the learner left out", () => {
    expect(omitted("je vais au cinéma", "je vais souvent au cinéma")).toEqual(["souvent"]);
  });

  it("finds several omissions, including at either end", () => {
    expect(omitted("vais cinéma", "je vais au cinéma hier")).toEqual(["je", "au", "hier"]);
  });

  it("doesn't call a replacement an omission: the strike-through already points at it", () => {
    expect(omitted("je suis mangé", "j'ai mangé")).toEqual([]);
    expect(omitted("il a mange", "il a mangé")).toEqual([]);
  });

  it("reports nothing for a correct sentence or one with only extra words", () => {
    expect(omitted("Le film était long.", "Le film était long.")).toEqual([]);
    expect(omitted("un film un peu de long", "un film un peu long")).toEqual([]);
  });

  it("treats a run of replaced words as replacements, not as one replacement plus omissions", () => {
    expect(omitted("Un nouveau collegue est un bon addition pour l'euipe", "Un nouveau collègue est une bonne addition pour l'équipe.")).toEqual([]);
  });

  it("treats an omission next to a replacement as a replacement", () => {
    // The added word sits beside a struck word, so the fix location is already visible.
    expect(omitted("je mangé", "j'ai mangé")).toEqual([]);
  });
});
