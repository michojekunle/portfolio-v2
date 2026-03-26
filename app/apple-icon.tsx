import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon(): ImageResponse {
  const dim = 180;
  const r = 32;
  const pad = 42;
  const sw = 13;
  const cx = dim / 2;
  const valleyY = cx + 10;

  const pts = [
    `${pad},${dim - pad}`,
    `${pad},${pad}`,
    `${cx},${valleyY}`,
    `${dim - pad},${pad}`,
    `${dim - pad},${dim - pad}`,
  ].join(" ");

  return new ImageResponse(
    (
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
            inset: 4,
            borderRadius: r - 2,
            border: "1.5px solid rgba(255,255,255,0.12)",
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
    ),
    { width: dim, height: dim }
  );
}
