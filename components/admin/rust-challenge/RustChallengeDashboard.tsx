"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Check, ChevronDown, Copy, Flame, Loader2, Send } from "lucide-react";
import type { RustChallengeDay } from "@/app/api/admin/rust-challenge/route";

interface Props {
  initialDays: RustChallengeDay[];
}

const PHASE_LABEL: Record<number, string> = {
  1: "Foundation",
  2: "Employability",
  3: "The Bridge",
  4: "Compound",
};

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Consecutive completed days ending today or yesterday — a gap further back
// than that breaks the streak, matching how any habit-streak counter works.
function computeStreak(days: RustChallengeDay[]): number {
  const byDate = new Map(days.map((d) => [d.challenge_date, d]));
  const today = new Date();
  let streak = 0;
  const cursor = new Date(today);

  // If today isn't marked done yet, start counting from yesterday instead —
  // otherwise a not-yet-logged today would prematurely zero the streak.
  const todayEntry = byDate.get(todayStr());
  if (!todayEntry?.completed) cursor.setDate(cursor.getDate() - 1);

  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    const entry = byDate.get(key);
    if (!entry || !entry.completed) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

type UpdateFn = (
  dayNumber: number,
  changes: { completed?: boolean; x_post_url?: string | null; notes?: string | null }
) => Promise<void>;

// Derived entirely from the day's own data — no separate template storage.
// daily_task already carries kickoff/build/test/ship/review phrasing from
// how the 180 days were generated, so it reads naturally as a standalone post.
function generateDayTweet(day: RustChallengeDay): string {
  return `Day ${day.day_number}/180 🦀\n\n${day.daily_task}\n\n#buildinpublic #rustlang`;
}

function SuggestedTweet({ day }: { day: RustChallengeDay }): React.ReactElement {
  const [text, setText] = useState(() => generateDayTweet(day));
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("[rust-challenge] copy error:", err);
      toast.error("Couldn't copy — select and copy manually");
    }
  };

  const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  return (
    <div className="space-y-2">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="text-sm min-h-24"
      />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => void handleCopy()}>
          {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button size="sm" variant="outline" className="flex-1" asChild>
          <a href={intentUrl} target="_blank" rel="noopener noreferrer">
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Open in X
          </a>
        </Button>
      </div>
    </div>
  );
}

// The one big satisfying action per card — full width, bottom-anchored, so
// it never has to compete with the smaller "save the post link" action for
// visual weight. Toggling back off (if marked by mistake) uses the same button.
function MarkDoneButton({
  day,
  saving,
  onToggle,
  size = "default",
}: {
  day: RustChallengeDay;
  saving: boolean;
  onToggle: () => void;
  size?: "default" | "sm";
}): React.ReactElement {
  return (
    <Button
      onClick={onToggle}
      disabled={saving}
      variant={day.completed ? "outline" : "default"}
      className={size === "default" ? "w-full h-11" : "h-7 text-xs shrink-0"}
      size={size === "sm" ? "sm" : "default"}
    >
      {saving ? (
        <Loader2 className={size === "default" ? "h-4 w-4 mr-2 animate-spin" : "h-3 w-3 animate-spin"} />
      ) : day.completed ? (
        <Check className={size === "default" ? "h-4 w-4 mr-2" : "h-3 w-3"} />
      ) : null}
      {size === "default" ? (
        day.completed ? `Day ${day.day_number} complete — tap to undo` : `Mark Day ${day.day_number} complete`
      ) : (
        <span className={day.completed ? "ml-1" : ""}>{day.completed ? "Done" : "Mark done"}</span>
      )}
    </Button>
  );
}

function LogFields({
  day,
  onSave,
  saving,
}: {
  day: RustChallengeDay;
  onSave: (changes: { x_post_url?: string | null; notes?: string | null }) => void;
  saving: boolean;
}): React.ReactElement {
  const [postUrl, setPostUrl] = useState(day.x_post_url ?? "");
  const [notes, setNotes] = useState(day.notes ?? "");

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Tonight's X post URL"
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
          className="h-9 text-sm flex-1 min-w-0"
        />
        <Button
          size="icon"
          variant="outline"
          className="h-9 w-9 shrink-0"
          disabled={saving}
          onClick={() => onSave({ x_post_url: postUrl.trim() || null })}
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <Textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => onSave({ notes: notes.trim() || null })}
        className="text-sm min-h-16"
      />
      {day.x_post_url && (
        <a href={day.x_post_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block">
          View post ↗
        </a>
      )}
    </div>
  );
}

