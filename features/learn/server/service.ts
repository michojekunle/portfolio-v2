import { endOfLocalDay, localDateString, resolveTimeZone } from "../domain/dates";
import type { WordAction } from "../domain/schemas";
import {
  DEFAULT_LEVEL,
  fallbackLessonFor,
  topicForDate,
  type Lesson,
  type Level,
} from "../domain/lessons";
import {
  MAX_REVIEWS_PER_SESSION,
  checkSessionEligibility,
  type ProfileUpdate,
  type SessionComplete,
} from "../domain/schemas";
import { COMMITMENT_STEPS, DEFAULT_COMMITMENT, type Commitment } from "../domain/commitment";
import { LEVEL_UP_RULES, suggestNextLevel, type LevelSuggestion } from "../domain/level-up";
import { gradeCard, isRecalled, markKnown, newCardSchedule, practiseAgain } from "../domain/srs";
import { applyCompletion, viewStreak } from "../domain/streak";
import type { LessonRequest } from "./ai";
import { AiUnavailableError, SessionNotEligibleError } from "./errors";
import type { Card, LearnRepository } from "./repository";
import { resolveVariantId, withVariant, type LanguagePack } from "../domain/language";

export interface ServiceDeps {
  readonly pack: LanguagePack;
  readonly repo: LearnRepository;
  readonly now: () => Date;
  /** Takes the learner's effective pack (variant applied), so the lesson matches their dialect. */
  readonly makeLesson: (pack: LanguagePack, request: LessonRequest) => Promise<Lesson>;
  /** Called when AI is down — injected so tests stay silent and prod can log. */
  readonly onAiFallback: (error: unknown) => void;
}

export interface DueCardDto {
  readonly id: string;
  readonly french: string;
  readonly english: string;
  readonly notes: string | null;
}

export interface StreakDto {
  readonly current: number;
  readonly longest: number;
  readonly freezes: number;
  readonly completedToday: boolean;
  readonly atRisk: boolean;
  readonly totalCompletions: number;
}

export interface SessionPayload {
  readonly guest: boolean;
  readonly today: string;
  readonly profile: {
    readonly level: Level;
    readonly timezone: string;
    readonly isNew: boolean;
    readonly dailyMinutes: Commitment;
    readonly variant: string | null;
  };
  readonly streak: StreakDto;
  readonly due: readonly DueCardDto[];
  readonly dueTotal: number;
  readonly lesson: Lesson;
  readonly lessonSource: "ai" | "cached" | "fallback";
  readonly estimatedMinutes: number;
  /** Set by the route: whether the learner has Plus (natural voices). Absent for guests. */
  readonly plus?: boolean;
  /** Set when recent sessions show the learner is ready for the next level. Never for guests. */
  readonly levelSuggestion: LevelSuggestion | null;
}

export interface CompletePayload {
  readonly alreadyCompleted: boolean;
  readonly streak: StreakDto & { readonly freezesUsed: number; readonly freezeEarned: boolean };
  readonly stats: { readonly reviews: number; readonly recalled: number; readonly newWords: number };
  readonly tomorrowDue: number;
}

/** Lesson (learn with say/type-back 4 + speak 2 + write 2 min) plus ~15s per review card, plus the steps a bigger commitment adds. */
const LESSON_MINUTES = 8;
const SECONDS_PER_REVIEW = 15;
const LISTEN_MINUTES = 4;
const DICTATION_MINUTES = 4;

export function estimateMinutes(reviewCount: number, commitment: Commitment = DEFAULT_COMMITMENT): number {
  const steps = COMMITMENT_STEPS[commitment];
  const minutes =
    LESSON_MINUTES + (reviewCount * SECONDS_PER_REVIEW) / 60 + (steps.listen ? LISTEN_MINUTES : 0) + (steps.dictation ? DICTATION_MINUTES : 0);
  // Never quote more than the learner signed up for.
  return Math.min(commitment, Math.max(5, Math.round(minutes)));
}

const toDueDto = (card: { id: string; french: string; english: string; notes: string | null }): DueCardDto => ({
  id: card.id,
  french: card.french,
  english: card.english,
  notes: card.notes,
});

export function loadGuestSession(basePack: LanguagePack, now: Date, clientTimezone: string | null, variantId: string | null = null): SessionPayload {
  const variant = resolveVariantId(basePack, variantId);
  const pack = withVariant(basePack, variant);
  const timezone = resolveTimeZone(clientTimezone);
  const today = localDateString(timezone, now);
  return {
    guest: true,
    today,
    profile: { level: DEFAULT_LEVEL, timezone, isNew: true, dailyMinutes: DEFAULT_COMMITMENT, variant },
    streak: { current: 0, longest: 0, freezes: 2, completedToday: false, atRisk: false, totalCompletions: 0 },
    due: [],
    dueTotal: 0,
    lesson: fallbackLessonFor(pack.fallbackLessons, today),
    lessonSource: "fallback",
    estimatedMinutes: estimateMinutes(0),
    levelSuggestion: null,
  };
}

