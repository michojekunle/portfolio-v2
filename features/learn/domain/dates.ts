/**
 * Timezone-aware day boundaries.
 *
 * The legacy streak code rolled the day over at UTC midnight, which is 1 AM in
 * Lagos but 4 PM in Los Angeles — a learner could "lose" a streak mid-afternoon.
 * Every day boundary here is computed in the learner's own IANA timezone.
 */

export const FALLBACK_TIME_ZONE = "UTC";

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch (error) {
    if (error instanceof RangeError) return false;
    throw error;
  }
}

export function resolveTimeZone(timeZone: string | null | undefined): string {
  return timeZone && isValidTimeZone(timeZone) ? timeZone : FALLBACK_TIME_ZONE;
}

/** "YYYY-MM-DD" for `now` as seen from `timeZone`. */
export function localDateString(timeZone: string, now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: resolveTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function readPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  const part = parts.find((p) => p.type === type);
  if (!part) throw new Error(`Intl.DateTimeFormat did not return a "${type}" part`);
  return Number(part.value);
}

/** Milliseconds the zone is ahead of UTC at `instant` (negative when behind). */
function zoneOffsetMs(timeZone: string, instant: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);

  const asUtc = Date.UTC(
    readPart(parts, "year"),
    readPart(parts, "month") - 1,
    readPart(parts, "day"),
    readPart(parts, "hour"),
    readPart(parts, "minute"),
    readPart(parts, "second")
  );
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** The UTC instant at which the learner's current local day ends. */
export function endOfLocalDay(timeZone: string, now: Date): Date {
  const zone = resolveTimeZone(timeZone);
  const [year, month, day] = localDateString(zone, now).split("-").map(Number);
  const naiveNextMidnight = Date.UTC(year, month - 1, day + 1, 0, 0, 0);
  // Two passes so a DST change between "now" and midnight still lands correctly.
  const firstPass = naiveNextMidnight - zoneOffsetMs(zone, new Date(naiveNextMidnight));
  return new Date(naiveNextMidnight - zoneOffsetMs(zone, new Date(firstPass)));
}

/** Whole days from `earlier` to `later`, both "YYYY-MM-DD". */
export function daysBetween(earlier: string, later: string): number {
  const toUtc = (date: string): number => {
    const [y, m, d] = date.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtc(later) - toUtc(earlier)) / 86_400_000);
}
