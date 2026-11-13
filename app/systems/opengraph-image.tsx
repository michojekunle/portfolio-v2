import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Systems Roadmap — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Systems & Infrastructure",
    title: "How far down the stack I've been.",
    subtitle:
      "Public roadmap across Rust, ZK cryptography, memory systems, and AI infrastructure.",
    cta: "Explore roadmap →",
    path: "/systems",
  });
}
