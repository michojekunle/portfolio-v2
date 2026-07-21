import type { JobRole } from "@/lib/admin/job-search-data";

export type ApplicationStatus = "toapply" | "applied" | "interviewing" | "offer" | "rejected" | "ghosted";

export interface JobApplication {
  id: string;
  date: string;
  role: JobRole;
  company: string;
  board: string | null;
  status: ApplicationStatus;
  followup: string | null;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  toapply: "To Apply",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer 🎉",
  rejected: "Rejected",
  ghosted: "Ghosted",
};

/** Maps each status onto the shadcn Badge's existing variant set instead of inventing a new color per status. */
export const STATUS_BADGE_VARIANT: Record<ApplicationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  toapply: "outline",
  applied: "secondary",
  interviewing: "default",
  offer: "default",
  rejected: "destructive",
  ghosted: "outline",
};

export const ROLE_LABEL: Record<JobRole, string> = {
  flutter: "🐦 Flutter",
  rust: "🦀 Rust",
};

export const DAILY_GOAL = 4;
