"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CURRICULUM_DAYS, getCurriculumDay } from "@/lib/speaking/curriculum";
import {
  computeDayStatus,
  formatCalendarDate,
  getProgrammeCalendarMonths,
} from "@/lib/speaking/dates";
import { WEEKLY_CHALLENGES } from "@/lib/speaking/methodology";
import type { DayStatus, SpeakingWorkspaceData } from "@/lib/speaking/types";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  data: SpeakingWorkspaceData;
}

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({ data }: CalendarViewProps): React.ReactElement {
  const months = useMemo(() => getProgrammeCalendarMonths(), []);
  const activeDay = getCurriculumDay(data.activeDayNumber) ?? CURRICULUM_DAYS[0];
  const initialMonthKey = activeDay.date.slice(0, 7);

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    months.some((m) => m.key === initialMonthKey) ? initialMonthKey : months[0].key
  );
  const [statusFilter, setStatusFilter] = useState<DayStatus | "all">("all");

  const activeMonth =
    months.find((m) => m.key === selectedMonthKey) ?? months[0];

  const dayStatuses = useMemo(() => {
    const map = new Map<number, DayStatus>();
    for (const d of CURRICULUM_DAYS) {
      map.set(
        d.dayNumber,
        computeDayStatus(d.date, data.todayDateStr, data.sessions[d.dayNumber])
      );
    }
    return map;
  }, [data]);

  const missedDays = useMemo(
    () => CURRICULUM_DAYS.filter((d) => dayStatuses.get(d.dayNumber) === "missed"),
    [dayStatuses]
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-1.5 pb-4 sm:pb-6 border-b border-(--rule)">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
          Nov 30, 2026 – Feb 27, 2027 · Africa/Lagos
        </div>
        <h1 className="font-display text-[clamp(1.65rem,3.5vw,2.75rem)] font-normal text-(--ink) m-0">
          Programme Calendar
        </h1>
        <p className="text-sm text-(--ink-2) max-w-[62ch] m-0 leading-relaxed">
          Missed days never shift the programme end date. Tap any day to catch up or prepare ahead.
        </p>
      </header>

      {/* Month Switcher & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5"
          role="group"
          aria-label="Select month"
        >
          {months.map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={selectedMonthKey === m.key}
              onClick={() => setSelectedMonthKey(m.key)}
              className={cn(
                "rounded-[4px] border px-3 py-2 min-h-[40px] text-xs font-medium cursor-pointer transition-colors text-center",
                selectedMonthKey === m.key
                  ? "border-(--ink) bg-(--ink) text-(--bg)"
                  : "border-(--rule) bg-(--paper) text-(--ink-2) hover:text-(--ink)"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DayStatus | "all")}
          aria-label="Filter calendar by status"
          className="rounded-[4px] border border-(--rule) bg-(--paper) px-3 py-2 min-h-[40px] text-base sm:text-xs text-(--ink)"
        >
          <option value="all">All statuses</option>
          <option value="today">Today</option>
          <option value="completed">Completed</option>
          <option value="practice_only">Practice-only</option>
          <option value="in_progress">In Progress</option>
          <option value="missed">Missed</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </div>

      {/* Calendar Grid */}
      <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl sm:text-2xl font-normal text-(--ink) m-0">
            {activeMonth.label}
          </h2>
          <div className="hidden sm:flex flex-wrap items-center gap-2">
            {(["today", "completed", "in_progress", "missed", "upcoming", "practice_only"] as DayStatus[]).map(
              (st) => (
                <StatusBadge key={st} status={st} />
              )
            )}
          </div>
        </div>

        {/* Desktop 7-column Grid */}
        <div className="hidden md:grid grid-cols-7 gap-2">
          {WEEKDAY_HEADERS.map((wd) => (
            <div
              key={wd}
              className="py-2 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)"
            >
              {wd}
            </div>
          ))}

          {Array.from({ length: activeMonth.leadingEmptyCells }).map((_, idx) => (
            <div key={`empty-${idx}`} className="min-h-[112px] rounded-[4px] bg-(--bg)/30" />
          ))}

          {activeMonth.cells.map((cell) => {
            const cDay = cell.curriculumDayNumber
              ? getCurriculumDay(cell.curriculumDayNumber)
              : undefined;

            if (!cDay) {
              return (
                <div
                  key={cell.date}
                  className="min-h-[112px] rounded-[4px] border border-(--rule-2) bg-(--bg)/40 p-2.5 opacity-45"
                >
                  <span className="font-mono text-xs tabular-nums text-(--ink-2)">
                    {cell.dayOfMonth}
                  </span>
                </div>
              );
            }

            const status = dayStatuses.get(cDay.dayNumber) ?? "upcoming";
            const dimmed = statusFilter !== "all" && status !== statusFilter;

            return (
              <Link
                key={cell.date}
                href={`/speaking/day/${cDay.dayNumber}`}
                className={cn(
                  "min-h-[112px] rounded-[4px] border p-2.5 flex flex-col justify-between gap-2 no-underline transition-colors min-w-0",
                  status === "today"
                    ? "border-(--ink) bg-(--bg-2)"
                    : "border-(--rule) bg-(--bg) hover:border-(--ink)",
                  dimmed && "opacity-30"
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-(--ink-2) tabular-nums">
                    D{cDay.dayNumber}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-(--ink)">
                    {cell.dayOfMonth}
                  </span>
                </div>
                <p className="text-xs font-medium text-(--ink) leading-snug line-clamp-2 m-0 break-words">
                  {cDay.topic}
                </p>
                <div className="pt-1">
                  <StatusBadge status={status} className="px-1.5 py-0" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-(--rule-2)">
          {activeMonth.cells
            .filter((cell) => cell.curriculumDayNumber !== null)
            .map((cell) => {
              const cDay = getCurriculumDay(cell.curriculumDayNumber!)!;
              const status = dayStatuses.get(cDay.dayNumber) ?? "upcoming";
              if (statusFilter !== "all" && status !== statusFilter) return null;
              return (
                <Link
                  key={cell.date}
                  href={`/speaking/day/${cDay.dayNumber}`}
                  className="flex items-center justify-between gap-3 py-3 min-h-[58px] no-underline group"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2) tabular-nums">
                      Day {cDay.dayNumber} · {formatCalendarDate(cDay.date)}
                    </div>
                    <div className="text-sm font-medium text-(--ink) truncate">
                      {cDay.topic}
                    </div>
                    <div className="font-mono text-[11px] text-(--ink-2) truncate">
                      {cDay.skill}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={status} />
                    <ChevronRight className="h-4 w-4 text-(--ink-3)" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
        </div>
      </section>

      {/* Missed Days Catch-up + Weekly Challenges Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-5 space-y-3">
          <h3 className="font-display text-lg font-normal text-(--ink) m-0">
            Missed Days to Catch Up
          </h3>
          {missedDays.length === 0 ? (
            <p className="text-sm text-(--ink-2) m-0">
              No missed days right now. Stay steady one conversation at a time.
            </p>
          ) : (
            <div className="divide-y divide-(--rule-2) max-h-64 overflow-y-auto">
              {missedDays.map((d) => (
                <Link
                  key={d.dayNumber}
                  href={`/speaking/day/${d.dayNumber}`}
                  className="flex items-center justify-between gap-3 py-2.5 min-h-[44px] no-underline hover:underline min-w-0"
                >
                  <span className="text-xs text-(--ink) truncate">
                    <span className="font-mono text-(--ink-2) mr-2 tabular-nums">
                      Day {d.dayNumber}
                    </span>
                    {d.topic}
                  </span>
                  <span className="font-mono text-[11px] text-(--ink-2) shrink-0 tabular-nums">
                    {d.date}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-5 space-y-3">
          <h3 className="font-display text-lg font-normal text-(--ink) m-0">
            Weekly Challenges
          </h3>
          <div className="divide-y divide-(--rule-2) max-h-64 overflow-y-auto">
            {WEEKLY_CHALLENGES.map((w) => {
              const rec = data.weeklyChallenges[w.weekNumber];
              return (
                <div
                  key={w.weekNumber}
                  className="py-2.5 flex items-start justify-between gap-3"
                >
                  <div className="text-xs min-w-0">
                    <span className="font-mono text-(--ink-2) mr-2 tabular-nums">
                      W{w.weekNumber} (D{w.dayRange[0]}–{w.dayRange[1]})
                    </span>
                    <span className="text-(--ink)">{w.challengeTitle}</span>
                  </div>
                  <span
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-[0.12em] shrink-0",
                      rec?.completed ? "text-(--good)" : "text-(--ink-2)"
                    )}
                  >
                    {rec?.completed ? "Done" : "Pending"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
