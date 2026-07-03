import Link from "next/link";
import { getObjectivesWithMilestones, getRecentEntries } from "@/lib/journal/queries";
import {
  VELA_ACCENT,
  VELA_ACCENT_SOFT,
  PRIORITY_CONFIG,
} from "@/lib/journal/types";
import type { JoEntry } from "@/lib/journal/types";
import { ArrowRight, BookOpen, Target } from "lucide-react";
import { MonthHeatmap } from "@/components/journal/MonthHeatmap";

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

function EntryStreak({ entries }: { entries: JoEntry[] }): React.ReactElement {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toLocaleDateString("en-CA");
  });

  const doneSet = new Set(entries.map((e) => e.date));
  const currentTodayStr = today.toLocaleDateString("en-CA");

  return (
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
              className="w-full h-[36px] rounded-[10px] transition-all duration-300"
              style={{
                background: done
                  ? VELA_ACCENT
                  : isToday
                  ? `rgba(124,58,237,0.15)`
                  : "var(--bg-2)",
                border: isToday ? `2px solid ${VELA_ACCENT}` : "2px solid transparent",
                boxShadow: done ? `0 2px 10px rgba(124,58,237,0.3)` : undefined,
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
  );
}

export default async function JournalDashboard(): Promise<React.ReactElement> {
  const today = todayStr();
  const [objectives, entries] = await Promise.all([
    getObjectivesWithMilestones(),
    getRecentEntries(90), // 90 days covers 3 months for heatmap
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

  const weekEntries = entries.filter((e) => {
    const d = new Date(e.date);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    return d >= weekStart;
  });

  const entryDates = entries.map((e) => e.date);

  return (
    <div className="max-w-[820px] mx-auto px-[32px] py-[52px] max-[640px]:px-[20px] max-[640px]:py-[36px]">

      {/* ── Hero Header ── */}
      <div className="mb-[48px] relative">
        {/* Ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-40px",
            left: "-60px",
            width: "340px",
            height: "220px",
            background: `radial-gradient(ellipse, ${VELA_ACCENT}20 0%, transparent 70%)`,
            borderRadius: "50%",
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase mb-[10px] text-[var(--ink-3)]">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <h1
            className="font-display font-normal leading-[1.02] tracking-[-0.025em] fvs-text m-0"
            style={{
              fontSize: "clamp(32px,5vw,48px)",
              color: "var(--ink)",
            }}
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
      </div>

      {/* ── Today's entry CTA ── */}
      <Link
        href={`/tools/journal/log/${today}`}
        className="block rounded-[16px] p-[24px] mb-[44px] no-underline transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-[2px]"
        style={
          todayEntry
            ? {
                background: VELA_ACCENT_SOFT,
                border: `1.5px solid rgba(124,58,237,0.25)`,
              }
            : {
                background: `linear-gradient(135deg, ${VELA_ACCENT} 0%, #6d28d9 100%)`,
                border: "1.5px solid transparent",
                boxShadow: `0 4px 24px rgba(124,58,237,0.35)`,
              }
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <div
              className="flex items-center gap-[8px] font-mono text-[10px] tracking-[0.14em] uppercase mb-[10px]"
              style={{ color: todayEntry ? VELA_ACCENT : "rgba(255,255,255,0.75)" }}
            >
              <BookOpen size={12} />
              {todayEntry ? "Today's Entry" : "Start Today's Log"}
            </div>
            {todayEntry ? (
              <div>
                <div className="text-[16px] font-semibold mb-[4px]" style={{ color: VELA_ACCENT }}>
                  {todayEntry.top_priorities.length} priorities planned ·{" "}
                  {todayEntry.accomplished.length} accomplished
                </div>
                {todayEntry.energy_level && (
                  <div className="font-mono text-[12px]" style={{ color: `${VELA_ACCENT}90` }}>
                    Energy: {"⚡".repeat(todayEntry.energy_level)}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="text-[17px] font-semibold text-white mb-[4px]">
                  Set your priorities for today
                </div>
                <div className="font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Priorities · What got done · Reflection · Energy
                </div>
              </div>
            )}
          </div>
          <ArrowRight
            size={22}
            style={{
              color: todayEntry ? VELA_ACCENT : "white",
              flexShrink: 0,
              opacity: 0.8,
            }}
          />
        </div>
      </Link>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-[16px] mb-[48px]">
        {[
          {
            label: "Current Streak",
            value: `${streakCount}`,
            unit: "days",
            accent: true,
            icon: streakCount > 0 ? "🔥" : "📅",
          },
          {
            label: "Active",
            value: activeObjectives.length.toString(),
            unit: "objectives",
            accent: false,
            icon: "🎯",
          },
          {
            label: "This Week",
            value: weekEntries.length.toString(),
            unit: "entries",
            accent: false,
            icon: "📖",
          },
        ].map(({ label, value, unit, accent, icon }) => (
          <div
            key={label}
            className="rounded-[14px] p-[20px] flex flex-col"
            style={{
              background: accent ? VELA_ACCENT_SOFT : "var(--bg-2)",
              border: accent ? `1.5px solid rgba(124,58,237,0.2)` : "1px solid var(--rule)",
            }}
          >
            <span className="text-[20px] mb-[10px] select-none" aria-hidden="true">
              {icon}
            </span>
            <div
              className="font-display text-[44px] max-[640px]:text-[36px] font-normal tracking-[-0.03em] fvs-text leading-[1]"
              style={{ color: accent ? VELA_ACCENT : "var(--ink)" }}
            >
              {value}
            </div>
            <div
              className="font-mono text-[9px] tracking-[0.12em] uppercase mt-[6px]"
              style={{ color: accent ? VELA_ACCENT : "var(--ink-3)", opacity: accent ? 0.75 : 1 }}
            >
              {unit}
            </div>
            <div
              className="font-mono text-[8px] tracking-[0.1em] uppercase mt-[2px]"
              style={{ color: "var(--ink-4)" }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── 7-day streak grid ── */}
      <section className="mb-[48px]">
        <div className="flex items-center justify-between mb-[18px]">
          <div className="flex items-center gap-[10px]">
            <span className="text-[18px]" aria-hidden="true">🔥</span>
            <div>
              <span
                className="font-display text-[24px] font-normal tracking-[-0.02em] fvs-text"
                style={{ color: "var(--ink)" }}
              >
                {streakCount}
              </span>
              <span
                className="font-mono text-[10px] tracking-[0.1em] uppercase ml-[6px]"
                style={{ color: "var(--ink-3)" }}
              >
                day streak
              </span>
            </div>
          </div>
          <div
            className="font-mono text-[10px] tracking-[0.14em] uppercase"
            style={{ color: "var(--ink-3)" }}
          >
            Last 7 Days
          </div>
        </div>
        <EntryStreak entries={entries} />
      </section>

      {/* ── Monthly heatmap ── */}
      <section className="mb-[48px]">
        <div
          className="font-mono text-[10px] tracking-[0.14em] uppercase mb-[16px]"
          style={{ color: "var(--ink-3)" }}
        >
          Monthly Activity
        </div>
        <div
          className="rounded-[16px] p-[24px]"
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--rule)",
          }}
        >
          <MonthHeatmap entryDates={entryDates} />
        </div>
      </section>

      {/* ── Active objectives ── */}
      {activeObjectives.length > 0 && (
        <section className="mb-[48px]">
          <div className="flex items-center justify-between mb-[16px]">
            <div
              className="font-mono text-[10px] tracking-[0.14em] uppercase"
              style={{ color: "var(--ink-3)" }}
            >
              Active Objectives
            </div>
            <Link
              href="/tools/journal/objectives"
              className="font-mono text-[10px] tracking-[0.10em] uppercase no-underline transition-opacity hover:opacity-70"
              style={{ color: VELA_ACCENT }}
            >
              Manage →
            </Link>
          </div>
          <div className="space-y-[10px]">
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
                  className="flex items-center gap-[14px] rounded-[12px] px-[16px] py-[14px] no-underline transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-[1px]"
                  style={{
                    background: `linear-gradient(135deg, ${obj.color}08 0%, var(--bg-2) 60%)`,
                    border: "1px solid var(--rule)",
                  }}
                >
                  {/* Icon badge */}
                  <div
                    className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center text-[18px] flex-shrink-0"
                    style={{
                      background: `${obj.color}18`,
                      border: `1px solid ${obj.color}28`,
                    }}
                  >
                    {obj.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium truncate text-[var(--ink)]">
                      {obj.title}
                    </div>
                    {total > 0 && (
                      <div className="flex items-center gap-[8px] mt-[6px]">
                        <div
                          className="flex-1 h-[3px] rounded-full overflow-hidden"
                          style={{ background: "var(--rule)", maxWidth: "120px" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: obj.color }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-[var(--ink-3)]">
                          {done}/{total}
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    className="font-mono text-[9px] tracking-[0.08em] uppercase px-[8px] py-[3px] rounded-full flex-shrink-0"
                    style={{ background: `${priCfg.color}15`, color: priCfg.color }}
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
          <div className="flex items-center justify-between mb-[16px]">
            <div
              className="font-mono text-[10px] tracking-[0.14em] uppercase"
              style={{ color: "var(--ink-3)" }}
            >
              Recent Entries
            </div>
            <Link
              href="/tools/journal/log/history"
              className="font-mono text-[10px] tracking-[0.10em] uppercase no-underline transition-opacity hover:opacity-70"
              style={{ color: VELA_ACCENT }}
            >
              View all →
            </Link>
          </div>
          <div className="space-y-[8px]">
            {entries.slice(0, 5).map((entry) => (
              <Link
                key={entry.date}
                href={`/tools/journal/log/${entry.date}`}
                className="flex items-center gap-[14px] rounded-[12px] px-[16px] py-[13px] no-underline transition-all hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:-translate-y-[1px]"
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
                  <div className="font-mono text-[11px] mt-[3px] text-[var(--ink-3)]">
                    {entry.top_priorities.length}p · {entry.accomplished.length} done
                    {entry.energy_level && ` · ${"⚡".repeat(entry.energy_level)}`}
                  </div>
                </div>
                <ArrowRight size={14} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Empty state ── */}
      {activeObjectives.length === 0 && entries.length === 0 && (
        <div className="text-center py-[80px]">
          <div
            className="mx-auto mb-[24px] w-[80px] h-[80px] rounded-[20px] flex items-center justify-center text-[36px]"
            style={{ background: VELA_ACCENT_SOFT }}
          >
            🧭
          </div>
          <div
            className="font-display text-[26px] font-normal tracking-[-0.01em] fvs-text mb-[10px]"
            style={{ color: "var(--ink)" }}
          >
            Set your first objective
          </div>
          <p
            className="text-[15px] leading-[1.6] mb-[28px] max-w-[400px] mx-auto"
            style={{ color: "var(--ink-3)" }}
          >
            Objectives are the big things you&apos;re steering toward. Start with one, then log
            your daily progress against it.
          </p>
          <Link
            href="/tools/journal/objectives"
            className="inline-flex items-center gap-[8px] px-[24px] py-[13px] rounded-[10px] font-mono text-[11px] tracking-[0.12em] uppercase font-semibold text-white no-underline transition-opacity hover:opacity-90"
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
