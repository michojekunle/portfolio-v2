import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest): Promise<ImageResponse | Response> {
  const { searchParams } = new URL(request.url);
  const quote = searchParams.get("quote") ?? "";
  const book = searchParams.get("book") ?? "";
  const author = searchParams.get("author") ?? "";
  const color = searchParams.get("color") ?? "yellow";

  if (!quote) {
    return new Response("Missing quote param", { status: 400 });
  }

  const MAX_QUOTE = 280;
  const displayQuote = quote.length > MAX_QUOTE ? `${quote.slice(0, MAX_QUOTE)}…` : quote;

  const HIGHLIGHT_PALETTES: Record<string, { bg: string; accent: string; quoteBg: string; quoteText: string }> = {
    yellow: { bg: "#1a1410", accent: "#F59E0B", quoteBg: "rgba(245,158,11,0.08)", quoteText: "#FDE68A" },
    green:  { bg: "#0f1a14", accent: "#22C55E", quoteBg: "rgba(34,197,94,0.08)",  quoteText: "#BBF7D0" },
    blue:   { bg: "#0f1420", accent: "#3B82F6", quoteBg: "rgba(59,130,246,0.08)", quoteText: "#BFDBFE" },
    pink:   { bg: "#1a0f18", accent: "#EC4899", quoteBg: "rgba(236,72,153,0.08)", quoteText: "#FBCFE8" },
  };

  const palette = HIGHLIGHT_PALETTES[color] ?? HIGHLIGHT_PALETTES.yellow;
  const BB_ORANGE = "#C85A2C";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1080px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: palette.bg,
          padding: "80px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${BB_ORANGE}, ${palette.accent})`,
          }}
        />

        {/* BookBreaks logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "auto",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: BB_ORANGE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#fff", fontSize: "18px", fontWeight: 700 }}>B</span>
          </div>
          <span
            style={{
              color: "#fff",
              fontSize: "20px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              fontFamily: "sans-serif",
            }}
          >
            BookBreaks
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: "14px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "monospace",
              marginLeft: "8px",
            }}
          >
            × Chapterly
          </span>
        </div>

        {/* Quote area — centered vertically */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: "40px",
            paddingBottom: "40px",
          }}
        >
          {/* Opening quote mark */}
          <div
            style={{
              fontSize: "120px",
              lineHeight: "0.6",
              color: palette.accent,
              opacity: 0.3,
              fontFamily: "Georgia, serif",
              marginBottom: "24px",
            }}
          >
            &ldquo;
          </div>
          <div
            style={{
              backgroundColor: palette.quoteBg,
              borderRadius: "20px",
              padding: "40px 48px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <p
              style={{
                color: palette.quoteText,
                fontSize: displayQuote.length > 180 ? "28px" : "34px",
                lineHeight: 1.55,
                margin: 0,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
              }}
            >
              {displayQuote}
            </p>
          </div>

          {/* Highlight color dot */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "28px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: palette.accent,
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "14px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "monospace",
              }}
            >
              {color} highlight
            </span>
          </div>
        </div>

        {/* Footer — book info */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {book && (
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "22px",
                  fontWeight: 600,
                  fontFamily: "Georgia, serif",
                }}
              >
                {book}
              </span>
            )}
            {author && (
              <span
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "16px",
                  fontFamily: "sans-serif",
                  letterSpacing: "0.02em",
                }}
              >
                by {author}
              </span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: "100px",
              padding: "8px 16px",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "13px",
                letterSpacing: "0.08em",
                fontFamily: "monospace",
                textTransform: "uppercase",
              }}
            >
              my highlight
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    }
  );
}
