"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { VELA_ACCENT } from "@/lib/journal/types";

interface Props {
  /** Array of "YYYY-MM-DD" date strings that have entries */
  entryDates: string[];
}

function buildMonthGrid(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0 = Sunday
  const totalDays = lastDay.getDate();

  const grid: (string | null)[] = [];
  // Leading empty cells
  for (let i = 0; i < startDow; i++) grid.push(null);
  // Actual day cells
  for (let d = 1; d <= totalDays; d++) {
    grid.push(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    );
  }
  // Trailing empty cells to complete last row
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function MonthHeatmap({ entryDates }: Props): React.ReactElement {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const doneSet = new Set(entryDates);
  const today = now.toLocaleDateString("en-CA");

  const canGoNext =
    viewYear < now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth < now.getMonth());

  const goPrev = (): void => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = (): void => {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const grid = buildMonthGrid(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Month navigation header */}
      <div className="flex items-center justify-between mb-3.5">
        <span
          className="font-mono text-[11px] tracking-[0.12em] uppercase"
          style={{ color: "var(--ink-2)" }}
        >
          {monthLabel}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={goPrev}
            className="w-6.5 h-6.5 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer transition-colors"
            style={{ color: "var(--ink-3)" }}
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className="w-6.5 h-6.5 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer transition-colors disabled:opacity-25"
            style={{ color: "var(--ink-3)" }}
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 gap-0.75 mb-1">
        {DOW.map((d, i) => (
          <div
            key={i}
            className="font-mono text-[9px] tracking-[0.06em] text-center uppercase"
            style={{ color: "var(--ink-4)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.75">
        {grid.map((dateStr, i) => {
          if (!dateStr) return <div key={`empty-${i}`} className="aspect-square" />;
          const done = doneSet.has(dateStr);
          const isToday = dateStr === today;
          const isFuture = dateStr > today;

          return (
            <div
              key={dateStr}
              title={new Date(dateStr).toLocaleDateString("en-GB", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
              className="aspect-square rounded transition-all duration-300 cursor-default"
              style={{
                background: done
                  ? VELA_ACCENT
                  : isToday
                  ? `rgba(124,58,237,0.18)`
                  : isFuture
                  ? "transparent"
                  : "var(--bg-2)",
                border: isToday
                  ? `1.5px solid ${VELA_ACCENT}`
                  : `1.5px solid transparent`,
                opacity: isFuture ? 0.15 : 1,
                boxShadow: done ? `0 0 6px rgba(124,58,237,0.25)` : undefined,
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--bg-2)" }} />
        <span className="font-mono text-[9px]" style={{ color: "var(--ink-4)" }}>No entry</span>
        <div className="w-2.5 h-2.5 rounded-sm ml-1" style={{ background: VELA_ACCENT }} />
        <span className="font-mono text-[9px]" style={{ color: "var(--ink-4)" }}>Logged</span>
      </div>
    </div>
  );
}
