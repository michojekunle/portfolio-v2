"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight } from "lucide-react";
import type { RustChallengeDay, UpdateFn } from "./types";
import { isDayActive, PHASE_LABEL } from "./types";

interface HorizonMatrixProps {
  days: RustChallengeDay[];
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
  onUpdate: UpdateFn;
}

type FilterOption = "all" | "active" | "incomplete" | "completed" | "phase1" | "phase2" | "phase3" | "phase4";

export function HorizonMatrix({
  days,
  selectedDayNumber,
  onSelectDay,
  onUpdate,
}: HorizonMatrixProps): React.ReactElement {
  const [filter, setFilter] = useState<FilterOption>("all");

  const filteredDays = useMemo(() => {
    switch (filter) {
      case "active":
        return days.filter(isDayActive);
      case "incomplete":
        return days.filter((d) => !d.completed);
      case "completed":
        return days.filter((d) => d.completed);
      case "phase1":
        return days.filter((d) => d.phase === 1);
      case "phase2":
        return days.filter((d) => d.phase === 2);
      case "phase3":
        return days.filter((d) => d.phase === 3);
      case "phase4":
        return days.filter((d) => d.phase === 4);
      default:
        return days;
    }
  }, [days, filter]);

  // Group filtered days by phase & week
  const groupedStructure = useMemo(() => {
    const phaseMap = new Map<number, Map<number, RustChallengeDay[]>>();
    for (const d of filteredDays) {
      const weekMap = phaseMap.get(d.phase) ?? new Map<number, RustChallengeDay[]>();
      const weekDays = weekMap.get(d.week_number) ?? [];
      weekDays.push(d);
      weekMap.set(d.week_number, weekDays);
      phaseMap.set(d.phase, weekMap);
    }

    return Array.from(phaseMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([phase, weekMap]) => ({
        phase,
        weeks: Array.from(weekMap.entries()).sort((a, b) => a[0] - b[0]),
      }));
  }, [filteredDays]);

  return (
    <div className="space-y-8">
      {/* Matrix Controls & Filter Bar (Flattened surface) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-xl shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`h-7 px-3 rounded-lg text-xs font-mono font-medium cursor-pointer transition-colors whitespace-nowrap ${
              filter === "all"
                ? "bg-foreground text-background font-semibold shadow-xs"
                : "border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            All (188)
          </button>
          <button
            type="button"
            onClick={() => setFilter("incomplete")}
            className={`h-7 px-3 rounded-lg text-xs font-mono font-medium cursor-pointer transition-colors whitespace-nowrap ${
              filter === "incomplete"
                ? "bg-foreground text-background font-semibold shadow-xs"
                : "border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Incomplete
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`h-7 px-3 rounded-lg text-xs font-mono font-medium cursor-pointer transition-colors whitespace-nowrap ${
              filter === "active"
                ? "bg-foreground text-background font-semibold shadow-xs"
                : "border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Active In Progress
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`h-7 px-3 rounded-lg text-xs font-mono font-medium cursor-pointer transition-colors whitespace-nowrap ${
              filter === "completed"
                ? "bg-foreground text-background font-semibold shadow-xs"
                : "border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Phase Quick Filters */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {[1, 2, 3, 4].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilter(`phase${p}` as FilterOption)}
              className={`h-7 px-2.5 rounded-lg text-xs font-mono font-medium cursor-pointer transition-colors whitespace-nowrap ${
                filter === `phase${p}`
                  ? "bg-foreground/15 dark:bg-white/15 text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              Phase {p}
            </button>
          ))}
        </div>
      </div>

      {/* Flattened Matrix Sections (Eliminates excessive nesting) */}
      <div className="space-y-10">
        {groupedStructure.map(({ phase, weeks }) => (
          <div key={phase} className="space-y-6">
            {/* Phase Section Title */}
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="space-y-0.5">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider block">
                  Phase {phase}
                </span>
                <h2 className="font-sans font-bold text-lg text-foreground">
                  {PHASE_LABEL[phase] || "Mastery Track"}
                </h2>
              </div>
              <span className="font-mono text-xs text-muted-foreground font-medium">
                {weeks.reduce((acc, [, wDays]) => acc + wDays.length, 0)} Days Total
              </span>
            </div>

            {/* Weeks Sections */}
            <div className="space-y-6">
              {weeks.map(([weekNum, weekDays]) => (
                <div key={weekNum} className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-foreground/90">
                      Week {weekNum}: {weekDays[0].week_focus}
                    </span>
                    <Badge variant="outline" className="font-mono text-xs text-muted-foreground font-medium">
                      {weekDays.filter((d) => d.completed).length}/{weekDays.length} Done
                    </Badge>
                  </div>

                  {/* Day Tiles Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {weekDays.map((d) => {
                      const isSelected = d.day_number === selectedDayNumber;
                      const active = isDayActive(d);

                      return (
                        <div
                          key={d.day_number}
                          className={`rounded-xl border p-3.5 flex flex-col justify-between gap-3 transition-colors ${
                            isSelected
                              ? "border-amber-600 dark:border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/50"
                              : d.completed
                                ? "border-emerald-600/40 bg-emerald-500/10"
                                : active
                                  ? "border-amber-500/40 bg-amber-500/10"
                                  : "border-border/80 bg-card/60 hover:border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-xs font-bold text-foreground">
                              Day {d.day_number}
                            </span>

                            {/* Track Indicators */}
                            <div className="flex items-center gap-1">
                              <span
                                title="Systems Rust"
                                className={`h-2 w-2 rounded-full ${
                                  d.rust_completed || d.completed ? "bg-amber-600 dark:bg-amber-500" : "bg-muted-foreground/20"
                                }`}
                              />
                              <span
                                title="DSA"
                                className={`h-2 w-2 rounded-full ${
                                  d.dsa_completed || d.completed ? "bg-sky-600 dark:bg-sky-500" : "bg-muted-foreground/20"
                                }`}
                              />
                              {d.frontend_task && (
                                <span
                                  title="Frontend"
                                  className={`h-2 w-2 rounded-full ${
                                    d.frontend_completed || d.completed ? "bg-emerald-600 dark:bg-emerald-500" : "bg-muted-foreground/20"
                                  }`}
                                />
                              )}
                              {d.system_design_task && (
                                <span
                                  title="System Design"
                                  className={`h-2 w-2 rounded-full ${
                                    d.system_design_completed || d.completed ? "bg-indigo-600 dark:bg-indigo-500" : "bg-muted-foreground/20"
                                  }`}
                                />
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-foreground/85 line-clamp-2 leading-relaxed font-sans">
                            {d.daily_task}
                          </p>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                            <button
                              type="button"
                              onClick={() => onSelectDay(d.day_number)}
                              className="font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 cursor-pointer font-medium"
                            >
                              <span>Open</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => void onUpdate(d.day_number, { completed: !d.completed })}
                              className={`h-6 px-2.5 rounded-md font-mono text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                                d.completed
                                  ? "bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40"
                                  : "bg-muted/50 hover:bg-muted text-muted-foreground border border-border/80"
                              }`}
                            >
                              {d.completed ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  <span>Done</span>
                                </>
                              ) : (
                                <span>Mark</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
