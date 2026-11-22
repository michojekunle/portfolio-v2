import type { Metadata } from "next";
import { LearnLanding, type LandingContent } from "@/features/learn/ui/LearnLanding";

const TITLE = "French Daily: one French page a day, about ten minutes";
const DESCRIPTION = "Learn French in about ten minutes a day: spaced review, a short scene you say back, real-speed listening and one sentence corrected in red pen. Free, no account needed to try.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn/french" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/learn/french", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const CONTENT: LandingContent = {
  app: "french",
  language: "French",
  appName: "French Daily",
  headline: "One French page a day.",
  headlineEm: "Out loud.",
  intro: "A one-button daily session of about ten minutes: review the words you're about to forget, hear a short scene, say it back, and write one sentence of your own, corrected in red pen.",
  steps: [
    { name: "Review", body: "The words you're about to forget, at the moment you'd forget them. Spaced repetition does the scheduling." },
    { name: "Learn", body: "A short scene in French, line by line, with a few new words. You say each line back or type it from memory." },
    { name: "Speak", body: "Answer one question out loud, in your own words, and see how close your pronunciation lands." },
    { name: "Write", body: "One sentence of your own, corrected in red pen. Your mistakes become tomorrow's review cards." },
  ],
  other: { href: "/learn/spanish", label: "Learning Spanish instead? Spanish Daily \u2192" },
};

export default function Page(): React.ReactElement {
  return <LearnLanding content={CONTENT} />;
}
