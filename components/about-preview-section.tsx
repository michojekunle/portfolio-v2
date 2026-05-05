import Link from "next/link"

const ROLES = [
  { 
    title: "Full-Stack Engineer", 
    desc: "Building complex interfaces that don't compromise on performance. Next.js, TypeScript, and React are my default stack.",
    tag: "UI/UX"
  },
  { 
    title: "Web3 Builder", 
    desc: "Engineering trustless systems on Rootstock, Starknet, and Stacks. Moving from EVM to ZK-proofs and Rust-based protocols.",
    tag: "BLOCKCHAIN"
  },
  { 
    title: "Technical Writer", 
    desc: "Distilling complex technical concepts into accessible, high-signal writing. Documentation, case studies, and thought pieces.",
    tag: "CONTENT"
  }
]

export function AboutPreviewSection(): React.ReactElement {
  return (
    <section className="py-[120px] max-[720px]:py-[72px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)]" aria-labelledby="about-preview-heading">
      <div className="grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[12px] items-baseline mb-[80px] max-[720px]:mb-[48px]">
        <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-2)] pt-[18px]">01 — IDENTITY</div>
        <div>
          <h2 id="about-preview-heading" className="m-0 font-[family:var(--display-font)] font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-[-0.025em] text-[var(--ink)] text-balance [font-variation-settings:'opsz'_144]">
            Engineering with <em className="not-italic italic text-[var(--v3-accent)] [font-variation-settings:'opsz'_144,'SOFT'_100]">precision.</em>
          </h2>
          <div className="col-start-2 max-[720px]:col-start-1 max-w-[56ch] text-[17px] leading-[1.6] text-[var(--ink-2)] mt-[18px]">
            I don&apos;t just build features; I architect systems. My approach is rooted in understanding the metal while obsessing over the interface.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 max-[920px]:grid-cols-1 gap-[40px] max-[920px]:gap-[64px]">
        {ROLES.map((role) => (
          <div key={role.title} className="flex flex-col gap-[20px]">
            <div className="font-mono text-[10px] tracking-[0.2em] text-[var(--v3-accent)] font-bold uppercase">{role.tag}</div>
            <h3 className="m-0 font-[family:var(--display-font)] font-normal text-[28px] leading-[1.1] text-[var(--ink)] [font-variation-settings:'opsz'_96]">
              {role.title}
            </h3>
            <p className="m-0 text-[16px] leading-[1.7] text-[var(--ink-2)]">
              {role.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-[80px] pt-[40px] border-t border-[var(--rule)] flex justify-center">
        <Link href="/about" className="group inline-flex items-center justify-center px-[32px] h-[52px] rounded-full font-mono text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer border border-[var(--rule)] bg-transparent text-[var(--ink)] transition-all duration-300 no-underline hover:border-[var(--v3-accent)] hover:text-[var(--v3-accent)] hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)]">
          More about my journey <span className="inline-block transition-transform duration-300 group-hover:translate-x-[4px] ml-[10px]" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
