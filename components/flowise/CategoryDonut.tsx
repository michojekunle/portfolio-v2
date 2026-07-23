"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/flowise/calculator";
import { usePrivacy, Amount } from "@/components/flowise/PrivacyProvider";

interface CategorySlice {
  id: string;
  name: string;
  icon: string;
  color: string;
  amount: number;
}

interface Props {
  data: CategorySlice[];
  total: number;
}

export function CategoryDonut({ data, total }: Props): React.ReactElement {
  const { hidden } = usePrivacy();
const [hovered, setHovered] = useState<string | null>(null);

  const sorted = [...data].sort((a, b) => b.amount - a.amount).slice(0, 8);

  const cx = 90;
  const cy = 90;
  const r = 68;
  const innerR = 44;

  let startAngle = -Math.PI / 2;

  const slices = sorted.map((s) => {
    const pct = total > 0 ? s.amount / total : 0;
    const angle = pct * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(startAngle + angle);
    const y2 = cy + r * Math.sin(startAngle + angle);
    const xi1 = cx + innerR * Math.cos(startAngle);
    const yi1 = cy + innerR * Math.sin(startAngle);
    const xi2 = cx + innerR * Math.cos(startAngle + angle);
    const yi2 = cy + innerR * Math.sin(startAngle + angle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const path = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${xi2} ${yi2}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi1} ${yi1}`,
      "Z",
    ].join(" ");
    startAngle += angle;
    return { ...s, path, pct };
  });

  const activeSlice = hovered ? slices.find((s) => s.id === hovered) : null;

  return (
    <div className="flex items-start gap-8 flex-wrap">
      {/* SVG donut */}
      <div className="relative shrink-0">
        <svg viewBox="0 0 180 180" width={180} height={180}>
          {slices.length === 0 ? (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--rule)" strokeWidth={r - innerR} />
          ) : slices.map((s) => (
            <path
              key={s.id}
              d={s.path}
              fill={s.color}
              opacity={hovered && hovered !== s.id ? 0.35 : 1}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer transition-opacity duration-150"
              style={{ strokeWidth: 2, stroke: "var(--bg)" }}
            />
          ))}
          {/* Inner hole label */}
          <circle cx={cx} cy={cy} r={innerR - 2} fill="var(--bg)" />
          {activeSlice ? (
            <>
              <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 18, fill: "var(--ink)", fontFamily: "sans-serif" }}>{activeSlice.icon}</text>
              <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 9, fill: "var(--ink)", fontFamily: "monospace", fontWeight: 600 }}>
                {Math.round(activeSlice.pct * 100)}%
              </text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 2} textAnchor="middle" style={{ fontSize: 12, fill: "var(--ink)", fontFamily: "monospace", fontWeight: 700 }}>
                {data.length > 0 ? `${data.length}` : "0"}
              </text>
              <text x={cx} y={cy + 10} textAnchor="middle" style={{ fontSize: 8, fill: "var(--ink-3)", fontFamily: "monospace" }}>categories</text>
            </>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 min-w-40 space-y-1.5">
        {slices.length === 0 ? (
          <div className="text-[13px] text-muted-foreground py-5">No expense data</div>
        ) : slices.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-2.5 cursor-default"
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ opacity: hovered && hovered !== s.id ? 0.4 : 1, transition: "opacity 0.15s" }}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-[11px] text-muted-foreground mr-auto truncate">{s.icon} {s.name}</span>
            <span className="font-mono text-[10px] font-semibold text-(--ink) shrink-0">{(hidden ? "****" : formatCurrency(s.amount, "NGN", true))}</span>
            <span className="font-mono text-[9px] text-(--ink-4) w-7.5 text-right shrink-0">{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
