import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Blog — Michael Ojekunle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function BlogIndexOGImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          position: "relative",
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        {/* Glow — centred, soft */}
        <div
          style={{
            position: "absolute",
            bottom: -120,
            right: -60,
            width: 700,
            height: 500,
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />

        {/* Inset border frame */}
        <div
          style={{
            position: "absolute",
            inset: "28px",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "3px",
            display: "flex",
          }}
        />

        {/* Top row — logomark + label */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: "#111",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.08)",
                position: "relative",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 44 44"
                style={{ position: "absolute" }}
              >
                <polyline
                  points="10,34 10,10 22,22 34,10 34,34"
                  fill="none"
                  stroke="white"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#444",
                letterSpacing: "0.3px",
              }}
            >
              Michael Ojekunle
            </span>
          </div>

          <span
            style={{
              fontSize: 12,
              color: "#333",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            Writing
          </span>
        </div>

        {/* Main — large "Blog" wordmark + description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Accent line */}
          <div
            style={{
              width: 40,
              height: 2,
              background: "rgba(255,255,255,0.12)",
              marginBottom: "32px",
            }}
          />

          <div
            style={{
              fontSize: 112,
              fontWeight: 800,
              color: "#f4f4f4",
              lineHeight: 0.9,
              letterSpacing: "-6px",
              marginBottom: "28px",
            }}
          >
            Blog
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "-0.3px",
              maxWidth: 680,
              lineHeight: 1.5,
            }}
          >
            Technical deep-dives, Web3 insights, and reflections on faith,
            code, and building for the decentralized future.
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "24px",
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: "#2e2e2e",
              letterSpacing: "0.5px",
            }}
          >
            michaelojekunle.dev/blog
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {["Technical", "Web3", "Reflection"].map((tag, i) => (
              <span
                key={i}
                style={{
                  fontSize: 11,
                  color: "#252525",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: 4,
                  display: "flex",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
