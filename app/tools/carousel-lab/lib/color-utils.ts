// Rough relative luminance (0 = black, 1 = white) — used to pick a wrapper
// tone that reads as "slightly darker/lighter than the card" regardless of
// which aesthetic mood (light or dark) is active.
export function hexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Shifts a hex color toward black (negative percent) or white (positive).
export function shadeColor(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return "#" + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

// The wrapper a "mesh" card floats on should read as a distinct tone from
// the card itself, regardless of whether the active mood is light or dark.
export function wrapperBackgroundFor(activeBg: string): string {
  const luminance = hexLuminance(activeBg);
  return luminance > 0.5 ? shadeColor(activeBg, -6) : shadeColor(activeBg, 10);
}
