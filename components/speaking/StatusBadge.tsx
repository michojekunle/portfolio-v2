import type { DayStatus } from "@/lib/speaking/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  DayStatus,
  { label: string; className: string; dotClass: string }
> = {
  today: {
    label: "Today",
    className: "border-(--ink) bg-(--ink) text-(--bg)",
    dotClass: "bg-(--bg)",
  },
  completed: {
    label: "Completed",
    className: "border-(--good)/40 bg-(--good)/12 text-(--good)",
    dotClass: "bg-(--good)",
  },
  practice_only: {
    label: "Practice-only",
    className: "border-(--good)/35 bg-(--paper) text-(--ink-2)",
    dotClass: "bg-(--good)",
  },
  in_progress: {
    label: "In Progress",
    className: "border-(--ink-3) bg-(--bg-2) text-(--ink)",
    dotClass: "bg-(--ink)",
  },
  missed: {
    label: "Missed",
    className: "border-destructive/35 bg-destructive/8 text-destructive",
    dotClass: "bg-destructive",
  },
  upcoming: {
    label: "Upcoming",
    className: "border-(--rule) bg-transparent text-(--ink-2)",
    dotClass: "bg-(--ink-3)",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: DayStatus;
  className?: string;
}): React.ReactElement {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] whitespace-nowrap",
        cfg.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dotClass)} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}
