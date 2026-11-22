import { describe, expect, it, vi } from "vitest";
import { FRENCH } from "../domain/languages";
import type { Lesson } from "../domain/lessons";

const FALLBACK_LESSONS = FRENCH.fallbackLessons;
import type { SessionComplete } from "../domain/schemas";
import { newCardSchedule, type CardSchedule } from "../domain/srs";
import { EMPTY_STREAK, type StreakState } from "../domain/streak";
import { AiUnavailableError, SessionNotEligibleError } from "./errors";
import type { Card, LearnRepository, Profile, SessionRecord } from "./repository";
import { completeUserSession, estimateMinutes, listWords, loadGuestSession, loadUserSession, saveUserProfile, updateWord, type ServiceDeps } from "./service";

const USER = "user-1";
const NOW = new Date("2026-11-20T10:00:00.000Z");
const CARD_ID = "3f6c8f0e-2b7a-4c1d-9e6a-1a2b3c4d5e6f";
const CARD_ID_2 = "9a1b2c3d-4e5f-4a6b-8c7d-0e1f2a3b4c5d";

interface FakeState {
  profile: Profile | null;
  streak: StreakState;
  cards: Card[];
  lessons: Map<string, Lesson>;
  sessions: SessionRecord[];
  addedCards: string[];
  streakSaves: number;
}

function makeCard(id: string, schedule: CardSchedule): Card {
  return { id, french: `mot-${id.slice(0, 4)}`, english: "word", notes: null, source: "lesson", schedule };
}

function setup(overrides: Partial<FakeState> = {}) {
  const state: FakeState = {
    profile: { level: "A2", timezone: "Africa/Lagos", dailyMinutes: 15, variant: null },
    streak: EMPTY_STREAK,
    cards: [],
    lessons: new Map(),
    sessions: [],
    addedCards: [],
    streakSaves: 0,
    ...overrides,
  };

  const repo: LearnRepository = {
    getProfile: async () => state.profile,
    upsertProfile: async (_id, profile) => {
      state.profile = profile;
    },
    getStreak: async () => state.streak,
    saveStreak: async (_id, streak) => {
      state.streak = streak;
      state.streakSaves += 1;
    },
    listDueCards: async (_id, _before, limit) => state.cards.slice(0, limit),
    countDueCards: async () => state.cards.length,
    listAllCards: async (_id, limit) => state.cards.slice(0, limit),
    getCardsByIds: async (_id, ids) => state.cards.filter((card) => ids.includes(card.id)),
    updateCardSchedules: async (_id, updates) => {
      for (const { id, schedule } of updates) {
        state.cards = state.cards.map((card) => (card.id === id ? { ...card, schedule } : card));
      }
    },
    addNewCards: async (_id, cards) => {
      state.addedCards.push(...cards.map((card) => card.french));
    },
    getLesson: async (_id, date) => state.lessons.get(date) ?? null,
    saveLesson: async (_id, date, lesson) => {
      state.lessons.set(date, lesson);
    },
    listRecentSessions: async (_id, limit) =>
      [...state.sessions]
        .reverse()
        .slice(0, limit)
        .map((s) => ({ level: s.level, reviews: s.reviews, reviewsRecalled: s.reviewsRecalled, speakScore: s.speakScore, writingCorrect: s.writingCorrect })),
    hasSession: async (_id, clientId) => state.sessions.some((s) => s.clientSessionId === clientId),
    insertSession: async (_id, record) => {
      state.sessions.push(record);
    },
  };

  const makeLesson = vi.fn<ServiceDeps["makeLesson"]>().mockResolvedValue(FALLBACK_LESSONS[0]);
  const onAiFallback = vi.fn<ServiceDeps["onAiFallback"]>();
  const deps: ServiceDeps = { pack: FRENCH, repo, now: () => NOW, makeLesson, onAiFallback };
  return { state, deps, makeLesson, onAiFallback };
}

const session = (overrides: Partial<SessionComplete> = {}): SessionComplete => ({
  clientSessionId: "7d9e1c2a-5b3f-4e8a-b1c0-2f4a6c8e0d12",
  timezone: "Africa/Lagos",
  durationSeconds: 600,
  reviews: [
    { cardId: CARD_ID, grade: "good" },
    { cardId: CARD_ID_2, grade: "again" },
  ],
  newCards: [{ french: "je voudrais", english: "I would like", source: "lesson" }],
  speakScore: 0.9,
  writingCorrect: true,
  ...overrides,
});

