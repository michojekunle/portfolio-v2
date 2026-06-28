import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Uses",
  description: "Hardware, software, tools, and setup Michael Ojekunle uses daily for development.",
}

import { UsesClient } from "@/components/uses-client"

export default function UsesPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <UsesClient />
    </main>
  )
}
