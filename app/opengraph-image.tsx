import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Michael Ojekunle — Full-Stack & Web3 Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image(): Promise<ImageResponse> {
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
        {/* Subtle radial glow — adds depth without breaking minimalism */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,255,255,0.025) 0%, transparent 70%)",
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

        {/* Top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "#3a3a3a",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            michael.dev
          </span>
          <span
            style={{
              fontSize: 12,
              color: "#3a3a3a",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            Lagos, Nigeria
          </span>
        </div>

        {/* Main content block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Name */}
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "#f4f4f4",
              lineHeight: 1,
              letterSpacing: "-4px",
              marginBottom: "20px",
            }}
          >
            Michael Ojekunle
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "#4a4a4a",
              letterSpacing: "-0.5px",
              marginBottom: "40px",
            }}
          >
            Full-Stack &amp; Web3 Developer
          </div>

          {/* Divider */}
          <div
            style={{
              width: "48px",
              height: "1px",
              background: "#272727",
              marginBottom: "28px",
            }}
          />

          {/* Tech stack */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "center",
            }}
          >
            {["Solidity", "Cairo", "TypeScript", "Next.js", "Rust"].map(
              (tech, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "24px",
                    color: "#363636",
                    fontSize: 15,
                    letterSpacing: "0.5px",
                  }}
                >
                  {i > 0 && (
                    <span
                      style={{
                        width: "3px",
                        height: "3px",
                        background: "#2a2a2a",
                        borderRadius: "50%",
                        display: "flex",
                      }}
                    />
                  )}
                  {tech}
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#2c2c2c",
              letterSpacing: "0.5px",
            }}
          >
            michaelojekunle.dev
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#1e1e1e",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: "#2c2c2c",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Open to opportunities
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
