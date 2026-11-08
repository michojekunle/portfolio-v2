import type { Metadata } from "next"
import { AboutClientContent } from "@/components/about-client-content"

export const metadata: Metadata = {
  title: "About",
  description:
    "Michael Ojekunle — software engineer and founder of Zamir, based in Lagos. Four years building products across web, mobile and web3, now going deep on Rust, distributed systems and AI infrastructure.",
}

export default function AboutPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <AboutClientContent />
    </main>
  )
}
