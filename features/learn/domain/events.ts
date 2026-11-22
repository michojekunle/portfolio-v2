import { z } from "zod";

/** Events the browser may report. A fixed list keeps the table clean and stops anyone filling it with junk. */
export const CLIENT_EVENT_NAMES = [
  "session_started",
  "session_finished",
  "onboarding_done",
  "voice_download_started",
  "voice_enabled",
  "voice_download_failed",
  "reminder_saved",
  "group_created",
  "group_joined",
] as const;

/** Events only our own jobs write. The public endpoint refuses these, so nobody can fake "reminders are fine". */
export const SERVER_EVENT_NAMES = ["reminder_run", "weekly_summary_run", "group_nudge_run"] as const;

export type ClientEventName = (typeof CLIENT_EVENT_NAMES)[number];
export type EventName = ClientEventName | (typeof SERVER_EVENT_NAMES)[number];

const PropValue = z.union([z.string().max(60), z.number().finite(), z.boolean()]);

/** Small flat properties only: no free text from learners ever belongs here. */
export const EventSchema = z.object({
  name: z.enum(CLIENT_EVENT_NAMES),
  language: z.enum(["fr", "es"]).optional(),
  props: z
    .record(z.string().regex(/^[a-z][a-z0-9_]{0,30}$/), PropValue)
    .refine((value) => Object.keys(value).length <= 8, "Too many properties")
    .optional(),
});

/** What the browser sends. */
export type ClientEvent = z.infer<typeof EventSchema>;

/** What gets stored: a client event, or a server-only one written by a job. */
export interface LearnEvent {
  readonly name: EventName;
  readonly language?: "fr" | "es";
  readonly props?: Readonly<Record<string, string | number | boolean>>;
}
