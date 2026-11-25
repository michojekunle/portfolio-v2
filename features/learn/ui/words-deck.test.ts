import { describe, expect, it } from "vitest";
import type { WordDto } from "../server/service";
import { clampCardIndex, filterWords, orderDeck, shuffleWordIds } from "./words-deck";

const sample = (overrides: Partial<WordDto> & { id: string }): WordDto => ({
  text: "bonjour",
  english: "hello",
  notes: null,
  source: "lesson",
  strength: "learning",
  dueAt: "2026-11-25T00:00:00.000Z",
  intervalDays: 1,
  ...overrides,
});

describe("words-deck", () => {
  const words: readonly WordDto[] = [
    sample({ id: "1", text: "la boulangerie", english: "the bakery", strength: "new" }),
    sample({ id: "2", text: "merci", english: "thank you", strength: "known" }),
    sample({ id: "3", text: "me pone", english: "could I have", source: "error", strength: "learning" }),
  ];

  it("filters by strength, mistakes, and normalised search query", () => {
    expect(filterWords(words, "", "all").map((w) => w.id)).toEqual(["1", "2", "3"]);
    expect(filterWords(words, "", "learning").map((w) => w.id)).toEqual(["1", "3"]);
    expect(filterWords(words, "", "known").map((w) => w.id)).toEqual(["2"]);
    expect(filterWords(words, "", "mistakes").map((w) => w.id)).toEqual(["3"]);
    expect(filterWords(words, "BAKERY", "all").map((w) => w.id)).toEqual(["1"]);
    expect(filterWords(words, "pone", "learning").map((w) => w.id)).toEqual(["3"]);
  });

  it("shuffles IDs deterministically with a seeded RNG and orders decks without dropping updates", () => {
    const shuffled = shuffleWordIds(words, () => 0);
    expect(shuffled).toEqual(["2", "3", "1"]);
    const updated = [words[0], { ...words[1], strength: "learning" as const }];
    expect(orderDeck(updated, shuffled).map((w) => w.id)).toEqual(["2", "1"]);
  });

  it("clamps card index within bounds including empty decks", () => {
    expect(clampCardIndex(0, 0)).toBe(0);
    expect(clampCardIndex(3, 0)).toBe(0);
    expect(clampCardIndex(-2, 5)).toBe(0);
    expect(clampCardIndex(10, 5)).toBe(4);
    expect(clampCardIndex(2, 5)).toBe(2);
  });
});
