import type { LanguageId } from "./language";
import { localDateString } from "./dates";
import { localHour } from "./reminders";
import { groupStreak, type MemberActivity } from "./groups";

/** Local hour the group-streak nudge goes out: late enough that most people have had their day, early enough to still do a page. */
export const GROUP_NUDGE_HOUR = 19;
/** The nudge stops being useful (and becomes rude) late at night. */
export const GROUP_NUDGE_LAST_HOUR = 22;
/** A group streak shorter than this isn't worth a nudge. */
export const MIN_NUDGE_STREAK = 2;

export interface DigestState {
  readonly timezone: string;
  /** "HH:MM" the learner picked for reminders; the weekly summary arrives at that hour. */
  readonly time: string;
  readonly lastWeeklyOn: string | null;
  readonly lastNudgeOn: string | null;
  readonly lastSentOn: string | null;
}

function localWeekday(timezone: string, now: Date): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: timezone }).format(now);
}

/**
 * Sundays, from the learner's reminder hour onwards, once. "From" rather than "at":
 * scheduled jobs run late or get skipped, and a missed hour would otherwise cost a whole week.
 */
export function isWeeklySummaryDue(state: DigestState, now: Date): boolean {
  const wantedHour = Number(state.time.split(":")[0]);
  if (!Number.isInteger(wantedHour)) return false;
  if (state.lastWeeklyOn === localDateString(state.timezone, now)) return false;
  return localWeekday(state.timezone, now) === "Sun" && localHour(state.timezone, now) >= wantedHour;
}

/** From the nudge hour until late evening, once a day, and not on a day the learner already got their normal reminder. */
export function isNudgeHour(state: DigestState, now: Date): boolean {
  const today = localDateString(state.timezone, now);
  if (state.lastNudgeOn === today || state.lastSentOn === today) return false;
  const hour = localHour(state.timezone, now);
  return hour >= GROUP_NUDGE_HOUR && hour <= GROUP_NUDGE_LAST_HOUR;
}

/**
 * The group's streak as it stands going into tonight, when `learnerId` is
 * one of the people still missing today. Null when there's nothing to nudge about.
 */
export function nudgeStreak(members: readonly MemberActivity[], learnerId: string, today: string): number | null {
  const me = members.find((m) => m.userId === learnerId);
  if (!me || me.completedOn.includes(today)) return null;
  const streak = groupStreak(members, today);
  return streak >= MIN_NUDGE_STREAK ? streak : null;
}

export interface WeekSession {
  readonly sessionDate: string;
  readonly reviews: number;
  readonly reviewsRecalled: number;
  readonly newCards: number;
}

export interface WeekStats {
  readonly pages: number;
  readonly reviews: number;
  readonly recalledPercent: number | null;
  readonly newWords: number;
}

export function summariseWeek(sessions: readonly WeekSession[]): WeekStats {
  const reviews = sessions.reduce((sum, s) => sum + s.reviews, 0);
  const recalled = sessions.reduce((sum, s) => sum + s.reviewsRecalled, 0);
  return {
    pages: new Set(sessions.map((s) => s.sessionDate)).size,
    reviews,
    recalledPercent: reviews > 0 ? Math.round((recalled / reviews) * 100) : null,
    newWords: sessions.reduce((sum, s) => sum + s.newCards, 0),
  };
}

export interface DigestMessage {
  readonly language: LanguageId;
  readonly title: string;
  readonly body: string;
  readonly url: string;
}

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

/** Written in the language being learned, like the daily reminder. */
export function weeklySummaryMessage(language: LanguageId, stats: WeekStats, streak: number): DigestMessage {
  if (stats.pages === 0) {
    return language === "fr"
      ? { language, title: "Ta semaine en français", body: "Pas de page cette semaine. Une seule page de dix minutes suffit pour relancer ta série.", url: "/french?start=1&source=weekly" }
      : { language, title: "Tu semana en español", body: "Esta semana no hubo páginas. Una sola página de diez minutos basta para retomar tu racha.", url: "/spanish?start=1&source=weekly" };
  }
  const recalled = stats.recalledPercent === null ? "" : language === "fr" ? ` (${stats.recalledPercent} % retenues)` : ` (${stats.recalledPercent} % recordadas)`;
  if (language === "fr") {
    return {
      language,
      title: "Ta semaine en français",
      body: `${plural(stats.pages, "page", "pages")}, ${plural(stats.reviews, "carte revue", "cartes revues")}${recalled}, ${plural(stats.newWords, "mot nouveau", "mots nouveaux")}. Série en cours : ${plural(streak, "jour", "jours")}.`,
      url: "/french?start=1&source=weekly",
    };
  }
  return {
    language,
    title: "Tu semana en español",
    body: `${plural(stats.pages, "página", "páginas")}, ${plural(stats.reviews, "tarjeta repasada", "tarjetas repasadas")}${recalled}, ${plural(stats.newWords, "palabra nueva", "palabras nuevas")}. Racha actual: ${plural(streak, "día", "días")}.`,
    url: "/spanish?start=1&source=weekly",
  };
}

export function groupNudgeMessage(language: LanguageId, streak: number): DigestMessage {
  return language === "fr"
    ? { language, title: `La série de ton groupe (${streak} jours) se joue ce soir`, body: "Il ne manque que ta page. Dix minutes suffisent.", url: "/french?start=1&source=group-nudge" }
    : { language, title: `La racha de tu grupo (${streak} días) se juega esta noche`, body: "Solo falta tu página. Diez minutos bastan.", url: "/spanish?start=1&source=group-nudge" };
}
