import { daysBetween } from "./dates";

export const MAX_GROUP_SIZE = 5;

/** Unambiguous alphabet (no 0/O, 1/I/L) so a code read aloud or typed from a screenshot just works. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const INVITE_CODE_LENGTH = 8;

/** Cryptographically random invite code. `randomValues` is injectable for tests. */
export function generateInviteCode(randomValues: (bytes: Uint8Array) => Uint8Array = (b) => crypto.getRandomValues(b)): string {
  const bytes = randomValues(new Uint8Array(INVITE_CODE_LENGTH));
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

export function normaliseInviteCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export interface MemberActivity {
  readonly userId: string;
  readonly displayName: string;
  /** Local date the member joined (YYYY-MM-DD). */
  readonly joinedOn: string;
  /** Local dates they finished a page. */
  readonly completedOn: readonly string[];
}

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Days in a row on which everyone who was in the group finished a page.
 * Today counts if everyone's done; otherwise the streak is still alive from
 * yesterday (it only breaks once a whole day passes with someone missing).
 * A member is only counted from the day they joined.
 */
/** How far back the group streak looks; the activity query fetches the same window. */
export const GROUP_STREAK_MAX_DAYS = 366;

export function groupStreak(members: readonly MemberActivity[], today: string): number {
  if (members.length === 0) return 0;
  const sets = members.map((m) => ({ joinedOn: m.joinedOn, done: new Set(m.completedOn) }));
  const everyoneDone = (date: string): boolean => {
    // joinedOn is a UTC date while completions are local, so the join day itself only counts if they finished it.
    const present = sets.filter((m) => m.joinedOn < date || m.done.has(date));
    return present.length > 0 && present.every((m) => m.done.has(date));
  };

  let streak = 0;
  let day = everyoneDone(today) ? today : shiftDate(today, -1);
  const earliest = members.reduce((min, m) => (m.joinedOn < min ? m.joinedOn : min), members[0].joinedOn);
  while (day >= earliest && everyoneDone(day) && streak < GROUP_STREAK_MAX_DAYS) {
    streak += 1;
    day = shiftDate(day, -1);
  }
  return streak;
}

export interface TodayStatus {
  readonly done: number;
  readonly total: number;
  readonly doneIds: ReadonlySet<string>;
}

export function todayStatus(members: readonly MemberActivity[], today: string): TodayStatus {
  const doneIds = new Set(members.filter((m) => m.completedOn.includes(today)).map((m) => m.userId));
  return { done: doneIds.size, total: members.length, doneIds };
}

/** Days since a member last finished a page (0 = today), or null if never. */
export function daysSinceLast(member: MemberActivity, today: string): number | null {
  const last = [...member.completedOn].sort().at(-1);
  return last ? daysBetween(last, today) : null;
}
