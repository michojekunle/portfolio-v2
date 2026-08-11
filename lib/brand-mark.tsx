/**
 * Two marks, one system — both drawn as a single continuous stroke.
 *
 * MoMark: Michael Ojekunle, the forward brand. The M's last leg sweeps
 * directly into the O without lifting, then curls back near its own start —
 * built the way single-stroke fashion monograms actually work. Primary mark:
 * navbar, favicon, apple-icon, OG cards.
 *
 * AmdMark: "AMD" isn't three initials meeting — it's one name, Ayomide,
 * read in three syllables. One unbroken line rises through three peaks
 * (Ayo · Mi · De) without lifting; the two accent dots mark where the name
 * starts and stops being said. Signature mark: socials, footer credit.
 */

/** Shared path data — the single source of truth also consumed by the carousel-lab canvas exporter. */
export const MO_PATH_D =
  "M12 82 L12 18 L34 54 L56 18 C 80 18 92 32 92 46 C 92 63 76 78 58 78 C 45 78 36 68 34 56";
export const AMD_PATH_D = "M10 72 L27 24 L44 72 L58 16 L72 72 L90 40";
export const AMD_DOTS = [
  { cx: 10, cy: 72 },
  { cx: 90, cy: 40 },
] as const;

function badgeShell(
  dim: number,
  children: React.ReactNode
): React.ReactElement {
  const r = dim * 0.1875;
  const border = Math.max(1, dim * 0.03125);
  return (
    <div
      style={{
        width: dim,
        height: dim,
        background: "#0a0a0a",
        borderRadius: r,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: border,
          borderRadius: Math.max(0, r - border),
          border: `${border}px solid rgba(255,255,255,0.14)`,
          display: "flex",
        }}
      />
      {children}
    </div>
  );
}

export function MoMark({ dim }: { dim: number }): React.ReactElement {
  const svgDim = dim * 0.64;
  const sw = 6.4;
  return badgeShell(
    dim,
    <svg
      width={svgDim}
      height={svgDim}
      viewBox="0 0 100 100"
      style={{ position: "absolute" }}
    >
      <path
        d={MO_PATH_D}
        fill="none"
        stroke="#ffffff"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AmdMark({ dim }: { dim: number }): React.ReactElement {
  const svgDim = dim * 0.72;
  const sw = 8;
  const dotR = 5.5;
  return badgeShell(
    dim,
    <svg
      width={svgDim}
      height={svgDim}
      viewBox="0 0 100 100"
      style={{ position: "absolute" }}
    >
      <circle cx={AMD_DOTS[0].cx} cy={AMD_DOTS[0].cy} r={dotR} fill="#d97a4d" />
      <path
        d={AMD_PATH_D}
        fill="none"
        stroke="#ffffff"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={AMD_DOTS[1].cx} cy={AMD_DOTS[1].cy} r={dotR} fill="#d97a4d" />
    </svg>
  );
}

/** Bare AMD signature (no badge), for inline use — running text, small colored badges. */
export function AmdSignatureInline({
  height,
  accent = "#d97a4d",
  color = "currentColor",
}: {
  height: number;
  accent?: string;
  color?: string;
}): React.ReactElement {
  const width = height * 1.6;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      style={{ display: "inline-block", verticalAlign: "middle" }}
      aria-label="AMD"
      role="img"
    >
      <circle cx={AMD_DOTS[0].cx} cy={AMD_DOTS[0].cy} r={7} fill={accent} />
      <path
        d={AMD_PATH_D}
        fill="none"
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={AMD_DOTS[1].cx} cy={AMD_DOTS[1].cy} r={7} fill={accent} />
    </svg>
  );
}

/** Bare MO signature (no badge), for inline use — running text, small colored badges. */
export function MoSignatureInline({
  height,
  color = "currentColor",
}: {
  height: number;
  color?: string;
}): React.ReactElement {
  return (
    <svg
      width={height}
      height={height}
      viewBox="0 0 100 100"
      style={{ display: "inline-block", verticalAlign: "middle" }}
      aria-label="MO"
      role="img"
    >
      <path
        d={MO_PATH_D}
        fill="none"
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
