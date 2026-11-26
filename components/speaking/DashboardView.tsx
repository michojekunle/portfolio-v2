"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Clock,
  Flame,
  CalendarDays,
  Lightbulb,
  Mic,
  Share2,
  Sparkles,
  Users,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { CURRICULUM_DAYS, getCurriculumDay, getWeekDays } from "@/lib/speaking/curriculum";
import {
  computeDayStatus,
  formatCalendarDate,
  formatMonthShort,
} from "@/lib/speaking/dates";
import {
  getAudienceOption,
  getFormatGuide,
  getPhaseForDay,
  getWeekMetaForDay,
  PROGRAMME_INFO,
} from "@/lib/speaking/methodology";
import { computeProgressMetrics } from "@/lib/speaking/analytics";
import type { DayStatus, SpeakingWorkspaceData, WeeklyChallengeRecord } from "@/lib/speaking/types";
import { StatusBadge } from "./StatusBadge";
import { QuickIdeaCapture } from "./IdeaBankDrawer";
import { cn } from "@/lib/utils";

type DashboardMode = "simplified" | "robust";
const MODE_STORAGE_KEY = "speaking_ledger_dashboard_mode";

interface DashboardViewProps {
  data: SpeakingWorkspaceData;
}

function formatDayShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][
    new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  ];
  return `${weekday} ${d}`;
}

function humanStatusLabel(status: DayStatus): string {
  switch (status) {
    case "today":
      return "Today";
    case "completed":
      return "Completed";
    case "practice_only":
      return "Practice-only";
    case "in_progress":
      return "In progress";
    case "missed":
      return "Missed";
    case "upcoming":
      return "Upcoming";
  }
}