function HeroCard({ day, onUpdate }: { day: RustChallengeDay; onUpdate: UpdateFn }): React.ReactElement {
  const [saving, setSaving] = useState(false);

  const handleToggle = async (): Promise<void> => {
    setSaving(true);
    try {
      await onUpdate(day.day_number, { completed: !day.completed });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (changes: { x_post_url?: string | null; notes?: string | null }): Promise<void> => {
    setSaving(true);
    try {
      await onUpdate(day.day_number, changes);
      toast.success("Saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-card border-primary/50 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Day {day.day_number}</span>
          <span>·</span>
          <span className="tabular-nums">{day.challenge_date}</span>
        </div>
        <Badge variant="secondary" className="text-xs shrink-0">Week {day.week_number} · {PHASE_LABEL[day.phase]}</Badge>
      </div>

      <p className="text-lg font-semibold leading-snug text-balance">{day.daily_task}</p>

      <div className="flex items-start gap-2 text-xs bg-muted text-muted-foreground px-3 py-2 rounded-lg">
        <Brain className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{day.dsa_rep}</span>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Suggested post</p>
        <SuggestedTweet day={day} />
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tonight's log</p>
        <LogFields day={day} onSave={(changes) => void handleSave(changes)} saving={saving} />
      </div>

      <MarkDoneButton day={day} saving={saving} onToggle={() => void handleToggle()} />
    </div>
  );
}

function CompactDayCard({ day, onUpdate }: { day: RustChallengeDay; onUpdate: UpdateFn }): React.ReactElement {
  const [saving, setSaving] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  const handleToggle = async (): Promise<void> => {
    setSaving(true);
    try {
      await onUpdate(day.day_number, { completed: !day.completed });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (changes: { x_post_url?: string | null; notes?: string | null }): Promise<void> => {
    setSaving(true);
    try {
      await onUpdate(day.day_number, changes);
      toast.success("Saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`rounded-lg border border-border p-3.5 space-y-2 transition-opacity ${day.completed ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          <span className="font-medium text-foreground shrink-0">Day {day.day_number}</span>
          <span className="tabular-nums truncate">{day.challenge_date}</span>
        </div>
        <MarkDoneButton day={day} saving={saving} onToggle={() => void handleToggle()} size="sm" />
      </div>
      <p className="text-sm">{day.daily_task}</p>
      <button
        type="button"
        onClick={() => setLogOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/70 text-muted-foreground transition-colors"
      >
        {day.x_post_url ? "Post link & notes" : "Log entry"}
        <ChevronDown className={`h-3 w-3 transition-transform ${logOpen ? "rotate-180" : ""}`} />
      </button>
      {logOpen && <LogFields day={day} onSave={(changes) => void handleSave(changes)} saving={saving} />}
    </div>
  );
}

function WeekPill({ day, isToday }: { day: RustChallengeDay; isToday: boolean }): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border transition-colors ${
          day.completed
            ? "bg-primary text-primary-foreground border-primary"
            : isToday
              ? "border-primary text-primary"
              : "border-border text-muted-foreground"
        }`}
      >
        {day.completed ? <Check className="h-3.5 w-3.5" /> : day.day_number}
      </div>
      <span className="text-[10px] text-muted-foreground">{isToday ? "Today" : `D${day.day_number}`}</span>
    </div>
  );
}

export function RustChallengeDashboard({ initialDays }: Props): React.ReactElement {
  const [days, setDays] = useState<RustChallengeDay[]>(initialDays);

  const handleUpdate: UpdateFn = async (dayNumber, changes) => {
    const prev = days;
    setDays((cur) =>
      cur.map((d) =>
        d.day_number === dayNumber
          ? { ...d, ...changes, completed_at: changes.completed !== undefined ? (changes.completed ? new Date().toISOString() : null) : d.completed_at }
          : d
      )
    );
    try {
      const res = await fetch("/api/admin/rust-challenge", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day_number: dayNumber, ...changes }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch (err) {
      console.error("[rust-challenge] update error:", err);
      setDays(prev);
      toast.error("Failed to save — try again");
    }
  };

  const streak = useMemo(() => computeStreak(days), [days]);
  const completedCount = useMemo(() => days.filter((d) => d.completed).length, [days]);
  const progressPct = days.length > 0 ? Math.round((completedCount / days.length) * 100) : 0;

  const today = todayStr();
  const todayDay = days.find((d) => d.challenge_date === today);
  // Off-calendar (before day 1, or past day 180): show the nearest not-yet-completed day instead.
  const fallbackDay = days.find((d) => !d.completed) ?? days[0];
  const focusDay = todayDay ?? fallbackDay;
  const focusWeekNumber = focusDay?.week_number;

  const thisWeekDays = useMemo(
    () => days.filter((d) => d.week_number === focusWeekNumber).sort((a, b) => a.day_number - b.day_number),
    [days, focusWeekNumber]
  );

  // Weeks grouped inside phases — 4 phase rows to scan instead of 26 week
  // rows, each expandable on demand rather than 180 day-cards on one page.
  const phases = useMemo(() => {
    const phaseMap = new Map<number, Map<number, RustChallengeDay[]>>();
    for (const d of days) {
      const weekMap = phaseMap.get(d.phase) ?? new Map<number, RustChallengeDay[]>();
      const weekDays = weekMap.get(d.week_number) ?? [];
      weekDays.push(d);
      weekMap.set(d.week_number, weekDays);
      phaseMap.set(d.phase, weekMap);
    }
    return Array.from(phaseMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([phase, weekMap]) => ({
        phase,
        weeks: Array.from(weekMap.entries()).sort((a, b) => a[0] - b[0]),
        days: Array.from(weekMap.values()).flat(),
      }));
  }, [days]);

  if (days.length === 0) {
    return (
      <div className="content-card text-center py-12">
        <p className="text-sm font-medium mb-1">No challenge days found</p>
        <p className="text-xs text-muted-foreground">Run the rust_challenge_days migration in Supabase, then refresh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-lg border border-border bg-card p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-semibold tabular-nums leading-tight">{streak}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">streak</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 tabular-nums">{completedCount}/{days.length}</p>
          <Progress value={progressPct} className="h-2" />
        </div>
        <div className="rounded-lg border border-border bg-card p-3 sm:p-4 min-w-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Today</p>
          <p className="text-xs sm:text-sm font-medium mt-1 tabular-nums truncate">{today}</p>
        </div>
      </div>

      {focusDay && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {todayDay ? "Today's target" : "Next up"}
          </p>
          <HeroCard day={focusDay} onUpdate={handleUpdate} />
        </div>
      )}

      {thisWeekDays.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">This week at a glance</p>
          <div className="rounded-lg border border-border bg-card p-4 flex gap-1 sm:gap-2">
            {thisWeekDays.map((d) => (
              <WeekPill key={d.id} day={d} isToday={d.challenge_date === today} />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Full 180-day plan</p>
        <div className="space-y-2">
          {phases.map(({ phase, weeks, days: phaseDays }) => {
            const phaseDone = phaseDays.filter((d) => d.completed).length;
            return (
              <details key={phase} className="rounded-lg border border-border bg-card overflow-hidden">
                <summary className="cursor-pointer px-4 py-3 flex items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden">
                  <span className="text-sm font-medium">
                    Phase {phase} — {PHASE_LABEL[phase]}
                  </span>
                  <Badge variant={phaseDone === phaseDays.length ? "secondary" : "outline"} className="text-xs shrink-0 tabular-nums">
                    {phaseDone}/{phaseDays.length}
                  </Badge>
                </summary>
                <div className="px-3 pb-3 space-y-1.5">
                  {weeks.map(([weekNumber, weekDays]) => {
                    const weekDone = weekDays.filter((d) => d.completed).length;
                    const isCurrentWeek = weekNumber === focusWeekNumber;
                    return (
                      <details key={weekNumber} className="rounded-md border border-border/70 overflow-hidden" open={isCurrentWeek}>
                        <summary className="cursor-pointer px-3 py-2.5 flex items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden">
                          <span className="text-xs font-medium truncate">
                            Week {weekNumber} — {weekDays[0].week_focus}
                          </span>
                          <Badge variant={weekDone === weekDays.length ? "secondary" : "outline"} className="text-xs shrink-0 tabular-nums">
                            {weekDone}/{weekDays.length}
                          </Badge>
                        </summary>
                        <div className="p-2 space-y-1.5">
                          {weekDays
                            .filter((d) => d.challenge_date !== today)
                            .map((d) => (
                              <CompactDayCard key={d.id} day={d} onUpdate={handleUpdate} />
                            ))}
                          {isCurrentWeek && todayDay && (
                            <p className="text-xs text-muted-foreground px-1 py-1">Day {todayDay.day_number} (today) is shown above ↑</p>
                          )}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}
