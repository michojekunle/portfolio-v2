import { describe, expect, it } from "vitest";
import { meaningOf, normaliseWord } from "./glossary";

const vocab = [
  { fr: "je voudrais", en: "I would like", note: "Polite" },
  { fr: "sans", en: "without" },
];
const gloss = [
  { fr: "s'il vous plaît", en: "please (formal)" },
  { fr: "un café crème", en: "a coffee with milk" },
  { fr: "une amie", en: "a (female) friend" },
];

describe("meaningOf", () => {
  it("explains today's new words first, with their note", () => {
    expect(meaningOf("voudrais,", vocab, gloss)).toEqual({ phrase: "je voudrais", meaning: "I would like", note: "Polite", isNew: true });
  });

  it("explains any other word from the line's glossary, as part of its phrase", () => {
    expect(meaningOf("plaît.", vocab, gloss)).toEqual({ phrase: "s'il vous plaît", meaning: "please (formal)", isNew: false });
  });

  it("matches whole words only", () => {
    expect(meaningOf("un", vocab, gloss)?.phrase).toBe("un café crème");
    expect(meaningOf("une", vocab, gloss)?.phrase).toBe("une amie");
  });

  it("returns null for a word nobody explained", () => {
    expect(meaningOf("demain", vocab, gloss)).toBeNull();
    expect(meaningOf("…", vocab, gloss)).toBeNull();
  });

  it("strips Spanish and French punctuation around a word", () => {
    expect(normaliseWord("¿Algo")).toBe("algo");
    expect(normaliseWord("«bonjour»")).toBe("bonjour");
    expect(normaliseWord("S’il")).toBe("s'il");
  });
});
