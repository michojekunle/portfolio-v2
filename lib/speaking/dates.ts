import type { CurriculumDay, DailySession, DayStatus } from "./types";

export const PROGRAMME_TIMEZONE = "Africa/Lagos";
export const PROGRAMME_START_DATE = "2026-11-30";
export const PROGRAMME_END_DATE = "2027-02-27";
export const PROGRAMME_TOTAL_DAYS = 90;

/** Returns YYYY-MM-DD in Africa/Lagos timezone using Intl.DateTimeFormat. */
export function getLagosDateString(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PROGRAMME_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Parses YYYY-MM-DD into [year, month, day] UTC numbers. */
function parseIsoDate(dateStr: string): [number, number, number] {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`Invalid YYYY-MM-DD date string: "${dateStr}"`);
  }
  return [parts[0], parts[1], parts[2]];
}

/** Pure calendar-day addition using Date.UTC so browser timezones never shift dates. */
export function addCalendarDays(dateStr: string, offsetDays: number): string {
  const [y, m, d] = parseIsoDate(dateStr);
  const utc = new Date(Date.UTC(y, m - 1, d + offsetDays));
  const yy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** Whole calendar days from `earlier` to `later` ("YYYY-MM-DD"). */
export function calendarDaysBetween(earlier: string, later: string): number {
  const [y1, m1, d1] = parseIsoDate(earlier);
  const [y2, m2, d2] = parseIsoDate(later);
  return Math.round(
    (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000
  );
}

/** Maps Day 1..90 to its fixed Africa/Lagos calendar date. */
export function getDateForDayNumber(dayNumber: number): string {
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > PROGRAMME_TOTAL_DAYS) {
    throw new Error(`Day number must be an integer between 1 and ${PROGRAMME_TOTAL_DAYS}`);
  }
  return addCalendarDays(PROGRAMME_START_DATE, dayNumber - 1);
}

/** Maps a YYYY-MM-DD Lagos date to Day 1..90, or null if outside the 90-day window. */
export function getDayNumberForDate(dateStr: string): number | null {
  const diff = calendarDaysBetween(PROGRAMME_START_DATE, dateStr);
  const dayNumber = diff + 1;
  if (dayNumber < 1 || dayNumber > PROGRAMME_TOTAL_DAYS) {
    return null;
  }
  return dayNumber;
}

export interface ProgrammeTimelineState {
  todayDateStr: string;
  programmeState: "before" | "active" | "completed";
  /** Exact day 1..90 if today falls inside the programme; null otherwise. */
  currentDayNumber: number | null;
  /** Focus day: 1 before start, current day during, 90 after end. */
  activeDayNumber: number;
  daysUntilStart: number;
  daysRemaining: number;
}

export function getProgrammeTimelineState(now: Date = new Date()): ProgrammeTimelineState {
  const todayDateStr = getLagosDateString(now);
  const diffFromStart = calendarDaysBetween(PROGRAMME_START_DATE, todayDateStr);
  const dayNumber = diffFromStart + 1;

  if (dayNumber < 1) {
    return {
      todayDateStr,
      programmeState: "before",
      currentDayNumber: null,
      activeDayNumber: 1,
      daysUntilStart: Math.abs(diffFromStart),
      daysRemaining: PROGRAMME_TOTAL_DAYS,
    };
  }

  if (dayNumber > PROGRAMME_TOTAL_DAYS) {
    return {
      todayDateStr,
      programmeState: "completed",
      currentDayNumber: null,
      activeDayNumber: PROGRAMME_TOTAL_DAYS,
      daysUntilStart: 0,
      daysRemaining: 0,
    };
  }

  return {
    todayDateStr,
    programmeState: "active",
    currentDayNumber: dayNumber,
    activeDayNumber: dayNumber,
    daysUntilStart: 0,
    daysRemaining: PROGRAMME_TOTAL_DAYS - dayNumber,
  };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatCalendarDate(dateStr: string, includeWeekday = true): string {
  const [y, m, d] = parseIsoDate(dateStr);
  const utc = new Date(Date.UTC(y, m - 1, d));
  const month = MONTH_NAMES[m - 1].slice(0, 3);
  if (!includeWeekday) return `${month} ${d}, ${y}`;
  const weekday = WEEKDAY_SHORT[utc.getUTCDay()];
  return `${weekday}, ${month} ${d}, ${y}`;
}

export function formatMonthShort(dateStr: string): string {
  const [, m, d] = parseIsoDate(dateStr);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}`;
}

/** Determines whether a session has any saved progress (without being completed). */
export function hasSessionWork(session: DailySession | undefined): boolean {
  if (!session) return false;
  return Boolean(
    session.status === "in_progress" ||
      session.prepCompleted ||
      session.firstTakeCompleted ||
      session.reviewCompleted ||
      session.secondTakeCompleted ||
      session.preparationNotes.trim() ||
      session.premPoint.trim() ||
      session.premReason.trim() ||
      session.premExample.trim() ||
      session.premMeaning.trim() ||
      session.firstRecordingUrl.trim() ||
      session.secondRecordingUrl.trim() ||
      session.finalRecordingUrl.trim() ||
      session.dailyLearningSummary.trim() ||
      session.reflectionNotes.trim() ||
      session.reflectionWhatLearned.trim()
  );
}

/**
 * Computes canonical DayStatus.
 * Never marks a day completed simply because the date has passed.
 */
export function computeDayStatus(
  dayDate: string,
  todayDateStr: string,
  session: DailySession | undefined
): DayStatus {
  if (session?.status === "completed") {
    return session.practiceOnly ? "practice_only" : "completed";
  }
  if (hasSessionWork(session)) {
    return "in_progress";
  }
  if (dayDate === todayDateStr) {
    return "today";
  }
  if (dayDate < todayDateStr) {
    return "missed";
  }
  return "upcoming";
}

/**
 * Computes current consecutive-day speaking streak up to `todayDateStr`.
 * A day counts as completed when `session.status === "completed"`.
 * If today is not yet completed, a streak active through yesterday is preserved.
 */
export function computeConsecutiveStreak(
  curriculum: Pick<CurriculumDay, "dayNumber" | "date">[],
  sessions: Record<number, DailySession>,
  todayDateStr: string
): number {
  const activeDay = getDayNumberForDate(todayDateStr);
  const maxDay =
    activeDay ??
    (todayDateStr > PROGRAMME_END_DATE ? PROGRAMME_TOTAL_DAYS : 0);
  if (maxDay === 0) return 0;

  const isDone = (dayNum: number): boolean =>
    sessions[dayNum]?.status === "completed";

  let cursor = maxDay;
  if (!isDone(cursor)) {
    cursor = maxDay - 1;
  }

  let streak = 0;
  while (cursor >= 1 && isDone(cursor)) {
    streak++;
    cursor--;
  }
  return streak;
}

export interface CalendarMonthGrid {
  key: string; // e.g. "2026-11"
  year: number;
  month: number; // 1-12
  label: string;
  leadingEmptyCells: number;
  cells: Array<{
    date: string;
    dayOfMonth: number;
    curriculumDayNumber: number | null;
  }>;
}

/** Builds the 4 programme months (Nov 2026 -> Feb 2027) for /speaking/calendar. */
export function getProgrammeCalendarMonths(): CalendarMonthGrid[] {
  const months: Array<{ year: number; month: number }> = [
    { year: 2026, month: 11 },
    { year: 2026, month: 12 },
    { year: 2027, month: 1 },
    { year: 2027, month: 2 },
  ];

  return months.map(({ year, month }) => {
    const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const cells: CalendarMonthGrid["cells"] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        date,
        dayOfMonth: d,
        curriculumDayNumber: getDayNumberForDate(date),
      });
    }

    return {
      key: `${year}-${String(month).padStart(2, "0")}`,
      year,
      month,
      label: `${MONTH_NAMES[month - 1]} ${year}`,
      leadingEmptyCells: firstWeekday,
      cells,
    };
  });
}
