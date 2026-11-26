"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";
import { CURRICULUM_DAYS } from "@/lib/speaking/curriculum";
import { computeDayStatus, formatMonthShort } from "@/lib/speaking/dates";
import {
  MONTH_TITLES,
  SPEAKING_PHASES,
  WEEKLY_CHALLENGES,
} from "@/lib/speaking/methodology";
import type { SpeakingWorkspaceData, WeeklyChallengeRecord } from "@/lib/speaking/types";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

interface CurriculumViewProps {
  data: SpeakingWorkspaceData;
}

export function CurriculumView({ data }: CurriculumViewProps): React.ReactElement {
  const [phaseFilter, setPhaseFilter] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [challenges, setChallenges] = useState<Record<number, WeeklyChallengeRecord>>(
    data.weeklyChallenges
  );

  const selectedPhaseObj = SPEAKING_PHASES.find((p) => p.number === phaseFilter);

  const filteredWeeks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return WEEKLY_CHALLENGES.map((week) => {
      const days = CURRICULUM_DAYS.filter((d) => {
        if (d.weekNumber !== week.weekNumber) return false;
        if (phaseFilter !== 0 && d.phase !== phaseFilter) return false;
        if (q) {
          return (
            d.topic.toLowerCase().includes(q) ||
            d.skill.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q) ||
            String(d.dayNumber) === q
          );
        }
        return true;
      });
      return { week, days };
    }).filter((group) => group.days.length > 0);
  }, [phaseFilter, search]);

  const toggleWeeklyChallenge = async (weekNumber: number): Promise<void> => {
    const current = challenges[weekNumber];
    if (!current) return;
    const nextCompleted = !current.completed;
    setChallenges((prev) => ({
      ...prev,
      [weekNumber]: { ...current, completed: nextCompleted },
    }));
    try {
      const res = await fetch("/api/speaking/weekly", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "challenge",
          weekNumber,
          completed: nextCompleted,
          reflection: current.reflection,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        nextCompleted
          ? `Week ${weekNumber} challenge complete`
          : `Week ${weekNumber} challenge reopened`
      );
    } catch {
      setChallenges((prev) => ({ ...prev, [weekNumber]: current }));
      toast.error("Failed to update weekly challenge");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-2 pb-4 sm:pb-6 border-b border-(--rule)">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
          90 Days · 3 Phases · 13 Weeks
        </div>
        <h1 className="font-display text-[clamp(1.65rem,3.5vw,2.75rem)] font-normal text-(--ink) m-0">
          Speaking Curriculum
        </h1>
        <p className="text-sm text-(--ink-2) max-w-[62ch] m-0 leading-relaxed">
          Month 1 builds clarity, Month 2 sharpens intellectual depth, Month 3 builds persuasive influence.
        </p>
      </header>

      {/* Mobile Compact Phase Switcher (< md) */}
      <div className="md:hidden space-y-2">
        <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Filter by phase">
          <button
            type="button"
            aria-pressed={phaseFilter === 0}
            onClick={() => setPhaseFilter(0)}
            className={cn(
              "rounded-[4px] border px-2 py-2 min-h-[40px] font-mono text-[11px] cursor-pointer transition-colors",
              phaseFilter === 0
                ? "border-(--ink) bg-(--ink) text-(--bg)"
                : "border-(--rule) bg-(--paper) text-(--ink-2)"
            )}
          >
            All (90)
          </button>
          {SPEAKING_PHASES.map((p) => (
            <button
              key={p.number}
              type="button"
              aria-pressed={phaseFilter === p.number}
              onClick={() =>
                setPhaseFilter((curr) => (curr === p.number ? 0 : p.number))
              }
              className={cn(
                "rounded-[4px] border px-2 py-2 min-h-[40px] font-mono text-[11px] cursor-pointer transition-colors tabular-nums",
                phaseFilter === p.number
                  ? "border-(--ink) bg-(--ink) text-(--bg)"
                  : "border-(--rule) bg-(--paper) text-(--ink-2)"
              )}
            >
              P{p.number} · {p.dayRange[0]}–{p.dayRange[1]}
            </button>
          ))}
        </div>
        {selectedPhaseObj && (
          <div className="rounded-[4px] border border-(--rule) bg-(--paper) px-3.5 py-2.5 text-xs text-(--ink-2)">
            <strong className="text-(--ink) font-medium">{selectedPhaseObj.title}:</strong>{" "}
            {selectedPhaseObj.objective}
          </div>
        )}
      </div>

      {/* Desktop Phase Overview Cards (md+) */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        {SPEAKING_PHASES.map((p) => (
          <button
            key={p.number}
            type="button"
            aria-pressed={phaseFilter === p.number}
            onClick={() =>
              setPhaseFilter((curr) => (curr === p.number ? 0 : p.number))
            }
            className={cn(
              "rounded-[6px] border p-5 text-left space-y-2 cursor-pointer transition-colors",
              phaseFilter === p.number
                ? "border-(--ink) bg-(--bg-2)"
                : "border-(--rule) bg-(--paper) hover:border-(--ink)"
            )}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2) tabular-nums">
              Days {p.dayRange[0]}–{p.dayRange[1]}
            </div>
            <div className="font-display text-lg text-(--ink)">{p.title}</div>
            <p className="text-xs text-(--ink-2) leading-relaxed m-0">{p.objective}</p>
            <p className="text-[11px] text-(--ink-2) m-0 pt-1.5 border-t border-(--rule-2)">
              Outcome: {p.endOutcome}
            </p>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-3.5 w-3.5 text-(--ink-2) absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search curriculum topics, skills, or day number"
            placeholder="Search topics, skills, or day #..."
            className="w-full rounded-[4px] border border-(--rule) bg-(--paper) pl-9 pr-3 py-2.5 text-base sm:text-sm text-(--ink) placeholder:text-(--ink-3) focus:border-(--ink) focus:outline-none"
          />
        </div>
        {phaseFilter !== 0 && (
          <button
            type="button"
            onClick={() => setPhaseFilter(0)}
            className="hidden md:inline-flex rounded-[4px] border border-(--rule) bg-(--paper) px-3 py-2 min-h-[40px] text-xs text-(--ink) cursor-pointer"
          >
            Clear phase filter
          </button>
        )}
      </div>

      {/* Weeks & Days */}
      {filteredWeeks.length === 0 ? (
        <div className="rounded-[6px] border border-dashed border-(--rule) p-8 text-center">
          <p className="font-display text-lg text-(--ink) m-0">No matching topics found.</p>
          <p className="text-sm text-(--ink-2) mt-1 mb-0">
            Try clearing your search or phase filter to view all 90 days.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredWeeks.map(({ week, days }) => {
            const ch = challenges[week.weekNumber];
            return (
              <section
                key={week.weekNumber}
                className="rounded-[6px] border border-(--rule) bg-(--paper) overflow-hidden"
              >
                <div className="p-4 sm:p-5 border-b border-(--rule-2) bg-(--bg)/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2) tabular-nums">
                      {MONTH_TITLES[week.monthNumber as 1 | 2 | 3]} · Week{" "}
                      {week.weekNumber} (D{week.dayRange[0]}–{week.dayRange[1]})
                    </div>
                    <h2 className="font-display text-lg sm:text-xl font-normal text-(--ink) mt-0.5 mb-0">
                      {week.weekTitle}
                    </h2>
                  </div>

                  <button
                    type="button"
                    aria-pressed={Boolean(ch?.completed)}
                    onClick={() => void toggleWeeklyChallenge(week.weekNumber)}
                    className={cn(
                      "inline-flex items-center justify-center gap-1.5 rounded-[4px] border px-3 py-2 min-h-[40px] text-xs font-medium cursor-pointer transition-colors self-start sm:self-auto",
                      ch?.completed
                        ? "border-(--good) bg-(--good)/15 text-(--good)"
                        : "border-(--rule) bg-(--paper) text-(--ink-2) hover:text-(--ink)"
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {ch?.completed ? "Challenge Done" : "Mark Challenge"}
                  </button>
                </div>

                <div className="px-4 sm:px-5 py-2.5 border-b border-(--rule-2) bg-(--bg)/30 text-xs text-(--ink-2)">
                  <strong className="font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2) mr-1.5">
                    Weekly Challenge:
                  </strong>
                  {week.challengeTitle}
                </div>

                <div className="divide-y divide-(--rule-2)">
                  {days.map((day) => {
                    const status = computeDayStatus(
                      day.date,
                      data.todayDateStr,
                      data.sessions[day.dayNumber]
                    );

                    return (
                      <Link
                        key={day.dayNumber}
                        href={`/speaking/day/${day.dayNumber}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-3.5 min-h-[60px] no-underline hover:bg-(--bg)/60 transition-colors"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs tabular-nums text-(--ink-2) w-12 shrink-0">
                              D{String(day.dayNumber).padStart(2, "0")}
                            </span>
                            <span className="text-sm font-medium text-(--ink) break-words">
                              {day.topic}
                            </span>
                          </div>
                          <p className="text-xs text-(--ink-2) sm:pl-[58px] m-0 line-clamp-2">
                            {day.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 sm:pl-4 pt-1 sm:pt-0">
                          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-(--ink-2) tabular-nums">
                            {day.skill} · {formatMonthShort(day.date)}
                          </span>
                          <StatusBadge status={status} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
