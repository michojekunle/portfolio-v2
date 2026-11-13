import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Brand Guidelines — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Identity & Typography",
    title: "Brand & Design Tokens",
    subtitle:
      "Design principles, chromatic palettes, typography hierarchy, and marks.",
    cta: "View design tokens →",
    path: "/brand",
  });
}
