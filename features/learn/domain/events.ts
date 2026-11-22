import { z } from "zod";

/**
 * What the browser may report. Every event has its own small, strict set of
 * properties (flags and bounded counts, never text), so the public endpoint
 * can't be used to store junk, free text, or numbers that fake a trend.
 */
const flag = z.boolean();
const count = (max: number) => z.number().int().min(0).max(max);
const Language = z.enum(["fr", "es"]);

function clientEvent<Name extends string, Shape extends z.ZodRawShape>(name: Name, props: Shape) {
  return z.object({ name: z.literal(name), language: Language.optional(), props: z.object(props).partial().strict().optional() });
}

export const EventSchema = z.discriminatedUnion("name", [
  clientEvent("session_started", { first: flag, guest: flag }),
  clientEvent("session_finished", { guest: flag, new_words: count(100), reviews: count(1000) }),
  clientEvent("voice_download_started", {}),
  clientEvent("voice_enabled", {}),
  clientEvent("voice_download_failed", {}),
  clientEvent("reminder_saved", { enabled: flag, email: flag, push: flag }),
  clientEvent("weekly_summary_toggled", { enabled: flag }),
  clientEvent("group_nudges_toggled", { enabled: flag }),
  clientEvent("group_created", {}),
  clientEvent("group_joined", {}),
]);

/** What the browser sends. */
export type ClientEvent = z.infer<typeof EventSchema>;
export type ClientEventName = ClientEvent["name"];

/** Events only our own jobs write. The public endpoint refuses these, so nobody can fake "reminders are fine". */
export const SERVER_EVENT_NAMES = ["reminder_run", "weekly_summary_run", "group_nudge_run"] as const;
export type EventName = ClientEventName | (typeof SERVER_EVENT_NAMES)[number];

/** What gets stored: a client event, or a server-only one written by a job. */
export interface LearnEvent {
  readonly name: EventName;
  readonly language?: "fr" | "es";
  readonly props?: Readonly<Record<string, string | number | boolean>>;
}
