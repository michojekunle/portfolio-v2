import { describe, expect, it } from "vitest";
import { LANGUAGES } from "./languages";
import { LessonSchema, fallbackLessonFor, topicForDate } from "./lessons";

describe.each(Object.values(LANGUAGES).map((pack) => [pack.name, pack] as const))("%s fallback lessons", (_name, pack) => {
  it.each(pack.fallbackLessons.map((lesson) => [lesson.title, lesson] as const))("%s satisfies the lesson schema", (_title, lesson) => {
    expect(LessonSchema.safeParse(lesson).success).toBe(true);
  });

  it("targets a word that actually appears in the lesson text", () => {
    for (const lesson of pack.fallbackLessons) {
      const corpus = lesson.sentences.map((s) => s.fr.toLowerCase()).join(" ");
      expect(corpus).toContain(lesson.write.targetWord.toLowerCase());
    }
  });

  it("uses a shadow line taken from the lesson's own sentences", () => {
    for (const lesson of pack.fallbackLessons) {
      expect(lesson.sentences.map((s) => s.fr)).toContain(lesson.shadow.fr);
    }
  });

  it("glosses only phrases that really appear in their sentence", () => {
    for (const lesson of pack.fallbackLessons) {
      for (const sentence of lesson.sentences) {
        for (const entry of sentence.gloss ?? []) {
          expect(sentence.fr.toLowerCase()).toContain(entry.fr.toLowerCase());
        }
      }
    }
  });

  it("asks a question the learner can answer aloud", () => {
    for (const lesson of pack.fallbackLessons) {
      expect(lesson.ask?.fr.trim().length ?? 0).toBeGreaterThan(5);
    }
  });

  it("always resolves a date to one of its own lessons and topics", () => {
    for (const date of ["2026-01-01", "2026-11-20", "2030-02-28"]) {
      expect(pack.fallbackLessons).toContain(fallbackLessonFor(pack.fallbackLessons, date));
      expect(pack.topics).toContain(topicForDate(pack.topics, date));
    }
  });
});

describe("LessonSchema", () => {
  const sample = LANGUAGES.fr.fallbackLessons[0];

  it("rejects an AI response with too few sentences", () => {
    expect(LessonSchema.safeParse({ ...sample, sentences: sample.sentences.slice(0, 2) }).success).toBe(false);
  });

  it("rejects an unknown CEFR level", () => {
    expect(LessonSchema.safeParse({ ...sample, level: "C2" }).success).toBe(false);
  });
});

describe("daily rotation", () => {
  it("is stable for a given date and changes on the next", () => {
    const topics = LANGUAGES.fr.topics;
    expect(topicForDate(topics, "2026-11-20")).toBe(topicForDate(topics, "2026-11-20"));
    expect(topicForDate(topics, "2026-11-20")).not.toBe(topicForDate(topics, "2026-11-21"));
  });
});
