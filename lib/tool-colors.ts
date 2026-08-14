/**
 * Single source of truth for each Creator Suite tool's brand accent.
 * Used by in-app UI, PWA manifests, and the dynamic tool-icon route —
 * keeping these in one place avoids the accent drifting out of sync
 * between a tool's page and its manifest/icon.
 */

export interface ToolColorSet {
  accent: string;
  accentSoft: string;
  accentBorder: string;
}

function buildColorSet(hex: string, r: number, g: number, b: number): ToolColorSet {
  return {
    accent: hex,
    accentSoft: `rgba(${r},${g},${b},0.12)`,
    accentBorder: `rgba(${r},${g},${b},0.25)`,
  };
}

export const TOOL_COLORS = {
  bookbreaks: buildColorSet("#C85A2C", 200, 90, 44),
  chapterly: buildColorSet("#4F6D7A", 79, 109, 122),
  "thread-studio": buildColorSet("#6366F1", 99, 102, 241),
  vela: buildColorSet("#7C3AED", 124, 58, 237),
  "carousel-lab": buildColorSet("#FF6B35", 255, 107, 53),
  flowise: buildColorSet("#16A34A", 22, 163, 74),
  french: buildColorSet("#0066F5", 0, 102, 245),
} as const satisfies Record<string, ToolColorSet>;

export type ToolId = keyof typeof TOOL_COLORS;
