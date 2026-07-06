import Link from "next/link";
import { ThemeSelector } from "@/components/theme-selector";
import { MagneticWrapper } from "./magnetic-wrapper";
import { ArrowUpRight } from "lucide-react";

export function Footer(): React.ReactElement {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-2)] border-t border-[var(--rule)] pt-[100px] pb-[32px]">
      <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] pb-[60px] flex flex-col min-[921px]:flex-row min-[921px]:justify-between gap-[80px] max-[920px]:gap-[40px] items-start border-b border-[var(--rule)] mb-[60px]">
        <h2 className="font-normal text-[clamp(64px,14vw,280px)] leading-[0.82] tracking-[-0.05em] mb-[56px] text-[var(--ink)] text-balance break-words min-[921px]:max-w-[60%]">
          Michael
          <br />
          <em>Ojekunle.</em>
        </h2>
        <div className="shrink-0 pt-[24px]">
          <ThemeSelector />
        </div>
      </div>

      <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)]">
        <p className="font-sans font-normal text-[20px] text-[var(--ink-2)] max-w-[32ch] mb-[80px]">
          Engineer &amp; writer. Building toward zero-knowledge ML — from Lagos.
        </p>

        <div className="grid grid-cols-4 max-[720px]:grid-cols-2 max-[480px]:grid-cols-1 gap-[32px] pt-[40px] border-t border-[var(--rule)]">
          <div className="flex flex-col">
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] mb-[18px] font-medium">
              Work
            </h5>
            <ul className="list-none p-0 m-0 text-[14px] leading-[2.0]">
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/work"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    Portfolio
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/about"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    About Me
                  </Link>
                </MagneticWrapper>
              </li>
               <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/tools"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    Creator Suite
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/contact"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    Get in touch
                  </Link>
                </MagneticWrapper>
              </li>
            </ul>
          </div>
          <div className="flex flex-col">
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] mb-[18px] font-medium">
              Writing
            </h5>
            <ul className="list-none p-0 m-0 text-[14px] leading-[2.0]">
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/blog"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    Field Notes
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/reading"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    Reading Log
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/videos"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    Videos
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/feed.xml"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    RSS Feed
                  </Link>
                </MagneticWrapper>
              </li>
            </ul>
          </div>
          <div className="flex flex-col">
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] mb-[18px] font-medium">
              Site
            </h5>
            <ul className="list-none p-0 m-0 text-[14px] leading-[2.0]">
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/about"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    About Me
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/#now"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    Activity
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/uses"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    /uses
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/guestbook"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    /guestbook
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/changelog"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    /changelog
                  </Link>
                </MagneticWrapper>
              </li>
            </ul>
          </div>
          <div className="flex flex-col">
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] mb-[18px] font-medium">
              Elsewhere
            </h5>
            <ul className="list-none p-0 m-0 text-[14px] leading-[2.0]">
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <a
                    href="https://github.com/michojekunle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    GitHub <ArrowUpRight className="inline w-3 h-3 ml-1" />
                  </a>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <a
                    href="https://x.com/devvmichael"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    Twitter <ArrowUpRight className="inline w-3 h-3 ml-1" />
                  </a>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <a
                    href="https://linkedin.com/in/michael-ojekunle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    LinkedIn <ArrowUpRight className="inline w-3 h-3 ml-1" />
                  </a>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <a
                    href="https://www.youtube.com/@devvmichael"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--ink-2)] no-underline hover:text-[var(--v3-accent)] transition-colors inline-block"
                  >
                    YouTube <ArrowUpRight className="inline w-3 h-3 ml-1" />
                  </a>
                </MagneticWrapper>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center max-[480px]:flex-col max-[480px]:items-start mt-[56px] pt-[28px] border-t border-[var(--rule)] font-mono text-[11px] text-[var(--ink-3)] flex-wrap gap-[12px] max-[480px]:gap-[8px]">
          <div>© {year} · Built with intent in Lagos, NG</div>
          <div className="font-display italic text-[13px] text-[var(--ink-2)]">
            &ldquo;Whatever you do, do it all to the glory of God.&rdquo; —
            1&nbsp;Cor&nbsp;10:31
          </div>
        </div>
      </div>
    </footer>
  );
}
