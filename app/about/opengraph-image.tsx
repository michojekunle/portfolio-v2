import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "About — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "About",
    title: "Curiosity is the constant.",
    subtitle: "A faith-driven engineer, writer, and builder from Lagos, Nigeria.",
    cta: "Read my story →",
    path: "/about",
  });
}
