import { z } from "zod";
import { REMINDER_TIMES } from "./reminders";
import { isValidTimeZone } from "./dates";
import { LEVELS } from "./lessons";

export const TimeZoneSchema = z
  .string()
  .min(1)
  .max(64)
  .refine(isValidTimeZone, { message: "Unknown timezone" });

export const GradeSchema = z.enum(["again", "hard", "good", "easy"]);

export const ProfileUpdateSchema = z.object({
  level: z.enum(LEVELS),
  timezone: TimeZoneSchema,
  /** Optional so older clients (level picker only) keep working. */
  dailyMinutes: z.union([z.literal(15), z.literal(30), z.literal(60)]).optional(),
  /** Regional variant id; unknown ids fall back to the language's default (validated against the pack server-side). */
  variant: z.string().trim().min(1).max(20).optional(),
});
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

/** Caps keep a malicious client from stuffing a session with thousands of cards. */
export const MAX_REVIEWS_PER_SESSION = 15;
export const MAX_NEW_CARDS_PER_SESSION = 12;
/** A session that finishes faster than this cannot have involved real practice. */
export const MIN_SESSION_SECONDS = 90;
/** Reviews + new words that must be touched for a session to count toward the streak. */
export const MIN_SESSION_ACTIVITY = 3;

export const CARD_TEXT_MAX = 240;
export const CARD_NOTES_MAX = 400;

/** Trims to a schema limit with an ellipsis, so a long sentence can't make the whole session save fail validation. */
export function clipText(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export const NewCardSchema = z.object({
  french: z.string().trim().min(1).max(CARD_TEXT_MAX),
  english: z.string().trim().min(1).max(CARD_TEXT_MAX),
  notes: z.string().trim().max(CARD_NOTES_MAX).optional(),
  source: z.enum(["lesson", "error"]).default("lesson"),
});

/** The database stores at most two hours per session. */
export const MAX_SESSION_SECONDS = 7200;

export const SessionCompleteSchema = z.object({
  clientSessionId: z.string().uuid(),
  timezone: TimeZoneSchema,
  // A page left open in a tab for hours still counts: clamp rather than reject, or the learner could never save it.
  durationSeconds: z.number().int().min(1).transform((seconds) => Math.min(seconds, MAX_SESSION_SECONDS)),
  reviews: z
    .array(z.object({ cardId: z.string().uuid(), grade: GradeSchema }))
    .max(MAX_REVIEWS_PER_SESSION),
  newCards: z.array(NewCardSchema).max(MAX_NEW_CARDS_PER_SESSION),
  speakScore: z.number().min(0).max(1).nullable(),
  writingCorrect: z.boolean().nullable(),
});
export type SessionComplete = z.infer<typeof SessionCompleteSchema>;

/**
 * Browser push endpoints the server may call. Restricting hosts stops a crafted
 * "subscription" from making the reminder job request internal or arbitrary URLs.
 */
const PUSH_HOSTS = [/\.googleapis\.com$/, /\.push\.services\.mozilla\.com$/, /\.notify\.windows\.com$/, /^web\.push\.apple\.com$/, /\.push\.apple\.com$/];

export const PushSubscriptionSchema = z.object({
  endpoint: z
    .string()
    .url()
    .max(1000)
    .refine((value) => {
      const url = new URL(value);
      return url.protocol === "https:" && PUSH_HOSTS.some((host) => host.test(url.hostname));
    }, "Unsupported push service."),
  keys: z.object({ p256dh: z.string().min(10).max(200), auth: z.string().min(8).max(100) }),
});
export type PushSubscriptionInput = z.infer<typeof PushSubscriptionSchema>;

export const ReminderUpdateSchema = z.object({
  /** null turns the reminder off. */
  time: z.enum(REMINDER_TIMES).nullable(),
  timezone: TimeZoneSchema,
  email: z.boolean(),
  /** Omitted = keep the stored one; null = remove it (e.g. permission revoked). */
  push: PushSubscriptionSchema.nullable().optional(),
  /** Omitted = keep the stored choice. */
  weeklySummary: z.boolean().optional(),
  groupNudges: z.boolean().optional(),
});
export type ReminderUpdate = z.infer<typeof ReminderUpdateSchema>;

const DisplayNameSchema = z.string().trim().min(1, "Add a name your group will see.").max(30);

export const GroupActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), name: z.string().trim().min(1).max(40), displayName: DisplayNameSchema, timezone: TimeZoneSchema }),
  z.object({ action: z.literal("join"), code: z.string().trim().min(4).max(20), displayName: DisplayNameSchema, timezone: TimeZoneSchema }),
  z.object({ action: z.literal("leave") }),
  z.object({
    action: z.literal("post"),
    /** Storage path the client uploaded to: <groupId>/<YYYY-MM-DD>/<userId>.<ext>; verified server-side. */
    path: z.string().regex(/^[0-9a-f-]{36}\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\.(webm|ogg|m4a|mp4|mp3|aac)$/),
    durationMs: z.number().int().min(500).max(65000),
    timezone: TimeZoneSchema,
  }),
]);
export type GroupAction = z.infer<typeof GroupActionSchema>;

export const WordActionSchema = z.object({
  cardId: z.string().uuid(),
  action: z.enum(["known", "again"]),
});
export type WordAction = z.infer<typeof WordActionSchema>;

export const FeedbackRequestSchema = z.object({
  sentence: z.string().trim().min(2).max(300),
  /** Absent for a spoken answer, where no particular word is required. */
  targetWord: z.string().trim().min(1).max(40).optional(),
  level: z.enum(LEVELS),
  /** "spoken" = transcribed speech: punctuation and capitals are the recognizer's, not the learner's. */
  mode: z.enum(["written", "spoken"]).default("written"),
  /** The question a spoken answer replies to, so the corrector can judge relevance. */
  question: z.string().trim().min(2).max(200).optional(),
});
export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;

export const ERROR_TAGS = [
  "none",
  "gender",
  "agreement",
  "conjugation",
  "word-order",
  "preposition",
  "spelling",
  "vocabulary",
  "other",
] as const;

export const FeedbackSchema = z.object({
  isCorrect: z.boolean(),
  usedTarget: z.boolean(),
  corrected: z.string().min(1).max(300),
  translation: z.string().min(1).max(300),
  explanation: z.string().max(240),
  errorTag: z.enum(ERROR_TAGS),
});
export type Feedback = z.infer<typeof FeedbackSchema>;

export interface SessionEligibility {
  readonly eligible: boolean;
  readonly reason: string | null;
}

/**
 * The streak is client-reported, so this is a speed bump rather than proof —
 * but it closes the legacy hole where submitting *nothing* kept a streak alive.
 */
export function checkSessionEligibility(input: SessionComplete): SessionEligibility {
  if (input.durationSeconds < MIN_SESSION_SECONDS) {
    return { eligible: false, reason: "Session was too short to count." };
  }
  if (input.reviews.length + input.newCards.length < MIN_SESSION_ACTIVITY) {
    return { eligible: false, reason: "Practice at least a few words before finishing." };
  }
  return { eligible: true, reason: null };
}
