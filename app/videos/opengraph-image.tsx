import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Videos — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Videos",
    title: "Watch & learn.",
    subtitle: "Talks, tutorials, and build logs on web3 and engineering.",
    cta: "Watch now →",
    path: "/videos",
  });
}
