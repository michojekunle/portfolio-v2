export type SpeakingPhaseNumber = 1 | 2 | 3;

export type SpeakingFormatId =
  | "conversational_talk"
  | "mini_keynote"
  | "educational_video"
  | "opinion_piece"
  | "personal_story"
  | "spontaneous_response";

export type AudienceTypeId =
  | "developers"
  | "entrepreneurs"
  | "students"
  | "business_owners"
  | "general"
  | "leaders"
  | "mixed";

export type DayStatus =
  | "upcoming"
  | "today"
  | "in_progress"
  | "completed"
  | "missed"
  | "practice_only";

export type PlatformId = "instagram" | "tiktok" | "x" | "youtube" | "website";

export type IdeaCategory =
  | "observation"
  | "question"
  | "reading"
  | "disagreement"
  | "technical_concept"
  | "business_idea"
  | "personal_experience"
  | "conversation";

export type IdeaStatus = "raw" | "developing" | "used";

export type ScorecardDimensionKey =
  | "clarity"
  | "structure"
  | "confidence"
  | "voice"
  | "storytelling"
  | "connection"
  | "originality";

export interface ProgrammeInfo {
  id: string;
  name: string;
  programmeTitle: string;
  tagline: string;
  description: string;
  startDate: string; // YYYY-MM-DD in Africa/Lagos
  endDate: string;   // YYYY-MM-DD in Africa/Lagos
  timezone: string;
  totalDays: number;
  status: "upcoming" | "active" | "completed";
}

export interface PhaseInfo {
  number: SpeakingPhaseNumber;
  name: string;
  title: string;
  dayRange: [number, number];
  objective: string;
  endOutcome: string;
}

export interface SpeakingFormatGuide {
  id: SpeakingFormatId;
  label: string;
  shortDesc: string;
  howToExecute: string;
  exampleAngle: string;
}

export interface AudienceOption {
  id: AudienceTypeId;
  label: string;
  defaultFocus: string;
}

export interface ScorecardDimension {
  key: ScorecardDimensionKey;
  label: string;
  question: string;
}

export interface WeeklyChallengeMeta {
  weekNumber: number;
  monthNumber: number;
  weekTitle: string;
  dayRange: [number, number];
  challengeTitle: string;
  challengeDescription: string;
}

export interface CarouselSlideDraft {
  title: string;
  content: string;
  layout: "hook" | "default" | "quote" | "split" | "cta";
}

export interface CurriculumDay {
  id: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD
  phase: SpeakingPhaseNumber;
  monthNumber: 1 | 2 | 3;
  monthTitle: string;
  weekNumber: number;
  weekTitle: string;
  topic: string;
  description: string;
  whyItMatters: string;
  skill: string;
  duration: string;
  thinkingPrompts: string[];
  recommendedFormat: SpeakingFormatId;
  recommendedAudience: AudienceTypeId;
  audienceAngles: Partial<Record<AudienceTypeId, string>>;
  exercise: string;
  recordingChecklist: string[];
  publishingSuggestion: string;
  weeklyChallengeReference: string;
  isFinalDay?: boolean;
}

export interface DailySession {
  id?: string;
  dayNumber: number;
  status: "not_started" | "in_progress" | "completed";
  prepCompleted: boolean;
  firstTakeCompleted: boolean;
  firstRecordingUrl: string;
  firstRecordingDuration: string;
  firstRecordingMinutes: number;
  reviewCompleted: boolean;
  secondTakeCompleted: boolean;
  secondRecordingUrl: string;
  secondRecordingDuration: string;
  finalRecordingUrl: string;
  preparationNotes: string;
  premPoint: string;
  premReason: string;
  premExample: string;
  premMeaning: string;
  selectedAudience: AudienceTypeId;
  selectedFormat: SpeakingFormatId;
  dailyLearningSummary: string;
  linkedBuildingIds: string[];
  linkedBookIds: string[];
  linkedLearningIds: string[];
  linkedProjectIds: string[];
  carouselSlides: CarouselSlideDraft[];
  practiceOnly: boolean;
  isPublic: boolean;
  audienceInteractionsCount: number;
  reflectionWhatWorked: string;
  reflectionWeakest: string;
  reflectionLostTrain: string;
  reflectionImproveTomorrow: string;
  reflectionWhatLearned: string;
  reflectionNotes: string;
  completedAt: string | null;
  updatedAt: string | null;
}

export interface SpeakingAssessment {
  id?: string;
  dayNumber: number;
  clarity: number;
  structure: number;
  confidence: number;
  voice: number;
  storytelling: number;
  connection: number;
  originality: number;
  averageScore: number;
  notes: string;
  updatedAt: string | null;
}

export interface PublicationRecord {
  id?: string;
  dayNumber: number;
  platform: PlatformId;
  published: boolean;
  url: string;
  caption: string;
  publishedAt: string | null;
  notes: string;
  videoCategory?: string;
  syncToVideos?: boolean;
  siteVideoId?: string | null;
}

export interface WeeklyChallengeRecord {
  weekNumber: number;
  title: string;
  description: string;
  completed: boolean;
  completedAt: string | null;
  reflection: string;
}

export interface WeeklyReviewRecord {
  id?: string;
  weekNumber: number;
  strongestRecording: string;
  weakestRecording: string;
  speakingHabit: string;
  whatImproved: string;
  stillStruggling: string;
  mostInterestingIdea: string;
  connectedWithSomeone: string;
  nextWeekFocus: string;
  audienceInteractions: number;
  weeklyArticleTitle: string;
  weeklyArticleBody: string;
  weeklyArticleSlug: string;
  reflection: string;
  submittedAt: string | null;
  updatedAt: string | null;
}

export interface IdeaBankItem {
  id: string;
  title: string;
  category: IdeaCategory;
  body: string;
  sourceRef: string;
  tags: string[];
  linkedDayNumber: number | null;
  status: IdeaStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Day90ReportRecord {
  presentationOutline: string;
  finalRecordingUrl: string;
  q1OrganiseThoughts: string;
  q2WithoutScript: string;
  q3ExplainComplicated: string;
  q4BetterStoryteller: string;
  q5HabitsOvercome: string;
  q6StillNeedsImprovement: string;
  q7ConversationsOpportunities: string;
  q8ContinueDoing: string;
  updatedAt: string | null;
}

export interface PortfolioContextItem {
  id: string;
  kind: "building" | "book" | "learning" | "project";
  title: string;
  subtitle: string;
  url?: string;
}

export interface PublicPublishedEntry {
  dayNumber: number;
  date: string;
  topic: string;
  skill: string;
  phase: SpeakingPhaseNumber;
  dailyLearningSummary: string | null;
  publications: Array<{
    platform: PlatformId;
    url: string;
    caption: string;
    publishedAt: string | null;
  }>;
}

export interface SpeakingWorkspaceData {
  isOwner: boolean;
  schemaReady: boolean;
  todayDateStr: string;
  currentDayNumber: number | null;
  activeDayNumber: number;
  programmeState: "before" | "active" | "completed";
  sessions: Record<number, DailySession>;
  assessments: Record<number, SpeakingAssessment>;
  publications: Record<number, PublicationRecord[]>;
  weeklyChallenges: Record<number, WeeklyChallengeRecord>;
  weeklyReviews: Record<number, WeeklyReviewRecord>;
  ideas: IdeaBankItem[];
  day90Report: Day90ReportRecord | null;
  portfolioContext: PortfolioContextItem[];
  publicPublishedEntries: PublicPublishedEntry[];
  siteVideos: import("@/lib/videos/types").SiteVideo[];
}
