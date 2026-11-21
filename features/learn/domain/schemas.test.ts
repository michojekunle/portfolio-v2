import { describe, expect, it } from "vitest";
import {
  CARD_NOTES_MAX,
  GroupActionSchema,
  NewCardSchema,
  PushSubscriptionSchema,
  clipText,
  FeedbackRequestSchema,
  SessionCompleteSchema,
  checkSessionEligibility,
  type SessionComplete,
} from "./schemas";

const validSession: SessionComplete = {
  clientSessionId: "7d9e1c2a-5b3f-4e8a-b1c0-2f4a6c8e0d12",
  timezone: "Africa/Lagos",
  durationSeconds: 600,
  reviews: [
    { cardId: "3f6c8f0e-2b7a-4c1d-9e6a-1a2b3c4d5e6f", grade: "good" },
    { cardId: "9a1b2c3d-4e5f-4a6b-8c7d-0e1f2a3b4c5d", grade: "again" },
  ],
  newCards: [{ french: "je voudrais", english: "I would like", source: "lesson" }],
  speakScore: 0.85,
  writingCorrect: true,
};

describe("SessionCompleteSchema", () => {
  it("accepts a well-formed session", () => {
    expect(SessionCompleteSchema.safeParse(validSession).success).toBe(true);
  });

  it("requires a uuid idempotency key", () => {
    expect(SessionCompleteSchema.safeParse({ ...validSession, clientSessionId: "abc" }).success).toBe(false);
  });

  it("rejects an unknown timezone", () => {
    expect(SessionCompleteSchema.safeParse({ ...validSession, timezone: "Mars/Base" }).success).toBe(false);
  });

  it("rejects a non-uuid card id so arbitrary rows cannot be targeted", () => {
    const bad = { ...validSession, reviews: [{ cardId: "1 OR 1=1", grade: "good" }] };
    expect(SessionCompleteSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an unknown grade", () => {
    const bad = { ...validSession, reviews: [{ cardId: "3f6c8f0e-2b7a-4c1d-9e6a-1a2b3c4d5e6f", grade: "perfect" }] };
    expect(SessionCompleteSchema.safeParse(bad).success).toBe(false);
  });

  it("caps reviews so a client cannot submit an unbounded batch", () => {
    const reviews = Array.from({ length: 16 }, () => ({ cardId: "3f6c8f0e-2b7a-4c1d-9e6a-1a2b3c4d5e6f", grade: "good" as const }));
    expect(SessionCompleteSchema.safeParse({ ...validSession, reviews }).success).toBe(false);
  });

  it("rejects a speak score outside 0..1", () => {
    expect(SessionCompleteSchema.safeParse({ ...validSession, speakScore: 1.4 }).success).toBe(false);
  });

  it("defaults a new card's source to 'lesson'", () => {
    const parsed = SessionCompleteSchema.parse({ ...validSession, newCards: [{ french: "sans", english: "without" }] });
    expect(parsed.newCards[0].source).toBe("lesson");
  });
});

describe("checkSessionEligibility", () => {
  it("passes a real session", () => {
    expect(checkSessionEligibility(validSession).eligible).toBe(true);
  });

  it("rejects an instant 'completion'", () => {
    const result = checkSessionEligibility({ ...validSession, durationSeconds: 5 });
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/too short/i);
  });

  it("rejects a long session with no practice in it", () => {
    const result = checkSessionEligibility({ ...validSession, reviews: [], newCards: [] });
    expect(result.eligible).toBe(false);
  });
});

describe("FeedbackRequestSchema", () => {
  it("trims and accepts a normal sentence", () => {
    const parsed = FeedbackRequestSchema.parse({ sentence: "  Je voudrais un café.  ", targetWord: "je voudrais", level: "A2" });
    expect(parsed.sentence).toBe("Je voudrais un café.");
  });

  it("rejects an oversized sentence", () => {
    expect(FeedbackRequestSchema.safeParse({ sentence: "a".repeat(301), targetWord: "x", level: "A2" }).success).toBe(false);
  });
});

describe("clipText", () => {
  it("leaves short text alone and clips long text to the limit", () => {
    expect(clipText("  bonjour ", 10)).toBe("bonjour");
    const clipped = clipText("a".repeat(500), 400);
    expect(clipped).toHaveLength(400);
    expect(clipped.endsWith("…")).toBe(true);
  });

  it("produces notes the schema accepts even from a maximal sentence and explanation", () => {
    const notes = clipText(`You wrote: “${"x".repeat(300)}” — ${"y".repeat(240)}`, CARD_NOTES_MAX);
    expect(NewCardSchema.safeParse({ french: "Bonjour.", english: "Hello.", notes, source: "error" }).success).toBe(true);
  });
});

describe("PushSubscriptionSchema", () => {
  const keys = { p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM", auth: "tBHItJI5svbpez7KI4CCXg" };

  it("accepts real browser push services", () => {
    for (const endpoint of ["https://fcm.googleapis.com/fcm/send/abc", "https://updates.push.services.mozilla.com/wpush/v2/abc", "https://web.push.apple.com/QF1"]) {
      expect(PushSubscriptionSchema.safeParse({ endpoint, keys }).success).toBe(true);
    }
  });

  it("rejects anything that would make the server call an arbitrary or internal URL", () => {
    for (const endpoint of ["http://fcm.googleapis.com/x", "https://169.254.169.254/latest", "https://evil.com/fcm.googleapis.com", "https://localhost/push"]) {
      expect(PushSubscriptionSchema.safeParse({ endpoint, keys }).success).toBe(false);
    }
  });
});

describe("GroupActionSchema", () => {
  const group = "3f2b6a1e-8c4d-4e5f-9a0b-1c2d3e4f5a6b";
  const user = "7d9e1c2a-5b3f-4e8a-b1c0-2f4a6c8e0d12";

  it("accepts a well-formed voice note path", () => {
    expect(GroupActionSchema.safeParse({ action: "post", path: `${group}/2026-11-21/${user}.webm`, durationMs: 12000, timezone: "Africa/Lagos" }).success).toBe(true);
  });

  it("rejects path traversal and other file shapes", () => {
    for (const path of [`${group}/../${user}.webm`, `${group}/2026-11-21/${user}.exe`, `/${group}/2026-11-21/${user}.webm`, `${group}/2026-11-21/../../secret.webm`]) {
      expect(GroupActionSchema.safeParse({ action: "post", path, durationMs: 12000, timezone: "Africa/Lagos" }).success).toBe(false);
    }
  });

  it("requires a display name when joining or creating", () => {
    expect(GroupActionSchema.safeParse({ action: "join", code: "ABCDEFGH", displayName: "  " }).success).toBe(false);
    expect(GroupActionSchema.safeParse({ action: "create", name: "Les matinaux", displayName: "Mo", timezone: "Africa/Lagos" }).success).toBe(true);
  });
});
