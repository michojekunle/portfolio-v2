import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Contact — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Contact",
    title: "Let's build something.",
    subtitle: "Open to select freelance work, collaborations, and conversations.",
    cta: "Start a conversation →",
    path: "/contact",
  });
}
