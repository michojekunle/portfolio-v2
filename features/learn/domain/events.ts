import { z } from "zod";

/** Every event the app may record. A fixed list keeps the table clean and stops anyone filling it with junk. */
export const EVENT_NAMES = [
  "session_started",
  "session_finished",
  "onboarding_done",
  "voice_download_started",
  "voice_enabled",
  "voice_download_failed",
  "reminder_saved",
  "reminder_run",
  "group_created",
  "group_joined",
  "weekly_summary_run",
  "group_nudge_run",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

const PropValue = z.union([z.string().max(60), z.number().finite(), z.boolean()]);

/** Small flat properties only: no free text from learners ever belongs here. */
export const EventSchema = z.object({
  name: z.enum(EVENT_NAMES),
  language: z.enum(["fr", "es"]).optional(),
  props: z
    .record(z.string().regex(/^[a-z][a-z0-9_]{0,30}$/), PropValue)
    .refine((value) => Object.keys(value).length <= 8, "Too many properties")
    .optional(),
});

export type LearnEvent = z.infer<typeof EventSchema>;
