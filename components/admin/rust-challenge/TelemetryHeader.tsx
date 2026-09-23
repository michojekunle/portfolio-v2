"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Grid3X3, LayoutDashboard, ScrollText, Sparkles } from "lucide-react";
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
      {/* Top AWS-Style System Telemetry Bar */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 dark:border-white/10 bg-card/75 dark:bg-[#0c0c10]/90 backdrop-blur-2xl p-5 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors">
        {/* Decorative background atmosphere */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/10 dark:bg-orange-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/10 dark:bg-purple-500/15 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Title & Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 border border-emerald-500/40 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase">
                <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                Live Pipeline
              </span>

              <span className="font-mono text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Sprint: Phase 0{currentDay.phase} · Week 0{currentDay.week_number}
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-foreground fvs-display leading-[1.1] text-balance">
              188-Day Systems, ZK & Architecture Sprint
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-[65ch] leading-relaxed font-sans">
              Self-paced command center spanning Systems Rust, DSA algorithms, Frontend internals, and Staff-level distributed systems design.
            </p>
          </div>

          {/* Right Metrics Cluster */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 lg:min-w-[340px]">
            {/* Metric 1: Sequential Streak */}
            <div className="rounded-2xl border border-orange-500/30 dark:border-orange-500/20 bg-background/80 dark:bg-black/40 p-3.5 sm:p-4 space-y-1 backdrop-blur-md shadow-2xs">
              <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                <Flame className={`h-4 w-4 ${streak > 0 ? "fill-current" : ""}`} />
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">Streak</span>
              </div>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums leading-none">
                {streak}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground">Days Unbroken</p>
            </div>

            {/* Metric 2: Mastered Velocity */}
            <div className="rounded-2xl border border-border/60 dark:border-white/5 bg-background/80 dark:bg-black/40 p-3.5 sm:p-4 space-y-1 backdrop-blur-md shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">Progress</span>
              </div>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums leading-none">
                {progressPct}%
              </p>
              <p className="text-[10px] font-mono text-muted-foreground tabular-nums">
                {completedCount}/{days.length} Done
              </p>
            </div>

            {/* Metric 3: Active Day Coordinates */}
            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border/60 dark:border-white/5 bg-background/80 dark:bg-black/40 p-3.5 sm:p-4 space-y-1 backdrop-blur-md shadow-2xs">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Focus Day</span>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums leading-none">
                Day {currentDay.day_number}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground truncate">
                {activeCount} Active Total
              </p>
            </div>
          </div>
        </div>

        {/* Linear Progress Rail */}
        <div className="relative mt-6 pt-4 border-t border-border/40 dark:border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
            <span className="font-medium">Curriculum Velocity</span>
            <span className="tabular-nums font-semibold text-foreground">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5 bg-muted dark:bg-white/10" />
        </div>
      </div>

      {/* Tri-Mode View Switcher Pills */}
      <div className="flex items-center overflow-x-auto no-scrollbar py-0.5">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-border/60 bg-card/80 dark:bg-card/60 backdrop-blur-xl shadow-2xs">
          <button
            type="button"
            onClick={() => onViewModeChange("cockpit")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg font-mono text-xs transition-all cursor-pointer whitespace-nowrap ${
              viewMode === "cockpit"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5 font-medium"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Today's Cockpit</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("matrix")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg font-mono text-xs transition-all cursor-pointer whitespace-nowrap ${
              viewMode === "matrix"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5 font-medium"
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            <span>188-Day Horizon Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("manifesto")}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg font-mono text-xs transition-all cursor-pointer whitespace-nowrap ${
              viewMode === "manifesto"
                ? "bg-foreground text-background shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5 font-medium"
            }`}
          >
            <ScrollText className="h-3.5 w-3.5" />
            <span>Architecture Manifesto</span>
          </button>
        </div>
      </div>
    </div>
  );
}
