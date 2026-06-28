import type { Metadata } from "next"
import { AboutClientContent } from "@/components/about-client-content"

export const metadata: Metadata = {
  title: "About",
  description:
    "Michael Ojekunle — full-stack and Web3 developer based in Lagos. Background, values, and what I'm building toward.",
}

export default function AboutPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <AboutClientContent />
    </main>
  )
}
