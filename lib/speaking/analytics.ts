import type {
  CurriculumDay,
  DailySession,
  DayStatus,
  PublicationRecord,
  ScorecardDimensionKey,
  SpeakingAssessment,
  WeeklyChallengeRecord,
  WeeklyReviewRecord,
} from "./types";
import { computeConsecutiveStreak, computeDayStatus } from "./dates";
import { SCORECARD_DIMENSIONS, WEEKLY_CHALLENGES } from "./methodology";

export interface CoreProgressMetrics {
  daysCompleted: number;
  totalDays: number;
  completionPercentage: number;
  totalSpeakingMinutes: number;
  numberOfRecordings: number;
  publishedVideosAndPosts: number;
  weeklyChallengesCompleted: number;
  totalWeeklyChallenges: number;
  currentStreak: number;
  totalPracticeSessions: number;
  averageSpeakingScore: number | null;
  weeklyReviewsCompleted: number;
}

export interface DimensionAverageSet {
  clarity: number | null;
  structure: number | null;
  confidence: number | null;
  voice: number | null;
  storytelling: number | null;
  connection: number | null;
  originality: number | null;
  overall: number | null;
  sampleCount: number;
}

export interface WeeklyAnalyticsRow {
  weekNumber: number;
  weekTitle: string;
  completedDays: number;
  totalDays: number;
  incompleteDays: number;
  averageScore: number | null;
  bestRecordingDay: { dayNumber: number; topic: string; score: number } | null;
  weakestRecordingDay: { dayNumber: number; topic: string; score: number } | null;
  recordingsPublished: number;
  audienceInteractions: number;
  challengeCompleted: boolean;
  dimensions: DimensionAverageSet;
}

export interface ArchiveEntry {
  day: CurriculumDay;
  status: DayStatus;
  session: DailySession | undefined;
  assessment: SpeakingAssessment | undefined;
  publications: PublicationRecord[];
  hasRecording: boolean;
  isPublished: boolean;
  recordingUrl: string;
}

export function computeAssessmentAverage(
  scores: Record<ScorecardDimensionKey, number>
): number {
  const sum = SCORECARD_DIMENSIONS.reduce((acc, dim) => acc + (scores[dim.key] || 0), 0);
  return Math.round((sum / SCORECARD_DIMENSIONS.length) * 100) / 100;
}

function emptyDimensionSet(): DimensionAverageSet {
  return {
    clarity: null,
    structure: null,
    confidence: null,
    voice: null,
    storytelling: null,
    connection: null,
    originality: null,
    overall: null,
    sampleCount: 0,
  };
}

export function computeDimensionAverages(
  assessments: SpeakingAssessment[]
): DimensionAverageSet {
  if (assessments.length === 0) return emptyDimensionSet();
  const count = assessments.length;
  const round2 = (v: number): number => Math.round(v * 100) / 100;

  const result = emptyDimensionSet();
  let totalSum = 0;

  for (const dim of SCORECARD_DIMENSIONS) {
    const sum = assessments.reduce((acc, a) => acc + a[dim.key], 0);
    const avg = round2(sum / count);
    result[dim.key] = avg;
    totalSum += avg;
  }

  result.overall = round2(totalSum / SCORECARD_DIMENSIONS.length);
  result.sampleCount = count;
  return result;
}

export function computeProgressMetrics(params: {
  curriculum: CurriculumDay[];
  sessions: Record<number, DailySession>;
  assessments: Record<number, SpeakingAssessment>;
  publications: Record<number, PublicationRecord[]>;
  weeklyChallenges: Record<number, WeeklyChallengeRecord>;
  weeklyReviews: Record<number, WeeklyReviewRecord>;
  todayDateStr: string;
}): CoreProgressMetrics {
  const {
    curriculum,
    sessions,
    assessments,
    publications,
    weeklyChallenges,
    weeklyReviews,
    todayDateStr,
  } = params;

  const sessionList = Object.values(sessions);
  const completedSessions = sessionList.filter((s) => s.status === "completed");
  const daysCompleted = completedSessions.length;

  const totalSpeakingMinutes = sessionList.reduce((sum, s) => {
    const mins = Number.isFinite(s.firstRecordingMinutes) ? s.firstRecordingMinutes : 0;
    return sum + Math.max(0, mins);
  }, 0);

  const numberOfRecordings = sessionList.reduce((count, s) => {
    let takes = 0;
    if (s.firstTakeCompleted || s.firstRecordingUrl.trim()) takes += 1;
    if (s.secondTakeCompleted || s.secondRecordingUrl.trim()) takes += 1;
    return count + takes;
  }, 0);

  const publishedVideosAndPosts = Object.values(publications)
    .flat()
    .filter((p) => p.published).length;

  const weeklyChallengesCompleted = Object.values(weeklyChallenges).filter(
    (c) => c.completed
  ).length;

  const currentStreak = computeConsecutiveStreak(curriculum, sessions, todayDateStr);

  const totalPracticeSessions = sessionList.filter(
    (s) => s.status === "completed" || s.firstTakeCompleted || s.secondTakeCompleted
  ).length;

  const assessmentList = Object.values(assessments);
  const averageSpeakingScore =
    assessmentList.length > 0
      ? Math.round(
          (assessmentList.reduce((acc, a) => acc + a.averageScore, 0) /
            assessmentList.length) *
            100
        ) / 100
      : null;

  const weeklyReviewsCompleted = Object.values(weeklyReviews).filter(
    (r) => Boolean(r.submittedAt)
  ).length;

  return {
    daysCompleted,
    totalDays: curriculum.length,
    completionPercentage:
      curriculum.length > 0
        ? Math.round((daysCompleted / curriculum.length) * 1000) / 10
        : 0,
    totalSpeakingMinutes,
    numberOfRecordings,
    publishedVideosAndPosts,
    weeklyChallengesCompleted,
    totalWeeklyChallenges: WEEKLY_CHALLENGES.length,
    currentStreak,
    totalPracticeSessions,
    averageSpeakingScore,
    weeklyReviewsCompleted,
  };
}

