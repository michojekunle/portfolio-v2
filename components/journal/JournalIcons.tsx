"use client";

import React from "react";
import {
  Target,
  Lightbulb,
  Rocket,
  BookOpen,
  Dumbbell,
  Trophy,
  Sprout,
  PenTool,
  Wallet,
  Palette,
  Microscope,
  Handshake,
  Zap,
  CircleDot,
  type LucideIcon,
} from "lucide-react";

export const OBJECTIVE_ICON_KEYS = [
  "target",
  "lightbulb",
  "rocket",
  "book",
  "dumbbell",
  "trophy",
  "sprout",
  "pen",
  "wallet",
  "palette",
  "microscope",
  "handshake",
] as const;

export type ObjectiveIconKey = (typeof OBJECTIVE_ICON_KEYS)[number];

const OBJECTIVE_ICON_MAP: Record<string, LucideIcon> = {
  // keys
  target: Target,
  lightbulb: Lightbulb,
  rocket: Rocket,
  book: BookOpen,
  dumbbell: Dumbbell,
  fitness: Dumbbell,
  trophy: Trophy,
  sprout: Sprout,
  growth: Sprout,
  pen: PenTool,
  write: PenTool,
  wallet: Wallet,
  finance: Wallet,
  palette: Palette,
  art: Palette,
  microscope: Microscope,
  science: Microscope,
  handshake: Handshake,
  network: Handshake,

  // Legacy emojis mapping for backwards database compatibility
  "\uD83C\uDFAF": Target,
  "\uD83D\uDCA1": Lightbulb,
  "\uD83D\uDE80": Rocket,
  "\uD83D\uDCD6": BookOpen,
  "\uD83D\uDCAA": Dumbbell,
  "\uD83C\uDFC6": Trophy,
  "\uD83C\uDF31": Sprout,
  "\u270F\uFE0F": PenTool,
  "\u270F": PenTool,
  "\uD83D\uDCB0": Wallet,
  "\uD83C\uDFA8": Palette,
  "\uD83D\uDD2C": Microscope,
  "\uD83E\uDD1D": Handshake,
};

interface ObjectiveIconProps {
  icon?: string | null;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export function ObjectiveIcon({
  icon,
  className = "w-4 h-4",
  size,
  style,
}: ObjectiveIconProps): React.ReactElement {
  if (!icon) return <Target className={className} size={size} style={style} />;
  const clean = icon.trim().toLowerCase();
  const IconComponent = OBJECTIVE_ICON_MAP[icon] ?? OBJECTIVE_ICON_MAP[clean] ?? Target;
  return <IconComponent className={className} size={size} style={style} />;
}

export function EnergyLevelIcons({
  level,
  size = 14,
  className = "inline-flex items-center gap-0.5",
}: {
  level: number;
  size?: number;
  className?: string;
}): React.ReactElement {
  const count = Math.max(0, Math.min(5, level));
  return (
    <span className={className} aria-label={`Energy level ${count} of 5`}>
      {Array.from({ length: count }).map((_, i) => (
        <Zap
          key={i}
          size={size}
          className="fill-amber-400 text-amber-500 shrink-0"
        />
      ))}
    </span>
  );
}
