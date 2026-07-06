"use client";

import { useState } from "react";

interface Props {
  title: string;
  coverUrl: string | null;
  className?: string;
  /** Font-size for the fallback title text, in px */
  titleSize?: number;
}

// Deterministic string hash so the same title always produces the same hue —
// no randomness, no flash of a different color on re-render.
function hashHue(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
}

// Book cover: renders the real image when available, and falls back to a
// gradient derived from the title's hash (so it's stable per-book) when the
// cover is missing OR fails to load. Mixed with var(--bg-2) so the gradient's
// overall tone tracks light/dark theme automatically.
export function BookCover({ title, coverUrl, className = "", titleSize = 15 }: Props): React.ReactElement {
  const [failed, setFailed] = useState(false);
  const showImage = coverUrl && !failed;

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverUrl}
        alt={title}
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  const hue = hashHue(title);
  const hue2 = (hue + 45) % 360;

  return (
    <div
      className={`absolute inset-0 flex items-end p-[14px] ${className}`}
      style={{
        background: `linear-gradient(135deg, color-mix(in oklch, oklch(0.72 0.12 ${hue}) 62%, var(--bg-2)) 0%, color-mix(in oklch, oklch(0.52 0.15 ${hue2}) 62%, var(--bg-2)) 100%)`,
      }}
    >
      <span
        className="font-display font-normal leading-[1.15] tracking-[-0.01em] text-[var(--ink)] line-clamp-4"
        style={{ fontSize: `${titleSize}px` }}
      >
        {title}
      </span>
    </div>
  );
}
