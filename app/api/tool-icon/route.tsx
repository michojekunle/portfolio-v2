import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { TOOL_COLORS, type ToolId } from "@/lib/tool-colors";

export const runtime = "edge";

// Referenced by every manifest in public/manifests/*.json instead of static
// PNGs (which drift out of sync or go missing when tools are added). Colors
// come from lib/tool-colors.ts — the same source of truth the in-app UI uses.
const TOOL_LABELS: Record<ToolId, string> = {
  bookbreaks: "BB",
  chapterly: "CH",
  "thread-studio": "TS",
  vela: "V",
  "carousel-lab": "CL",
  flowise: "FL",
};

export async function GET(request: NextRequest): Promise<ImageResponse> {
  const { searchParams } = new URL(request.url);
  const tool = (searchParams.get("tool") ?? "") as ToolId;
  const sizeParam = Number(searchParams.get("size"));
  const size = sizeParam === 512 ? 512 : 192;

  const colors = TOOL_COLORS[tool];
  const config = colors ? { label: TOOL_LABELS[tool], bg: colors.accent } : { label: "?", bg: "#4F6D7A" };
  const fontSize = size * 0.42;
  const radius = size * 0.22;

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: config.bg,
          borderRadius: radius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: size * 0.04,
            borderRadius: radius - size * 0.02,
            border: `${size * 0.02}px solid rgba(255,255,255,0.25)`,
            display: "flex",
          }}
        />
        <span
          style={{
            fontSize,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          {config.label}
        </span>
      </div>
    ),
    { width: size, height: size }
  );
}
