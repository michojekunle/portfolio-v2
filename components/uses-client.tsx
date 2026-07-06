"use client"

import { motion } from "framer-motion"
import { TiltCard } from "./tilt-card"

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

import { UsesHeroWidget } from "./uses-hero-widget"

export function UsesClient() {
  const titleWords = "What I actually use.".split(" ")

  return (
    <>
      <section className="grid grid-cols-1 min-[900px]:grid-cols-[1.4fr_1fr] gap-[48px] items-center pt-[160px] pb-[80px] max-[720px]:pt-[80px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]"
          >
            /USES · SETUP
          </motion.div>
          
          <h1 className="m-0 font-display font-light text-[clamp(48px,8vw,110px)] leading-[0.9] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance fvs-display flex flex-wrap gap-x-[16px] max-[720px]:gap-x-[10px]">
            {titleWords.map((word, i) => {
              const isActually = word === "actually"
              return (
                <motion.span
                  key={i}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                    delay: i * 0.1
                  }}
                  className={isActually ? "italic text-[var(--v3-accent)] fvs-soft" : ""}
                >
                  {word}
                </motion.span>
              )
            })}
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[18px] text-[var(--ink-2)] max-w-[52ch] leading-[1.65] m-0"
          >
            Updated when something meaningful changes. Affiliate-free — these are the tools that survived.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-start min-[900px]:justify-end w-full"
        >
          <UsesHeroWidget />
        </motion.div>
      </section>

      <section className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[120px] max-[720px]:py-[72px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {categories.map((cat, catIdx) => (
            <motion.div 
              key={cat.title} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: catIdx * 0.1 }}
              className="flex flex-col gap-[24px]"
            >
              <h2 className="font-mono text-[12px] tracking-[0.16em] uppercase text-[var(--ink-3)] border-b border-[var(--rule)] pb-[12px] mb-[12px]">
                {cat.title}
              </h2>
              {cat.items.map((item, itemIdx) => (
                <TiltCard key={item.name} className="p-[24px] bg-[var(--paper)] border border-[var(--rule)] rounded-[12px] h-full">
                  <h4 className="font-display font-medium text-[20px] mb-[12px] text-[var(--ink)]">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--v3-accent)] transition-colors decoration-none">
                        {item.name}
                      </a>
                    ) : (
                      item.name
                    )}
                  </h4>
                  <p className="text-[15px] leading-[1.6] text-[var(--ink-2)] m-0">
                    {item.description}
                  </p>
                </TiltCard>
              ))}
            </motion.div>
          ))}
        </div>
      </section>
    </>
  )
}
