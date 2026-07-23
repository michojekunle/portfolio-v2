import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Reading — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Reading Log",
    title: "What I'm reading.",
    subtitle: "Books, notes, quotes, and the ideas I'm taking from each one.",
    cta: "Browse the shelf →",
    path: "/reading",
  });
}
