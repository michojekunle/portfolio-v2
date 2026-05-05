import type { Metadata } from "next"
import { WorkClient } from "./work-client"

export const metadata: Metadata = {
  title: "Work",
  description: "A selection of projects worth talking about — web3 frontends, smart contracts, and open-source tools by Michael Ojekunle.",
}

export default function WorkPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
        <section className="pt-[160px] pb-[80px] max-[720px]:pt-[120px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]">SELECTED WORK · 2024 — 2026</div>
          <h1 className="m-0 font-[family:var(--display-font)] font-normal text-[clamp(64px,10vw,120px)] leading-[0.85] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance [font-variation-settings:'opsz'_144]">
            Engineering <em className="not-italic italic text-[var(--v3-accent)] [font-variation-settings:'opsz'_144,'SOFT'_100]">impact.</em>
          </h1>
          <p className="text-[18px] text-[var(--ink-2)] max-w-[48ch] leading-[1.65] m-0 italic font-[family:var(--display-font)] [font-variation-settings:'opsz'_96]">
            Each project here represents a specific challenge solved—from protocol-level complexity to high-fidelity interface design.
          </p>
        </section>

        <WorkClient />
    </main>
  )
}
