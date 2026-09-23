"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";

export type DisciplineTheme = "terracotta" | "steel" | "sage" | "indigo";

interface DisciplineCardProps {
  trackNumber: number;
  trackName: string;
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
    toggleActiveBg: string;
  }
> = {
  terracotta: {
    border: "border-border/80 hover:border-amber-600/40",
    borderActive: "border-amber-600/70 dark:border-amber-500/60 bg-amber-500/[0.03]",
    badgeBg: "bg-amber-500/10 text-amber-900 dark:text-amber-300 border-amber-500/30",
    toggleActiveBg: "bg-amber-600 dark:bg-amber-500 text-white hover:bg-amber-700",
  },
  steel: {
    border: "border-border/80 hover:border-sky-600/40",
    borderActive: "border-sky-600/70 dark:border-sky-500/60 bg-sky-500/[0.03]",
    badgeBg: "bg-sky-500/10 text-sky-900 dark:text-sky-300 border-sky-500/30",
    toggleActiveBg: "bg-sky-600 dark:bg-sky-500 text-white hover:bg-sky-700",
  },
  sage: {
    border: "border-border/80 hover:border-emerald-600/40",
    borderActive: "border-emerald-600/70 dark:border-emerald-500/60 bg-emerald-500/[0.03]",
    badgeBg: "bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 border-emerald-500/30",
    toggleActiveBg: "bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700",
  },
  indigo: {
    border: "border-border/80 hover:border-indigo-600/40",
    borderActive: "border-indigo-600/70 dark:border-indigo-500/60 bg-indigo-500/[0.03]",
    badgeBg: "bg-indigo-500/10 text-indigo-900 dark:text-indigo-300 border-indigo-500/30",
    toggleActiveBg: "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700",
  },
};

export function DisciplineCard({
  trackNumber,
  trackName,
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
      className={`flex flex-col justify-between rounded-2xl border bg-card/80 dark:bg-card/40 backdrop-blur-xl p-5 sm:p-6 transition-colors shadow-2xs ${
        completed ? styles.borderActive : styles.border
      }`}
    >
      <div className="space-y-3.5">
        {/* Header row: In-flow icon with track name and category badge */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{icon}</span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Track {trackNumber}
            </span>
          </div>

          <Badge variant="outline" className={`text-xs font-mono tracking-wide py-0.5 px-2.5 font-medium ${styles.badgeBg}`}>
            {category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-sans font-bold text-base sm:text-lg tracking-tight text-foreground text-balance">
          {trackName}
        </h3>

        {/* Task description with generous line height */}
        <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-sans select-text">
          {description}
        </p>
      </div>

      {/* Footer tactile action row */}
      <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`h-2 w-2 rounded-full ${
              completed ? "bg-emerald-600 dark:bg-emerald-500" : "bg-muted-foreground/30"
            }`}
          />
          <span className={completed ? "text-foreground font-medium" : "text-muted-foreground"}>
            {completed ? "Completed" : "Incomplete"}
          </span>
        </div>

        <button
          type="button"
          disabled={disabled || loading}
          onClick={handleToggle}
          className={`h-8 px-3.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed ${
            completed
              ? styles.toggleActiveBg
              : "bg-background hover:bg-muted/50 border border-border/80 text-foreground"
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
