import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { ReactElement } from "react";

export const LEARN_OG_SIZE = { width: 1200, height: 630 } as const;

export interface LearnOgOptions {
  readonly app: "french" | "spanish";
  readonly name: string;
  /** Headline in the language being learned. */
  readonly headline: string;
  readonly translation: string;
  readonly steps: readonly string[];
  readonly accent: string;
  readonly paper: string;
  readonly ink: string;
  /** "ruled" notebook (Cahier) or squared "grid" paper. */
  readonly paperStyle: "ruled" | "grid";
}

const MARGIN_RED = "#FF7A7F";

function Paper({ style, accent }: { readonly style: LearnOgOptions["paperStyle"]; readonly accent: string }): ReactElement {
  const lines: ReactElement[] = [];
  if (style === "ruled") {
    for (let y = 120; y < 630; y += 46) lines.push(<div key={`h${y}`} style={{ position: "absolute", left: 0, width: 1200, top: y, height: 2, background: accent, opacity: 0.1 }} />);
  } else {
    for (let y = 0; y < 630; y += 36) lines.push(<div key={`h${y}`} style={{ position: "absolute", left: 0, width: 1200, top: y, height: 1, background: accent, opacity: 0.12 }} />);
    for (let x = 0; x < 1200; x += 36) lines.push(<div key={`v${x}`} style={{ position: "absolute", top: 0, height: 630, left: x, width: 1, background: accent, opacity: 0.12 }} />);
  }
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex" }}>
      {lines}
      <div style={{ position: "absolute", top: 0, height: 630, left: 96, width: 4, background: MARGIN_RED }} />
    </div>
  );
}

export async function renderLearnOg(o: LearnOgOptions): Promise<ImageResponse> {
  const icon = await readFile(join(process.cwd(), "public", "icons", o.app, "icon-512.png"));
  const iconSrc = `data:image/png;base64,${icon.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: o.paper, color: o.ink, fontFamily: "sans-serif" }}>
        <Paper style={o.paperStyle} accent={o.accent} />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px 56px 140px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain img only */}
            <img src={iconSrc} width={72} height={72} style={{ borderRadius: 16 }} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>{o.name}</div>
              <div style={{ fontSize: 22, opacity: 0.6 }}>One page a day · about ten minutes</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -3, lineHeight: 1, color: o.accent }}>{o.headline}</div>
            <div style={{ fontSize: 34, opacity: 0.7, fontStyle: "italic" }}>{o.translation}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 12 }}>
              {o.steps.map((step, i) => (
                <div key={step} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: i === 0 ? o.accent : "rgba(255,255,255,0.75)", color: i === 0 ? "#fff" : o.ink, border: `2px solid ${o.accent}`, fontSize: 22, fontWeight: 600 }}>
                  <span style={{ opacity: 0.6 }}>{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 22, opacity: 0.55 }}>{`michaelojekunle.dev/${o.app}`}</div>
          </div>
        </div>
      </div>
    ),
    LEARN_OG_SIZE
  );
}
