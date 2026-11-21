import { z } from "zod";

export const LEVELS = ["A1", "A2", "B1", "B2"] as const;
export type Level = (typeof LEVELS)[number];
export const DEFAULT_LEVEL: Level = "A2";

/**
 * `fr` holds the sentence in the language being learned (French or Spanish).
 * The name predates Spanish; it's kept because lessons are stored as JSON and
 * the AI is asked for this exact shape.
 */
const GlossSchema = z.object({
  fr: z.string().min(1).max(60),
  en: z.string().min(1).max(80),
});

const SentenceSchema = z.object({
  fr: z.string().min(2).max(240),
  en: z.string().min(2).max(240),
  /**
   * Meaning in context of the other words in the line (vocab items excluded),
   * so a tap on ANY word explains it. Optional: older stored lessons lack it.
   */
  gloss: z.array(GlossSchema).max(16).optional(),
});

const VocabSchema = z.object({
  fr: z.string().min(1).max(80),
  en: z.string().min(1).max(120),
  note: z.string().max(160).optional(),
});

/**
 * One day's lesson. Sized for ~12 minutes: 6 sentences to read/hear, a handful
 * of words to keep, one line to say aloud, one sentence to write.
 */
export const LessonSchema = z.object({
  title: z.string().min(2).max(80),
  topic: z.string().min(2).max(80),
  level: z.enum(LEVELS),
  sentences: z.array(SentenceSchema).min(4).max(8),
  vocab: z.array(VocabSchema).min(3).max(6),
  shadow: SentenceSchema,
  write: z.object({
    prompt: z.string().min(4).max(200),
    targetWord: z.string().min(1).max(40),
  }),
  /** A question the learner answers out loud in their own words. Optional: older cached lessons lack it. */
  ask: SentenceSchema.optional(),
});
export type Lesson = z.infer<typeof LessonSchema>;
export type LessonVocab = z.infer<typeof VocabSchema>;
export type Gloss = z.infer<typeof GlossSchema>;

/** Topics rotate so consecutive days never feel like the same lesson. */
export function topicForDate(topics: readonly string[], localDate: string): string {
  return topics[dayIndex(localDate, topics.length)];
}

/** The hand-written lesson for a day: used for guests, new users and AI outages. */
export function fallbackLessonFor(lessons: readonly Lesson[], localDate: string): Lesson {
  return lessons[dayIndex(localDate, lessons.length)];
}

function dayIndex(localDate: string, length: number): number {
  const daysSinceEpoch = Math.floor(Date.parse(`${localDate}T00:00:00Z`) / 86_400_000);
  return ((daysSinceEpoch % length) + length) % length;
}
