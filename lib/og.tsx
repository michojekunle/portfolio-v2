import { ImageResponse } from "next/og";
import { MoMark } from "@/lib/brand-mark";

/**
 * Shared Open Graph card renderer. One branded template so every page's social
 * preview is consistent, legible, and on-brand (warm dark + cream + gold, matching
 * the site's v3 palette) — each page supplies its own eyebrow, title, subtitle and CTA.
 *
 * Uses satori's built-in font (no custom font fetch) to stay reliable on the edge,
 * matching the rest of the repo's OG images.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

// Monochrome palette — high-contrast white on near-black.
const BG = "#0a0a0a";
const INK = "#ffffff";
const INK_MUTED = "#a3a3a3";
const INK_FAINT = "#666666";
const ACCENT = "#ffffff";
const ACCENT_SOFT = "#ededed";

interface OgCardOptions {
  /** Small uppercase label above the title, e.g. "Selected Work". */
  eyebrow: string;
  /** Main headline. */
  title: string;
  /** Supporting line under the title. */
  subtitle?: string;
  /** Call-to-action pill text, e.g. "See the work →". */
  cta: string;
  /** Path shown bottom-right after the domain, e.g. "/work". Omit for home. */
  path?: string;
}

function titleSize(title: string): number {
  if (title.length > 62) return 60;
  if (title.length > 42) return 72;
  if (title.length > 24) return 88;
  return 100;
}

export function renderOgCard({ eyebrow, title, subtitle, cta, path }: OgCardOptions): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: "64px 72px",
          position: "relative",
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        {/* Warm gold glow, top-right */}
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -160,
            width: 720,
            height: 620,
            background: "radial-gradient(ellipse, rgba(255,255,255,0.10) 0%, transparent 68%)",
            borderRadius: "50%",
            display: "flex",
          }}
        />
        {/* Counter-glow, bottom-left, for depth */}
        <div
          style={{
            position: "absolute",
            bottom: -260,
            left: -180,
            width: 640,
            height: 520,
            background: "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)",
            borderRadius: "50%",
            display: "flex",
          }}
        />
        {/* Inset hairline frame */}
        <div
          style={{
            position: "absolute",
            inset: 26,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 6,
            display: "flex",
          }}
        />

        {/* Top row — logomark + name, and eyebrow pill */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <MoMark dim={48} />
            <span style={{ fontSize: 18, fontWeight: 600, color: INK, letterSpacing: "0.2px" }}>
              Michael Ojekunle
            </span>
          </div>

          <span
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.08)",
              color: ACCENT_SOFT,
              fontSize: 15,
              fontWeight: 600,
              padding: "9px 20px",
              borderRadius: 100,
              letterSpacing: "2px",
              textTransform: "uppercase",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            {eyebrow}
          </span>
        </div>

        {/* Middle — title + subtitle */}
        <div style={{ display: "flex", flexDirection: "column", position: "relative", flex: 1, justifyContent: "center", paddingTop: 24, paddingBottom: 24 }}>
          <div style={{ display: "flex", width: 52, height: 3, background: ACCENT, borderRadius: 2, marginBottom: 30 }} />
          <div
            style={{
              display: "flex",
              fontSize: titleSize(title),
              fontWeight: 800,
              color: INK,
              lineHeight: 1.02,
              letterSpacing: "-2.5px",
              maxWidth: 1000,
              marginBottom: subtitle ? 26 : 0,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 400,
                color: INK_MUTED,
                lineHeight: 1.5,
                letterSpacing: "-0.3px",
                maxWidth: 860,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom row — CTA pill + domain */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: ACCENT,
              color: "#0a0a0a",
              fontSize: 20,
              fontWeight: 700,
              padding: "15px 30px",
              borderRadius: 100,
              letterSpacing: "-0.2px",
            }}
          >
            {cta}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", width: 7, height: 7, borderRadius: "50%", background: ACCENT }} />
            <span style={{ fontSize: 17, color: INK_FAINT, letterSpacing: "0.3px" }}>
              michaelojekunle.dev{path ?? ""}
            </span>
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
