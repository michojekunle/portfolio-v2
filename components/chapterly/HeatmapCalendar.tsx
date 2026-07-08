"use client";

const ACCENT = "var(--ch-accent)";
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKS = 53;

function getDayLabel(minutes: number): string {
  if (minutes === 0) return "No activity";
  if (minutes < 10) return `${minutes}m`;
  if (minutes < 60) return `${minutes}m read`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m read` : `${h}h read`;
}

function getIntensity(minutes: number): number {
  if (minutes === 0) return 0;
  if (minutes < 10) return 0.2;
  if (minutes < 30) return 0.45;
  if (minutes < 60) return 0.65;
  if (minutes < 120) return 0.85;
  return 1;
}

interface Props {
  /** Map of "YYYY-MM-DD" → minutes read */
  data: Record<string, number>;
}

export function HeatmapCalendar({ data }: Props): React.ReactElement {
  // Build a 53-week × 7-day grid anchored on today.
  // All arithmetic is done in UTC so cell keys match the UTC-based data from the server.
  const nowUtcMs = Date.now();
  // UTC midnight of today
  const todayUtcMs = nowUtcMs - (nowUtcMs % 86_400_000);

  // Find the Sunday that starts the oldest displayed week (UTC)
  const gridStartMs = todayUtcMs - (WEEKS * 7 - 1) * 86_400_000;
  const gridStartDay = new Date(gridStartMs).getUTCDay(); // 0=Sun
  const gridAnchorMs = gridStartMs - gridStartDay * 86_400_000;

  // Build weeks: each is an array of 7 UTC epoch-ms values (Sun→Sat)
  const weeks: number[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(gridAnchorMs + (w * 7 + d) * 86_400_000);
    }
    weeks.push(week);
  }

  // Month label positions: one label per month, placed at the first week that
  // starts a new month
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const m = new Date(week[0]).getUTCMonth();
    if (m !== lastMonth) {
      monthLabels.push({
        label: new Date(week[0]).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
        weekIndex: i,
      });
      lastMonth = m;
    }
  });

  return (
    <div className="overflow-x-auto scrollbar-custom pb-[10px]">
      {/* Month labels */}
      <div className="flex gap-[4px] mb-[6px] pl-[26px]">
        {weeks.map((_, i) => {
          const label = monthLabels.find((ml) => ml.weekIndex === i);
          return (
            <div key={i} className="w-[12px] shrink-0 relative">
              {label ? (
                <span className="absolute left-0 top-0 font-mono text-[8px] tracking-[0.08em] uppercase text-[var(--ink-3)] whitespace-nowrap">
                  {label.label}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex gap-[4px]">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-[3px] mr-[2px] shrink-0">
          {DAYS_OF_WEEK.map((d, i) => (
            <div
              key={d}
              className="h-[12px] flex items-center font-mono text-[7px] text-[var(--ink-3)]"
              style={{ opacity: i % 2 === 0 ? 0 : 1 }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px] shrink-0">
            {week.map((dayMs) => {
              const key = new Date(dayMs).toISOString().slice(0, 10);
              const minutes = data[key] ?? 0;
              const intensity = getIntensity(minutes);
              const isFuture = dayMs > todayUtcMs;

              return (
                <div
                  key={key}
                  className="w-[12px] h-[12px] rounded-[2px]"
                  style={{
                    background:
                      isFuture
                        ? "transparent"
                        : minutes > 0
                          ? `rgba(79,109,122,${intensity})`
                          : "var(--rule)",
                    cursor: minutes > 0 ? "default" : undefined,
                    border: isFuture ? "1px solid var(--rule)" : undefined,
                    opacity: isFuture ? 0.3 : 1,
                  }}
                  title={isFuture ? undefined : `${key} — ${getDayLabel(minutes)}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-[6px] mt-[12px] justify-end">
        <span className="font-mono text-[8px] tracking-[0.08em] uppercase text-[var(--ink-3)]">
          Less
        </span>
        {[0, 0.2, 0.45, 0.65, 0.85, 1].map((op) => (
          <div
            key={op}
            className="w-[10px] h-[10px] rounded-[2px]"
            style={{
              background: op === 0 ? "var(--rule)" : `rgba(79,109,122,${op})`,
            }}
          />
        ))}
        <span className="font-mono text-[8px] tracking-[0.08em] uppercase text-[var(--ink-3)]">
          More
        </span>
      </div>
    </div>
  );
}