export async function loadUserSession(
  deps: ServiceDeps,
  userId: string,
  clientTimezone: string | null
): Promise<SessionPayload> {
  const { repo } = deps;
  const now = deps.now();

  const stored = await repo.getProfile(userId);
  const timezone = resolveTimeZone(clientTimezone ?? stored?.timezone);
  const level = stored?.level ?? DEFAULT_LEVEL;
  const dailyMinutes = stored?.dailyMinutes ?? DEFAULT_COMMITMENT;
  const variant = resolveVariantId(deps.pack, stored?.variant);
  const pack = withVariant(deps.pack, variant);

  // Keep the stored zone current so server-side jobs (reminders) can use it.
  if (stored && stored.timezone !== timezone) await repo.upsertProfile(userId, { level, timezone, dailyMinutes, variant });

  const today = localDateString(timezone, now);
  const [streakState, dueCards, dueTotal, cachedLesson, recentSessions] = await Promise.all([
    repo.getStreak(userId),
    repo.listDueCards(userId, endOfLocalDay(timezone, now), MAX_REVIEWS_PER_SESSION),
    repo.countDueCards(userId, endOfLocalDay(timezone, now)),
    repo.getLesson(userId, today),
    repo.listRecentSessions(userId, LEVEL_UP_RULES.window * 2),
  ]);

  let lesson = cachedLesson;
  let lessonSource: SessionPayload["lessonSource"] = "cached";

  // Until a learner has picked a level, don't spend an AI call (or cache a
  // lesson) at a guessed one — they get the offline lesson, and the first
  // generated lesson after onboarding matches their real level.
  if (!lesson && stored === null) {
    lesson = fallbackLessonFor(pack.fallbackLessons, today);
    lessonSource = "fallback";
  }

  if (!lesson) {
    try {
      lesson = await deps.makeLesson(pack, {
        level,
        topic: topicForDate(pack.topics, today),
        recycleWords: dueCards.map((card) => card.french),
      });
      lessonSource = "ai";
      await repo.saveLesson(userId, today, lesson);
    } catch (error) {
      if (!(error instanceof AiUnavailableError)) throw error;
      deps.onAiFallback(error);
      // Not cached: a transient AI outage should retry on the next load, not stick all day.
      lesson = fallbackLessonFor(pack.fallbackLessons, today);
      lessonSource = "fallback";
    }
  }

  const view = viewStreak(streakState, today);
  return {
    guest: false,
    today,
    profile: { level, timezone, isNew: stored === null, dailyMinutes, variant },
    streak: {
      current: view.current,
      longest: streakState.longest,
      freezes: streakState.freezes,
      completedToday: view.completedToday,
      atRisk: view.atRisk,
      totalCompletions: streakState.totalCompletions,
    },
    due: dueCards.map(toDueDto),
    dueTotal,
    lesson,
    lessonSource,
    estimatedMinutes: estimateMinutes(dueCards.length, dailyMinutes),
    levelSuggestion: stored === null ? null : suggestNextLevel(level, recentSessions),
  };
}

export async function saveUserProfile(deps: ServiceDeps, userId: string, update: ProfileUpdate): Promise<void> {
  // Partial updates (level only) must not reset a commitment chosen earlier.
  const existing = await deps.repo.getProfile(userId);
  await deps.repo.upsertProfile(userId, {
    level: update.level,
    timezone: update.timezone,
    dailyMinutes: update.dailyMinutes ?? existing?.dailyMinutes ?? DEFAULT_COMMITMENT,
    variant: resolveVariantId(deps.pack, update.variant ?? existing?.variant),
  });
}

