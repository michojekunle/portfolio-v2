import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About",
  description:
    "Michael Ojekunle — full-stack and Web3 developer based in Lagos. Background, values, and what I'm building toward.",
}

export default function AboutPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <section className="pt-[160px] pb-[80px] max-[720px]:pt-[120px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
        <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]">02 — ABOUT · BACKGROUND</div>
        <h1 className="m-0 font-[family:var(--display-font)] font-normal text-[clamp(64px,10vw,120px)] leading-[0.85] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance [font-variation-settings:'opsz'_144]">
          Curiosity is <em className="not-italic italic text-[var(--v3-accent)] [font-variation-settings:'opsz'_144,'SOFT'_100]">the</em> constant.
        </h1>
      </section>

      <section className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[120px] max-[720px]:py-[72px]">
        <div className="v3-about-grid">
          <div className="v3-about-prose">
            <p>
              I came to software through a long detour. My background is in the sciences —
              the kind of education that teaches you to follow evidence, question assumptions,
              and be honest when an experiment fails. It turns out programming rewards exactly
              the same habits. <em>Read the spec before you pour the concrete.</em>
            </p>

            <p className="body">
              My first serious programming was Java. Then React. Then — around the time L2s started
              actually shipping — Solidity. I&apos;ve spent the last four years engineering
              frontends for web3 teams shipping on Rootstock, Starknet, and Stacks. Some of it
              I&apos;m proud of. Some of it taught me what I&apos;d never do again.
            </p>

            <p className="body">
              Right now I&apos;m splitting time between two adjacent obsessions:{" "}
              <b>zero-knowledge machine learning</b> and <b>Rust systems programming</b>. They
              feel related to me, even though most people would put them on opposite ends of a
              stack diagram. ZK is teaching me to think in constraints. Rust is teaching me to
              think in lifetimes. Both are teaching me that the abstractions I&apos;ve been
              trusting were never as solid as I assumed.
            </p>

            <p>
              I&apos;m building toward making zkML feel <em>legible</em> to the engineer on the
              other side of the screen. Less mythical, more shippable.
            </p>

            <p className="body">
              I write essays as I go — not because I have answers, but because writing forces me
              to stop pretending I understand things I don&apos;t. If you&apos;ve read one of my
              pieces and it helped, that&apos;s the loop closing for me.
            </p>

            <p className="body">
              I&apos;m also drawn to applied systems thinking beyond software.{" "}
              <b>Agriculture and food systems</b>, <b>waste management</b>, and{" "}
              <b>recycling infrastructure</b> — the same first-principles thinking I apply to
              protocol design shows up in how I think about resource loops in the physical world.
              The incentive structures are not that different.
            </p>

            <p className="body">
              Off-screen: I play guitar badly, chess decently, and study Mandarin daily. I live in
              Lagos. I&apos;m a Christian, which informs how I think about work — patience,
              restraint, and the conviction that the small invisible parts matter as much as the
              visible ones.
            </p>

            <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/work" className="v3-btn v3-btn-primary">
                See the work <span className="arr" aria-hidden="true">→</span>
              </Link>
              <Link href="/contact" className="v3-btn v3-btn-ghost">
                Book a call
              </Link>
            </div>
          </div>

          <aside className="v3-about-aside">
            <h4>Stack — current</h4>
            <div className="row"><div className="k">Frontend</div><div className="v">Next.js 16 · TypeScript · Tailwind</div></div>
            <div className="row"><div className="k">Contracts</div><div className="v">Solidity · Cairo · Clarity · Foundry</div></div>
            <div className="row"><div className="k">Chains</div><div className="v">Starknet · Rootstock · Stacks · ETH L1</div></div>
            <div className="row"><div className="k">Systems</div><div className="v">Rust · Linux internals · Halo2</div></div>
            <div className="row"><div className="k">Infra</div><div className="v">Supabase · Vercel · Hetzner · Resend</div></div>

            <h4>Reading</h4>
            <div className="row"><div className="k">Books</div><div className="v">Crafting Interpreters · Operating Systems: Three Easy Pieces</div></div>
            <div className="row"><div className="k">Papers</div><div className="v">Halo2 spec · Cairo whitepaper</div></div>

            <h4>Curious about</h4>
            <div className="row"><div className="k">Systems</div><div className="v">Agriculture · Food systems · Waste management</div></div>
            <div className="row"><div className="k">Research</div><div className="v">Recycling infrastructure · Circular economy</div></div>

            <h4>Elsewhere</h4>
            <div className="row">
              <div className="k">GitHub</div>
              <div className="v"><a href="https://github.com/michojekunle" target="_blank" rel="noopener noreferrer">michojekunle ↗</a></div>
            </div>
            <div className="row">
              <div className="k">Twitter</div>
              <div className="v"><a href="https://x.com/devvmichael" target="_blank" rel="noopener noreferrer">@devvmichael ↗</a></div>
            </div>
            <div className="row">
              <div className="k">LinkedIn</div>
              <div className="v"><a href="https://linkedin.com/in/michael-ojekunle" target="_blank" rel="noopener noreferrer">michael-ojekunle ↗</a></div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
