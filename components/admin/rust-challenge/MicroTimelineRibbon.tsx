"use client";

import type { RustChallengeDay } from "./types";
import { isDayActive } from "./types";

interface MicroTimelineRibbonProps {
  days: RustChallengeDay[];
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
}

export function MicroTimelineRibbon({
  days,
  selectedDayNumber,
  onSelectDay,
}: MicroTimelineRibbonProps): React.ReactElement {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl p-4 space-y-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
        <span>188-Day Horizon Micro-Rail</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-xs bg-emerald-500" /> Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-xs bg-amber-500" /> Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-xs bg-white/20" /> Pending
          </span>
        </div>
      </div>

      {/* Progress tick bar */}
      <div className="flex items-center gap-[2px] overflow-x-auto py-1.5 no-scrollbar">
        {days.map((d) => {
          const isSelected = d.day_number === selectedDayNumber;
          const isDone = d.completed;
          const isActive = isDayActive(d);

          return (
            <button
              key={d.day_number}
              type="button"
              onClick={() => onSelectDay(d.day_number)}
              title={`Day ${d.day_number}: ${isDone ? "Completed" : isActive ? "Active" : "Pending"}`}
              className={`h-5 flex-1 min-w-[3px] sm:min-w-[4px] rounded-[1px] transition-all cursor-pointer ${
                isSelected
                  ? "bg-white ring-2 ring-orange-500 ring-offset-1 ring-offset-background scale-y-125 z-10"
                  : isDone
                    ? "bg-emerald-500 hover:bg-emerald-400"
                    : isActive
                      ? "bg-amber-500 hover:bg-amber-400"
                      : "bg-white/10 hover:bg-white/20"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
