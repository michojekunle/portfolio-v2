import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Tools — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Tools",
    title: "Apps I've built.",
    subtitle: "Small, useful products — journaling, finance, and reading, crafted end to end.",
    cta: "Try the tools →",
    path: "/tools",
  });
}
