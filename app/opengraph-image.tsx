import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Michael Ojekunle — Software Engineer & Builder";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Software Engineer & Builder",
    title: "Michael Ojekunle",
    subtitle: "Four years building products across web, mobile and web3, now going deep on Rust, distributed systems and AI infrastructure. Currently building Zamir.",
    cta: "Explore the work →",
  });
}
