import { LEARN_OG_SIZE, renderLearnOg } from "@/features/learn/og/render-learn-og";

export const alt = "Spanish Daily — one Spanish page a day, about ten minutes: review, listen, speak, write.";
export const size = LEARN_OG_SIZE;
export const contentType = "image/png";

export default function Image(): ReturnType<typeof renderLearnOg> {
  return renderLearnOg({
    app: "spanish",
    name: "Spanish Daily",
    headline: "Una página al día.",
    translation: "One page a day — and it sticks.",
    steps: ["Repasa", "Escucha", "Habla", "Escribe"],
    accent: "#1D4FB8",
    paper: "#fdfdfb",
    ink: "#111a2b",
    paperStyle: "grid",
  });
}
