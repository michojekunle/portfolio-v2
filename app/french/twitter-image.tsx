import { LEARN_OG_SIZE, renderLearnOg } from "@/features/learn/og/render-learn-og";

export const alt = "French Daily — one French page a day, about ten minutes: review, listen, speak, write.";
export const size = LEARN_OG_SIZE;
export const contentType = "image/png";

export default function Image(): ReturnType<typeof renderLearnOg> {
  return renderLearnOg({
    app: "french",
    name: "French Daily",
    headline: "Une page par jour.",
    translation: "One page a day — and you keep it.",
    steps: ["Révise", "Écoute", "Parle", "Écris"],
    accent: "#4B2FA8",
    paper: "#fbfaf7",
    ink: "#1d1a2b",
    paperStyle: "ruled",
  });
}
