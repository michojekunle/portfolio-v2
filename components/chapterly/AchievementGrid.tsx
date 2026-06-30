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
} from "lucide-react";
import { BADGE_DEFS, BADGE_LIST } from "@/lib/chapterly/achievements";
import type { BadgeId, ChAchievement } from "@/lib/chapterly/types";

const BADGE_ICONS: Record<BadgeId, React.ReactNode> = {
  first_book: <BookOpen size={20} />,
  night_owl: <Moon size={20} />,
  marathon: <Timer size={20} />,
  completionist_10: <Trophy size={20} />,
  completionist_50: <Award size={20} />,
  streak_7: <Flame size={20} />,
  streak_30: <Flame size={20} />,
  streak_100: <Flame size={20} />,
  speed_demon: <Zap size={20} />,
  book_whisperer: <Star size={20} />,
};

const BADGE_ACCENT: Record<BadgeId, string> = {
  first_book: "#4F6D7A",
  night_owl: "#6366F1",
  marathon: "#EA580C",
  completionist_10: "#D97706",
  completionist_50: "#D97706",
  streak_7: "#EA580C",
  streak_30: "#DC2626",
  streak_100: "#9333EA",
  speed_demon: "#16A34A",
  book_whisperer: "#D97706",
};

interface Props {
  earned: ChAchievement[];
}

export function AchievementGrid({ earned }: Props): React.ReactElement {
  const earnedIds = new Set(earned.map((a) => a.badge_id as BadgeId));
  const earnedMap = new Map(earned.map((a) => [a.badge_id as BadgeId, a.earned_at]));

  return (
    <div className="grid grid-cols-5 max-[900px]:grid-cols-4 max-[640px]:grid-cols-3 max-[400px]:grid-cols-2 gap-[12px]">
      {BADGE_LIST.map((def) => {
        const isEarned = earnedIds.has(def.id);
        const earnedAt = earnedMap.get(def.id);
        const accent = BADGE_ACCENT[def.id];

        return (
          <div
            key={def.id}
            className="rounded-[12px] p-[16px] flex flex-col items-center text-center gap-[8px] border transition-all"
            style={
              isEarned
                ? {
                    background: accent + "12",
                    borderColor: accent + "40",
                  }
                : {
                    background: "var(--bg-2)",
                    borderColor: "var(--rule)",
                    opacity: 0.45,
                  }
            }
            title={
              isEarned
                ? `Earned ${new Date(earnedAt!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                : "Locked"
            }
          >
            <div
              className="w-[40px] h-[40px] rounded-full flex items-center justify-center"
              style={
                isEarned
                  ? { background: accent + "20", color: accent }
                  : { background: "var(--rule)", color: "var(--ink-3)" }
              }
            >
              {isEarned ? BADGE_ICONS[def.id] : <Library size={20} />}
            </div>
            <div className="font-mono text-[9px] tracking-[0.1em] uppercase font-semibold text-[var(--ink-2)] leading-[1.3]">
              {def.label}
            </div>
            <div className="font-mono text-[9px] text-[var(--ink-3)] leading-[1.4] hidden max-[900px]:block">
              {isEarned ? "Earned" : "Locked"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
