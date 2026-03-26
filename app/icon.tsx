import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Shared M-mark renderer at any given dimension
function MMark({ dim }: { dim: number }): React.ReactElement {
  const r = dim * 0.1875; // corner radius (6 / 32)
  const pad = dim * 0.25; // 8 / 32 — inner padding
  const sw = dim * 0.078125; // stroke-width (2.5 / 32)
  const cx = dim / 2;
  const valleyY = cx + dim * 0.0625; // valley slightly below center for optical balance

  const pts = [
    `${pad},${dim - pad}`,
    `${pad},${pad}`,
    `${cx},${valleyY}`,
    `${dim - pad},${pad}`,
    `${dim - pad},${dim - pad}`,
  ].join(" ");

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
      {/* inset border */}
      <div
        style={{
          position: "absolute",
          inset: dim * 0.03125,
          borderRadius: r - 1,
          border: `${dim * 0.03125}px solid rgba(255,255,255,0.12)`,
          display: "flex",
        }}
      />
      <svg
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        style={{ position: "absolute" }}
      >
        <polyline
          points={pts}
          fill="none"
          stroke="white"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function Icon(): ImageResponse {
  return new ImageResponse(<MMark dim={32} />, { width: 32, height: 32 });
}
