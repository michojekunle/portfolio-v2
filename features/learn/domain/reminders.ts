import { localDateString } from "./dates";

/** Times offered in settings. Hourly, because the reminder job runs once an hour. */
export const REMINDER_TIMES = ["07:00", "08:00", "12:00", "18:00", "20:00", "21:00", "22:00"] as const;
export type ReminderTime = (typeof REMINDER_TIMES)[number];

export interface ReminderState {
  /** "HH:MM" in the learner's own time zone. */
  readonly time: string;
  readonly timezone: string;
  /** Local date (YYYY-MM-DD) the last reminder went out, so a learner gets at most one a day. */
  readonly lastSentOn: string | null;
  /** Local date the learner last finished a page in this language. */
  readonly lastCompletedOn: string | null;
}

function localHour(timezone: string, now: Date): number {
  const hour = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: timezone }).format(now);
  return Number(hour);
}

/**
 * Send now? Yes when it is the learner's chosen hour where they live, today's
 * page isn't done yet, and nothing was sent today. Hour granularity matches
 * the hourly job; a missed run simply means no nag that day, never two.
 */
export function isReminderDue(state: ReminderState, now: Date): boolean {
  const [hourText] = state.time.split(":");
  const wantedHour = Number(hourText);
  if (!Number.isInteger(wantedHour) || wantedHour < 0 || wantedHour > 23) return false;

  const today = localDateString(state.timezone, now);
  if (state.lastSentOn === today) return false;
  if (state.lastCompletedOn === today) return false;
  return localHour(state.timezone, now) === wantedHour;
}
