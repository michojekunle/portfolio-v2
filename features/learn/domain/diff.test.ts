import { describe, expect, it } from "vitest";
import { diffWords } from "./diff";

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
