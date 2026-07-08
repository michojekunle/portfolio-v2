"use client";

import {
  Award,
  Flame,
  Zap,
  Trophy,
  BookOpen,
  Moon,
  Timer,
  Star,
  Library,
  Sunrise,
  MessageSquare,
  StickyNote,
  Highlighter,
  Brain,
  Layers,
  Rabbit,
  Globe,
  Gauge,
  BookMarked,
  CheckCircle2,
} from "lucide-react";
import { BADGE_DEFS, BADGE_LIST } from "@/lib/chapterly/achievements";
import type { BadgeId, ChAchievement } from "@/lib/chapterly/types";

const BADGE_ICONS: Record<BadgeId, React.ReactNode> = {
  // Milestones
  first_book: <BookOpen size={20} />,
  completionist_1: <CheckCircle2 size={20} />,
  completionist_10: <Trophy size={20} />,
  completionist_50: <Award size={20} />,
  book_whisperer: <Star size={20} />,
  // Streaks
  streak_3: <Flame size={20} />,
  streak_7: <Flame size={20} />,
  streak_30: <Flame size={20} />,
  streak_100: <Flame size={20} />,
  // Sessions
  night_owl: <Moon size={20} />,
  early_bird: <Sunrise size={20} />,
  marathon: <Timer size={20} />,
  speed_reader: <Rabbit size={20} />,
  // Engagement
  highlight_hero: <Highlighter size={20} />,
  note_keeper: <StickyNote size={20} />,
  flashcard_master: <Brain size={20} />,
  ai_explorer: <MessageSquare size={20} />,
  // Depth
  polymath: <Globe size={20} />,
  deep_reader: <Layers size={20} />,
  speed_demon: <Zap size={20} />,
};

const BADGE_ACCENT: Record<BadgeId, string> = {
  first_book: "var(--ch-accent)",
  completionist_1: "#16A34A",
  completionist_10: "#D97706",
  completionist_50: "#D97706",
  book_whisperer: "#D97706",
  streak_3: "#EA580C",
  streak_7: "#EA580C",
  streak_30: "#DC2626",
  streak_100: "#9333EA",
  night_owl: "#6366F1",
  early_bird: "#F59E0B",
  marathon: "#EA580C",
  speed_reader: "#16A34A",
  highlight_hero: "#CA8A04",
  note_keeper: "#0EA5E9",
  flashcard_master: "#8B5CF6",
  ai_explorer: "var(--ch-accent)",
  polymath: "#059669",
  deep_reader: "var(--ch-accent)",
  speed_demon: "#16A34A",
};

const BADGE_GROUPS = [
  { label: "Milestones", ids: ["first_book", "completionist_1", "completionist_10", "completionist_50", "book_whisperer"] },
  { label: "Streaks", ids: ["streak_3", "streak_7", "streak_30", "streak_100"] },
  { label: "Sessions", ids: ["night_owl", "early_bird", "marathon", "speed_reader"] },
  { label: "Engagement", ids: ["highlight_hero", "note_keeper", "flashcard_master", "ai_explorer"] },
  { label: "Depth", ids: ["polymath", "deep_reader", "speed_demon"] },
] as const;

interface Props {
  earned: ChAchievement[];
}

export function AchievementGrid({ earned }: Props): React.ReactElement {
  const earnedIds = new Set(earned.map((a) => a.badge_id as BadgeId));
  const earnedMap = new Map(earned.map((a) => [a.badge_id as BadgeId, a.earned_at]));
  const allDefs = Object.fromEntries(BADGE_LIST.map((d) => [d.id, d]));

  return (
    <div className="space-y-[32px]">
      {BADGE_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[12px]">
            {group.label}
          </div>
          <div className="grid grid-cols-5 max-[900px]:grid-cols-4 max-[640px]:grid-cols-3 max-[400px]:grid-cols-2 gap-[10px]">
            {group.ids.map((id) => {
              const badgeId = id as BadgeId;
              const def = allDefs[badgeId];
              if (!def) return null;
              const isEarned = earnedIds.has(badgeId);
              const earnedAt = earnedMap.get(badgeId);
              const accent = BADGE_ACCENT[badgeId];

              return (
                <div
                  key={badgeId}
                  className="rounded-[12px] p-[14px] flex flex-col items-center text-center gap-[8px] border transition-all"
                  style={
                    isEarned
                      ? { background: accent + "12", borderColor: accent + "40" }
                      : { background: "var(--bg-2)", borderColor: "var(--rule)", opacity: 0.4 }
                  }
                  title={
                    isEarned && earnedAt
                      ? `Earned ${new Date(earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                      : def.description
                  }
                >
                  <div
                    className="w-[38px] h-[38px] rounded-full flex items-center justify-center"
                    style={
                      isEarned
                        ? { background: accent + "20", color: accent }
                        : { background: "var(--rule)", color: "var(--ink-3)" }
                    }
                  >
                    {isEarned ? BADGE_ICONS[badgeId] : <Library size={18} />}
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.08em] uppercase font-semibold text-[var(--ink-2)] leading-[1.3]">
                    {def.label}
                  </div>
                  <div
                    className="font-mono text-[8px] text-[var(--ink-3)] leading-[1.4]"
                    style={{ fontSize: "8px" }}
                  >
                    {isEarned ? "✓ Earned" : "Locked"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
