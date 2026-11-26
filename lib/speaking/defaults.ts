import { getCurriculumDay } from "./curriculum";
import type { DailySession } from "./types";

export function createEmptySession(dayNumber: number): DailySession {
  const day = getCurriculumDay(dayNumber);
  return {
    dayNumber,
    status: "not_started",
    prepCompleted: false,
    firstTakeCompleted: false,
    firstRecordingUrl: "",
    firstRecordingDuration: "",
    firstRecordingMinutes: 0,
    reviewCompleted: false,
    secondTakeCompleted: false,
    secondRecordingUrl: "",
    secondRecordingDuration: "",
    finalRecordingUrl: "",
    preparationNotes: "",
    premPoint: "",
    premReason: "",
    premExample: "",
    premMeaning: "",
    selectedAudience: day?.recommendedAudience ?? "mixed",
    selectedFormat: day?.recommendedFormat ?? "conversational_talk",
    dailyLearningSummary: "",
    linkedBuildingIds: [],
    linkedBookIds: [],
    linkedLearningIds: [],
    linkedProjectIds: [],
    carouselSlides: [],
    practiceOnly: false,
    isPublic: false,
    audienceInteractionsCount: 0,
    reflectionWhatWorked: "",
    reflectionWeakest: "",
    reflectionLostTrain: "",
    reflectionImproveTomorrow: "",
    reflectionWhatLearned: "",
    reflectionNotes: "",
    completedAt: null,
    updatedAt: null,
  };
}
