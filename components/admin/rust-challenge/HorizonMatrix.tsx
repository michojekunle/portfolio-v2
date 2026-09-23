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
    <div className="space-y-6">
      {/* Matrix Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className="h-7 text-xs font-mono px-3 rounded-lg cursor-pointer"
          >
            All (188)
          </Button>
          <Button
            size="sm"
            variant={filter === "incomplete" ? "default" : "outline"}
            onClick={() => setFilter("incomplete")}
            className="h-7 text-xs font-mono px-3 rounded-lg cursor-pointer"
          >
            Incomplete
          </Button>
          <Button
            size="sm"
            variant={filter === "active" ? "default" : "outline"}
            onClick={() => setFilter("active")}
            className="h-7 text-xs font-mono px-3 rounded-lg cursor-pointer"
          >
            Active In Progress
          </Button>
          <Button
            size="sm"
            variant={filter === "completed" ? "default" : "outline"}
            onClick={() => setFilter("completed")}
            className="h-7 text-xs font-mono px-3 rounded-lg cursor-pointer"
          >
            Completed
          </Button>
        </div>

        {/* Phase Quick Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4].map((p) => (
            <Button
              key={p}
              size="sm"
              variant={filter === `phase${p}` ? "secondary" : "ghost"}
              onClick={() => setFilter(`phase${p}` as FilterOption)}
              className="h-7 text-[11px] font-mono px-2 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Phase {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Matrix Content */}
      <div className="space-y-8">
        {groupedStructure.map(({ phase, weeks }) => (
          <div key={phase} className="space-y-4">
            {/* Phase Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <h3 className="font-display font-bold text-sm tracking-tight text-foreground uppercase">
                  Phase 0{phase} — {PHASE_LABEL[phase] || "Mastery Track"}
                </h3>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {weeks.reduce((acc, [, wDays]) => acc + wDays.length, 0)} Days
              </span>
            </div>

            {/* Weeks Container */}
            <div className="grid grid-cols-1 gap-4">
              {weeks.map(([weekNum, weekDays]) => (
                <div
                  key={weekNum}
                  className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl p-4 space-y-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-foreground/90">
                      Week 0{weekNum} — {weekDays[0].week_focus}
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                      {weekDays.filter((d) => d.completed).length}/{weekDays.length} Done
                    </Badge>
                  </div>

                  {/* High Density Day Tiles Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {weekDays.map((d) => {
                      const isSelected = d.day_number === selectedDayNumber;
                      const stats = countDaySteps(d);
                      const active = isDayActive(d);

                      return (
                        <div
                          key={d.day_number}
                          className={`relative rounded-xl border p-3 flex flex-col justify-between gap-2.5 transition-all duration-200 ${
                            isSelected
                              ? "border-orange-500/70 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.15)] ring-1 ring-orange-500/40"
                              : d.completed
                                ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                                : active
                                  ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                                  : "border-border/40 bg-background/40 hover:border-border/70 hover:bg-background/60"
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
                                  d.rust_completed || d.completed ? "bg-amber-400" : "bg-white/20"
                                }`}
                              />
                              <span
                                title="DSA"
                                className={`h-1.5 w-1.5 rounded-full ${
                                  d.dsa_completed || d.completed ? "bg-sky-400" : "bg-white/20"
                                }`}
                              />
                              {d.frontend_task && (
                                <span
                                  title="Frontend"
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    d.frontend_completed || d.completed ? "bg-emerald-400" : "bg-white/20"
                                  }`}
                                />
                              )}
                              {d.system_design_task && (
                                <span
                                  title="System Design"
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    d.system_design_completed || d.completed ? "bg-purple-400" : "bg-white/20"
                                  }`}
                                />
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-foreground/80 line-clamp-2 leading-relaxed font-sans">
                            {d.daily_task}
                          </p>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
                            <button
                              type="button"
                              onClick={() => onSelectDay(d.day_number)}
                              className="font-mono text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>Inspect</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => void onUpdate(d.day_number, { completed: !d.completed })}
                              className={`h-6 px-2 rounded-md font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
                                d.completed
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                  : "bg-muted/40 hover:bg-muted text-muted-foreground border border-border/40"
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
