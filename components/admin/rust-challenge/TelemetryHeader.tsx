"use client";

import { Flame, Grid3X3, LayoutDashboard, ScrollText, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { ChallengeViewMode, RustChallengeDay } from "./types";

interface TelemetryHeaderProps {
  days: RustChallengeDay[];
  currentDay: RustChallengeDay;
  streak: number;
  completedCount: number;
  activeCount: number;
  progressPct: number;
  viewMode: ChallengeViewMode;
  onViewModeChange: (mode: ChallengeViewMode) => void;
}

export function TelemetryHeader({
  days,
  currentDay,
  streak,
  completedCount,
  activeCount,
  progressPct,
  viewMode,
  onViewModeChange,
}: TelemetryHeaderProps): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Telemetry Ingress Surface */}
      <div className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-xl p-5 sm:p-7 shadow-xs">
        {/* Header line: Title & Context */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-border/60">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="font-semibold text-foreground">Phase {currentDay.phase}</span>
              <span>/</span>
              <span>Week {currentDay.week_number}</span>
              <span>·</span>
              <span className="truncate max-w-[320px]">{currentDay.week_focus}</span>
            </div>

            <h1 className="font-sans font-bold text-2xl sm:text-3xl tracking-tight text-foreground text-balance">
              188-Day Systems, ZK & Distributed Architecture
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-[70ch] leading-relaxed font-sans">
              Daily engineering tracks covering low-level Rust systems, algorithms, browser runtimes, and staff-level distributed systems design.
            </p>
          </div>

          {/* View Mode Segmented Controls */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-border/80 bg-background/90 self-start shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange("cockpit")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === "cockpit"
                  ? "bg-foreground text-background font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Day Cockpit</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("matrix")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === "matrix"
                  ? "bg-foreground text-background font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              <span>188-Day Grid</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange("manifesto")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === "manifesto"
                  ? "bg-foreground text-background font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <ScrollText className="h-3.5 w-3.5" />
              <span>Manifesto</span>
            </button>
          </div>
        </div>

        {/* Flattened Telemetry Metrics Bar (No nested cards, clean horizontal rule divisions) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-5">
          {/* Metric 1: Focus Day */}
          <div className="space-y-1">
            <span className="font-mono text-xs text-muted-foreground block">Active Day</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-foreground tabular-nums leading-none">
                {currentDay.day_number}
              </span>
              <span className="text-xs font-mono text-muted-foreground">/ {days.length}</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate">{currentDay.challenge_date}</p>
          </div>

          {/* Metric 2: Streak */}
          <div className="space-y-1 sm:border-l sm:border-border/60 sm:pl-6">
            <span className="font-mono text-xs text-muted-foreground block flex items-center gap-1">
              <Flame className={`h-3.5 w-3.5 ${streak > 0 ? "text-orange-500 fill-current" : "text-muted-foreground"}`} />
              Consecutive Streak
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-foreground tabular-nums leading-none">
                {streak}
              </span>
              <span className="text-xs font-mono text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">Unbroken progress</p>
          </div>

          {/* Metric 3: Completed Days */}
          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-border/60 pt-4 sm:pt-0 sm:pl-6">
            <span className="font-mono text-xs text-muted-foreground block flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Completed Days
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-foreground tabular-nums leading-none">
                {completedCount}
              </span>
              <span className="text-xs font-mono text-muted-foreground">({activeCount} active)</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono tabular-nums">{progressPct}% overall</p>
          </div>

          {/* Metric 4: Progress Bar */}
          <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-border/60 pt-4 sm:pt-0 sm:pl-6 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Curriculum Velocity</span>
              <span className="font-semibold text-foreground tabular-nums">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2 bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
