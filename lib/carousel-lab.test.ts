import { describe, it, expect } from "vitest";
import { STARTER_DECKS, TRACK_METAS } from "@/app/tools/carousel-lab/lib/starter-decks";
import { TEMPLATE_METAS, MOOD_STYLES } from "@/app/tools/carousel-lab/lib/constants";
import { AESTHETIC_MOODS, type AestheticMood } from "@/app/tools/carousel-lab/lib/types";

describe("Carousel Lab - Starter Decks Catalog Integrity", () => {
  it("should have at least 10 starter decks covering all 5 core tracks", () => {
    expect(STARTER_DECKS.length).toBeGreaterThanOrEqual(10);

    const tracksInDecks = new Set(STARTER_DECKS.map((d) => d.track));
    const validTracks = TRACK_METAS.filter((t) => t.id !== "all").map((t) => t.id);

    validTracks.forEach((track) => {
      expect(tracksInDecks.has(track as any)).toBe(true);
    });
  });

  it("should have unique IDs across all starter decks", () => {
    const ids = STARTER_DECKS.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should contain valid slide structures (3-8 slides, hook first, cta last)", () => {
    STARTER_DECKS.forEach((deck) => {
      expect(deck.slides.length).toBeGreaterThanOrEqual(3);
      expect(deck.slides.length).toBeLessThanOrEqual(8);

      // Slide 1 must be Hook
      expect(deck.slides[0].layout).toBe("hook");
      expect(deck.slides[0].title.length).toBeGreaterThan(5);
      expect(deck.slides[0].content.length).toBeGreaterThan(10);

      // Final slide must be CTA
      const lastSlide = deck.slides[deck.slides.length - 1];
      expect(lastSlide.layout).toBe("cta");
      expect(lastSlide.title.length).toBeGreaterThan(3);

      // Intermediate slides must have valid content
      deck.slides.forEach((slide) => {
        expect(slide.title.trim().length).toBeGreaterThan(0);
        expect(slide.content.trim().length).toBeGreaterThan(0);
        expect(["default", "hook", "split", "quote", "metrics", "cta"]).toContain(
          slide.layout || "default"
        );
      });
    });
  });

  it("should assign aesthetics that exist in AESTHETIC_MOODS and MOOD_STYLES", () => {
    STARTER_DECKS.forEach((deck) => {
      expect(AESTHETIC_MOODS).toContain(deck.aesthetic);
      expect(MOOD_STYLES[deck.aesthetic]).toBeDefined();
      const style = MOOD_STYLES[deck.aesthetic];
      expect(style.bg).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(style.text).toMatch(/^#[0-9a-fA-F]{3,6}$/);
      expect(style.accent).toMatch(/^#[0-9a-fA-F]{3,6}$/);
    });
  });
});

describe("Carousel Lab - Design Archetypes & Customizer Metas", () => {
  it("should define all 9 core aesthetic moods in TEMPLATE_METAS", () => {
    expect(TEMPLATE_METAS.length).toBe(9);

    TEMPLATE_METAS.forEach((meta) => {
      expect(AESTHETIC_MOODS).toContain(meta.id);
      expect(meta.previewBg).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(meta.previewText).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(meta.previewAccent).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(meta.badge.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(10);
    });
  });

  it("should have complete style configurations in MOOD_STYLES for each aesthetic", () => {
    AESTHETIC_MOODS.forEach((mood: AestheticMood) => {
      const style = MOOD_STYLES[mood];
      expect(style).toBeDefined();
      expect(style.fontTitle.length).toBeGreaterThan(0);
      expect(style.fontBody.length).toBeGreaterThan(0);
      expect(typeof style.borderWidth).toBe("number");
      expect(typeof style.borderRadius).toBe("number");
    });
  });
});

describe("Carousel Lab - Voice Profile & Guardrails Logic", () => {
  it("should properly structure a VoiceProfile with default anti-AI banned words", () => {
    const defaultBanned = [
      "delve",
      "unlock",
      "supercharge",
      "game-changer",
      "testament",
      "synergy",
      "in conclusion",
    ];

    const sampleProfile = {
      toneSummary: "Direct, technical, contrarian, no corporate fluff.",
      cadence: "staccato" as const,
      bannedWords: defaultBanned,
      customRules: ["Keep sentences under 15 words", "Never use emojis"],
      sampleSnippets: ["Here is post 1", "Here is post 2"],
      extractedAt: Date.now(),
    };

    expect(sampleProfile.toneSummary.length).toBeGreaterThan(10);
    expect(["staccato", "balanced", "narrative"]).toContain(sampleProfile.cadence);
    expect(sampleProfile.bannedWords).toContain("delve");
    expect(sampleProfile.bannedWords).toContain("unlock");
    expect(sampleProfile.customRules.length).toBe(2);
  });
});
