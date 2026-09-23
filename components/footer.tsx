import Link from "next/link";
import { ThemeSelector } from "@/components/theme-selector";
import { MagneticWrapper } from "./magnetic-wrapper";
import { ArrowUpRight } from "lucide-react";
import { AmdSignatureInline } from "@/lib/brand-mark";

export function Footer(): React.ReactElement {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-(--bg-2) border-t border-(--rule) pt-[100px] pb-8">
      <div className="max-w-(--maxw) mx-auto px-(--gutter) pb-15 flex flex-col min-[921px]:flex-row min-[921px]:justify-between gap-20 max-[920px]:gap-10 items-start border-b border-(--rule) mb-15">
        <h2 className="font-normal text-[clamp(44px,7.5vw,140px)] leading-[0.9] tracking-[-0.04em] mb-14 text-(--ink) whitespace-nowrap">
          Michael
          <br />
          <em>Ojekunle.</em>
        </h2>
        <div className="shrink-0 pt-6">
          <ThemeSelector />
        </div>
      </div>

      <div className="max-w-(--maxw) mx-auto px-(--gutter)">
        <p className="font-sans font-normal text-[20px] text-secondary-foreground max-w-[32ch] mb-20">
          Engineer, writer &amp; builder. Going deep on Rust systems today, toward zkML tomorrow, based in Lagos.
        </p>

        <div className="grid grid-cols-4 max-[720px]:grid-cols-2 max-[480px]:grid-cols-1 gap-8 pt-10 border-t border-(--rule)">
          <div className="flex flex-col">
            <h3 className="font-mono text-[12px] tracking-[0.18em] uppercase text-muted-foreground mb-4.5 font-medium">
              Work
            </h3>
            <ul className="list-none p-0 m-0 text-[14px] leading-[2.0]">
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/work"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    Portfolio
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/about"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    About Me
                  </Link>
                </MagneticWrapper>
              </li>
               <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/tools"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    Creator Suite
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/contact"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    Get in touch
                  </Link>
                </MagneticWrapper>
              </li>
            </ul>
          </div>
          <div className="flex flex-col">
            <h3 className="font-mono text-[12px] tracking-[0.18em] uppercase text-muted-foreground mb-4.5 font-medium">
              Writing
            </h3>
            <ul className="list-none p-0 m-0 text-[14px] leading-[2.0]">
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/blog"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    Field Notes
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/reading"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    Reading Log
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/videos"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    Videos
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/feed.xml"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    RSS Feed
                  </Link>
                </MagneticWrapper>
              </li>
            </ul>
          </div>
          <div className="flex flex-col">
            <h3 className="font-mono text-[12px] tracking-[0.18em] uppercase text-muted-foreground mb-4.5 font-medium">
              Site
            </h3>
            <ul className="list-none p-0 m-0 text-[14px] leading-[2.0]">
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/about"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    About Me
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/#now"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    Activity
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/uses"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    /uses
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/guestbook"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    /guestbook
                  </Link>
                </MagneticWrapper>
              </li>
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <Link
                    href="/changelog"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    /changelog
                  </Link>
                </MagneticWrapper>
              </li>
            </ul>
          </div>
          <div className="flex flex-col">
            <h3 className="font-mono text-[12px] tracking-[0.18em] uppercase text-muted-foreground mb-4.5 font-medium">
              Elsewhere
            </h3>
            <ul className="list-none p-0 m-0 text-[14px] leading-[2.0]">
              <li>
                <MagneticWrapper strength={10} className="inline-block">
                  <a
                    href="https://github.com/michojekunle"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
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
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
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
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
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
                    className="text-secondary-foreground no-underline hover:text-(--v3-accent) transition-colors inline-block"
                  >
                    YouTube <ArrowUpRight className="inline w-3 h-3 ml-1" />
                  </a>
                </MagneticWrapper>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center max-[480px]:flex-col max-[480px]:items-start mt-14 pt-7 border-t border-(--rule) font-mono text-[12px] text-muted-foreground flex-wrap gap-3 max-[480px]:gap-2">
          <div className="flex items-center gap-2">
            <span>© {year}</span>
            <AmdSignatureInline height={11} />
            <span>· Built with intent in Lagos, NG</span>
          </div>
          <div className="font-display italic text-[13px] text-secondary-foreground">
            &ldquo;Whatever you do, do it all to the glory of God.&rdquo; —
            1&nbsp;Cor&nbsp;10:31
          </div>
        </div>
      </div>
    </footer>
  );
}
