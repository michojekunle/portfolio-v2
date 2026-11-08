import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Changelog — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Changelog",
    title: "What's new.",
    subtitle: "Ships, updates, and improvements to the site and tools over time.",
    cta: "See updates →",
    path: "/changelog",
  });
}
