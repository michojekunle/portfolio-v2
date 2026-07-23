import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Work — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Selected Work",
    title: "Projects worth talking about.",
    subtitle: "Web3 frontends, smart contracts, and open-source tools — built end to end.",
    cta: "See the work →",
    path: "/work",
  });
}
