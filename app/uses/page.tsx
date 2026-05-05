import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Uses",
  description: "Hardware, software, tools, and setup Michael Ojekunle uses daily for development.",
}

interface ToolItem {
  name: string
  description: string
  url?: string
}

interface ToolCategory {
  title: string
  items: ToolItem[]
}

const categories: ToolCategory[] = [
  {
    title: "Editor & Terminal",
    items: [
      { name: "VS Code", description: "My primary environment. Vim keybindings, minimal extensions, focused on the home row." },
      { name: "Claude Code", description: "Terminal-native AI assistant for deep engineering sessions. Like having a senior pair programmer in the CLI." },
      { name: "Warp", description: "AI-augmented terminal. Makes complex commands discoverable without leaving the shell." },
    ],
  },
  {
    title: "Languages & Frameworks",
    items: [
      { name: "TypeScript + Next.js", description: "My default stack for building type-safe, server-first web apps that scale." },
      { name: "Solidity", description: "The language of on-chain logic. For EVM-compatible contracts — Rootstock, mainnet." },
      { name: "Cairo", description: "Computation that can be proven. Exploring STARKs and scaling Ethereum via Starknet." },
      { name: "Rust", description: "Systems programming from first principles. CLI tools, performance-critical code, anything close to the metal." },
      { name: "Clarity", description: "Decidable, non-Turing-complete contract language for the Stacks blockchain." },
    ],
  },
  {
    title: "Infrastructure & Services",
    items: [
      { name: "Vercel", description: "The floor for deploying Next.js apps. Zero-config, excellent DX, automatic previews." },
      { name: "Supabase", description: "Postgres with an API, auth, storage, and realtime. Where I manage relational state." },
      { name: "Resend", description: "Transactional and newsletter email. Clean API, custom domain support." },
      { name: "GitHub + Actions", description: "Source control and CI/CD. Every repo has at least a lint + type-check pipeline." },
    ],
  },
  {
    title: "Design & Productivity",
    items: [
      { name: "Figma", description: "Where ideas take visual shape before they touch the DOM. Also useful for design system audits." },
      { name: "Notion", description: "Personal knowledge base. Architectural notes, reading logs, project trackers." },
      { name: "Arc Browser", description: "Spaces keep dev, research, and personal browsing separate. Reduces mental context-switching." },
    ],
  },
  {
    title: "Hardware",
    items: [
      { name: "MacBook Pro M3", description: "The workhorse. Runs hot under heavy compiles but never throttles when it matters." },
    ],
  },
]

export default function UsesPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
        <section className="pt-[160px] pb-[80px] max-[720px]:pt-[120px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]">/USES · SETUP</div>
          <h1 className="m-0 font-[family:var(--display-font)] font-normal text-[clamp(64px,10vw,120px)] leading-[0.85] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance [font-variation-settings:'opsz'_144]">
            What I <em className="not-italic italic text-[var(--v3-accent)] [font-variation-settings:'opsz'_144,'SOFT'_100]">actually</em> use.
          </h1>
          <p className="text-[18px] text-[var(--ink-2)] max-w-[52ch] leading-[1.65] m-0">
            Updated when something meaningful changes. Affiliate-free — these are the tools that
            survived.
          </p>
        </section>

        <section className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[120px] max-[720px]:py-[72px]">
          {categories.map((cat) => (
            <div key={cat.title} className="v3-uses-grid">
              <div className="cat-title">{cat.title}</div>
              <div className="items">
                {cat.items.map((item) => (
                  <div key={item.name}>
                    <h4>
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.name}
                        </a>
                      ) : (
                        item.name
                      )}
                    </h4>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
    </main>
  )
}
