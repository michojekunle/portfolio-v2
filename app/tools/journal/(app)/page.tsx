import Link from "next/link";
import { getObjectivesWithMilestones, getRecentEntries } from "@/lib/journal/queries";
import { VELA_ACCENT, VELA_ACCENT_SOFT, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/journal/types";
import type { JoEntry } from "@/lib/journal/types";
import { ArrowRight, BookOpen, Target, Zap } from "lucide-react";

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

  return (
    <div className="flex items-center gap-[6px]">
      {days.map((d) => {
        const done = doneSet.has(d);
        const isToday = d === todayStr();
        return (
          <div
            key={d}
            className="flex flex-col items-center gap-[4px]"
            title={formatDate(d)}
          >
            <div
              className="w-[32px] h-[32px] rounded-[8px] transition-all"
              style={{
                background: done
                  ? VELA_ACCENT
                  : isToday
                  ? VELA_ACCENT_SOFT
                  : "var(--bg-2)",
                border: isToday ? `2px solid ${VELA_ACCENT}` : "2px solid transparent",
              }}
            />
            <span className="font-mono text-[8px] tracking-[0.05em] uppercase text-[var(--ink-3)]">
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
    getRecentEntries(14),
  ]);

  const todayEntry = entries.find((e) => e.date === today) ?? null;
  const activeObjectives = objectives.filter((o) => o.status === "active");

  const streakCount = (() => {
    let count = 0;
    let cursor = new Date();
    const doneSet = new Set(entries.map((e) => e.date));
    while (true) {
      const d = cursor.toLocaleDateString("en-CA");
      if (!doneSet.has(d)) break;
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  return (
    <div className="max-w-[800px] mx-auto px-[32px] py-[48px] max-[640px]:px-[20px] max-[640px]:py-[32px]">
      {/* Header */}
      <div className="mb-[40px]">
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase mb-[8px] text-[var(--ink-3)]">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <h1 className="font-display text-[32px] font-normal tracking-[-0.02em] fvs-text m-0 text-[var(--ink)]">
          {todayEntry ? "Good work today." : "What will you move forward today?"}
        </h1>
      </div>

      {/* Today's entry CTA */}
      <Link
        href={`/tools/journal/log/${today}`}
        className="block rounded-[12px] p-[24px] mb-[40px] no-underline transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[1px]"
        style={{
          background: todayEntry ? VELA_ACCENT_SOFT : VELA_ACCENT,
          border: `1.5px solid ${todayEntry ? `${VELA_ACCENT}30` : "transparent"}`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div
              className="flex items-center gap-[8px] font-mono text-[10px] tracking-[0.14em] uppercase mb-[8px]"
              style={{ color: todayEntry ? VELA_ACCENT : "rgba(255,255,255,0.7)" }}
            >
              <BookOpen size={12} />
              {todayEntry ? "Today's Entry" : "Start Today's Log"}
            </div>
            {todayEntry ? (
              <div>
                <div className="text-[15px] font-medium mb-[4px]" style={{ color: VELA_ACCENT }}>
                  {todayEntry.top_priorities.length} priorities planned ·{" "}
                  {todayEntry.accomplished.length} accomplished
                </div>
                {todayEntry.energy_level && (
                  <div className="font-mono text-[11px]" style={{ color: `${VELA_ACCENT}90` }}>
                    Energy: {"⚡".repeat(todayEntry.energy_level)}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[15px] font-medium text-white">
                Set your priorities for today
              </div>
            )}
          </div>
          <ArrowRight
            size={20}
            style={{ color: todayEntry ? VELA_ACCENT : "white", flexShrink: 0 }}
          />
        </div>
      </Link>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-[16px] mb-[40px]">
        {[
          { label: "Streak", value: `${streakCount}d`, sub: "days logged" },
          { label: "Active", value: activeObjectives.length.toString(), sub: "objectives" },
          {
            label: "This Week",
            value: entries.filter((e) => {
              const d = new Date(e.date);
              const now = new Date();
              const weekStart = new Date(now);
              weekStart.setDate(now.getDate() - now.getDay());
              return d >= weekStart;
            }).length.toString(),
            sub: "entries",
          },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="rounded-[10px] p-[16px] text-center"
            style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
          >
            <div
              className="font-display text-[28px] font-normal tracking-[-0.02em] fvs-text leading-[1]"
              style={{ color: VELA_ACCENT }}
            >
              {value}
            </div>
            <div className="font-mono text-[9px] tracking-[0.12em] uppercase mt-[6px] text-[var(--ink-3)]">
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* 7-day streak grid */}
      <section className="mb-[40px]">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase mb-[16px] text-[var(--ink-3)]">
          Last 7 Days
        </div>
        <EntryStreak entries={entries} />
      </section>

      {/* Active objectives */}
      {activeObjectives.length > 0 && (
        <section className="mb-[40px]">
          <div className="flex items-center justify-between mb-[16px]">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
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
                  className="flex items-center gap-[14px] rounded-[10px] px-[16px] py-[14px] no-underline transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
                >
                  <span className="text-[20px] flex-shrink-0">{obj.icon}</span>
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
                            className="h-full rounded-full"
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
                    className="font-mono text-[9px] tracking-[0.08em] uppercase px-[7px] py-[3px] rounded-full flex-shrink-0"
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

      {/* Recent entries */}
      {entries.length > 0 && (
        <section>
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase mb-[16px] text-[var(--ink-3)]">
            Recent Entries
          </div>
          <div className="space-y-[8px]">
            {entries.slice(0, 5).map((entry) => (
              <Link
                key={entry.date}
                href={`/tools/journal/log/${entry.date}`}
                className="flex items-center gap-[14px] rounded-[10px] px-[16px] py-[13px] no-underline transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
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

      {/* Empty state */}
      {activeObjectives.length === 0 && entries.length === 0 && (
        <div className="text-center py-[60px]">
          <div className="text-[40px] mb-[16px]">🧭</div>
          <div className="font-display text-[22px] font-normal tracking-[-0.01em] fvs-text mb-[8px] text-[var(--ink)]">
            Set your first objective
          </div>
          <p className="text-[14px] leading-[1.6] text-[var(--ink-3)] mb-[24px] max-w-[360px] mx-auto">
            Objectives are the big things you're steering toward. Start with one.
          </p>
          <Link
            href="/tools/journal/objectives"
            className="inline-flex items-center gap-[8px] px-[20px] py-[11px] rounded-[8px] font-mono text-[11px] tracking-[0.12em] uppercase font-semibold text-white no-underline transition-opacity hover:opacity-90"
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
