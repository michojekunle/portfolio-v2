import { describe, expect, it } from "vitest";
import {
  computeAssessmentAverage,
  computeFirstVsLast30Days,
  computeProgressMetrics,
  computeWeeklyAnalytics,
  getBestTalks,
} from "./analytics";
import { CURRICULUM_DAYS, getCurriculumDay } from "./curriculum";
import { buildDailyCarouselSlides, buildWeeklyArticleDraft } from "./content-bridge";
import { createEmptySession } from "./defaults";
import type { SpeakingAssessment, WeeklyChallengeRecord } from "./types";

describe("Speaking Ledger Analytics & Content Bridge", () => {
  const emptyChallenges: Record<number, WeeklyChallengeRecord> = {};

  it("never fabricates progress or average scores when no data is saved", () => {
    const metrics = computeProgressMetrics({
      curriculum: CURRICULUM_DAYS,
      sessions: {},
      assessments: {},
      publications: {},
      weeklyChallenges: emptyChallenges,
      weeklyReviews: {},
      todayDateStr: "2026-11-30",
    });

    expect(metrics.daysCompleted).toBe(0);
    expect(metrics.completionPercentage).toBe(0);
    expect(metrics.totalSpeakingMinutes).toBe(0);
    expect(metrics.numberOfRecordings).toBe(0);
    expect(metrics.averageSpeakingScore).toBeNull();
    expect(metrics.currentStreak).toBe(0);
  });

  it("computes exact metrics, weekly averages, and First 30 vs Last 30 comparisons from saved data", () => {
    const sessions = {
      1: {
        ...createEmptySession(1),
        status: "completed" as const,
        firstTakeCompleted: true,
        firstRecordingUrl: "https://youtube.com/watch?v=day1",
        firstRecordingMinutes: 4,
        secondTakeCompleted: true,
        premPoint: "I build to understand.",
        dailyLearningSummary: "Explained my transition from frontend to systems.",
      },
      65: {
        ...createEmptySession(65),
        status: "completed" as const,
        firstTakeCompleted: true,
        firstRecordingUrl: "https://youtube.com/watch?v=day65",
        firstRecordingMinutes: 5,
      },
    };

    const a1: SpeakingAssessment = {
      dayNumber: 1,
      clarity: 3,
      structure: 3,
      confidence: 3,
      voice: 4,
      storytelling: 3,
      connection: 4,
      originality: 4,
      averageScore: computeAssessmentAverage({
        clarity: 3,
        structure: 3,
        confidence: 3,
        voice: 4,
        storytelling: 3,
        connection: 4,
        originality: 4,
      }),
      notes: "",
      updatedAt: null,
    };
    const a65: SpeakingAssessment = {
      dayNumber: 65,
      clarity: 5,
      structure: 5,
      confidence: 4,
      voice: 5,
      storytelling: 4,
      connection: 5,
      originality: 5,
      averageScore: computeAssessmentAverage({
        clarity: 5,
        structure: 5,
        confidence: 4,
        voice: 5,
        storytelling: 4,
        connection: 5,
        originality: 5,
      }),
      notes: "",
      updatedAt: null,
    };

    const assessments = { 1: a1, 65: a65 };

    const metrics = computeProgressMetrics({
      curriculum: CURRICULUM_DAYS,
      sessions,
      assessments,
      publications: {
        1: [
          {
            dayNumber: 1,
            platform: "youtube",
            published: true,
            url: "https://youtube.com/watch?v=day1",
            caption: "",
            publishedAt: "2026-11-30T18:00:00Z",
            notes: "",
          },
        ],
      },
      weeklyChallenges: {
        1: {
          weekNumber: 1,
          title: "Week 1",
          description: "",
          completed: true,
          completedAt: "2026-12-06T18:00:00Z",
          reflection: "",
        },
      },
      weeklyReviews: {},
      todayDateStr: "2026-11-30",
    });

    expect(metrics.daysCompleted).toBe(2);
    expect(metrics.totalSpeakingMinutes).toBe(9);
    expect(metrics.numberOfRecordings).toBe(3);
    expect(metrics.publishedVideosAndPosts).toBe(1);
    expect(metrics.weeklyChallengesCompleted).toBe(1);
    expect(metrics.averageSpeakingScore).toBe(
      Math.round(((a1.averageScore + a65.averageScore) / 2) * 100) / 100
    );

    const { first30, last30 } = computeFirstVsLast30Days(assessments);
    expect(first30.clarity).toBe(3);
    expect(last30.clarity).toBe(5);

    const weekly = computeWeeklyAnalytics({
      curriculum: CURRICULUM_DAYS,
      sessions,
      assessments,
      publications: {},
      weeklyChallenges: {},
    });
    expect(weekly[0].completedDays).toBe(1);
    expect(weekly[0].bestRecordingDay?.dayNumber).toBe(1);

    const top = getBestTalks(CURRICULUM_DAYS, sessions, assessments, 2);
    expect(top[0].day.dayNumber).toBe(65);
  });

  it("builds carousel slides and weekly short-form article drafts linking portfolio items", () => {
    const day1 = getCurriculumDay(1)!;
    const session1 = {
      ...createEmptySession(1),
      status: "completed" as const,
      premPoint: "Curiosity compounds when paired with building.",
      premReason: "Shipping forces real judgment.",
      premExample: "Building Zamir taught me how language shapes music.",
      premMeaning: "Start one small concrete build today.",
      dailyLearningSummary: "Practised opening without reading notes.",
      linkedBuildingIds: ["building:zamir"],
    };
    const portfolioContext = [
      {
        id: "building:zamir",
        kind: "building" as const,
        title: "Zamir",
        subtitle: "In Progress",
      },
    ];

    const slides = buildDailyCarouselSlides({
      day: day1,
      session: session1,
      linkedItems: portfolioContext,
    });
    expect(slides.length).toBe(6);
    expect(slides[0].title).toBe(day1.topic);
    expect(slides.some((s) => s.content.includes("Zamir"))).toBe(true);

    const article = buildWeeklyArticleDraft({
      weekNumber: 1,
      weekTitle: "Introducing yourself and your worldview",
      days: CURRICULUM_DAYS.slice(0, 7),
      sessions: { 1: session1 },
      portfolioContext,
    });
    expect(article.title).toContain("Week 1 Notes");
    expect(article.content).toContain("Curiosity compounds when paired with building.");
    expect(article.content).toContain("Zamir");
  });
});
