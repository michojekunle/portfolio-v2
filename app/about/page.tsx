import type { Metadata } from "next"
import { AboutClientContent } from "@/components/about-client-content"
import { getPublicBooks } from "@/lib/supabase/reading"

export const revalidate = 300

export const metadata: Metadata = {
  title: "About",
  description:
    "Michael Ojekunle — software engineer based in Lagos. Four years building products across web, mobile and web3, now going deep on Rust, distributed systems and AI infrastructure.",
}

export default async function AboutPage(): Promise<React.ReactElement> {
  const books = await getPublicBooks()
  const currentReads = books.filter((b) => b.status === "reading")

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <AboutClientContent currentReads={currentReads} />
    </main>
  )
}
