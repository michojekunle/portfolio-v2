import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Writing — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Writing",
    title: "Notes on code & faith.",
    subtitle: "Essays on web3, engineering, and building software with intention.",
    cta: "Read the blog →",
    path: "/blog",
  });
}
