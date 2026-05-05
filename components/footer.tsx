import Link from "next/link"
import { ThemeSelector } from "@/components/theme-selector"

export function Footer(): React.ReactElement {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[var(--bg-2)] border-t border-[var(--rule)] pt-[100px] pb-[32px]">
      <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] pb-[60px] flex flex-col min-[921px]:flex-row min-[921px]:justify-between gap-[80px] max-[920px]:gap-[40px] items-start border-b border-[var(--rule)] mb-[60px]">
        <h2 className="font-[family:var(--display-font)] font-normal text-[clamp(64px,14vw,280px)] leading-[0.82] tracking-[-0.05em] mb-[56px] text-[var(--ink)] text-balance [font-variation-settings:'opsz'_144] break-words min-[921px]:max-w-[60%]">
          Michael<br />
          <em className="not-italic italic text-[var(--v3-accent)] [font-variation-settings:'opsz'_144,'SOFT'_100]">Ojekunle.</em>
        </h2>
        <div className="shrink-0 pt-[24px]">
          <ThemeSelector />
        </div>
      </div>

      <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)]">
        <p className="font-[family:var(--display-font)] italic text-[22px] text-[var(--ink-2)] max-w-[32ch] mb-[80px]">
          Engineer &amp; writer. Building toward zero-knowledge ML — from Lagos.
        </p>

        <div className="grid grid-cols-4 max-[720px]:grid-cols-2 max-[480px]:grid-cols-1 gap-[32px] pt-[40px] border-t border-[var(--rule)]">
          <div className="flex flex-col">
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] mb-[18px] font-medium">Work</h5>
            <ul className="list-none p-0 m-0 text-[14px] leading-[2.0]">
              <li><Link href="/work" className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors">Selected projects</Link></li>
              <li><Link href="/work" className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors">Open source</Link></li>
              <li><Link href="/about" className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors">Resume / CV</Link></li>
            </ul>
          </div>
          <div className="flex flex-col">
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] mb-[18px] font-medium">Writing</h5>
            <ul className="list-none p-0 m-0 text-[14px] leading-[2.0]">
              <li><Link href="/blog" className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors">Field Notes</Link></li>
              <li><Link href="/blog" className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors">Newsletter</Link></li>
              <li><Link href="/feed.xml" className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors">RSS</Link></li>
            </ul>
          </div>
          <div className="flex flex-col">
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] mb-[18px] font-medium">Site</h5>
            <ul className="list-none p-0 m-0 text-[14px] leading-[2.0]">
              <li><Link href="/uses" className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors">/uses</Link></li>
              <li><Link href="/guestbook" className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors">/guestbook</Link></li>
              <li><Link href="/changelog" className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors">/changelog</Link></li>
            </ul>
          </div>
          <div className="flex flex-col">
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] mb-[18px] font-medium">Elsewhere</h5>
            <ul className="list-none p-0 m-0 text-[14px] leading-[2.0]">
              <li><a href="https://github.com/michojekunle" target="_blank" rel="noopener noreferrer" className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors">GitHub ↗</a></li>
              <li><a href="https://x.com/devvmichael" target="_blank" rel="noopener noreferrer" className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors">Twitter ↗</a></li>
              <li><a href="https://linkedin.com/in/michael-ojekunle" target="_blank" rel="noopener noreferrer" className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors">LinkedIn ↗</a></li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center max-[480px]:flex-col max-[480px]:items-start mt-[56px] pt-[28px] border-t border-[var(--rule)] font-mono text-[11px] text-[var(--ink-3)] flex-wrap gap-[12px] max-[480px]:gap-[8px]">
          <div>© {year} · Built with intent in Lagos, NG</div>
          <div className="font-[family:var(--display-font)] italic text-[13px] text-[var(--ink-2)]">
            &ldquo;Whatever you do, do it all to the glory of God.&rdquo; — Col&nbsp;3:17
          </div>
        </div>
      </div>
    </footer>
  )
}

