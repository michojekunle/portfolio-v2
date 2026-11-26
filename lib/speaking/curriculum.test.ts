import { describe, expect, it } from "vitest";
import { CURRICULUM_DAYS, getCurriculumDay, getWeekDays } from "./curriculum";
import { WEEKLY_CHALLENGES } from "./methodology";

describe("Canonical 90-Day Curriculum Mapping", () => {
  it("contains exactly 90 ordered days with unique dates from Nov 30 2026 to Feb 27 2027", () => {
    expect(CURRICULUM_DAYS).toHaveLength(90);
    expect(CURRICULUM_DAYS[0].dayNumber).toBe(1);
    expect(CURRICULUM_DAYS[0].date).toBe("2026-11-30");
    expect(CURRICULUM_DAYS[89].dayNumber).toBe(90);
    expect(CURRICULUM_DAYS[89].date).toBe("2027-02-27");

    const uniqueDates = new Set(CURRICULUM_DAYS.map((d) => d.date));
    expect(uniqueDates.size).toBe(90);

    for (let i = 0; i < 90; i++) {
      expect(CURRICULUM_DAYS[i].dayNumber).toBe(i + 1);
    }
  });

  it("preserves exact canonical titles, skills, and phase boundaries", () => {
    expect(getCurriculumDay(1)?.topic).toBe(
      "Who am I beyond what I do for a living?"
    );
    expect(getCurriculumDay(1)?.skill).toBe("Self-expression");
    expect(getCurriculumDay(1)?.thinkingPrompts).toHaveLength(6);

    expect(getCurriculumDay(12)?.topic).toBe(
      "The story behind Zamir and what I wanted to create."
    );
    expect(getCurriculumDay(30)?.phase).toBe(1);
    expect(getCurriculumDay(31)?.phase).toBe(2);
    expect(getCurriculumDay(33)?.topic).toBe("Why I decided to learn Rust.");
    expect(getCurriculumDay(45)?.topic).toBe(
      "What Benjamin Graham taught me about investing."
    );
    expect(getCurriculumDay(60)?.phase).toBe(2);
    expect(getCurriculumDay(61)?.phase).toBe(3);
    expect(getCurriculumDay(89)?.topic).toBe(
      "The person I am becoming and the future I want to contribute to."
    );
    expect(getCurriculumDay(90)?.topic).toBe(
      "What I believe about building a meaningful life and creating value."
    );
    expect(getCurriculumDay(90)?.duration).toBe("10 minutes");
    expect(getCurriculumDay(90)?.isFinalDay).toBe(true);
  });

  it("populates rich prompts and covers all 90 days across Weeks 1-13 without gaps", () => {
    let totalDaysInWeeks = 0;
    for (const week of WEEKLY_CHALLENGES) {
      const days = getWeekDays(week.weekNumber);
      expect(days.length).toBeGreaterThan(0);
      totalDaysInWeeks += days.length;
    }
    expect(totalDaysInWeeks).toBe(90);

    for (const day of CURRICULUM_DAYS) {
      expect(day.topic.length).toBeGreaterThan(5);
      expect(day.skill.length).toBeGreaterThan(2);
      expect(day.whyItMatters.length).toBeGreaterThan(20);
      expect(day.thinkingPrompts.length).toBeGreaterThanOrEqual(4);
      expect(day.thinkingPrompts.length).toBeLessThanOrEqual(6);
      expect(day.weeklyChallengeReference.length).toBeGreaterThan(5);
    }
  });
});
