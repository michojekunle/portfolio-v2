import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Carousel Lab — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Personal Utility",
    title: "Carousel Lab",
    subtitle:
      "Design and export high-conversion multi-slide carousels directly to Instagram.",
    cta: "Launch tool →",
    path: "/tools/carousel-lab",
  });
}
