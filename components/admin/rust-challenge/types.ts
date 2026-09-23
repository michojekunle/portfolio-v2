import type { RustChallengeDay } from "@/app/api/admin/rust-challenge/route";
import type { RustChallengeMeta, Quote } from "@/app/api/admin/rust-challenge/meta/route";

export type { RustChallengeDay, RustChallengeMeta, Quote };

export type ChallengeViewMode = "cockpit" | "matrix" | "manifesto";

export type UpdateFn = (
  dayNumber: number,
  changes: Partial<RustChallengeDay>
) => Promise<void>;

export const PHASE_LABEL: Record<number, string> = {
  1: "Foundations & Low-Level Mechanics",
  2: "Systems Depth & Employability",
  3: "The Bridge: ZK & Distributed Systems",
  4: "Staff Architecture & Capstone",
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

export function generateDayTweet(day: RustChallengeDay, totalDays: number = 188): string {
  const parts = [`Day ${day.day_number}/${totalDays} 🦀`];
  if (day.daily_task) parts.push(`• Systems: ${day.daily_task.split("*(Resource:")[0].trim()}`);
  if (day.frontend_task) parts.push(`• Frontend: ${day.frontend_task.split("*(Resource:")[0].trim()}`);
  if (day.system_design_task) parts.push(`• System Design: ${day.system_design_task.split("*(Resource:")[0].trim()}`);
  parts.push("#buildinpublic #rustlang #systems");
  return parts.join("\n\n");
}
