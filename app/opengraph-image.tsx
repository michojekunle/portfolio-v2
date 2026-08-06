import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Michael Ojekunle — Software Engineer & Builder";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Software Engineer & Builder",
    title: "Michael Ojekunle",
    subtitle: "Full-stack engineer going deep on Rust systems programming — building products of my own, heading toward zkML.",
    cta: "Explore the work →",
  });
}
