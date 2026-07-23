import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Guestbook — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Guestbook",
    title: "Sign the guestbook.",
    subtitle: "Leave a note, say hi, or drop a thought for the next visitor.",
    cta: "Leave a message →",
    path: "/guestbook",
  });
}
