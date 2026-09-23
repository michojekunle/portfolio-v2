"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Brain,
  Palette,
  Network,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { RustChallengeDay, UpdateFn } from "./types";
import { countDaySteps, PHASE_LABEL } from "./types";
import { DisciplineCard } from "./DisciplineCard";
import { ProofOfWorkTerminal } from "./ProofOfWorkTerminal";

interface DailyCockpitProps {
  day: RustChallengeDay;
  totalDays: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onUpdate: UpdateFn;
}

export function DailyCockpit({
  day,
  totalDays,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onUpdate,
}: DailyCockpitProps): React.ReactElement {
  const [macroSaving, setMacroSaving] = useState(false);
  const stepStats = countDaySteps(day);
  const allStepsDone = stepStats.completed === stepStats.total;

  const handleStepToggle = async (
    key: "rust_completed" | "dsa_completed" | "frontend_completed" | "system_design_completed",
    currentVal: boolean
  ): Promise<void> => {
    const nextVal = !currentVal;
    const isNowAllDone =
      (key === "rust_completed" ? nextVal : Boolean(day.rust_completed)) &&
      (key === "dsa_completed" ? nextVal : Boolean(day.dsa_completed)) &&
      (!day.frontend_task || (key === "frontend_completed" ? nextVal : Boolean(day.frontend_completed))) &&
      (!day.system_design_task || (key === "system_design_completed" ? nextVal : Boolean(day.system_design_completed)));

    await onUpdate(day.day_number, {
      [key]: nextVal,
      ...(isNowAllDone ? { completed: true } : {}),
    });
  };

  const handleToggleFullDay = async (): Promise<void> => {
    setMacroSaving(true);
    try {
      const nextState = !day.completed;
      await onUpdate(day.day_number, {
        completed: nextState,
        rust_completed: nextState,
        dsa_completed: nextState,
        frontend_completed: day.frontend_task ? nextState : false,
        system_design_completed: day.system_design_task ? nextState : false,
      });
    } finally {
      setMacroSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Day Command Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border border-border/60 bg-card/80 dark:bg-card/40 backdrop-blur-xl shadow-2xs">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onPrev}
            disabled={!hasPrev}
            className="h-8 px-2.5 rounded-lg border-border/80 hover:bg-muted/50 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="font-mono text-xs font-medium">Prev</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onNext}
            disabled={!hasNext}
            className="h-8 px-2.5 rounded-lg border-border/80 hover:bg-muted/50 cursor-pointer disabled:cursor-not-allowed"
          >
            <span className="font-mono text-xs font-medium">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Center Title & Context */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[11px] px-2.5 py-0.5 border-orange-500/40 text-orange-700 dark:text-orange-400 bg-orange-500/10 font-semibold"
          >
            Day {day.day_number} of {totalDays}
          </Badge>

          <span className="font-mono text-xs text-muted-foreground font-medium">
            Phase 0{day.phase} · Week 0{day.week_number}
          </span>

          <span className="text-muted-foreground/60 hidden sm:inline">|</span>

          <span className="text-xs font-semibold text-foreground/90 truncate max-w-[280px]">
            {day.week_focus}
          </span>
        </div>

        {/* Right Status Capsule */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <Badge
            variant={day.completed ? "default" : "outline"}
            className={`font-mono text-[11px] px-2.5 py-0.5 font-semibold transition-colors ${
              day.completed
                ? "bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600"
                : "border-border/80 text-muted-foreground"
            }`}
          >
            {day.completed ? "Day Verified ✓" : `${stepStats.completed}/${stepStats.total} Steps Done`}
          </Badge>
        </div>
      </div>

      {/* The 4-Quadrant Discipline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Discipline 1: Systems Rust & ZK Core */}
        <DisciplineCard
          stepNumber={1}
          totalSteps={stepStats.total}
          title="Systems & ZK Primitives"
          category="Rust Core"
          theme="amber"
          icon={<Cpu className="h-4 w-4 text-amber-600 dark:text-amber-500" />}
          description={day.daily_task}
          completed={Boolean(day.rust_completed || day.completed)}
          onToggle={() => handleStepToggle("rust_completed", Boolean(day.rust_completed))}
        />

        {/* Discipline 2: DSA Daily Rep */}
        <DisciplineCard
          stepNumber={2}
          totalSteps={stepStats.total}
          title="DSA Daily Rep"
          category="Algorithms"
          theme="cyan"
          icon={<Brain className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
          description={day.dsa_rep}
          completed={Boolean(day.dsa_completed || day.completed)}
          onToggle={() => handleStepToggle("dsa_completed", Boolean(day.dsa_completed))}
        />

        {/* Discipline 3: Frontend Mastery */}
        {day.frontend_task && (
          <DisciplineCard
            stepNumber={3}
            totalSteps={stepStats.total}
            title="Frontend Mastery"
            category="Web Runtime"
            theme="emerald"
            icon={<Palette className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            description={day.frontend_task}
            completed={Boolean(day.frontend_completed || day.completed)}
            onToggle={() => handleStepToggle("frontend_completed", Boolean(day.frontend_completed))}
          />
        )}

        {/* Discipline 4: Staff System Design */}
        {day.system_design_task && (
          <DisciplineCard
            stepNumber={4}
            totalSteps={stepStats.total}
            title="Staff System Design"
            category="Architecture"
            theme="violet"
            icon={<Network className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
            description={day.system_design_task}
            completed={Boolean(day.system_design_completed || day.completed)}
            onToggle={() => handleStepToggle("system_design_completed", Boolean(day.system_design_completed))}
          />
        )}
      </div>

      {/* Macro Day Action Button */}
      <div className="p-0.5">
        <Button
          onClick={handleToggleFullDay}
          disabled={macroSaving}
          variant={day.completed ? "outline" : "default"}
          className={`w-full h-12 text-xs sm:text-sm font-semibold rounded-xl font-mono tracking-wide transition-all shadow-md cursor-pointer ${
            day.completed
              ? "border-emerald-500/50 text-emerald-800 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
              : allStepsDone
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.25)]"
                : "bg-foreground text-background hover:bg-foreground/90"
          }`}
        >
          {macroSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : day.completed ? (
            <Check className="h-4 w-4 mr-2" />
          ) : allStepsDone ? (
            <Sparkles className="h-4 w-4 mr-2" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          {day.completed
            ? `Day ${day.day_number} fully mastered · Tap to reopen`
            : allStepsDone
              ? `All steps complete! Verify Day ${day.day_number}`
              : `Fast-Forward: Mark All Steps Done for Day ${day.day_number}`}
        </Button>
      </div>

      {/* Proof of Work Monospace Terminal */}
      <ProofOfWorkTerminal day={day} totalDays={totalDays} onUpdate={onUpdate} />
    </div>
  );
}
