"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Cpu,
  Flame,
  Loader2,
  Network,
  Palette,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import { format } from "date-fns";
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

export function isDayActive(d: RustChallengeDay): boolean {
  return Boolean(
    d.completed ||
    d.rust_completed ||
    d.dsa_completed ||
    d.frontend_completed ||
    d.system_design_completed ||
    (Array.isArray(d.subtasks_completed) && d.subtasks_completed.length > 0)
  );
}

export function countDaySteps(d: RustChallengeDay): { completed: number; total: number } {
  let total = 2; // Core Rust & DSA are always present
  let completed = (d.rust_completed ? 1 : 0) + (d.dsa_completed ? 1 : 0);

  if (d.frontend_task) {
    total++;
    if (d.frontend_completed) completed++;
  }
  if (d.system_design_task) {
    total++;
    if (d.system_design_completed) completed++;
  }

  if (d.completed) {
    completed = total;
  }

  return { completed, total };
}

// Unbroken sequential streak: counts consecutive challenge days where at least 1 step was completed
export function computeStreak(days: RustChallengeDay[]): number {
  let streak = 0;
  for (const d of days) {
    if (isDayActive(d)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

type UpdateFn = (
  dayNumber: number,
  changes: Partial<RustChallengeDay>
) => Promise<void>;

function generateDayTweet(day: RustChallengeDay, totalDays: number = 188): string {
  const parts = [`Day ${day.day_number}/${totalDays} 🦀`];
  if (day.daily_task) parts.push(`• Systems: ${day.daily_task.split("*(Resource:")[0].trim()}`);
  if (day.frontend_task) parts.push(`• Frontend: ${day.frontend_task.split("*(Resource:")[0].trim()}`);
  if (day.system_design_task) parts.push(`• System Design: ${day.system_design_task.split("*(Resource:")[0].trim()}`);
  parts.push("#buildinpublic #rustlang #systems");
  return parts.join("\n\n");
}

function SuggestedTweet({ day, totalDays = 188 }: { day: RustChallengeDay; totalDays?: number }): React.ReactElement {
  const [text, setText] = useState(() => generateDayTweet(day, totalDays));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setText(generateDayTweet(day, totalDays));
  }, [day, totalDays]);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Tweet text copied");
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
        className="text-sm min-h-24 bg-background/50 border-border/40"
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

  useEffect(() => {
    setPostUrl(day.x_post_url ?? "");
    setNotes(day.notes ?? "");
  }, [day.day_number, day.x_post_url, day.notes]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Tonight's X post URL (e.g. https://x.com/...)"
          value={postUrl}
          onChange={(e) => setPostUrl(e.target.value)}
          className="h-9 text-sm flex-1 min-w-0 bg-background/40 border-border/40"
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
        placeholder="Notes, roadblocks, breakthrough snippets (auto-saves on blur)..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => onSave({ notes: notes.trim() || null })}
        className="text-sm min-h-16 bg-background/40 border-border/40"
      />
      {day.x_post_url && (
        <a href={day.x_post_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block">
          View post on X ↗
        </a>
      )}
    </div>
  );
}

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  completed: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function StepCard({
  icon,
  title,
  badge,
  badgeColor,
  description,
  completed,
  onToggle,
  disabled,
}: StepCardProps): React.ReactElement {
  const parts = description.split("*(Resource:");
  const mainText = parts[0].trim();
  const resourceText = parts.length > 1 ? parts[1].replace(/\)*$/, "").trim() : null;

  return (
    <div
      onClick={disabled ? undefined : onToggle}
      className={`group relative rounded-xl border p-4 transition-all cursor-pointer ${
        completed
          ? "border-emerald-500/40 bg-emerald-500/5 shadow-[inset_0_1px_0_rgba(16,185,129,0.1)]"
          : "border-border/50 bg-background/40 hover:border-border/80 hover:bg-background/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onToggle();
            }}
            className={`h-5 w-5 rounded-md flex items-center justify-center border transition-colors ${
              completed
                ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                : "border-muted-foreground/40 group-hover:border-foreground/60"
            }`}
          >
            {completed ? <Check className="h-3.5 w-3.5" /> : null}
          </button>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-xs font-semibold text-foreground tracking-tight">{title}</span>
            </div>
            <Badge variant="secondary" className={`text-[10px] font-mono px-2 py-0.5 border ${badgeColor}`}>
              {badge}
            </Badge>
          </div>

          <p className={`text-xs sm:text-sm leading-relaxed ${completed ? "text-muted-foreground line-through opacity-85" : "text-foreground/90 font-medium"}`}>
            {mainText}
          </p>

          {resourceText && (
            <div className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1">
              <span className="opacity-70 font-mono">Source:</span>
              <span className="italic opacity-90 truncate max-w-[400px]">{resourceText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeroCard({
  day,
  onUpdate,
  totalDays,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  day: RustChallengeDay;
  onUpdate: UpdateFn;
  totalDays?: number;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}): React.ReactElement {
  const [saving, setSaving] = useState(false);
  const stepStats = countDaySteps(day);
  const hasStarted = isDayActive(day);
  const allStepsDone = stepStats.completed === stepStats.total && stepStats.total > 0;

  const handleStepToggle = async (stepKey: keyof RustChallengeDay, currentVal: boolean): Promise<void> => {
    setSaving(true);
    const nextVal = !currentVal;
    const patch: Partial<RustChallengeDay> = { [stepKey]: nextVal };

    const hypotheticalCompleted = {
      rust_completed: stepKey === "rust_completed" ? nextVal : day.rust_completed,
      dsa_completed: stepKey === "dsa_completed" ? nextVal : day.dsa_completed,
      frontend_completed: stepKey === "frontend_completed" ? nextVal : day.frontend_completed,
      system_design_completed: stepKey === "system_design_completed" ? nextVal : day.system_design_completed,
    };

    const isAll =
      hypotheticalCompleted.rust_completed &&
      hypotheticalCompleted.dsa_completed &&
      (!day.frontend_task || hypotheticalCompleted.frontend_completed) &&
      (!day.system_design_task || hypotheticalCompleted.system_design_completed);

    if (isAll) {
      patch.completed = true;
    } else if (day.completed && !nextVal) {
      patch.completed = false;
    }

    try {
      await onUpdate(day.day_number, patch);
      if (nextVal) {
        toast.success(`Step checked! Day ${day.day_number} streak active 🔥`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFullDay = async (): Promise<void> => {
    setSaving(true);
    const next = !day.completed;
    try {
      await onUpdate(day.day_number, { completed: next });
      if (next) {
        toast.success(`Day ${day.day_number} fully completed! 🚀`);
      }
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = format(new Date(day.challenge_date), "EEEE, MMM d, yyyy");

  return (
    <div className="relative rounded-2xl border border-orange-500/30 bg-card/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_35px_rgba(249,115,22,0.04)] p-5 sm:p-7 space-y-6 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* Header with Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
              Day {day.day_number} of {totalDays || 188}
            </span>
            {hasStarted && (
              <Badge variant="outline" className="border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] gap-1 py-0.5">
                <Flame className="h-3 w-3 fill-current" /> Streak Active
              </Badge>
            )}
            {day.completed && (
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] gap-1 py-0.5">
                <Check className="h-3 w-3" /> Fully Done
              </Badge>
            )}
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-foreground">
            {day.week_focus}
          </h2>
          <p className="text-xs text-muted-foreground font-mono">
            Target scheduled: {formattedDate} · Week {day.week_number} · {PHASE_LABEL[day.phase]}
          </p>
        </div>

        {/* Day Jumper Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
          <Button
            size="sm"
            variant="outline"
            disabled={!hasPrev}
            onClick={onPrev}
            className="h-8 text-xs gap-1 border-border/40 bg-background/40 hover:bg-background/70"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev Day
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!hasNext}
            onClick={onNext}
            className="h-8 text-xs gap-1 border-border/40 bg-background/40 hover:bg-background/70"
          >
            Next Day <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Progress & Completion Banner */}
      <div className="rounded-xl bg-background/30 border border-border/40 p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
            Daily Reps Checklist (Complete ≥1 step to keep streak alive)
          </span>
          <span className="font-mono font-semibold tabular-nums text-foreground">
            {stepStats.completed} / {stepStats.total} Steps Done ({Math.round((stepStats.completed / stepStats.total) * 100)}%)
          </span>
        </div>
        <Progress value={(stepStats.completed / stepStats.total) * 100} className="h-2 bg-muted/60" />
      </div>

      {/* 4 Core Steps Cards */}
      <div className="space-y-3">
        {/* Step 1: Systems & ZK Core */}
        <StepCard
          icon={<Cpu className="h-4 w-4 text-orange-500" />}
          title="Step 1: Systems & ZK Core Build"
          badge="Systems Rust"
          badgeColor="border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/5"
          description={day.daily_task}
          completed={Boolean(day.rust_completed || day.completed)}
          onToggle={() => void handleStepToggle("rust_completed", Boolean(day.rust_completed))}
          disabled={saving}
        />

        {/* Step 2: DSA Rep */}
        <StepCard
          icon={<Brain className="h-4 w-4 text-teal-500" />}
          title="Step 2: Algorithmic DSA Rep"
          badge="Algorithms"
          badgeColor="border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-500/5"
          description={day.dsa_rep}
          completed={Boolean(day.dsa_completed || day.completed)}
          onToggle={() => void handleStepToggle("dsa_completed", Boolean(day.dsa_completed))}
          disabled={saving}
        />

        {/* Step 3: Frontend Mastery Track */}
        {day.frontend_task && (
          <StepCard
            icon={<Palette className="h-4 w-4 text-pink-500" />}
            title="Step 3: Frontend Architecture & UI"
            badge="Frontend Track"
            badgeColor="border-pink-500/30 text-pink-600 dark:text-pink-400 bg-pink-500/5"
            description={day.frontend_task}
            completed={Boolean(day.frontend_completed || day.completed)}
            onToggle={() => void handleStepToggle("frontend_completed", Boolean(day.frontend_completed))}
            disabled={saving}
          />
        )}

        {/* Step 4: System Design Concept */}
        {day.system_design_task && (
          <StepCard
            icon={<Network className="h-4 w-4 text-indigo-500" />}
            title="Step 4: System Design Concept"
            badge="Architecture"
            badgeColor="border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5"
            description={day.system_design_task}
            completed={Boolean(day.system_design_completed || day.completed)}
            onToggle={() => void handleStepToggle("system_design_completed", Boolean(day.system_design_completed))}
            disabled={saving}
          />
        )}
      </div>

      {/* Suggested Tweet */}
      <div className="border-t border-border/40 pt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Suggested Share / Log</p>
        <SuggestedTweet day={day} totalDays={totalDays} />
      </div>

      {/* Log fields */}
      <div className="border-t border-border/40 pt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tonight's Log & Artifacts</p>
        <LogFields day={day} onSave={(changes) => void onUpdate(day.day_number, changes)} saving={saving} />
      </div>

      {/* Big Satisfying Full Day Toggle */}
      <div className="pt-2">
        <Button
          onClick={() => void handleToggleFullDay()}
          disabled={saving}
          variant={day.completed ? "outline" : "default"}
          className="w-full h-11 text-sm font-semibold rounded-xl"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : day.completed ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />
          )}
          {day.completed
            ? `Day ${day.day_number} complete — tap to reopen`
            : allStepsDone
              ? `All steps done! Complete Day ${day.day_number}`
              : `Mark All Steps Complete for Day ${day.day_number}`}
        </Button>
      </div>
    </div>
  );
}

function CompactDayCard({
  day,
  onUpdate,
  isTarget,
  onSetTarget,
}: {
  day: RustChallengeDay;
  onUpdate: UpdateFn;
  isTarget: boolean;
  onSetTarget: () => void;
}): React.ReactElement {
  const [logOpen, setLogOpen] = useState(false);
  const stepStats = countDaySteps(day);
  const hasStarted = isDayActive(day);

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 transition-all ${
        isTarget
          ? "border-orange-500/60 bg-orange-500/5 shadow-[0_0_20px_rgba(249,115,22,0.06)]"
          : day.completed
            ? "border-border/30 bg-card/20 opacity-70"
            : "border-border/40 bg-card/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      }`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs min-w-0">
          <span className="font-mono font-bold text-foreground">Day {day.day_number}</span>
          <span className="text-muted-foreground tabular-nums">· {day.challenge_date}</span>
          {hasStarted && (
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-orange-500/40 text-orange-600 dark:text-orange-400">
              {stepStats.completed}/{stepStats.total} steps
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={isTarget ? "secondary" : "outline"}
            onClick={onSetTarget}
            className="h-7 text-xs px-2.5 gap-1"
          >
            <Target className="h-3 w-3" />
            {isTarget ? "Active Target" : "Focus"}
          </Button>

          <Button
            size="sm"
            variant={day.completed ? "outline" : "default"}
            onClick={() => void onUpdate(day.day_number, { completed: !day.completed })}
            className="h-7 text-xs px-2.5"
          >
            {day.completed ? "Done ✓" : "Mark Done"}
          </Button>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-foreground/90 font-medium line-clamp-2">{day.daily_task}</p>

      {/* Step check buttons right inside compact card */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        <button
          type="button"
          onClick={() => void onUpdate(day.day_number, { rust_completed: !day.rust_completed })}
          className={`text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1 transition-colors ${
            day.rust_completed || day.completed ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400" : "bg-muted/40 border-border/40 text-muted-foreground hover:bg-muted/70"
          }`}
        >
          <span>🦀 Systems</span>
          {day.rust_completed || day.completed ? <Check className="h-2.5 w-2.5" /> : null}
        </button>

        <button
          type="button"
          onClick={() => void onUpdate(day.day_number, { dsa_completed: !day.dsa_completed })}
          className={`text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1 transition-colors ${
            day.dsa_completed || day.completed ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400" : "bg-muted/40 border-border/40 text-muted-foreground hover:bg-muted/70"
          }`}
        >
          <span>🧠 DSA</span>
          {day.dsa_completed || day.completed ? <Check className="h-2.5 w-2.5" /> : null}
        </button>

        {day.frontend_task && (
          <button
            type="button"
            onClick={() => void onUpdate(day.day_number, { frontend_completed: !day.frontend_completed })}
            className={`text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1 transition-colors ${
              day.frontend_completed || day.completed ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400" : "bg-muted/40 border-border/40 text-muted-foreground hover:bg-muted/70"
            }`}
          >
            <span>🎨 Frontend</span>
            {day.frontend_completed || day.completed ? <Check className="h-2.5 w-2.5" /> : null}
          </button>
        )}

        {day.system_design_task && (
          <button
            type="button"
            onClick={() => void onUpdate(day.day_number, { system_design_completed: !day.system_design_completed })}
            className={`text-[10px] font-mono px-2 py-1 rounded-md border flex items-center gap-1 transition-colors ${
              day.system_design_completed || day.completed ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400" : "bg-muted/40 border-border/40 text-muted-foreground hover:bg-muted/70"
            }`}
          >
            <span>📐 SysDesign</span>
            {day.system_design_completed || day.completed ? <Check className="h-2.5 w-2.5" /> : null}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setLogOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground transition-colors"
      >
        {day.x_post_url ? "Post link & notes" : "Log entry"}
        <ChevronDown className={`h-3 w-3 transition-transform ${logOpen ? "rotate-180" : ""}`} />
      </button>
      {logOpen && <LogFields day={day} onSave={(changes) => void onUpdate(day.day_number, changes)} saving={false} />}
    </div>
  );
}

function WeekPill({
  day,
  isTarget,
  onClick,
}: {
  day: RustChallengeDay;
  isTarget: boolean;
  onClick: () => void;
}): React.ReactElement {
  const active = isDayActive(day);

  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-1 min-w-0 cursor-pointer group"
    >
      <div
        className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold border-2 transition-all ${
          day.completed
            ? "bg-emerald-500 text-white border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
            : active
              ? "bg-orange-500 text-white border-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]"
              : isTarget
                ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 ring-2 ring-orange-500/40"
                : "border-border text-muted-foreground group-hover:border-foreground/50"
        }`}
      >
        {day.completed ? (
          <Check className="h-4 w-4" />
        ) : active ? (
          <Flame className="h-4 w-4 fill-current" />
        ) : (
          day.day_number
        )}
      </div>
      <span className={`text-[10px] font-mono uppercase tracking-wide truncate max-w-full ${
        isTarget ? "text-orange-600 dark:text-orange-400 font-bold" : "text-muted-foreground"
      }`}>
        D{day.day_number}
      </span>
    </div>
  );
}

export function RustChallengeDashboard({ initialDays }: Props): React.ReactElement {
  const [days, setDays] = useState<RustChallengeDay[]>(initialDays);

  // Find the first uncompleted day, or default to Day 1
  const firstUnfinishedDay = useMemo(() => days.find((d) => !d.completed)?.day_number ?? 1, [days]);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(firstUnfinishedDay);

  // When initial days load or update, adjust selected day if not yet chosen
  useEffect(() => {
    setSelectedDayNumber((curr) => {
      if (curr && days.some((d) => d.day_number === curr)) return curr;
      return firstUnfinishedDay;
    });
  }, [firstUnfinishedDay, days]);

  const handleUpdate: UpdateFn = async (dayNumber, changes) => {
    const prev = days;
    setDays((cur) =>
      cur.map((d) =>
        d.day_number === dayNumber
          ? {
              ...d,
              ...changes,
              completed_at:
                changes.completed !== undefined
                  ? changes.completed
                    ? new Date().toISOString()
                    : null
                  : d.completed_at || new Date().toISOString(),
            }
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
      const data = await res.json();
      if (data?.day) {
        setDays((cur) => cur.map((d) => (d.day_number === dayNumber ? { ...d, ...data.day } : d)));
      }
    } catch (err) {
      console.error("[rust-challenge] update error:", err);
      setDays(prev);
      toast.error("Failed to save — try again");
    }
  };

  const streak = useMemo(() => computeStreak(days), [days]);
  const completedCount = useMemo(() => days.filter((d) => d.completed).length, [days]);
  const activeCount = useMemo(() => days.filter(isDayActive).length, [days]);
  const progressPct = days.length > 0 ? Math.round((completedCount / days.length) * 100) : 0;

  // Active Focus Day in Hero Card
  const focusDay = useMemo(
    () => days.find((d) => d.day_number === selectedDayNumber) ?? days.find((d) => !d.completed) ?? days[0],
    [days, selectedDayNumber]
  );
  const focusWeekNumber = focusDay?.week_number;

  const thisWeekDays = useMemo(
    () => days.filter((d) => d.week_number === focusWeekNumber).sort((a, b) => a.day_number - b.day_number),
    [days, focusWeekNumber]
  );

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
      <div className="bg-card/40 backdrop-blur-xl border border-border/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-xl text-center py-12">
        <p className="text-sm font-medium mb-1">No challenge days found</p>
        <p className="text-xs text-muted-foreground">Run the migrations in Supabase, then refresh.</p>
      </div>
    );
  }

  const focusIndex = days.findIndex((d) => d.day_number === focusDay?.day_number);

  return (
    <div className="space-y-8">
      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Streak Card */}
        <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-card/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-3 sm:p-5 flex items-center gap-2.5 sm:gap-4">
          <Flame className={`h-6 w-6 sm:h-8 sm:w-8 shrink-0 ${streak > 0 ? "text-orange-500 fill-current" : "text-muted-foreground/40"}`} />
          <div className="min-w-0">
            <p className="font-display text-2xl sm:text-4xl font-extrabold tabular-nums leading-none fvs-display text-(--ink)">{streak}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight mt-1 uppercase tracking-wider font-mono">
              day{streak === 1 ? "" : "s"} streak 🔥
            </p>
          </div>
        </div>

        {/* Total Progress Card */}
        <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-3 sm:p-5 flex flex-col justify-center min-w-0">
          <p className="font-display text-xl sm:text-3xl font-bold tabular-nums leading-none fvs-display text-(--ink)">{progressPct}%</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-2.5 mt-1 tabular-nums uppercase tracking-wider font-mono">
            {completedCount}/{days.length} done ({activeCount} active)
          </p>
          <Progress value={progressPct} className="h-1.5 sm:h-2" />
        </div>

        {/* Current Target Selector Card */}
        <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-3 sm:p-5 min-w-0 flex flex-col justify-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight uppercase tracking-wider font-mono">Current Focus</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-sm sm:text-lg font-semibold tabular-nums text-(--ink)">
              Day {focusDay?.day_number}
            </span>
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">
              · {focusDay?.week_focus.slice(0, 18)}...
            </span>
          </div>
        </div>
      </div>

      {/* Main Focus Hero Card */}
      {focusDay && (
        <div>
          <HeroCard
            day={focusDay}
            onUpdate={handleUpdate}
            totalDays={days.length}
            hasPrev={focusIndex > 0}
            hasNext={focusIndex < days.length - 1}
            onPrev={() => {
              if (focusIndex > 0) setSelectedDayNumber(days[focusIndex - 1].day_number);
            }}
            onNext={() => {
              if (focusIndex < days.length - 1) setSelectedDayNumber(days[focusIndex + 1].day_number);
            }}
          />
        </div>
      )}

      {/* Week Ribbon */}
      {thisWeekDays.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Week {focusWeekNumber} at a glance · Tap any day to focus
            </p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-4 flex gap-1 sm:gap-2">
            {thisWeekDays.map((d) => (
              <WeekPill
                key={d.id}
                day={d}
                isTarget={d.day_number === focusDay?.day_number}
                onClick={() => setSelectedDayNumber(d.day_number)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Full 188-Day Roadmap */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Full Roadmap ({days.length} Days · 26 Weeks · 4 Phases)
          </p>
        </div>
        <div className="space-y-2">
          {phases.map(({ phase, weeks, days: phaseDays }) => {
            const phaseDone = phaseDays.filter((d) => d.completed).length;
            const phaseActive = phaseDays.filter(isDayActive).length;
            const isPhaseCurrent = phaseDays.some((d) => d.day_number === focusDay?.day_number);

            return (
              <details
                key={phase}
                className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden"
                open={isPhaseCurrent}
              >
                <summary className="cursor-pointer px-4 py-3.5 flex items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-sm font-semibold text-foreground">
                      Phase {phase} — {PHASE_LABEL[phase]}
                    </span>
                    {phaseActive > 0 && (
                      <span className="text-xs text-orange-500 font-mono">({phaseActive} active)</span>
                    )}
                  </div>
                  <Badge variant={phaseDone === phaseDays.length ? "secondary" : "outline"} className="text-xs shrink-0 tabular-nums">
                    {phaseDone}/{phaseDays.length} Done
                  </Badge>
                </summary>
                <div className="px-3 pb-3 space-y-2">
                  {weeks.map(([weekNumber, weekDays]) => {
                    const weekDone = weekDays.filter((d) => d.completed).length;
                    const isCurrentWeek = weekNumber === focusWeekNumber;
                    return (
                      <details
                        key={weekNumber}
                        className="rounded-xl border border-border/40 bg-background/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden"
                        open={isCurrentWeek}
                      >
                        <summary className="cursor-pointer px-3 py-2.5 flex items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden">
                          <span className="text-xs font-semibold truncate text-foreground/90">
                            Week {weekNumber} — {weekDays[0].week_focus}
                          </span>
                          <Badge variant={weekDone === weekDays.length ? "secondary" : "outline"} className="text-xs shrink-0 tabular-nums">
                            {weekDone}/{weekDays.length}
                          </Badge>
                        </summary>
                        <div className="p-2.5 space-y-2">
                          {weekDays.map((d) => (
                            <CompactDayCard
                              key={d.id}
                              day={d}
                              isTarget={d.day_number === focusDay?.day_number}
                              onSetTarget={() => setSelectedDayNumber(d.day_number)}
                              onUpdate={handleUpdate}
                            />
                          ))}
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
