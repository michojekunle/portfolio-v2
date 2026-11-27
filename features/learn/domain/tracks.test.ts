import { describe, expect, it } from "vitest";
import { FRENCH, SPANISH } from "./languages";
import { LessonSchema } from "./lessons";
import {
  DEFAULT_TRACK,
  MAX_GOAL_NOTE_LENGTH,
  TRACKS,
  TRACK_IDS,
  computeSprintProgress,
  resolveFocusId,
  resolveTrackId,
  sanitiseGoalNote,
  selectNextMission,
} from "./tracks";
import { fallbackLessonForTrack } from "./tracks-fallbacks";
import { staggerStarterKitCards, survivalKitForTrack } from "./tracks-kits";

describe("goal tracks", () => {
  it("resolves valid and unknown track/focus ids safely", () => {
    expect(resolveTrackId(undefined)).toBe(DEFAULT_TRACK);
    expect(resolveTrackId("invalid")).toBe(DEFAULT_TRACK);
    expect(resolveTrackId("medical")).toBe("medical");
    expect(resolveFocusId("medical", "unknown")).toBe(TRACKS.medical.focuses[0].id);
    expect(resolveFocusId("medical", "handoff")).toBe("handoff");
  });

  it("sanitises custom goal notes against control chars, braces, and excessive length", () => {
    expect(sanitiseGoalNote("   ")).toBeNull();
    expect(sanitiseGoalNote("Backend\nengineer\t<script>{prompt}</script>")).toBe("Backend engineer scriptprompt/script");
    const long = "a".repeat(MAX_GOAL_NOTE_LENGTH + 40);
    expect(sanitiseGoalNote(long)?.length).toBe(MAX_GOAL_NOTE_LENGTH);
  });

  it("advances focus-matched Sprint missions without repeating recent ones", () => {
    const first = selectNextMission("tech", "standups", [], "2026-11-26");
    expect(first.focusIds).toContain("standups");

    const second = selectNextMission("tech", "standups", [first.slug], "2026-11-26");
    expect(second.slug).not.toBe(first.slug);
    expect(second.focusIds).toContain("standups");
  });

  it("ships schema-valid fallback scenes for every specialized track in French, Spain Spanish, and LatAm Spanish", () => {
    for (const trackId of TRACK_IDS) {
      const fr = fallbackLessonForTrack(FRENCH, trackId, "2026-11-26");
      const es = fallbackLessonForTrack(SPANISH, trackId, "2026-11-26", "es");
      const latam = fallbackLessonForTrack(SPANISH, trackId, "2026-11-26", "latam");
      for (const lesson of [fr, es, latam]) {
        expect(LessonSchema.safeParse(lesson).success).toBe(true);
      }
      if (trackId !== "general") {
        expect(fr.track).toBe(trackId);
        expect(es.track).toBe(trackId);
        expect(latam.track).toBe(trackId);
      }
    }
  });

  it("provides survival kits for every track and staggers starter cards over Days 0-2 without duplicates", () => {
    const kit = survivalKitForTrack("fr", "tech");
    expect(kit.length).toBeGreaterThanOrEqual(8);
    const now = new Date("2026-11-27T00:00:00.000Z");
    const cards = staggerStarterKitCards(kit, "tech", "A2", [kit[0].fr], now);
    expect(cards).toHaveLength(kit.length - 1);
    expect(cards[0].dueAt.getTime()).toBe(now.getTime());
    expect(cards[4].dueAt.getTime()).toBe(now.getTime() + 86_400_000);
    expect(cards[cards.length - 1].dueAt.getTime()).toBeLessThanOrEqual(now.getTime() + 2 * 86_400_000);
  });

  it("computes Sprint progress across a track's ordered missions", () => {
    const sprint1 = TRACKS.tech.missions.filter((m) => m.sprint === 1);
    const p1 = computeSprintProgress("tech", [sprint1[0].slug, sprint1[1].slug]);
    expect(p1.completedMissions).toBe(2);
    expect(p1.sprintCompleted).toBe(2);
    expect(p1.sprintTotal).toBe(sprint1.length);

    const p2 = computeSprintProgress("tech", sprint1.map((m) => m.slug));
    expect(p2.currentSprintTitle).toContain("Sprint 2");
    expect(p2.sprintCompleted).toBe(0);
  });
});
