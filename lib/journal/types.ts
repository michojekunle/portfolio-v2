export interface JoObjective {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: "active" | "completed" | "dropped" | "paused";
  priority: "high" | "medium" | "low";
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface JoMilestone {
  id: string;
  user_id: string;
  objective_id: string;
  title: string;
  is_done: boolean;
  due_date: string | null;
  created_at: string;
}

export type JoObjectiveWithMilestones = JoObjective & { milestones: JoMilestone[] };

export interface JoEntry {
  id: string;
  user_id: string;
  date: string;
  top_priorities: string[];
  accomplished: string[];
  blockers: string | null;
  notes: string | null;
  energy_level: number | null;
  objective_ids: string[];
  created_at: string;
  updated_at: string;
}

export const OBJECTIVE_COLORS = [
  "#7C3AED", "#DB2777", "#D97706", "#16A34A",
  "#0284C7", "#DC2626", "#0891B2", "#9333EA",
  "#CA8A04", "#059669",
] as const;

export const PRIORITY_CONFIG: Record<
  JoObjective["priority"],
  { label: string; color: string }
> = {
  high:   { label: "High",   color: "#DC2626" },
  medium: { label: "Medium", color: "#D97706" },
  low:    { label: "Low",    color: "#6B7280" },
};

export const STATUS_CONFIG: Record<
  JoObjective["status"],
  { label: string; color: string }
> = {
  active:    { label: "Active",    color: "#7C3AED" },
  completed: { label: "Completed", color: "#16A34A" },
  paused:    { label: "Paused",    color: "#D97706" },
  dropped:   { label: "Dropped",   color: "#6B7280" },
};

export const ENERGY_LABELS: Record<number, string> = {
  1: "Drained",
  2: "Low",
  3: "Steady",
  4: "Energised",
  5: "On fire",
};

export const VELA_ACCENT = "#7C3AED";
export const VELA_ACCENT_SOFT = "rgba(124,58,237,0.10)";
