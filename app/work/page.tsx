import type { Metadata } from "next"
import { WorkClient } from "./work-client"
import { WorkHeroWidget } from "@/components/work-hero-widget"

export const metadata: Metadata = {
  title: "Work",
  description: "A selection of projects worth talking about — full-stack products, mobile and web3 apps, smart contracts, and open-source tools by Michael Ojekunle.",
}

export default function WorkPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
        <section className="pt-40 pb-20 max-[720px]:pt-20 max-[720px]:pb-14 max-w-(--maxw) mx-auto px-(--gutter) border-b border-(--rule)">
          <div className="grid grid-cols-[1.4fr_1fr] max-[900px]:grid-cols-1 gap-16 max-[720px]:gap-8 items-center">
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground mb-6">SELECTED WORK · 2024 — 2026</div>
              <h1 className="m-0 font-display font-normal text-[clamp(48px,8vw,100px)] leading-[0.95] tracking-[-0.04em] text-(--ink) mb-8 text-balance fvs-display">
                Engineering <em className="not-italic italic text-(--v3-accent) fvs-soft">impact.</em>
              </h1>
              <p className="text-[18px] text-secondary-foreground max-w-[48ch] leading-[1.65] m-0 italic font-display fvs-text">
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

