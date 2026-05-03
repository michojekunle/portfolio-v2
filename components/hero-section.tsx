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
    <section className="v3-home-hero v3-container" aria-label="Introduction">
      <div className="v3-hero-bg-pattern" aria-hidden="true" />

      {/* Status dashboard meta row */}
      <div className="meta-row v3-eyebrow" role="presentation">
        <div>
          <b>Michael Ojekunle</b><br />
          Full-Stack &amp; Web3 · Lagos, NG
        </div>
        <div className="center">
          <span className="v3-eyebrow dot" aria-hidden="true" />
          Available for select work
        </div>
        <div className="right">
          <b>2026 · v3</b><br />
          EST. 2021 · 4+ years
        </div>
      </div>

      <h1>
        Engineer.<br />
        <em>Writer.</em><br />
        <span className="stroke">Builder.</span>
      </h1>

      <div className="lede-row">
        <div>
          <p className="lede">
            I build web3 frontends that hold up under pressure. Quietly going deep on{" "}
            <em>ZK proofs</em> and Rust — because I want to understand the stack all the way down.
          </p>

          {/* Tech stack pills */}
          <div className="v3-hero-stack" role="list" aria-label="Primary technologies">
            {STACK.map((s) => (
              <span key={s.label} role="listitem" className={s.primary ? "primary" : undefined}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <div className="lede-body">
          <p className="body">
            Four years engineering frontends across Next.js, Solidity, Cairo, and Clarity.
            Shipping production apps on <b>Rootstock</b>, <b>Starknet</b>, and <b>Stacks</b>.
            Right now I&apos;m learning ZK proofs and Rust systems programming alongside —
            because I want to understand the stack all the way to the metal.
          </p>

          <div className="ctas">
            <Link href="/contact" className="v3-btn v3-btn-primary">
              Book a call <span className="arr" aria-hidden="true">→</span>
            </Link>
            <Link href="/work" className="v3-btn v3-btn-ghost">
              Selected work
            </Link>
          </div>

          <div className="v3-hero-stats" role="list" aria-label="Career highlights">
            <div className="stat" role="listitem">
              <span className="n">4+</span>
              <span className="l">Years building</span>
            </div>
            <div className="stat" role="listitem">
              <span className="n">3</span>
              <span className="l">Chains shipped</span>
            </div>
            <div className="stat" role="listitem">
              <span className="n">12+</span>
              <span className="l">Projects live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
