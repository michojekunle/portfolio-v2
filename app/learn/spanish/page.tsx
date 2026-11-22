import type { Metadata } from "next";
import { LearnLanding, type LandingContent } from "@/features/learn/ui/LearnLanding";

const TITLE = "Spanish Daily: one Spanish page a day, about ten minutes";
const DESCRIPTION = "Learn Spanish in about ten minutes a day, with Spain or Latin American voices: spaced review, a short scene you say back, and one sentence corrected. Free, no account needed to try.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn/spanish" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/learn/spanish", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const CONTENT: LandingContent = {
  app: "spanish",
  language: "Spanish",
  appName: "Spanish Daily",
  headline: "One Spanish page a day.",
  headlineEm: "Out loud.",
  intro: "The same one-button, ten-minute page for Spanish, in Spain or Latin American Spanish: review, a short scene, speaking, and one sentence of your own, corrected.",
  steps: [
    { name: "Review", body: "The words you're about to forget, at the moment you'd forget them. Spaced repetition does the scheduling." },
    { name: "Learn", body: "A short scene in Spanish, line by line, with a few new words. You say each line back or type it from memory." },
    { name: "Speak", body: "Answer one question out loud, in your own words, and see how close your pronunciation lands." },
    { name: "Write", body: "One sentence of your own, corrected in red pen. Your mistakes become tomorrow's review cards." },
  ],
  other: { href: "/learn/french", label: "Learning French instead? French Daily \u2192" },
};

export default function Page(): React.ReactElement {
  return <LearnLanding content={CONTENT} />;
}
