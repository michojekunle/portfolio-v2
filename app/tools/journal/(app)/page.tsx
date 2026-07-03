import Link from "next/link";
import { getObjectivesWithMilestones, getRecentEntries } from "@/lib/journal/queries";
import { VELA_ACCENT, VELA_ACCENT_SOFT, PRIORITY_CONFIG } from "@/lib/journal/types";
import type { JoEntry } from "@/lib/journal/types";
import { ArrowRight, Target } from "lucide-react";
import { MonthHeatmap } from "@/components/journal/MonthHeatmap";
import { DailyCTAs } from "@/components/journal/DailyCTAs";

function todayStr(): string {
  return new Date().toLocaleDateString("en-CA");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function EntryStreak({
  entries,
  streakCount,
}: {
  entries: JoEntry[];
  streakCount: number;
}): React.ReactElement {
  const today = new Date();
  const currentTodayStr = today.toLocaleDateString("en-CA");
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toLocaleDateString("en-CA");
  });
  const doneSet = new Set(entries.map((e) => e.date));

  return (
    <div>
      {/* Section header with streak count inline */}
      <div className="flex items-center justify-between mb-[14px]">
        <span
          className="font-mono text-[10px] tracking-[0.14em] uppercase"
          style={{ color: "var(--ink-3)" }}
        >
          Last 7 days
        </span>
        {streakCount > 0 && (
          <span
            className="font-mono text-[10px] tracking-[0.1em]"
            style={{ color: VELA_ACCENT }}
          >
            🔥 {streakCount}-day streak
          </span>
        )}
      </div>

      {/* Dot grid */}
      <div className="flex items-center gap-[8px]">
        {days.map((d) => {
          const done = doneSet.has(d);
          const isToday = d === currentTodayStr;
          return (
            <div
              key={d}
              className="flex flex-col items-center gap-[6px] flex-1"
              title={formatDate(d)}
            >
              <div
                className="w-full h-[32px] rounded-[8px] transition-all duration-300"
                style={{
                  background: done
                    ? VELA_ACCENT
                    : isToday
                    ? `rgba(124,58,237,0.14)`
                    : "var(--bg-2)",
                  border: isToday ? `2px solid ${VELA_ACCENT}` : "2px solid transparent",
                }}
              />
              <span
                className="font-mono text-[9px] tracking-[0.05em] uppercase"
                style={{
                  color: isToday ? VELA_ACCENT : "var(--ink-4)",
                  fontWeight: isToday ? 600 : 400,
                }}
              >
                {new Date(d).toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function JournalDashboard(): Promise<React.ReactElement> {
  const today = todayStr();
  const [objectives, entries] = await Promise.all([
    getObjectivesWithMilestones(),
    getRecentEntries(90),
  ]);

  const todayEntry = entries.find((e) => e.date === today) ?? null;
  const activeObjectives = objectives.filter((o) => o.status === "active");

  const streakCount = (() => {
    let count = 0;
    const cursor = new Date();
    const doneSet = new Set(entries.map((e) => e.date));
    while (true) {
      const d = cursor.toLocaleDateString("en-CA");
      if (!doneSet.has(d)) break;
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  const weekEntryCount = entries.filter((e) => {
    const d = new Date(e.date);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    return d >= weekStart;
  }).length;

  const entryDates = entries.map((e) => e.date);

  return (
    <div className="max-w-[760px] mx-auto px-[32px] py-[48px] max-[640px]:px-[20px] max-[640px]:py-[32px]">

      {/* ── Header ── */}
      <div className="mb-[36px]">
        <div
          className="font-mono text-[10px] tracking-[0.18em] uppercase mb-[8px]"
          style={{ color: "var(--ink-4)" }}
        >
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
        <h1
          className="font-display font-normal leading-[1.05] tracking-[-0.025em] fvs-text m-0"
          style={{ fontSize: "clamp(28px,4.5vw,42px)", color: "var(--ink)" }}
        >
          {todayEntry ? (
            <>
              Good work{" "}
              <em className="not-italic" style={{ color: VELA_ACCENT }}>
                today.
              </em>
            </>
          ) : (
            <>
              What will you{" "}
              <em className="not-italic" style={{ color: VELA_ACCENT }}>
                move forward
              </em>{" "}
              today?
            </>
          )}
        </h1>
      </div>

      {/* ── Today's CTAs — setting priorities and logging the day are two different moments ── */}
      <DailyCTAs date={today} todayEntry={todayEntry} />

      {/* ── Stats row — 3 clean numbers ── */}
      <div className="grid grid-cols-3 gap-[12px] mb-[40px]">
        {[
          { value: streakCount, label: "day streak", accent: streakCount > 0 },
          { value: activeObjectives.length, label: "objectives", accent: false },
          { value: weekEntryCount, label: "this week", accent: false },
        ].map(({ value, label, accent }) => (
          <div
            key={label}
            className="rounded-[12px] px-[16px] py-[18px]"
            style={{
              background: accent ? VELA_ACCENT_SOFT : "var(--bg-2)",
              border: accent ? `1.5px solid rgba(124,58,237,0.18)` : "1px solid var(--rule)",
              borderLeft: accent ? `3px solid ${VELA_ACCENT}` : undefined,
            }}
          >
            <div
              className="font-display text-[36px] font-normal tracking-[-0.03em] fvs-text leading-[1]"
              style={{ color: accent ? VELA_ACCENT : "var(--ink)" }}
            >
              {value}
            </div>
            <div
              className="font-mono text-[9px] tracking-[0.12em] uppercase mt-[6px]"
              style={{ color: accent ? VELA_ACCENT : "var(--ink-3)", opacity: accent ? 0.7 : 1 }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── 7-day streak grid ── */}
      <section className="mb-[40px]">
        <EntryStreak entries={entries} streakCount={streakCount} />
      </section>

      {/* ── Monthly heatmap ── */}
      <section className="mb-[40px]">
        <div
          className="font-mono text-[10px] tracking-[0.14em] uppercase mb-[14px]"
          style={{ color: "var(--ink-3)" }}
        >
          Monthly activity
        </div>
        <div
          className="rounded-[14px] p-[20px]"
          style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
        >
          <MonthHeatmap entryDates={entryDates} />
        </div>
      </section>

      {/* ── Active objectives ── */}
      {activeObjectives.length > 0 && (
        <section className="mb-[40px]">
          <div className="flex items-center justify-between mb-[14px]">
            <div
              className="font-mono text-[10px] tracking-[0.14em] uppercase"
              style={{ color: "var(--ink-3)" }}
            >
              Active objectives
            </div>
            <Link
              href="/tools/journal/objectives"
              className="font-mono text-[10px] tracking-[0.10em] uppercase no-underline transition-opacity hover:opacity-70"
              style={{ color: VELA_ACCENT }}
            >
              Manage →
            </Link>
          </div>
          <div className="space-y-[8px]">
            {activeObjectives.slice(0, 5).map((obj) => {
              const milestones = obj.milestones ?? [];
              const done = milestones.filter((m) => m.is_done).length;
              const total = milestones.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const priCfg = PRIORITY_CONFIG[obj.priority];
              return (
                <Link
                  key={obj.id}
                  href="/tools/journal/objectives"
                  className="flex items-center gap-[12px] rounded-[10px] px-[14px] py-[12px] no-underline transition-all hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
                >
                  {/* Icon */}
                  <div
                    className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center text-[16px] flex-shrink-0"
                    style={{ background: `${obj.color}18`, border: `1px solid ${obj.color}28` }}
                  >
                    {obj.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate text-[var(--ink)]">
                      {obj.title}
                    </div>
                    {total > 0 && (
                      <div className="flex items-center gap-[8px] mt-[5px]">
                        <div
                          className="flex-1 h-[3px] rounded-full overflow-hidden"
                          style={{ background: "var(--rule)", maxWidth: "100px" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: obj.color }}
                          />
                        </div>
                        <span
                          className="font-mono text-[9px]"
                          style={{ color: "var(--ink-4)" }}
                        >
                          {done}/{total}
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    className="font-mono text-[9px] tracking-[0.06em] uppercase px-[7px] py-[3px] rounded-full flex-shrink-0"
                    style={{ background: `${priCfg.color}12`, color: priCfg.color }}
                  >
                    {priCfg.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Recent entries ── */}
      {entries.length > 0 && (
        <section>
          <div
            className="font-mono text-[10px] tracking-[0.14em] uppercase mb-[14px]"
            style={{ color: "var(--ink-3)" }}
          >
            Recent entries
          </div>
          <div className="space-y-[6px]">
            {entries.slice(0, 5).map((entry) => (
              <Link
                key={entry.date}
                href={`/tools/journal/log/${entry.date}`}
                className="flex items-center gap-[12px] rounded-[10px] px-[14px] py-[12px] no-underline transition-all hover:shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--ink)]">
                    {formatDate(entry.date)}
                    {entry.date === today && (
                      <span
                        className="ml-[8px] font-mono text-[9px] tracking-[0.1em] uppercase px-[6px] py-[2px] rounded-full"
                        style={{ background: VELA_ACCENT_SOFT, color: VELA_ACCENT }}
                      >
                        Today
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[10px] mt-[2px]" style={{ color: "var(--ink-4)" }}>
                    {entry.top_priorities.length}p · {entry.accomplished.length} done
                    {entry.energy_level && ` · ${"⚡".repeat(entry.energy_level)}`}
                  </div>
                </div>
                <ArrowRight size={13} style={{ color: "var(--ink-4)", flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Empty state ── */}
      {activeObjectives.length === 0 && entries.length === 0 && (
        <div className="text-center py-[72px]">
          <div
            className="mx-auto mb-[20px] w-[64px] h-[64px] rounded-[16px] flex items-center justify-center text-[28px]"
            style={{ background: VELA_ACCENT_SOFT }}
          >
            🧭
          </div>
          <div
            className="font-display text-[24px] font-normal tracking-[-0.01em] fvs-text mb-[8px]"
            style={{ color: "var(--ink)" }}
          >
            Set your first objective
          </div>
          <p
            className="text-[14px] leading-[1.6] mb-[24px] max-w-[360px] mx-auto"
            style={{ color: "var(--ink-3)" }}
          >
            Objectives are the big things you&apos;re steering toward. Start with one, then log
            your daily progress against it.
          </p>
          <Link
            href="/tools/journal/objectives"
            className="inline-flex items-center gap-[8px] px-[20px] py-[11px] rounded-[10px] font-mono text-[11px] tracking-[0.12em] uppercase font-semibold text-white no-underline transition-opacity hover:opacity-90"
            style={{ background: VELA_ACCENT }}
          >
            <Target size={13} />
            Add Objective
          </Link>
        </div>
      )}
    </div>
  );
}
