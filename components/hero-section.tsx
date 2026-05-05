import Link from "next/link"

const STACK = [
  { label: "TypeScript", primary: true },
  { label: "Next.js", primary: true },
  { label: "Solidity", primary: true },
  { label: "Cairo", primary: false },
  { label: "Rust", primary: false },
  { label: "Clarity", primary: false },
]

export function HeroSection(): React.ReactElement {
  return (
    <section className="pt-[120px] pb-[80px] max-[720px]:pt-[64px] max-[720px]:pb-[48px] max-[480px]:pt-[40px] max-[480px]:pb-[32px] relative overflow-hidden max-w-[var(--maxw)] mx-auto px-[var(--gutter)]" aria-label="Introduction">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(-55deg,transparent,transparent_2px,color-mix(in_oklab,var(--v3-accent)_5%,transparent)_2px,color-mix(in_oklab,var(--v3-accent)_5%,transparent)_5px)] opacity-50 z-0 pointer-events-none" aria-hidden="true" />

      {/* Status dashboard meta row */}
      <div className="relative z-[1] grid grid-cols-[1fr_auto_1fr] max-[720px]:grid-cols-1 items-end gap-[32px] max-[720px]:gap-[16px] pb-[32px] mb-[64px] border-b border-[var(--rule)] font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--ink-3)] max-[480px]:text-[10px]" role="presentation">
        <div className="leading-[1.7] text-[12px] text-[var(--ink-3)] max-[720px]:text-left max-[480px]:text-[10px]">
          <b className="text-[var(--ink)] font-medium">Michael Ojekunle</b><br />
          Full-Stack &amp; Web3 · Lagos, NG
        </div>
        <div className="leading-[1.7] text-[12px] text-center max-[720px]:text-left text-[var(--v3-accent)] max-[480px]:text-[10px]">
          <span className="inline-block w-[7px] h-[7px] rounded-full bg-[var(--v3-accent)] mr-[8px] align-middle animate-[v3-pulse_2.4s_infinite_ease-in-out]" aria-hidden="true" />
          Available for select work
        </div>
        <div className="leading-[1.7] text-[12px] text-right max-[720px]:text-left text-[var(--ink-3)] max-[480px]:text-[10px]">
          <b className="text-[var(--ink)] font-medium">2026 · v3</b><br />
          EST. 2021 · 4+ years
        </div>
      </div>

      <h1 className="relative z-[1] font-normal text-[clamp(72px,18vw,200px)] leading-[0.85] tracking-[-0.05em] text-[var(--ink)] mb-[80px] max-[720px]:mb-[32px] text-balance">
        Engineer.<br />
        <em>Writer.</em><br />
        <span className="block text-transparent [-webkit-text-stroke:2px_var(--ink)]">Builder.</span>
      </h1>

      <div className="relative z-[1] grid grid-cols-[1.2fr_1fr] max-[920px]:grid-cols-1 gap-[80px] max-[920px]:gap-[40px] mt-[80px] pt-[40px] border-t border-[var(--rule)] items-start">
        <div>
          <p className="font-normal text-[clamp(28px,3.4vw,40px)] leading-[1.25] text-[var(--ink)] m-0 max-w-[24ch] text-pretty">
            I build web3 frontends that hold up under pressure. Quietly going deep on{" "}
            <em>ZK proofs</em> and Rust — because I want to understand the stack all the way down.
          </p>

          {/* Tech stack pills */}
          <div className="flex flex-wrap gap-[7px] mt-[24px]" role="list" aria-label="Primary technologies">
            {STACK.map((s) => (
              <span key={s.label} role="listitem" className={`font-mono text-[10px] tracking-[0.1em] px-[12px] py-[5px] rounded-[5px] border uppercase transition-colors duration-150 hover:border-[var(--v3-accent-soft)] hover:text-[var(--v3-accent)] ${s.primary ? "border-[var(--v3-accent-soft)] text-[var(--v3-accent)] bg-[color-mix(in_oklab,var(--v3-accent-soft)_35%,var(--paper))]" : "border-[var(--rule)] bg-[var(--paper)] text-[var(--ink-3)]"}`}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[17px] leading-[1.7] text-[var(--ink-2)] m-0">
            Four years engineering frontends across Next.js, Solidity, Cairo, and Clarity.
            Shipping production apps on <b className="text-[var(--ink)] font-medium">Rootstock</b>, <b className="text-[var(--ink)] font-medium">Starknet</b>, and <b className="text-[var(--ink)] font-medium">Stacks</b>.
            Right now I&apos;m learning ZK proofs and Rust systems programming alongside —
            because I want to understand the stack all the way to the metal.
          </p>

          <div className="flex gap-[16px] flex-wrap mt-[32px] max-[720px]:mb-[40px]">
            <Link href="/contact" className="group inline-flex items-center justify-center px-[28px] h-[52px] rounded-full font-mono text-[12px] uppercase tracking-[0.1em] font-medium cursor-pointer border border-transparent transition-all duration-300 no-underline bg-[var(--v3-accent)] text-[var(--bg)] hover:-translate-y-[2px] hover:shadow-[0_12px_32px_-8px_color-mix(in_oklab,var(--v3-accent)_60%,transparent)]">
              Book a call <span className="inline-block transition-transform duration-300 group-hover:translate-x-[4px] ml-[8px]" aria-hidden="true">↗</span>
            </Link>
            <Link href="/work" className="group inline-flex items-center justify-center px-[28px] h-[52px] rounded-full font-mono text-[12px] uppercase tracking-[0.1em] font-medium cursor-pointer border border-[var(--rule)] bg-transparent text-[var(--ink)] transition-all duration-300 no-underline hover:border-[var(--v3-accent)] hover:text-[var(--v3-accent)] hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)]">
              Portfolio <span className="inline-block transition-transform duration-300 group-hover:translate-x-[4px] ml-[8px]" aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="flex gap-0 mt-[48px] border border-[var(--rule)] rounded-[8px] overflow-hidden" role="list" aria-label="Career highlights">
            <div className="flex-[1] flex flex-col p-[20px_24px] border-r border-[var(--rule)] bg-[var(--paper)] last:border-r-0 max-[720px]:pr-[14px] max-[720px]:mr-[14px]" role="listitem">
              <span className="font-[family:var(--display-font)] text-[40px] font-normal leading-[1] tracking-[-0.03em] text-[var(--v3-accent)] [font-variation-settings:'opsz'_144]">4+</span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mt-[6px]">Years building</span>
            </div>
            <div className="flex-[1] flex flex-col p-[20px_24px] border-r border-[var(--rule)] bg-[var(--paper)] last:border-r-0 max-[720px]:pr-[14px] max-[720px]:mr-[14px]" role="listitem">
              <span className="font-[family:var(--display-font)] text-[40px] font-normal leading-[1] tracking-[-0.03em] text-[var(--v3-accent)] [font-variation-settings:'opsz'_144]">3</span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mt-[6px]">Chains shipped</span>
            </div>
            <div className="flex-[1] flex flex-col p-[20px_24px] border-r border-[var(--rule)] bg-[var(--paper)] last:border-r-0 max-[720px]:pr-[14px] max-[720px]:mr-[14px]" role="listitem">
              <span className="font-[family:var(--display-font)] text-[40px] font-normal leading-[1] tracking-[-0.03em] text-[var(--v3-accent)] [font-variation-settings:'opsz'_144]">12+</span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mt-[6px]">Projects live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