describe("estimateMinutes", () => {
  it("fits the 15-minute promise even with a full review queue", () => {
    expect(estimateMinutes(15)).toBeLessThanOrEqual(15);
    expect(estimateMinutes(0)).toBeGreaterThanOrEqual(5);
    expect(estimateMinutes(15, 30)).toBeLessThanOrEqual(30);
    expect(estimateMinutes(0, 60)).toBeGreaterThan(estimateMinutes(0, 15));
  });
});

describe("loadGuestSession", () => {
  it("works with no account, no AI, and no database", () => {
    const payload = loadGuestSession(FRENCH, NOW, "Africa/Lagos");
    expect(payload.guest).toBe(true);
    expect(payload.due).toEqual([]);
    expect(payload.lessonSource).toBe("fallback");
  });
});

describe("loadUserSession", () => {
  it("generates a lesson once, then serves the cached copy", async () => {
    const { deps, makeLesson } = setup();
    const first = await loadUserSession(deps, USER, "Africa/Lagos");
    const second = await loadUserSession(deps, USER, "Africa/Lagos");
    expect(first.lessonSource).toBe("ai");
    expect(second.lessonSource).toBe("cached");
    expect(makeLesson).toHaveBeenCalledTimes(1);
  });

  it("falls back to a hand-written lesson when AI is down, without caching it", async () => {
    const { deps, makeLesson, onAiFallback, state } = setup();
    makeLesson.mockRejectedValue(new AiUnavailableError("down"));
    const payload = await loadUserSession(deps, USER, "Africa/Lagos");
    expect(payload.lessonSource).toBe("fallback");
    expect(onAiFallback).toHaveBeenCalledOnce();
    expect(state.lessons.size).toBe(0);
  });

  it("does not swallow unexpected errors as an AI outage", async () => {
    const { deps, makeLesson } = setup();
    makeLesson.mockRejectedValue(new TypeError("bug"));
    await expect(loadUserSession(deps, USER, "Africa/Lagos")).rejects.toThrow(TypeError);
  });

  it("flags first-time users and skips AI until they pick a level", async () => {
    const { deps, makeLesson, state } = setup({ profile: null });
    const payload = await loadUserSession(deps, USER, "Africa/Lagos");
    expect(payload.profile.isNew).toBe(true);
    expect(payload.lessonSource).toBe("fallback");
    expect(makeLesson).not.toHaveBeenCalled();
    expect(state.lessons.size).toBe(0);
  });

  it("keeps a chosen commitment when only the level changes", async () => {
    const { deps, state } = setup({ profile: { level: "A2", timezone: "Africa/Lagos", dailyMinutes: 60, variant: null } });
    await saveUserProfile(deps, USER, { level: "B1", timezone: "Africa/Lagos" });
    expect(state.profile).toEqual({ level: "B1", timezone: "Africa/Lagos", dailyMinutes: 60, variant: null });
    const payload = await loadUserSession(deps, USER, "Africa/Lagos");
    expect(payload.profile.dailyMinutes).toBe(60);
  });

  it("suggests the next level only after strong recent sessions at the current level", async () => {
    const record = (i: number, recalled: number): SessionRecord => ({
      clientSessionId: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
      sessionDate: "2026-11-01",
      level: "A2",
      durationSeconds: 600,
      reviews: 8,
      reviewsRecalled: recalled,
      newCards: 5,
      speakScore: 0.9,
      writingCorrect: true,
    });
    const strong = setup({ sessions: Array.from({ length: 8 }, (_, i) => record(i, 8)) });
    expect((await loadUserSession(strong.deps, USER, "Africa/Lagos")).levelSuggestion?.next).toBe("B1");

    const shaky = setup({ sessions: Array.from({ length: 8 }, (_, i) => record(i, 5)) });
    expect((await loadUserSession(shaky.deps, USER, "Africa/Lagos")).levelSuggestion).toBeNull();
  });

  it("recycles due words into lesson generation", async () => {
    const dueCard = makeCard(CARD_ID, newCardSchedule(NOW));
    const { deps, makeLesson } = setup({ cards: [dueCard] });
    await loadUserSession(deps, USER, "Africa/Lagos");
    expect(makeLesson).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ recycleWords: [dueCard.french] }));
  });
});

