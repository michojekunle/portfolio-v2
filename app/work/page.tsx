import type { Metadata } from "next"
import { WorkClient } from "./work-client"
import { WorkHeroWidget } from "@/components/work-hero-widget"

export const metadata: Metadata = {
  title: "Work",
  description: "A selection of projects worth talking about — web3 frontends, smart contracts, and open-source tools by Michael Ojekunle.",
}

export default function WorkPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
        <section className="pt-[160px] pb-[80px] max-[720px]:pt-[80px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
          <div className="grid grid-cols-[1.4fr_1fr] max-[900px]:grid-cols-1 gap-[64px] max-[720px]:gap-[32px] items-center">
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]">SELECTED WORK · 2024 — 2026</div>
              <h1 className="m-0 font-display font-normal text-[clamp(48px,8vw,100px)] leading-[0.95] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance fvs-display">
                Engineering <em className="not-italic italic text-[var(--v3-accent)] fvs-soft">impact.</em>
              </h1>
              <p className="text-[18px] text-[var(--ink-2)] max-w-[48ch] leading-[1.65] m-0 italic font-display fvs-text">
                Each project here represents a specific challenge solved—from protocol-level complexity to high-fidelity interface design.
              </p>
            </div>
            <div className="flex justify-end max-[900px]:justify-start">
              <WorkHeroWidget />
            </div>
          </div>
        </section>

        <WorkClient />
    </main>
  )
}