export async function completeUserSession(
  deps: ServiceDeps,
  userId: string,
  input: SessionComplete
): Promise<CompletePayload> {
  const { repo } = deps;
  const eligibility = checkSessionEligibility(input);
  if (!eligibility.eligible) {
    throw new SessionNotEligibleError(eligibility.reason ?? "Session did not qualify.");
  }

  const now = deps.now();
  const timezone = resolveTimeZone(input.timezone);
  const today = localDateString(timezone, now);
  const tomorrowEnd = endOfLocalDay(timezone, new Date(endOfLocalDay(timezone, now).getTime() + 1));

  const streakState = await repo.getStreak(userId);
  const tomorrowDue = async (): Promise<number> => repo.countDueCards(userId, tomorrowEnd);

  // A retried request must not re-grade cards (that would compound intervals).
  if (await repo.hasSession(userId, input.clientSessionId)) {
    const view = viewStreak(streakState, today);
    return {
      alreadyCompleted: true,
      streak: {
        current: view.current,
        longest: streakState.longest,
        freezes: streakState.freezes,
        completedToday: view.completedToday,
        atRisk: false,
        totalCompletions: streakState.totalCompletions,
        freezesUsed: 0,
        freezeEarned: false,
      },
      stats: { reviews: input.reviews.length, recalled: 0, newWords: input.newCards.length },
      tomorrowDue: await tomorrowDue(),
    };
  }

  // Schedules come from the stored card, never from the client.
  const gradeById = new Map(input.reviews.map((review) => [review.cardId, review.grade] as const));
  const cards = await repo.getCardsByIds(userId, [...gradeById.keys()]);
  const updates = cards.map((card) => {
    const grade = gradeById.get(card.id);
    if (!grade) throw new Error(`Invariant violated: no grade for card ${card.id}`);
    return { id: card.id, grade, schedule: gradeCard(card.schedule, grade, now) };
  });
  const recalled = updates.filter((update) => isRecalled(update.grade)).length;

  await repo.updateCardSchedules(userId, updates);
  await repo.addNewCards(userId, input.newCards, newCardSchedule(now));

  const profile = await repo.getProfile(userId);
  const level = profile?.level ?? DEFAULT_LEVEL;

  const completion = applyCompletion(streakState, today);
  if (!completion.alreadyCompleted) {
    await repo.saveStreak(userId, completion.state);
    await repo.insertCompletionLog(userId);
  }

  await repo.insertSession(userId, {
    clientSessionId: input.clientSessionId,
    sessionDate: today,
    level,
    durationSeconds: input.durationSeconds,
    reviews: updates.length,
    reviewsRecalled: recalled,
    newCards: input.newCards.length,
    speakScore: input.speakScore,
    writingCorrect: input.writingCorrect,
  });

  const finalState = completion.state;
  return {
    alreadyCompleted: completion.alreadyCompleted,
    streak: {
      current: finalState.current,
      longest: finalState.longest,
      freezes: finalState.freezes,
      completedToday: true,
      atRisk: false,
      totalCompletions: finalState.totalCompletions,
      freezesUsed: completion.freezesUsed,
      freezeEarned: completion.freezeEarned,
    },
    stats: { reviews: updates.length, recalled, newWords: input.newCards.length },
    tomorrowDue: await tomorrowDue(),
  };
}


// ── My words ──────────────────────────────────────────────────────────────

export const MAX_WORDS_LISTED = 1000;

export interface WordDto {
  readonly id: string;
  readonly text: string;
  readonly english: string;
  readonly notes: string | null;
  readonly source: "lesson" | "manual" | "error";
  /** "new" until first review; "learning" while short-interval; "known" once spaced out ≥ 21 days. */
  readonly strength: "new" | "learning" | "known";
  readonly dueAt: string;
  readonly intervalDays: number;
}

/** A word counts as known once the schedule trusts it for three weeks — the usual "mature card" threshold. */
const MATURE_DAYS = 21;

function toWordDto(card: Card): WordDto {
  const { schedule } = card;
  const strength = schedule.intervalDays >= MATURE_DAYS ? "known" : schedule.reps === 0 ? "new" : "learning";
  return {
    id: card.id,
    text: card.french,
    english: card.english,
    notes: card.notes,
    source: card.source,
    strength,
    dueAt: schedule.dueAt.toISOString(),
    intervalDays: schedule.intervalDays,
  };
}

export async function listWords(deps: ServiceDeps, userId: string): Promise<readonly WordDto[]> {
  return (await deps.repo.listAllCards(userId, MAX_WORDS_LISTED)).map(toWordDto);
}

/** Applies "I know this" / "practise again" to one of the learner's own cards. Returns null if it isn't theirs. */
export async function updateWord(deps: ServiceDeps, userId: string, input: WordAction): Promise<WordDto | null> {
  const [card] = await deps.repo.getCardsByIds(userId, [input.cardId]);
  if (!card) return null;
  const now = deps.now();
  const schedule = input.action === "known" ? markKnown(card.schedule, now) : practiseAgain(card.schedule, now);
  await deps.repo.updateCardSchedules(userId, [{ id: card.id, schedule }]);
  return toWordDto({ ...card, schedule });
}
