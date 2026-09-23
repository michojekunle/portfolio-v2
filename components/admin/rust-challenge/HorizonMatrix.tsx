"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Target, ChevronRight } from "lucide-react";
import type { RustChallengeDay, UpdateFn } from "./types";
import { countDaySteps, isDayActive, PHASE_LABEL } from "./types";

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
    <div className="space-y-6 sm:space-y-8">
      {/* Matrix Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border border-border/60 bg-card/80 dark:bg-card/40 backdrop-blur-xl shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`h-7 px-3 rounded-lg text-xs font-mono font-medium cursor-pointer transition-colors whitespace-nowrap ${
              filter === "all"
                ? "bg-foreground text-background shadow-xs font-semibold"
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
                ? "bg-foreground text-background shadow-xs font-semibold"
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
                ? "bg-foreground text-background shadow-xs font-semibold"
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
                ? "bg-foreground text-background shadow-xs font-semibold"
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
              className={`h-7 px-2.5 rounded-lg text-[11px] font-mono font-medium cursor-pointer transition-colors whitespace-nowrap ${
                filter === `phase${p}`
                  ? "bg-foreground/15 dark:bg-white/15 text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              Phase 0{p}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Content */}
      <div className="space-y-8">
        {groupedStructure.map(({ phase, weeks }) => (
          <div key={phase} className="space-y-4">
            {/* Phase Header */}
            <div className="flex items-center justify-between border-b border-border/40 dark:border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <h3 className="font-display font-bold text-sm tracking-tight text-foreground uppercase">
                  Phase 0{phase} — {PHASE_LABEL[phase] || "Mastery Track"}
                </h3>
              </div>
              <span className="font-mono text-xs text-muted-foreground font-medium">
                {weeks.reduce((acc, [, wDays]) => acc + wDays.length, 0)} Days
              </span>
            </div>

            {/* Weeks Container */}
            <div className="grid grid-cols-1 gap-4">
              {weeks.map(([weekNum, weekDays]) => (
                <div
                  key={weekNum}
                  className="rounded-2xl border border-border/60 dark:border-border/40 bg-card/75 dark:bg-card/30 backdrop-blur-xl p-3.5 sm:p-4 space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-foreground/90">
                      Week 0{weekNum} — {weekDays[0].week_focus}
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground font-medium">
                      {weekDays.filter((d) => d.completed).length}/{weekDays.length} Done
                    </Badge>
                  </div>

                  {/* High Density Day Tiles Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {weekDays.map((d) => {
                      const isSelected = d.day_number === selectedDayNumber;
                      const active = isDayActive(d);

                      return (
                        <div
                          key={d.day_number}
                          className={`relative rounded-xl border p-3 flex flex-col justify-between gap-2.5 transition-all duration-200 ${
                            isSelected
                              ? "border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.12)] ring-1 ring-orange-500/40"
                              : d.completed
                                ? "border-emerald-500/40 bg-emerald-500/10 hover:border-emerald-500/60"
                                : active
                                  ? "border-amber-500/40 bg-amber-500/10 hover:border-amber-500/60"
                                  : "border-border/80 bg-background/90 hover:border-border hover:bg-background"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-xs font-bold text-foreground">
                              Day {d.day_number}
                            </span>

                            {/* 4 Mini Discipline Dots */}
                            <div className="flex items-center gap-1">
                              <span
                                title="Systems Rust"
                                className={`h-1.5 w-1.5 rounded-full ${
                                  d.rust_completed || d.completed ? "bg-amber-500" : "bg-foreground/15 dark:bg-white/20"
                                }`}
                              />
                              <span
                                title="DSA"
                                className={`h-1.5 w-1.5 rounded-full ${
                                  d.dsa_completed || d.completed ? "bg-sky-500" : "bg-foreground/15 dark:bg-white/20"
                                }`}
                              />
                              {d.frontend_task && (
                                <span
                                  title="Frontend"
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    d.frontend_completed || d.completed ? "bg-emerald-500" : "bg-foreground/15 dark:bg-white/20"
                                  }`}
                                />
                              )}
                              {d.system_design_task && (
                                <span
                                  title="System Design"
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    d.system_design_completed || d.completed ? "bg-purple-500" : "bg-foreground/15 dark:bg-white/20"
                                  }`}
                                />
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-foreground/80 line-clamp-2 leading-relaxed font-sans">
                            {d.daily_task}
                          </p>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30 dark:border-white/5">
                            <button
                              type="button"
                              onClick={() => onSelectDay(d.day_number)}
                              className="font-mono text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 cursor-pointer font-medium"
                            >
                              <span>Inspect</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => void onUpdate(d.day_number, { completed: !d.completed })}
                              className={`h-6 px-2 rounded-md font-mono text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                                d.completed
                                  ? "bg-emerald-600/20 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40"
                                  : "bg-muted/50 hover:bg-muted text-muted-foreground border border-border/70"
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
