"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/flowise/calculator";

interface Props {
  dailySpend: Record<string, number>;
  months?: number;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getIntensity(amount: number, max: number): number {
  if (amount === 0 || max === 0) return 0;
  return Math.min(Math.sqrt(amount / max), 1);
}

function intensityColor(intensity: number): string {
  if (intensity === 0) return "var(--rule)";
  const l = Math.round(90 - intensity * 55);
  return `oklch(${l}% 0.12 142)`;
}

export function SpendingHeatmap({ dailySpend, months = 3 }: Props): React.ReactElement {
  const { weeks, monthLabels, maxSpend } = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    // Start from N months ago on the first of that month
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - months + 1, 1);
    startDate.setHours(12, 0, 0, 0);

    // Build day array
    type DayEntry = { date: string; amount: number; isoDate: string };
    const days: DayEntry[] = [];
    const cur = new Date(startDate);
    while (cur <= today) {
      const iso = cur.toISOString().slice(0, 10);
      days.push({ date: iso, amount: Math.abs(dailySpend[iso] ?? 0), isoDate: iso });
      cur.setDate(cur.getDate() + 1);
    }

    const maxSpend = Math.max(...days.map((d) => d.amount), 1);

    // Pad to fill complete weeks (Mon-start)
    const firstDow = (startDate.getDay() + 6) % 7; // Mon=0
    const paddedDays: (DayEntry | null)[] = [
      ...Array.from({ length: firstDow }, () => null),
      ...days,
    ];
    // Pad end
    while (paddedDays.length % 7 !== 0) paddedDays.push(null);

    // Group into weeks
    const weeks: (DayEntry | null)[][] = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
      weeks.push(paddedDays.slice(i, i + 7));
    }

    // Month labels: find where month starts
    const monthLabels: { label: string; weekIdx: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstReal = week.find((d) => d !== null);
      if (!firstReal) return;
      const m = new Date(firstReal.date).getMonth();
      if (m !== lastMonth) {
        lastMonth = m;
        monthLabels.push({
          label: new Date(firstReal.date).toLocaleDateString("en-NG", { month: "short" }),
          weekIdx: wi,
        });
      }
    });

    return { weeks, monthLabels, maxSpend };
  }, [dailySpend, months]);

  const totalSpend = Object.values(dailySpend).reduce((s, v) => s + Math.abs(v), 0);
  const activeDays = Object.values(dailySpend).filter((v) => v !== 0).length;

  const CELL = 14;
  const GAP = 2;
  const SVG_W = weeks.length * (CELL + GAP) + 32;
  const SVG_H = 7 * (CELL + GAP) + 28;

  return (
    <div>
      <div className="flex items-center justify-between mb-[16px]">
        <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]">Spending Heatmap</div>
        <div className="flex items-center gap-[16px]">
          <div className="font-mono text-[10px] text-[var(--ink-4)]">{activeDays} active days · {formatCurrency(totalSpend, "NGN", true)} total</div>
          <div className="flex items-center gap-[4px]">
            <span className="font-mono text-[9px] text-[var(--ink-4)]">Less</span>
            {[0, 0.2, 0.5, 0.8, 1].map((v, i) => (
              <div key={i} className="w-[10px] h-[10px] rounded-[2px]" style={{ background: intensityColor(v) }} />
            ))}
            <span className="font-mono text-[9px] text-[var(--ink-4)]">More</span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto pb-[4px]" style={{ WebkitOverflowScrolling: "touch" }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: "100%", minWidth: Math.min(SVG_W, 500), height: SVG_H }}>
          {/* Month labels */}
          {monthLabels.map(({ label, weekIdx }) => (
            <text
              key={label + weekIdx}
              x={32 + weekIdx * (CELL + GAP)}
              y={10}
              className="font-mono"
              style={{ fontSize: 9, fill: "var(--ink-3)", fontFamily: "monospace" }}
            >{label}</text>
          ))}
          {/* Weekday labels */}
          {WEEKDAYS.map((d, i) => (
            <text
              key={d}
              x={24}
              y={22 + i * (CELL + GAP) + CELL / 2}
              textAnchor="end"
              style={{ fontSize: 8, fill: "var(--ink-4)", fontFamily: "monospace", dominantBaseline: "middle" }}
            >{i % 2 === 0 ? d.slice(0, 1) : ""}</text>
          ))}
          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              if (!day) return null;
              const intensity = getIntensity(day.amount, maxSpend);
              const x = 32 + wi * (CELL + GAP);
              const y = 18 + di * (CELL + GAP);
              return (
                <rect
                  key={day.date}
                  x={x} y={y}
                  width={CELL} height={CELL}
                  rx={3}
                  fill={intensityColor(intensity)}
                  style={{ cursor: "default" }}
                >
                  <title>{day.date}: {day.amount > 0 ? formatCurrency(day.amount, "NGN") : "No spending"}</title>
                </rect>
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
}
