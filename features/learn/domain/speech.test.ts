import { describe, expect, it } from "vitest";
import { compareSpoken } from "./speech";

describe("compareSpoken", () => {
  it("scores a perfect repeat as 1", () => {
    const result = compareSpoken("Je voudrais un café crème", "je voudrais un café crème");
    expect(result.score).toBe(1);
    expect(result.words.every((w) => w.matched)).toBe(true);
  });

  it("ignores case, accents and punctuation differences from the recognizer", () => {
    const result = compareSpoken("Voilà ! Gardez la monnaie.", "voila gardez la monnaie");
    expect(result.score).toBe(1);
  });

  it("treats apostrophe variants as the same word", () => {
    expect(compareSpoken("Qu'est-ce que tu fais", "quest ce que tu fais").score).toBeLessThan(1);
    expect(compareSpoken("J'ai passé une soirée", "jai passe une soiree").score).toBe(1);
  });

  it("flags exactly the words that were skipped", () => {
    const result = compareSpoken("Nous avons vu un film très drôle", "nous avons vu un film drôle");
    expect(result.score).toBeCloseTo(6 / 7);
    expect(result.words.find((w) => w.word === "très")?.matched).toBe(false);
    expect(result.words.filter((w) => !w.matched)).toHaveLength(1);
  });

  it("penalises words said out of order", () => {
    const result = compareSpoken("un grand café", "café grand un");
    expect(result.score).toBeLessThan(1);
  });

  it("returns 0 when nothing was heard", () => {
    expect(compareSpoken("Bonjour tout le monde", "").score).toBe(0);
  });

  it("returns 0 for an empty target instead of dividing by zero", () => {
    expect(compareSpoken("", "bonjour")).toEqual({ score: 0, words: [] });
  });

  it("does not credit extra heard words as matches", () => {
    const result = compareSpoken("bonjour", "bonjour bonjour bonjour");
    expect(result.score).toBe(1);
    expect(result.words).toHaveLength(1);
  });
});
