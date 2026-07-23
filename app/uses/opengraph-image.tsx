import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Uses — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Uses",
    title: "My setup & tools.",
    subtitle: "The hardware, apps, and gear behind everything I build.",
    cta: "See the stack →",
    path: "/uses",
  });
}
