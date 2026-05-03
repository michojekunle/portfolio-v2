import type { Metadata } from "next"
import { WorkClient } from "./work-client"

export const metadata: Metadata = {
  title: "Work",
  description: "Six projects worth talking about — web3 frontends, smart contracts, and open-source tools by Michael Ojekunle.",
}

export default function WorkPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
        <section className="v3-work-hero v3-container">
          <div className="v3-eyebrow" style={{ marginBottom: 24 }}>
            <b>Selected work</b> · 2024 — 2026
          </div>
          <h1>
            Six projects <em>worth</em>
            <br />
            talking about.
          </h1>
          <p
            style={{
              fontFamily: "var(--display-font)",
              fontSize: 22,
              fontStyle: "italic",
              color: "var(--ink-2)",
              maxWidth: "32ch",
              margin: 0,
              fontVariationSettings: '"opsz" 96, "SOFT" 100',
            }}
          >
            Each one taught me something I couldn&apos;t have learned reading.
          </p>
        </section>

        <WorkClient />
    </main>
  )
}