export function DashboardView({ data }: DashboardViewProps): React.ReactElement {
  const [mode, setMode] = useState<DashboardMode>("simplified");
  const [weeklyChallenges, setWeeklyChallenges] = useState<Record<number, WeeklyChallengeRecord>>(
    data.weeklyChallenges
  );
  const [recentIdeas, setRecentIdeas] = useState(data.ideas.slice(0, 3));
  const [togglingChallenge, setTogglingChallenge] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_STORAGE_KEY);
      if (saved === "simplified" || saved === "robust") {
        setMode(saved);
      }
    } catch {
      // Ignore storage failures
    }
  }, []);

  const switchMode = (next: DashboardMode): void => {
    setMode(next);
    try {
      localStorage.setItem(MODE_STORAGE_KEY, next);
    } catch {
      // Ignore storage failures
    }
  };

  const activeDay = getCurriculumDay(data.activeDayNumber) ?? CURRICULUM_DAYS[0];
  const tomorrowDay =
    activeDay.dayNumber < 90 ? getCurriculumDay(activeDay.dayNumber + 1) : undefined;
  const phase = getPhaseForDay(activeDay.dayNumber);
  const weekMeta = getWeekMetaForDay(activeDay.dayNumber);
  const weekDays = getWeekDays(activeDay.weekNumber);
  const activeSession = data.sessions[activeDay.dayNumber];
  const activeStatus = computeDayStatus(activeDay.date, data.todayDateStr, activeSession);
  const activeFormat = getFormatGuide(activeSession?.selectedFormat ?? activeDay.recommendedFormat);
  const activeAudience = getAudienceOption(
    activeSession?.selectedAudience ?? activeDay.recommendedAudience
  );

  const metrics = computeProgressMetrics({
    curriculum: CURRICULUM_DAYS,
    sessions: data.sessions,
    assessments: data.assessments,
    publications: data.publications,
    weeklyChallenges,
    weeklyReviews: data.weeklyReviews,
    todayDateStr: data.todayDateStr,
  });

  const currentChallenge = weeklyChallenges[weekMeta.weekNumber];

  const handleToggleChallenge = async (): Promise<void> => {
    if (!currentChallenge) return;
    const nextCompleted = !currentChallenge.completed;
    setTogglingChallenge(true);
    setWeeklyChallenges((prev) => ({
      ...prev,
      [weekMeta.weekNumber]: {
        ...currentChallenge,
        completed: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : null,
      },
    }));

    try {
      const res = await fetch("/api/speaking/weekly", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "challenge",
          weekNumber: weekMeta.weekNumber,
          completed: nextCompleted,
          reflection: currentChallenge.reflection,
        }),
      });
      if (!res.ok) throw new Error("Failed to update weekly challenge");
      toast.success(
        nextCompleted
          ? `Week ${weekMeta.weekNumber} challenge completed`
          : `Week ${weekMeta.weekNumber} challenge reopened`
      );
    } catch {
      setWeeklyChallenges((prev) => ({
        ...prev,
        [weekMeta.weekNumber]: currentChallenge,
      }));
      toast.error("Could not update weekly challenge");
    } finally {
      setTogglingChallenge(false);
    }
  };

  const checklistState = [
    Boolean(
      activeSession?.prepCompleted ||
        activeSession?.preparationNotes.trim() ||
        activeSession?.premPoint.trim()
    ),
    Boolean(activeSession?.firstTakeCompleted),
    Boolean(activeSession?.reviewCompleted),
    Boolean(activeSession?.secondTakeCompleted),
    Boolean(
      activeSession?.reflectionWhatWorked.trim() ||
        activeSession?.reflectionWhatLearned.trim() ||
        activeSession?.reflectionNotes.trim()
    ),
    Boolean(
      activeSession?.practiceOnly ||
        (data.publications[activeDay.dayNumber] ?? []).some((p) => p.published)
    ),
  ];

  const phaseLabelShort =
    phase.number === 1 ? "FOUNDATION" : phase.number === 2 ? "DEPTH" : "INFLUENCE";

  const paddedDay = String(activeDay.dayNumber).padStart(2, "0");
  const paddedCompleted = String(metrics.daysCompleted).padStart(2, "0");
  const sessionButtonLabel =
    activeStatus === "completed" || activeStatus === "practice_only"
      ? "Review today's session"
      : activeStatus === "in_progress"
      ? "Continue today's session"
      : "Start today's session";

  const sessionPillLabel =
    activeStatus === "completed"
      ? "Completed"
      : activeStatus === "practice_only"
      ? "Practice-only"
      : activeStatus === "in_progress"
      ? "In progress"
      : "Not started";

  const quickActionTiles = [
    {
      href: `/speaking/day/${activeDay.dayNumber}`,
      label: "Practice",
      icon: Mic,
    },
    {
      href: "/speaking/calendar",
      label: "Calendar",
      icon: CalendarDays,
    },
    {
      href: "/speaking/journal?tab=ideas",
      label: "Ideas",
      icon: Lightbulb,
    },
    {
      href: "/speaking/progress",
      label: "Stats",
      icon: BarChart3,
    },
  ];

  // ── Mode Switcher Bar ───────────────────────────────────────────────────────
  const modeSwitcher = (
    <div
      role="group"
      aria-label="Dashboard view mode"
      className="inline-flex items-center rounded-[4px] border border-(--rule) bg-(--paper) p-0.5 shrink-0"
    >
      <button
        type="button"
        aria-pressed={mode === "simplified"}
        onClick={() => switchMode("simplified")}
        className={cn(
          "rounded-[2px] px-3 py-1.5 min-h-[34px] font-mono text-[11px] uppercase tracking-[0.12em] cursor-pointer transition-colors",
          mode === "simplified"
            ? "bg-(--ink) text-(--bg)"
            : "text-(--ink-2) hover:text-(--ink)"
        )}
      >
        Simplified
      </button>
      <button
        type="button"
        aria-pressed={mode === "robust"}
        onClick={() => switchMode("robust")}
        className={cn(
          "rounded-[2px] px-3 py-1.5 min-h-[34px] font-mono text-[11px] uppercase tracking-[0.12em] cursor-pointer transition-colors",
          mode === "robust"
            ? "bg-(--ink) text-(--bg)"
            : "text-(--ink-2) hover:text-(--ink)"
        )}
      >
        Robust
      </button>
    </div>
  );

  // ── SIMPLIFIED DASHBOARD (OPay-inspired focused clarity) ────────────────────
  if (mode === "simplified") {
    const progressPct =
      metrics.daysCompleted > 0
        ? metrics.completionPercentage
        : Math.round((activeDay.dayNumber / 90) * 1000) / 10;

    return (
      <div className="max-w-[780px] space-y-4">
        {/* Top bar with Date & Mode Switcher */}
        <div className="flex items-center justify-between gap-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2) tabular-nums truncate">
            {formatCalendarDate(data.todayDateStr)}
          </div>
          {modeSwitcher}
        </div>

        {/* Unified Primary Card */}
        <div className="rounded-[6px] border border-(--rule) bg-(--paper) divide-y divide-(--rule-2)">
          {/* 1. Header + Progress Hero (Wallet Card analog) */}
          <div className="p-4 sm:p-7 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <h1 className="font-display text-xl sm:text-2xl font-normal tracking-[-0.02em] text-(--ink) m-0">
                  {PROGRAMME_INFO.name}
                </h1>
                <p className="text-xs sm:text-sm text-(--ink-2) m-0">
                  90 days of ideas and conversations
                </p>
              </div>
              <span className="rounded-full border border-(--good)/35 bg-(--good)/12 px-2.5 py-0.5 font-mono text-[11px] font-medium text-(--good) shrink-0">
                {data.programmeState === "before"
                  ? "Upcoming"
                  : data.programmeState === "completed"
                  ? "Completed"
                  : "In progress"}
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
                    Your Progress
                  </div>
                  <div className="font-sans text-2xl font-semibold tracking-tight text-(--ink) tabular-nums mt-0.5">
                    {paddedCompleted}{" "}
                    <span className="text-(--ink-3) font-normal">/ 90</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-sans text-lg font-medium text-(--ink) tabular-nums">
                    {metrics.completionPercentage}%
                  </div>
                  <div className="text-xs text-(--ink-2)">
                    Streak: {metrics.currentStreak}d
                  </div>
                </div>
              </div>

              <div
                className="h-1.5 w-full rounded-full bg-(--bg-2) overflow-hidden"
                role="progressbar"
                aria-valuenow={metrics.completionPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="90-day speaking completion progress"
              >
                <div
                  className="h-full rounded-full bg-(--good) transition-all duration-300"
                  style={{
                    width: `${
                      metrics.daysCompleted > 0
                        ? Math.min(100, metrics.completionPercentage)
                        : Math.min(100, Math.max(1.1, progressPct * 0.15))
                    }%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2) gap-2 flex-wrap">
                <span>{phaseLabelShort}</span>
                <span className="tabular-nums">30 NOV 2026 – 27 FEB 2027</span>
              </div>
            </div>

            {/* OPay-style 4-Icon Quick Actions Strip */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {quickActionTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <Link
                    key={tile.label}
                    href={tile.href}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-[6px] border border-(--rule) bg-(--bg) py-2.5 px-1.5 min-h-[62px] text-(--ink) no-underline hover:border-(--ink) transition-colors"
                  >
                    <Icon className="h-4 w-4 text-(--ink)" strokeWidth={1.7} aria-hidden="true" />
                    <span className="text-[11px] font-medium leading-none">{tile.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 2. Today's Assignment + Primary CTA */}
          <div className="p-4 sm:p-7 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2) tabular-nums">
                  {data.programmeState === "before"
                    ? `STARTS MON, NOV 30 · DAY ${paddedDay}`
                    : `TODAY · DAY ${paddedDay}`}
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 font-mono text-[11px] shrink-0",
                    activeStatus === "completed" || activeStatus === "practice_only"
                      ? "border-(--good)/40 bg-(--good)/15 text-(--good)"
                      : activeStatus === "in_progress"
                      ? "border-(--ink)/30 bg-(--bg-2) text-(--ink)"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  )}
                >
                  {sessionPillLabel}
                </span>
              </div>

              <h2 className="font-display text-[clamp(1.3rem,2.6vw,1.75rem)] font-normal leading-snug text-(--ink) m-0">
                {activeDay.topic}
              </h2>
              <p className="text-sm text-(--ink-2) leading-relaxed m-0">
                {activeDay.description}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="rounded-full border border-(--rule) bg-(--bg-2) px-2.5 py-0.5 text-[11px] text-(--ink-2)">
                  {activeDay.skill}
                </span>
                <span className="rounded-full border border-(--rule) bg-(--bg-2) px-2.5 py-0.5 text-[11px] text-(--ink-2)">
                  {activeDay.duration}
                </span>
                <span className="rounded-full border border-(--rule) bg-(--bg-2) px-2.5 py-0.5 text-[11px] text-(--ink-2)">
                  {activeFormat.label}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-medium text-(--ink)">
                Today&apos;s thinking prompts
              </div>
              <ul className="space-y-1 pl-4 m-0 text-sm text-(--ink-2) leading-relaxed list-disc">
                {activeDay.thinkingPrompts.slice(0, 4).map((prompt, idx) => (
                  <li key={idx}>{prompt}</li>
                ))}
              </ul>
            </div>

            {/* High-Contrast Single Primary Action */}
            <Link
              href={`/speaking/day/${activeDay.dayNumber}`}
              className="flex items-center justify-center gap-2 w-full rounded-[6px] bg-(--ink) text-(--bg) px-4 py-3 min-h-[48px] text-sm font-medium no-underline hover:opacity-90 transition-opacity"
            >
              {sessionButtonLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* 3. Tomorrow's Topic */}
          <div className="p-4 sm:p-7">
            {tomorrowDay ? (
              <Link
                href={`/speaking/day/${tomorrowDay.dayNumber}`}
                className="flex items-center justify-between gap-3 no-underline group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2) tabular-nums">
                    Tomorrow · Day {String(tomorrowDay.dayNumber).padStart(2, "0")}
                  </div>
                  <div className="text-sm font-medium text-(--ink) group-hover:underline truncate">
                    {tomorrowDay.topic}
                  </div>
                </div>
                <ChevronRight
                  className="h-4 w-4 text-(--ink-2) group-hover:text-(--ink) shrink-0"
                  aria-hidden="true"
                />
              </Link>
            ) : (
              <div className="flex items-center justify-between gap-2 text-xs text-(--ink-2)">
                <span>Day 90 completes the programme.</span>
                <Link href="/speaking/progress" className="text-(--ink) underline">
                  View 90-Day Report →
                </Link>
              </div>
            )}
          </div>

          {/* 4. THIS WEEK (Transaction-row clarity) */}
          <div className="p-4 sm:p-7 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
                THIS WEEK · WEEK {weekMeta.weekNumber}
              </span>
              <Link
                href="/speaking/calendar"
                className="font-mono text-[11px] text-(--ink-2) hover:text-(--ink) no-underline"
              >
                Full Calendar →
              </Link>
            </div>

            <div className="divide-y divide-(--rule-2)">
              {weekDays.map((day) => {
                const status = computeDayStatus(
                  day.date,
                  data.todayDateStr,
                  data.sessions[day.dayNumber]
                );
                const isToday = day.dayNumber === activeDay.dayNumber;
                return (
                  <Link
                    key={day.dayNumber}
                    href={`/speaking/day/${day.dayNumber}`}
                    className="flex items-center justify-between gap-3 py-3 min-h-[54px] no-underline group min-w-0"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <span
                        className={cn(
                          "font-mono text-[11px] uppercase tracking-[0.1em] w-14 shrink-0 tabular-nums",
                          isToday ? "text-(--ink) font-medium" : "text-(--ink-2)"
                        )}
                      >
                        {formatDayShort(day.date)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-(--ink) group-hover:underline truncate m-0">
                          {day.topic}
                        </p>
                        <p className="text-xs text-(--ink-2) m-0">
                          {humanStatusLabel(status)}
                        </p>
                      </div>
                    </div>

                    {isToday ? (
                      <span className="rounded-full border border-(--good)/35 bg-(--good)/12 px-2.5 py-0.5 font-mono text-[11px] font-medium text-(--good) shrink-0">
                        Today
                      </span>
                    ) : status === "completed" || status === "practice_only" ? (
                      <span className="rounded-full border border-(--good)/35 bg-(--good)/10 px-2.5 py-0.5 font-mono text-[11px] text-(--good) shrink-0">
                        Done
                      </span>
                    ) : (
                      <ChevronRight
                        className="h-4 w-4 text-(--ink-2) group-hover:text-(--ink) shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ROBUST DASHBOARD (mobile-clean telemetry, checklist, weekly challenge) ───
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* A. Dashboard Header */}
      <header className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-7 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2) tabular-nums">
              <span className="text-(--ink) font-medium">
                DAY {activeDay.dayNumber} OF 90
              </span>
              <span>·</span>
              <span>{formatCalendarDate(data.todayDateStr)}</span>
            </div>
            <h1 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-normal leading-[1.08] tracking-[-0.025em] text-(--ink) m-0">
              {PROGRAMME_INFO.name}
            </h1>
            <p className="text-sm sm:text-base text-(--ink-2) max-w-[60ch] leading-relaxed m-0">
              {PROGRAMME_INFO.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between md:flex-col md:items-end gap-2.5 shrink-0">
            {modeSwitcher}
            <span className="rounded-[2px] border border-(--rule) bg-(--bg-2) px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink)">
              {phase.name}
            </span>
          </div>
        </div>

        {/* Responsive 4-metric strip + progress bar */}
        <div className="space-y-3 pt-4 border-t border-(--rule-2)">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) px-3 py-2.5">
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2)">
                Completed
              </div>
              <div className="font-mono text-base font-medium tabular-nums text-(--ink)">
                {metrics.daysCompleted} / 90
              </div>
            </div>
            <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) px-3 py-2.5">
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2)">
                Progress
              </div>
              <div className="font-mono text-base font-medium tabular-nums text-(--ink)">
                {metrics.completionPercentage}%
              </div>
            </div>
            <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) px-3 py-2.5">
              <div className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2)">
                <Flame className="h-3 w-3" aria-hidden="true" />
                Streak
              </div>
              <div className="font-mono text-base font-medium tabular-nums text-(--ink)">
                {metrics.currentStreak}d
              </div>
            </div>
            <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) px-3 py-2.5">
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2)">
                Avg Score
              </div>
              <div className="font-mono text-base font-medium tabular-nums text-(--ink)">
                {metrics.averageSpeakingScore !== null
                  ? `${metrics.averageSpeakingScore.toFixed(2)} / 5`
                  : `${metrics.totalPracticeSessions} logs`}
              </div>
            </div>
          </div>

          <div
            className="h-2 w-full rounded-[2px] bg-(--bg-2) overflow-hidden border border-(--rule)"
            role="progressbar"
            aria-valuenow={metrics.completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="90-day speaking completion progress"
          >
            <div
              className="h-full bg-(--good) transition-all duration-300"
              style={{ width: `${Math.min(100, metrics.completionPercentage)}%` }}
            />
          </div>
        </div>
      </header>

      {/* B. Today's Assignment */}
      <section
        aria-labelledby="today-assignment-heading"
        className="rounded-[6px] border border-(--ink) bg-(--paper) p-4 sm:p-7 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-(--rule-2)">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2) tabular-nums">
            <span className="text-(--ink) font-semibold">DAY {activeDay.dayNumber} / 90</span>
            <span>·</span>
            <span>{formatCalendarDate(activeDay.date)}</span>
            <span>·</span>
            <span>Week {activeDay.weekNumber}</span>
          </div>
          <StatusBadge status={activeStatus} />
        </div>

        <div className="space-y-4">
          <h2
            id="today-assignment-heading"
            className="font-display text-[clamp(1.5rem,3.6vw,2.5rem)] font-normal leading-[1.12] tracking-[-0.02em] text-(--ink) m-0"
          >
            {activeDay.topic}
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-(--rule) bg-(--bg-2) px-2.5 py-1 font-mono text-[11px] text-(--ink)">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {activeDay.skill}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-(--rule) bg-(--bg) px-2.5 py-1 font-mono text-[11px] text-(--ink-2)">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {activeDay.duration}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-(--rule) bg-(--bg) px-2.5 py-1 font-mono text-[11px] text-(--ink-2)">
              <Users className="h-3 w-3" aria-hidden="true" />
              {activeAudience.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-(--rule) bg-(--bg) px-2.5 py-1 font-mono text-[11px] text-(--ink-2)">
              <Mic className="h-3 w-3" aria-hidden="true" />
              {activeFormat.label}
            </span>
          </div>

          {/* Mobile immediate primary CTA */}
          <div className="lg:hidden pt-1">
            <Link
              href={`/speaking/day/${activeDay.dayNumber}`}
              className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-(--ink) text-(--bg) px-4 py-3 min-h-[48px] text-sm font-medium no-underline hover:opacity-90 transition-opacity"
            >
              {sessionButtonLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5 pt-1">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
                  Objective & Why It Matters
                </div>
                <p className="text-sm sm:text-base text-(--ink) leading-relaxed m-0">
                  {activeDay.description}
                </p>
                <p className="text-xs sm:text-sm text-(--ink-2) leading-relaxed m-0">
                  {activeDay.whyItMatters}
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
                  Preparation Prompts
                </div>
                <ul className="space-y-1.5 pl-4 m-0 text-sm text-(--ink-2) leading-relaxed list-disc">
                  {activeDay.thinkingPrompts.map((prompt, idx) => (
                    <li key={idx}>{prompt}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[4px] border border-(--rule) bg-(--bg) p-4 space-y-1.5">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
                  Today&apos;s Exercise
                </div>
                <p className="text-sm text-(--ink) leading-relaxed m-0">
                  {activeDay.exercise}
                </p>
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="rounded-[4px] border border-(--rule) bg-(--bg) p-4 space-y-2.5">
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
                    Recording & Completion Checklist
                  </div>
                  <ul className="space-y-2 m-0 p-0 list-none">
                    {activeDay.recordingChecklist.map((req, idx) => {
                      const checked = checklistState[idx];
                      return (
                        <li
                          key={req}
                          className="flex items-start gap-2.5 text-xs leading-snug"
                        >
                          <span
                            className={cn(
                              "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border",
                              checked
                                ? "border-(--good) bg-(--good) text-white"
                                : "border-(--rule) bg-(--paper)"
                            )}
                          >
                            {checked && <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />}
                          </span>
                          <span className={checked ? "text-(--ink)" : "text-(--ink-2)"}>
                            {req}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="rounded-[4px] border border-(--rule) bg-(--bg) p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
                    <Share2 className="h-3 w-3" aria-hidden="true" />
                    Publishing Suggestion
                  </div>
                  <p className="text-xs text-(--ink-2) leading-relaxed m-0">
                    {activeDay.publishingSuggestion}
                  </p>
                </div>
              </div>

              <div className="hidden lg:flex pt-2">
                <Link
                  href={`/speaking/day/${activeDay.dayNumber}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-[4px] bg-(--ink) text-(--bg) px-5 py-3 min-h-[44px] text-sm font-medium tracking-wide no-underline hover:opacity-90 transition-opacity"
                >
                  {sessionButtonLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* C & D: Tomorrow's Preview + This Week's Programme */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-5 items-start">
        <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
              Tomorrow&apos;s Preview
            </span>
            {tomorrowDay && (
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2) tabular-nums">
                Day {tomorrowDay.dayNumber} · {formatMonthShort(tomorrowDay.date)}
              </span>
            )}
          </div>

          {tomorrowDay ? (
            <>
              <div className="space-y-2">
                <h3 className="font-display text-xl font-normal text-(--ink) leading-snug m-0">
                  {tomorrowDay.topic}
                </h3>
                <div className="inline-block rounded-[2px] border border-(--rule) bg-(--bg-2) px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2)">
                  Skill: {tomorrowDay.skill}
                </div>
                <p className="text-sm text-(--ink-2) leading-relaxed m-0">
                  {tomorrowDay.description}
                </p>
              </div>
              <div className="pt-1">
                <Link
                  href={`/speaking/day/${tomorrowDay.dayNumber}`}
                  className="inline-flex items-center gap-1.5 rounded-[4px] border border-(--rule) bg-(--bg) px-3.5 py-2 min-h-[40px] text-xs font-medium text-(--ink) no-underline hover:border-(--ink) transition-colors"
                >
                  Prepare tomorrow&apos;s thoughts
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <h3 className="font-display text-xl font-normal text-(--ink) m-0">
                Final Day Reached
              </h3>
              <p className="text-sm text-(--ink-2) leading-relaxed m-0">
                Day 90 completes the structured curriculum and transitions The Speaking Ledger into your permanent speaking and idea archive.
              </p>
              <Link
                href="/speaking/progress"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-(--ink) no-underline hover:underline"
              >
                View 90-Day Report →
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
                This Week · Week {weekMeta.weekNumber}
              </span>
              <h3 className="font-display text-xl font-normal text-(--ink) mt-1 mb-0">
                {weekMeta.weekTitle}
              </h3>
            </div>
            <Link
              href={`/speaking/journal?tab=reviews&week=${weekMeta.weekNumber}`}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2) hover:text-(--ink) no-underline"
            >
              Weekly Review →
            </Link>
          </div>

          <div className="divide-y divide-(--rule-2) border-y border-(--rule-2)">
            {weekDays.map((day) => {
              const status = computeDayStatus(
                day.date,
                data.todayDateStr,
                data.sessions[day.dayNumber]
              );
              const isCurrent = day.dayNumber === activeDay.dayNumber;
              return (
                <Link
                  key={day.dayNumber}
                  href={`/speaking/day/${day.dayNumber}`}
                  className={cn(
                    "flex items-center justify-between gap-3 py-3 min-h-[54px] px-2 -mx-2 rounded-[4px] no-underline transition-colors min-w-0",
                    isCurrent ? "bg-(--bg-2)" : "hover:bg-(--bg)/70"
                  )}
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <span className="font-mono text-xs tabular-nums text-(--ink-2) w-11 shrink-0">
                      D{String(day.dayNumber).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          "text-sm m-0 truncate",
                          isCurrent ? "font-medium text-(--ink)" : "text-(--ink)"
                        )}
                      >
                        {day.topic}
                      </p>
                      <p className="font-mono text-[11px] text-(--ink-2) truncate m-0">
                        {day.skill} · {formatMonthShort(day.date)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={status} className="shrink-0" />
                </Link>
              );
            })}
          </div>

          {currentChallenge && (
            <div className="rounded-[4px] border border-(--rule) bg-(--bg) p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
                  Weekly Challenge
                </div>
                <p className="text-sm font-medium text-(--ink) m-0">
                  {currentChallenge.title}
                </p>
                <p className="text-xs text-(--ink-2) m-0 leading-relaxed">
                  {currentChallenge.description}
                </p>
              </div>
              <button
                type="button"
                aria-pressed={currentChallenge.completed}
                disabled={togglingChallenge}
                onClick={() => void handleToggleChallenge()}
                className={cn(
                  "shrink-0 inline-flex items-center justify-center gap-1.5 rounded-[4px] border px-3 py-2 min-h-[40px] text-xs font-medium cursor-pointer transition-colors",
                  currentChallenge.completed
                    ? "border-(--good) bg-(--good)/15 text-(--good)"
                    : "border-(--rule) bg-(--paper) text-(--ink) hover:border-(--ink)"
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {currentChallenge.completed ? "Completed" : "Mark Complete"}
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Quick Idea Bank + Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5 items-start">
        <div className="space-y-3">
          <QuickIdeaCapture
            defaultDayNumber={activeDay.dayNumber}
            compact
            onCreated={(idea) => setRecentIdeas((prev) => [idea, ...prev].slice(0, 3))}
          />
          {recentIdeas.length > 0 && (
            <div className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
                  Recent Idea Bank Sparks
                </span>
                <Link
                  href="/speaking/journal?tab=ideas"
                  className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2) hover:text-(--ink) no-underline"
                >
                  Open Idea Bank →
                </Link>
              </div>
              <div className="divide-y divide-(--rule-2)">
                {recentIdeas.map((idea) => (
                  <div key={idea.id} className="py-1.5 flex items-center justify-between gap-2 text-xs">
                    <span className="text-(--ink) truncate">{idea.title}</span>
                    <span className="font-mono text-[11px] uppercase text-(--ink-2) shrink-0">
                      {idea.category.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-normal text-(--ink) m-0">
              Quick Access
            </h3>
            <CalendarDays className="h-4 w-4 text-(--ink-2)" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { href: "/speaking/calendar", label: "90-Day Calendar" },
              { href: "/speaking/curriculum", label: "Full Curriculum" },
              { href: "/speaking/journal", label: "Idea Bank & Journal" },
              { href: "/speaking/progress", label: "Progress & Archive" },
              { href: "/speaking/methodology", label: "PREM & Methodology" },
              { href: "/tools/carousel-lab", label: "Carousel Lab" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2.5 min-h-[44px] text-xs font-medium text-(--ink) no-underline hover:border-(--ink) transition-colors flex items-center justify-between gap-1.5"
              >
                <span className="truncate">{item.label}</span>
                <ArrowRight className="h-3 w-3 text-(--ink-2) shrink-0" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