export function computeWeeklyAnalytics(params: {
  curriculum: CurriculumDay[];
  sessions: Record<number, DailySession>;
  assessments: Record<number, SpeakingAssessment>;
  publications: Record<number, PublicationRecord[]>;
  weeklyChallenges: Record<number, WeeklyChallengeRecord>;
}): WeeklyAnalyticsRow[] {
  const { curriculum, sessions, assessments, publications, weeklyChallenges } = params;

  return WEEKLY_CHALLENGES.map((week) => {
    const weekDays = curriculum.filter(
      (d) => d.dayNumber >= week.dayRange[0] && d.dayNumber <= week.dayRange[1]
    );
    const completedDays = weekDays.filter(
      (d) => sessions[d.dayNumber]?.status === "completed"
    ).length;

    const weekAssessments = weekDays
      .map((d) => ({ day: d, assessment: assessments[d.dayNumber] }))
      .filter((x): x is { day: CurriculumDay; assessment: SpeakingAssessment } =>
        Boolean(x.assessment)
      );

    const dimensions = computeDimensionAverages(
      weekAssessments.map((x) => x.assessment)
    );

    let bestRecordingDay: WeeklyAnalyticsRow["bestRecordingDay"] = null;
    let weakestRecordingDay: WeeklyAnalyticsRow["weakestRecordingDay"] = null;

    if (weekAssessments.length > 0) {
      const sorted = [...weekAssessments].sort(
        (a, b) => b.assessment.averageScore - a.assessment.averageScore
      );
      bestRecordingDay = {
        dayNumber: sorted[0].day.dayNumber,
        topic: sorted[0].day.topic,
        score: sorted[0].assessment.averageScore,
      };
      const last = sorted[sorted.length - 1];
      weakestRecordingDay = {
        dayNumber: last.day.dayNumber,
        topic: last.day.topic,
        score: last.assessment.averageScore,
      };
    }

    const recordingsPublished = weekDays.reduce((sum, d) => {
      const pubs = publications[d.dayNumber] ?? [];
      return sum + (pubs.some((p) => p.published) ? 1 : 0);
    }, 0);

    const audienceInteractions = weekDays.reduce(
      (sum, d) => sum + (sessions[d.dayNumber]?.audienceInteractionsCount ?? 0),
      0
    );

    return {
      weekNumber: week.weekNumber,
      weekTitle: week.weekTitle,
      completedDays,
      totalDays: weekDays.length,
      incompleteDays: weekDays.length - completedDays,
      averageScore: dimensions.overall,
      bestRecordingDay,
      weakestRecordingDay,
      recordingsPublished,
      audienceInteractions,
      challengeCompleted: Boolean(weeklyChallenges[week.weekNumber]?.completed),
      dimensions,
    };
  });
}

export function computeFirstVsLast30Days(
  assessments: Record<number, SpeakingAssessment>
): {
  first30: DimensionAverageSet;
  last30: DimensionAverageSet;
} {
  const all = Object.values(assessments);
  const first30 = computeDimensionAverages(
    all.filter((a) => a.dayNumber >= 1 && a.dayNumber <= 30)
  );
  const last30 = computeDimensionAverages(
    all.filter((a) => a.dayNumber >= 61 && a.dayNumber <= 90)
  );
  return { first30, last30 };
}

export function buildArchiveEntries(params: {
  curriculum: CurriculumDay[];
  sessions: Record<number, DailySession>;
  assessments: Record<number, SpeakingAssessment>;
  publications: Record<number, PublicationRecord[]>;
  todayDateStr: string;
}): ArchiveEntry[] {
  const { curriculum, sessions, assessments, publications, todayDateStr } = params;

  return curriculum.map((day) => {
    const session = sessions[day.dayNumber];
    const assessment = assessments[day.dayNumber];
    const pubs = publications[day.dayNumber] ?? [];
    const status = computeDayStatus(day.date, todayDateStr, session);
    const recordingUrl =
      session?.finalRecordingUrl.trim() ||
      session?.secondRecordingUrl.trim() ||
      session?.firstRecordingUrl.trim() ||
      "";
    const hasRecording = Boolean(
      recordingUrl || session?.firstTakeCompleted || session?.secondTakeCompleted
    );
    const isPublished = pubs.some((p) => p.published);

    return {
      day,
      status,
      session,
      assessment,
      publications: pubs,
      hasRecording,
      isPublished,
      recordingUrl,
    };
  });
}

export function getBestTalks(
  curriculum: CurriculumDay[],
  sessions: Record<number, DailySession>,
  assessments: Record<number, SpeakingAssessment>,
  limit = 5
): Array<{
  day: CurriculumDay;
  averageScore: number;
  recordingUrl: string;
  whatLearned: string;
}> {
  return curriculum
    .map((day) => {
      const assessment = assessments[day.dayNumber];
      const session = sessions[day.dayNumber];
      if (!assessment) return null;
      return {
        day,
        averageScore: assessment.averageScore,
        recordingUrl:
          session?.finalRecordingUrl.trim() ||
          session?.secondRecordingUrl.trim() ||
          session?.firstRecordingUrl.trim() ||
          "",
        whatLearned:
          session?.reflectionWhatLearned.trim() ||
          session?.dailyLearningSummary.trim() ||
          "",
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, limit);
}
