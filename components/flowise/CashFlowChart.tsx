"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/flowise/calculator";
import { usePrivacy, Amount } from "@/components/flowise/PrivacyProvider";

interface MonthData {
  income: number;
  expenses: number;
}

interface Props {
  data: Record<string, MonthData>;
}

const W = 560;
const H = 180;
const PAD = { top: 16, right: 16, bottom: 40, left: 60 };

export function CashFlowChart({ data }: Props): React.ReactElement {
  const { hidden } = usePrivacy();
const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; income: number; expenses: number } | null>(null);

  const { points, xLabels, yMax, yStep } = useMemo(() => {
    const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
    if (entries.length === 0) return { points: [], xLabels: [], yMax: 0, yStep: 0 };

    const allVals = entries.flatMap(([, v]) => [v.income, v.expenses]);
    const yMax = Math.max(...allVals, 1);
    const yStep = yMax / 4;

    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const points = entries.map(([month, v], i) => {
      const x = PAD.left + (entries.length < 2 ? chartW / 2 : (i / (entries.length - 1)) * chartW);
      const incomeY = PAD.top + chartH * (1 - v.income / yMax);
      const expenseY = PAD.top + chartH * (1 - v.expenses / yMax);
      const label = new Date(month + "-15").toLocaleDateString("en-NG", { month: "short", year: "2-digit" });
      return { x, incomeY, expenseY, income: v.income, expenses: v.expenses, label, month };
    });

    const xLabels = points.map((p) => ({ x: p.x, label: p.label }));

    return { points, xLabels, yMax, yStep };
  }, [data]);

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const buildPath = (pts: typeof points, key: "incomeY" | "expenseY"): string => {
  const { hidden } = usePrivacy();

    if (pts.length === 0) return "";
    return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p[key]}`).join(" ");
  };

  const buildArea = (pts: typeof points, key: "incomeY" | "expenseY"): string => {
    if (pts.length === 0) return "";
    const baseline = PAD.top + chartH;
    const line = buildPath(pts, key);
    return `${line} L ${pts[pts.length - 1].x} ${baseline} L ${pts[0].x} ${baseline} Z`;
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Cash Flow</div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 rounded-full bg-[#16A34A]" /><span className="font-mono text-[9px] text-muted-foreground">Income</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 rounded-full bg-[#EF4444]" /><span className="font-mono text-[9px] text-muted-foreground">Expenses</span></div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", minWidth: 300, height: H }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Y gridlines */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = PAD.top + (chartH / 4) * i;
            const val = yMax - yStep * i;
            return (
              <g key={i}>
                <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="var(--rule)" strokeWidth={1} />
                <text x={PAD.left - 6} y={y} textAnchor="end" style={{ fontSize: 8, fill: "var(--ink-4)", fontFamily: "monospace", dominantBaseline: "middle" }}>
                  {(hidden ? "****" : formatCurrency(val, "NGN", true))}
                </text>
              </g>
            );
          })}

          {/* Area fills */}
          {points.length > 1 && (
            <>
              <path d={buildArea(points, "incomeY")} fill="rgba(22,163,74,0.08)" />
              <path d={buildArea(points, "expenseY")} fill="rgba(239,68,68,0.08)" />
            </>
          )}

          {/* Lines */}
          {points.length > 1 && (
            <>
              <path d={buildPath(points, "incomeY")} fill="none" stroke="#16A34A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d={buildPath(points, "expenseY")} fill="none" stroke="#EF4444" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}

          {/* Data points + hover */}
          {points.map((p) => (
            <g key={p.month}>
              <circle cx={p.x} cy={p.incomeY} r={3} fill="#16A34A" />
              <circle cx={p.x} cy={p.expenseY} r={3} fill="#EF4444" />
              {/* Invisible hover target */}
              <rect
                x={p.x - 16}
                y={PAD.top}
                width={32}
                height={chartH}
                fill="transparent"
                onMouseEnter={() => setTooltip({ x: p.x, y: Math.min(p.incomeY, p.expenseY) - 10, label: p.label, income: p.income, expenses: p.expenses })}
              />
            </g>
          ))}

          {/* X labels */}
          {xLabels.map(({ x, label }) => (
            <text key={label} x={x} y={H - 6} textAnchor="middle" style={{ fontSize: 8, fill: "var(--ink-4)", fontFamily: "monospace" }}>{label}</text>
          ))}

          {/* Tooltip */}
          {tooltip && (
            <g>
              <line x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={PAD.top + chartH} stroke="var(--rule)" strokeWidth={1} strokeDasharray="3 3" />
              <rect
                x={Math.min(tooltip.x + 8, W - 136)}
                y={Math.max(tooltip.y - 30, PAD.top)}
                width={128}
                height={52}
                rx={6}
                fill="var(--bg)"
                stroke="var(--rule)"
                strokeWidth={1}
              />
              <text x={Math.min(tooltip.x + 14, W - 130)} y={Math.max(tooltip.y - 15, PAD.top + 14)} style={{ fontSize: 9, fill: "var(--ink-3)", fontFamily: "monospace" }}>{tooltip.label}</text>
              <text x={Math.min(tooltip.x + 14, W - 130)} y={Math.max(tooltip.y + 2, PAD.top + 28)} style={{ fontSize: 10, fill: "#16A34A", fontFamily: "monospace" }}>↑ {(hidden ? "****" : formatCurrency(tooltip.income, "NGN", true))}</text>
              <text x={Math.min(tooltip.x + 14, W - 130)} y={Math.max(tooltip.y + 16, PAD.top + 42)} style={{ fontSize: 10, fill: "#EF4444", fontFamily: "monospace" }}>↓ {(hidden ? "****" : formatCurrency(tooltip.expenses, "NGN", true))}</text>
            </g>
          )}
        </svg>
      </div>
      {points.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="font-mono text-[11px] text-(--ink-4)">No data yet — add transactions to see trends</div>
        </div>
      )}
    </div>
  );
}
