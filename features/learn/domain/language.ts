import type { Lesson, Level } from "./lessons";

export type LanguageId = "fr" | "es";

/** One way everyday speech differs from the written form ("je suis" → "chuis", "para" → "pa'"). */
export interface ReductionRule {
  readonly pattern: RegExp;
  /** Replacement; may use $1… for capture groups. Empty string = the word disappears. */
  readonly spoken: string;
  readonly why: string;
}

/**
 * Everything that differs between languages, as plain data. The engine
 * (spaced repetition, streaks, stages, steps, UI) is shared; a language is
 * just one of these plus its copy and visual world in the UI layer.
 */
export interface LanguagePack {
  readonly id: LanguageId;
  /** English name, used in prompts and labels: "French". */
  readonly name: string;
  readonly appName: string;
  readonly route: string;
  readonly api: string;
  /** BCP-47 locale for speech synthesis, recognition and dates. */
  readonly speechLocale: string;
  /** Where the accent the app teaches is from ("France"), for the voice-install hint. */
  readonly accentRegion: string;
  /** Voice names that tend to sound natural on common platforms. */
  readonly voiceHints: RegExp;
  readonly topics: readonly string[];
  readonly fallbackLessons: readonly Lesson[];
  /** Grammar and length guide per level, for the lesson generator. */
  readonly cefrGuide: Record<Level, string>;
  /** One sentence per level on what changes when moving up (matches cefrGuide). */
  readonly levelUpChanges: Record<Level, string>;
  /** Informal "you" the lessons use when addressing the learner. */
  readonly informalYou: string;
  /** Articles that may precede a vocabulary item but be absent in context. */
  readonly articles: readonly string[];
  /** Letters most keyboards hide. */
  readonly accents: readonly string[];
  readonly reductions: readonly ReductionRule[];
  readonly spokenNote: string;
  readonly tables: {
    readonly profiles: string;
    readonly streaks: string;
    readonly cards: string;
    /** Card text column ("french_text" predates multi-language). */
    readonly cardText: string;
    readonly lessons: string;
    readonly sessions: string;
    /** Table the reminder cron reads, or null when the language has no reminders yet. */
    readonly completionLog: string | null;
  };
}
