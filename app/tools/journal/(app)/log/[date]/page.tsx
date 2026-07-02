import { notFound } from "next/navigation";
import { getEntryForDate, getObjectivesWithMilestones } from "@/lib/journal/queries";
import { EntryForm } from "@/components/journal/EntryForm";
import { VELA_ACCENT } from "@/lib/journal/types";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ date: string }>;
}

function formatHeaderDate(dateStr: string): { weekday: string; rest: string } {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { weekday: "", rest: dateStr };
  return {
    weekday: d.toLocaleDateString("en-GB", { weekday: "long" }),
    rest: d.toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" }),
  };
}

function adjacentDate(dateStr: string, delta: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + delta);
  return d.toLocaleDateString("en-CA");
}

export default async function LogDatePage({ params }: Props): Promise<React.ReactElement> {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const today = new Date().toLocaleDateString("en-CA");
  const isFuture = date > today;
  if (isFuture) notFound();

  const [entry, objectives] = await Promise.all([
    getEntryForDate(date),
    getObjectivesWithMilestones(),
  ]);

  const { weekday, rest } = formatHeaderDate(date);
  const isToday = date === today;
  const prevDate = adjacentDate(date, -1);
  const nextDate = adjacentDate(date, 1);
  const hasNext = nextDate <= today;

  return (
    <div className="max-w-[720px] mx-auto px-[32px] py-[48px] max-[640px]:px-[20px] max-[640px]:py-[32px]">
      {/* Date navigation */}
      <div className="flex items-center justify-between mb-[32px]">
        <Link
          href={`/tools/journal/log/${prevDate}`}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] no-underline transition-all hover:shadow-sm"
          style={{ background: "var(--bg-2)", border: "1px solid var(--rule)", color: "var(--ink-2)" }}
          aria-label="Previous day"
        >
          <ArrowLeft size={15} />
        </Link>

        <div className="text-center">
          <div
            className="font-display text-[22px] font-normal tracking-[-0.02em] fvs-text leading-[1] text-[var(--ink)]"
          >
            {weekday}
          </div>
          <div className="flex items-center justify-center gap-[8px] mt-[4px]">
            <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-3)]">{rest}</span>
            {isToday && (
              <span
                className="font-mono text-[9px] tracking-[0.1em] uppercase px-[7px] py-[2px] rounded-full"
                style={{ background: VELA_ACCENT, color: "#fff" }}
              >
                Today
              </span>
            )}
          </div>
        </div>

        {hasNext ? (
          <Link
            href={`/tools/journal/log/${nextDate}`}
            className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] no-underline transition-all hover:shadow-sm"
            style={{ background: "var(--bg-2)", border: "1px solid var(--rule)", color: "var(--ink-2)" }}
            aria-label="Next day"
          >
            <ArrowRight size={15} />
          </Link>
        ) : (
          <div className="w-[36px]" />
        )}
      </div>

      <EntryForm
        date={date}
        initialEntry={entry}
        objectives={objectives}
      />
    </div>
  );
}
