import { describe, expect, it } from "vitest";
import { COMMITMENT_STEPS, GOALS, toCommitment } from "./commitment";
import { FRENCH, SPANISH } from "./languages";
import { spokenForm } from "./reductions";

describe("toCommitment", () => {
  it("maps stored minutes to the nearest option", () => {
    expect(toCommitment(12)).toBe(15);
    expect(toCommitment(30)).toBe(30);
    expect(toCommitment(50)).toBe(60);
    expect(toCommitment(null)).toBe(15);
  });
});

describe("GOALS", () => {
  it("never promises more for less time", () => {
    const order = ["A1", "A1+", "A2", "B1", "B1+/B2"];
    for (const months of [0, 1, 2]) {
      const levels = [15, 30, 60].map((c) => order.indexOf(GOALS[c as 15 | 30 | 60][months].level));
      expect(levels).toEqual([...levels].sort((a, b) => a - b));
    }
  });

  it("adds steps as commitment grows", () => {
    expect(COMMITMENT_STEPS[15]).toEqual({ listen: false, dictation: false });
    expect(COMMITMENT_STEPS[60]).toEqual({ listen: true, dictation: true });
  });
});

describe("spokenForm", () => {
  it("shows common spoken reductions", () => {
    expect(spokenForm("Je ne sais pas encore.", FRENCH.reductions).spoken).toBe("chais pas encore.");
    expect(spokenForm("Je suis fatigué parce que il y a du bruit.", FRENCH.reductions).spoken).toBe("chuis fatigué pasque y a du bruit.");
    expect(spokenForm("Je veux un petit café.", FRENCH.reductions).spoken).toBe("j'veux un p'tit café.");
  });

  it("drops ne in negation", () => {
    expect(spokenForm("Ce n'est pas grave.", FRENCH.reductions).spoken).toBe("c'est pas grave.");
    expect(spokenForm("Il n'aime pas ça.", FRENCH.reductions).spoken).toBe("Il aime pas ça.");
  });

  it("leaves lines with nothing to reduce alone", () => {
    const result = spokenForm("Bonjour, madame.", FRENCH.reductions);
    expect(result.spoken).toBe("Bonjour, madame.");
    expect(result.changes).toHaveLength(0);
  });
});

describe("spokenForm — Spanish", () => {
  it("shows common casual reductions, including words with accents", () => {
    expect(spokenForm("Estoy muy cansado.", SPANISH.reductions).spoken).toBe("'toy muy cansao.");
    expect(spokenForm("Es para el niño, ¿está bien?", SPANISH.reductions).spoken).toBe("Es pa'l niño, ¿'tá bien?");
    expect(spokenForm("No pasa nada.", SPANISH.reductions).spoken).toBe("No pasa na'.");
  });

  it("does not touch a word that merely contains a rule", () => {
    expect(spokenForm("Paraguay está lejos.", SPANISH.reductions).spoken).toBe("Paraguay 'tá lejos.");
    expect(spokenForm("Hola, buenos días.", SPANISH.reductions).changes).toHaveLength(0);
  });
});
