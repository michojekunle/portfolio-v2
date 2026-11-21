import { describe, expect, it } from "vitest";
import { FRENCH, SPANISH } from "./languages";
import { buildGap, checkGap, pickTileSentence, sentenceTiles, tileWords, tilesMatch } from "./exercises";

describe("sentenceTiles", () => {
  const sentence = "Je voudrais un café, s'il vous plaît.";

  it("contains every word exactly once", () => {
    const tiles = sentenceTiles(sentence, "2026-11-21");
    expect(tiles.map((t) => t.word).sort()).toEqual(sentence.split(" ").sort());
  });

  it("shuffles the same way for the same seed", () => {
    expect(sentenceTiles(sentence, "a")).toEqual(sentenceTiles(sentence, "a"));
  });

  it("never returns the sentence already in order", () => {
    for (const seed of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
      const tiles = sentenceTiles("Bonjour madame", seed);
      expect(tiles.map((t) => t.word).join(" ")).not.toBe("Bonjour madame");
    }
  });
});

describe("tilesMatch", () => {
  it("accepts the right order", () => {
    const tiles = sentenceTiles("Il fait beau", "x");
    const ordered = ["Il", "fait", "beau"].map((word) => tiles.find((t) => t.word === word)!); // test fixture: every word exists
    expect(tilesMatch("Il fait beau", ordered)).toBe(true);
  });

  it("rejects a wrong order or a partial answer", () => {
    expect(tilesMatch("Il fait beau", [{ id: 1, word: "fait" }, { id: 0, word: "Il" }, { id: 2, word: "beau" }])).toBe(false);
    expect(tilesMatch("Il fait beau", [{ id: 0, word: "Il" }])).toBe(false);
  });

  it("treats repeated words as interchangeable", () => {
    expect(tilesMatch("de plus en plus", [{ id: 0, word: "de" }, { id: 3, word: "plus" }, { id: 2, word: "en" }, { id: 1, word: "plus" }])).toBe(true);
  });
});

describe("buildGap", () => {
  const lesson = {
    shadow: { fr: "Je prends un croissant.", en: "I'll have a croissant." },
    sentences: [
      { fr: "Bonjour, je voudrais un café.", en: "Hello, I'd like a coffee." },
      { fr: "On va à la boulangerie.", en: "We're going to the bakery." },
    ],
    vocab: [
      { fr: "la boulangerie", en: "the bakery" },
      { fr: "je voudrais", en: "I would like" },
    ],
  };

  it("blanks a new word inside a lesson sentence", () => {
    const gap = buildGap(lesson, FRENCH.articles);
    expect(gap).not.toBeNull();
    expect(`${gap?.before}${gap?.answer}${gap?.after}`).toMatch(/boulangerie|voudrais/);
  });

  it("returns null when no new word appears in any sentence", () => {
    expect(buildGap({ ...lesson, vocab: [{ fr: "le parapluie", en: "the umbrella" }] }, FRENCH.articles)).toBeNull();
  });

  it("matches whole words only", () => {
    const gap = buildGap({ shadow: { fr: "Il est parti.", en: "He left." }, sentences: [], vocab: [{ fr: "part", en: "share" }] }, FRENCH.articles);
    expect(gap).toBeNull();
  });
});

describe("checkGap", () => {
  it("accepts an exact answer, ignoring case and punctuation", () => {
    expect(checkGap("boulangerie", "Boulangerie.")).toBe("correct");
  });

  it("flags a missing accent separately from a wrong word", () => {
    expect(checkGap("café", "cafe")).toBe("accents");
    expect(checkGap("café", "thé")).toBe("wrong");
  });
});

describe("pickTileSentence", () => {
  const long = { fr: "Bonjour, je voudrais un café crème, s'il vous plaît.", en: "Hello, I'd like a coffee, please." };

  it("uses the spoken line when it's short", () => {
    const shadow = { fr: "Je prends un croissant.", en: "I'll have a croissant." };
    expect(pickTileSentence({ shadow, sentences: [long] })).toBe(shadow);
  });

  it("falls back to the shortest lesson line of three words or more", () => {
    const sentences = [long, { fr: "Merci.", en: "Thanks." }, { fr: "C'est combien, le café ?", en: "How much is the coffee?" }];
    expect(pickTileSentence({ shadow: long, sentences }).fr).toBe("C'est combien, le café ?");
  });
});

describe("tileWords", () => {
  it("keeps French spaced punctuation attached to its word", () => {
    expect(tileWords("Vous désirez autre chose ?")).toEqual(["Vous", "désirez", "autre", "chose ?"]);
    expect(tileWords("Il a dit « bonjour » !")).toEqual(["Il", "a", "dit", "« bonjour » !"]);
  });
});

describe("Spanish exercises", () => {
  it("blanks a vocabulary word inside a sentence that opens with ¿", () => {
    const gap = buildGap(
      { shadow: { fr: "¿Algo más?", en: "Anything else?" }, sentences: [], vocab: [{ fr: "algo más", en: "anything else" }] },
      SPANISH.articles
    );
    expect(gap?.answer.toLowerCase()).toBe("algo más");
    expect(gap?.before).toBe("¿");
  });

  it("drops Spanish articles to find the word in context", () => {
    const gap = buildGap(
      { shadow: { fr: "Quédese con el cambio.", en: "Keep the change." }, sentences: [], vocab: [{ fr: "el cambio", en: "the change" }] },
      SPANISH.articles
    );
    expect(gap).not.toBeNull();
  });

  it("keeps ¿ and ¡ attached to their word as tiles", () => {
    expect(tileWords("¿ Qué tal ?")).toEqual(["¿\u00a0Qué", "tal\u00a0?"]);
  });
});
