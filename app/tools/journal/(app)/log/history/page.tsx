import Link from "next/link";
import { getRecentEntries } from "@/lib/journal/queries";
import { VELA_ACCENT, VELA_ACCENT_SOFT } from "@/lib/journal/types";
import { ArrowRight, BookOpen } from "lucide-react";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export default async function HistoryPage(): Promise<React.ReactElement> {
  const today = new Date().toLocaleDateString("en-CA");
  const entries = await getRecentEntries(365);

  // Group entries by month
  const grouped = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const monthKey = entry.date.slice(0, 7); // "YYYY-MM"
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(entry);
    return acc;
  }, {});

  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-[720px] mx-auto px-[32px] py-[48px] max-[640px]:px-[20px] max-[640px]:py-[32px]">
      <div className="flex items-center justify-between mb-[40px]">
        <div>
          <h1 className="font-display text-[28px] font-normal tracking-[-0.02em] fvs-text m-0 text-[var(--ink)]">
            Entry History
          </h1>
          <p className="text-[13px] text-[var(--ink-3)] mt-[4px] mb-0">
            {entries.length} {entries.length === 1 ? "entry" : "entries"} in the last year
          </p>
        </div>
        <Link
          href={`/tools/journal/log/${today}`}
          className="flex items-center gap-[8px] px-[14px] py-[8px] rounded-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold text-white no-underline transition-opacity hover:opacity-90"
          style={{ background: VELA_ACCENT }}
        >
          <BookOpen size={12} />
          Today
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-[80px]">
          <div
            className="mx-auto mb-[20px] w-[64px] h-[64px] rounded-[16px] flex items-center justify-center text-[28px]"
            style={{ background: VELA_ACCENT_SOFT }}
          >
            📖
          </div>
          <div className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text mb-[8px] text-[var(--ink)]">
            No entries yet
          </div>
          <p className="text-[14px] text-[var(--ink-3)] mb-[24px]">
            Start logging your days and they&apos;ll appear here.
          </p>
          <Link
            href={`/tools/journal/log/${today}`}
            className="inline-flex items-center gap-[8px] px-[20px] py-[10px] rounded-[8px] font-mono text-[11px] tracking-[0.12em] uppercase font-semibold text-white no-underline"
            style={{ background: VELA_ACCENT }}
          >
            Write today&apos;s entry
          </Link>
        </div>
      ) : (
        <div className="space-y-[40px]">
          {months.map((month) => (
            <section key={month}>
              <div
                className="font-mono text-[10px] tracking-[0.16em] uppercase mb-[12px] pb-[8px]"
                style={{ color: "var(--ink-3)", borderBottom: "1px solid var(--rule)" }}
              >
                {formatMonth(`${month}-01`)}
                <span
                  className="ml-[8px] px-[6px] py-[1px] rounded-full text-[9px]"
                  style={{ background: VELA_ACCENT_SOFT, color: VELA_ACCENT }}
                >
                  {grouped[month].length}
                </span>
              </div>
              <div className="space-y-[6px]">
                {grouped[month].map((entry) => {
                  const isToday = entry.date === today;
                  return (
                    <Link
                      key={entry.date}
                      href={`/tools/journal/log/${entry.date}`}
                      className="flex items-center gap-[14px] rounded-[10px] px-[16px] py-[13px] no-underline transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-[1px]"
                      style={{
                        background: isToday ? VELA_ACCENT_SOFT : "var(--bg-2)",
                        border: isToday ? `1px solid rgba(124,58,237,0.25)` : "1px solid var(--rule)",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[13px] font-medium"
                          style={{ color: isToday ? VELA_ACCENT : "var(--ink)" }}
                        >
                          {formatDate(entry.date)}
                          {isToday && (
                            <span
                              className="ml-[8px] font-mono text-[9px] tracking-[0.1em] uppercase px-[6px] py-[2px] rounded-full"
                              style={{ background: VELA_ACCENT, color: "#fff" }}
                            >
                              Today
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] mt-[3px] text-[var(--ink-3)]">
                          {entry.top_priorities.length > 0
                            ? `${entry.top_priorities.length} priorit${entry.top_priorities.length === 1 ? "y" : "ies"}`
                            : "No priorities"}
                          {" · "}
                          {entry.accomplished.length > 0
                            ? `${entry.accomplished.length} done`
                            : "Nothing logged"}
                          {entry.energy_level ? ` · ${"⚡".repeat(entry.energy_level)}` : ""}
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
