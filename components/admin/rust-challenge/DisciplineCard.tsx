"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";

export type DisciplineTheme = "amber" | "cyan" | "emerald" | "violet";

interface DisciplineCardProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  category: string;
  theme: DisciplineTheme;
  icon: React.ReactNode;
  description: string;
  completed: boolean;
  disabled?: boolean;
  onToggle: () => Promise<void> | void;
}

const THEME_STYLES: Record<
  DisciplineTheme,
  {
    border: string;
    borderActive: string;
    badgeBg: string;
    glow: string;
    toggleActiveBg: string;
  }
> = {
  amber: {
    border: "border-amber-500/30 dark:border-amber-500/20",
    borderActive: "border-amber-500/80 dark:border-amber-500/60 shadow-[0_0_24px_rgba(245,158,11,0.12)]",
    badgeBg: "bg-amber-500/15 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-500/40 dark:border-amber-500/30",
    glow: "bg-amber-500/10 dark:bg-amber-500/10",
    toggleActiveBg: "bg-amber-600 dark:bg-amber-500 text-white hover:bg-amber-700 dark:hover:bg-amber-600",
  },
  cyan: {
    border: "border-sky-500/30 dark:border-sky-500/20",
    borderActive: "border-sky-500/80 dark:border-sky-500/60 shadow-[0_0_24px_rgba(14,165,233,0.12)]",
    badgeBg: "bg-sky-500/15 dark:bg-sky-500/10 text-sky-900 dark:text-sky-300 border-sky-500/40 dark:border-sky-500/30",
    glow: "bg-sky-500/10 dark:bg-sky-500/10",
    toggleActiveBg: "bg-sky-600 dark:bg-sky-500 text-white hover:bg-sky-700 dark:hover:bg-sky-600",
  },
  emerald: {
    border: "border-emerald-500/30 dark:border-emerald-500/20",
    borderActive: "border-emerald-500/80 dark:border-emerald-500/60 shadow-[0_0_24px_rgba(16,185,129,0.12)]",
    badgeBg: "bg-emerald-500/15 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 border-emerald-500/40 dark:border-emerald-500/30",
    glow: "bg-emerald-500/10 dark:bg-emerald-500/10",
    toggleActiveBg: "bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600",
  },
  violet: {
    border: "border-purple-500/30 dark:border-purple-500/20",
    borderActive: "border-purple-500/80 dark:border-purple-500/60 shadow-[0_0_24px_rgba(168,85,247,0.12)]",
    badgeBg: "bg-purple-500/15 dark:bg-purple-500/10 text-purple-900 dark:text-purple-300 border-purple-500/40 dark:border-purple-500/30",
    glow: "bg-purple-500/10 dark:bg-purple-500/10",
    toggleActiveBg: "bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600",
  },
};

export function DisciplineCard({
  stepNumber,
  totalSteps,
  title,
  category,
  theme,
  icon,
  description,
  completed,
  disabled = false,
  onToggle,
}: DisciplineCardProps): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const styles = THEME_STYLES[theme];

  const handleToggle = async (): Promise<void> => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      await onToggle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card/80 dark:bg-card/40 backdrop-blur-2xl p-4 sm:p-6 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${
        completed ? styles.borderActive : `${styles.border} hover:border-border/80 hover:bg-card/90 dark:hover:bg-card/50`
      }`}
    >
      {/* Background radial atmosphere */}
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full blur-3xl transition-opacity duration-500 ${
          completed ? "opacity-100" : "opacity-30 group-hover:opacity-70"
        } ${styles.glow}`}
      />

      <div className="relative space-y-3">
        {/* Header row: Discipline step label & tactile category tag */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-background/80 dark:bg-background/60 border border-border/60 dark:border-border/40 shadow-2xs">
              {icon}
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] tracking-wider uppercase text-muted-foreground font-semibold">
              Step 0{stepNumber} of 0{totalSteps}
            </span>
          </div>

          <Badge variant="outline" className={`text-[10px] font-mono tracking-wide py-0.5 px-2 font-semibold ${styles.badgeBg}`}>
            {category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-display text-base sm:text-lg font-bold tracking-tight text-foreground text-balance">
          {title}
        </h3>

        {/* Task description */}
        <p className="text-xs sm:text-[13px] text-foreground/85 leading-relaxed font-sans select-text">
          {description}
        </p>
      </div>

      {/* Footer tactile action row */}
      <div className="relative mt-5 pt-4 border-t border-border/40 dark:border-white/5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono">
          <span
            className={`h-2 w-2 rounded-full ${
              completed
                ? "bg-emerald-600 dark:bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : "bg-muted-foreground/40"
            }`}
          />
          <span className={completed ? "text-foreground font-medium" : "text-muted-foreground"}>
            {completed ? "Completed & Verified" : "Pending Action"}
          </span>
        </div>

        <button
          type="button"
          disabled={disabled || loading}
          onClick={handleToggle}
          className={`h-8 px-3 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed shadow-2xs ${
            completed
              ? styles.toggleActiveBg
              : "bg-background hover:bg-muted/50 border border-border/80 text-foreground hover:border-foreground/30"
          }`}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : completed ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Done</span>
            </>
          ) : (
            <span>Mark Complete</span>
          )}
        </button>
      </div>
    </div>
  );
}