describe("completeUserSession", () => {
  it("rejects a session that is too short before touching any data", async () => {
    const { deps, state } = setup();
    await expect(completeUserSession(deps, USER, session({ durationSeconds: 5 }))).rejects.toThrow(SessionNotEligibleError);
    expect(state.sessions).toHaveLength(0);
    expect(state.streakSaves).toBe(0);
  });

  it("grades cards from stored schedules, saves new words, extends the streak, logs once", async () => {
    const { deps, state } = setup({
      cards: [makeCard(CARD_ID, newCardSchedule(NOW)), makeCard(CARD_ID_2, newCardSchedule(NOW))],
    });
    const result = await completeUserSession(deps, USER, session());

    expect(result.streak.current).toBe(1);
    expect(result.stats).toEqual({ reviews: 2, recalled: 1, newWords: 1 });
    expect(state.addedCards).toEqual(["je voudrais"]);
    expect(state.sessions).toHaveLength(1);
    expect(state.cards.find((c) => c.id === CARD_ID)?.schedule.state).toBe("review");
    expect(state.cards.find((c) => c.id === CARD_ID_2)?.schedule.state).toBe("learning");
  });

  it("is idempotent: a retried request does not re-grade cards or double-count", async () => {
    const { deps, state } = setup({ cards: [makeCard(CARD_ID, newCardSchedule(NOW))] });
    const input = session({
      reviews: [{ cardId: CARD_ID, grade: "good" }],
      newCards: [
        { french: "sans", english: "without", source: "lesson" },
        { french: "alors", english: "so", source: "lesson" },
      ],
    });
    await completeUserSession(deps, USER, input);
    const afterFirst = state.cards[0].schedule;

    const retry = await completeUserSession(deps, USER, input);
    expect(retry.alreadyCompleted).toBe(true);
    expect(state.cards[0].schedule).toEqual(afterFirst);
    expect(state.sessions).toHaveLength(1);
  });

  it("records a second same-day session without inflating the streak or the reminder log", async () => {
    const { deps, state } = setup();
    await completeUserSession(deps, USER, session({ reviews: [], clientSessionId: "11111111-1111-4111-8111-111111111111", newCards: [
      { french: "a", english: "a", source: "lesson" },
      { french: "b", english: "b", source: "lesson" },
      { french: "c", english: "c", source: "lesson" },
    ] }));
    const second = await completeUserSession(deps, USER, session({ reviews: [], clientSessionId: "22222222-2222-4222-8222-222222222222", newCards: [
      { french: "d", english: "d", source: "lesson" },
      { french: "e", english: "e", source: "lesson" },
      { french: "f", english: "f", source: "lesson" },
    ] }));
    expect(second.alreadyCompleted).toBe(true);
    expect(second.streak.current).toBe(1);
    expect(state.sessions).toHaveLength(2);
  });

  it("ignores card ids the user does not own", async () => {
    const { deps } = setup({ cards: [] });
    const result = await completeUserSession(deps, USER, session());
    expect(result.stats.reviews).toBe(0);
  });
});

describe("my words", () => {
  it("lists the deck and marks a word known or due again — only for the owner", async () => {
    const { deps, state } = setup({ cards: [makeCard(CARD_ID, newCardSchedule(NOW))] });
    expect((await listWords(deps, USER))[0]).toMatchObject({ id: CARD_ID, strength: "new" });

    const known = await updateWord(deps, USER, { cardId: CARD_ID, action: "known" });
    expect(known?.strength).toBe("known");
    expect(state.cards[0].schedule.intervalDays).toBeGreaterThanOrEqual(180);

    const again = await updateWord(deps, USER, { cardId: CARD_ID, action: "again" });
    expect(again?.dueAt).toBe(NOW.toISOString());

    expect(await updateWord(deps, USER, { cardId: "00000000-0000-4000-8000-000000000000", action: "known" })).toBeNull();
  });
});

describe("regional variants", () => {
  it("serves Latin American lessons and voice to a guest who picked them, and Spain by default", async () => {
    const { SPANISH } = await import("../domain/languages");
    const latam = loadGuestSession(SPANISH, NOW, "America/Mexico_City", "latam");
    expect(latam.profile.variant).toBe("latam");
    expect(latam.lesson.sentences.map((s) => s.fr).join(" ")).toMatch(/me da|carro|celular|chistosa|pesos/);

    const unknown = loadGuestSession(SPANISH, NOW, "Europe/Madrid", "klingon");
    expect(unknown.profile.variant).toBe("es");
  });

  it("generates AI lessons with the learner's variant", async () => {
    const { SPANISH } = await import("../domain/languages");
    const { deps, makeLesson } = setup({ profile: { level: "A2", timezone: "America/Bogota", dailyMinutes: 15, variant: "latam" } });
    const spanishDeps = { ...deps, pack: SPANISH };
    await loadUserSession(spanishDeps, USER, "America/Bogota");
    expect(makeLesson.mock.calls[0][0].aiDialect).toMatch(/Latin American/);
  });
});
