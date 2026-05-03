import Link from "next/link"
import { ThemeSelector } from "@/components/theme-selector"

export function Footer(): React.ReactElement {
  const year = new Date().getFullYear()

  return (
    <footer className="v3-foot">
      {/* v3-foot-top has its own max-width/centering */}
      <div className="v3-foot-top">
        <h2 className="v3-foot-mark">
          Michael<br />
          <em>Ojekunle.</em>
        </h2>
        <ThemeSelector />
      </div>

      <div className="v3-container">
        <p className="v3-foot-tagline">
          Engineer &amp; writer. Building toward zero-knowledge ML — from Lagos.
        </p>

        <div className="v3-foot-grid">
          <div className="v3-foot-col">
            <h5>Work</h5>
            <ul>
              <li><Link href="/work">Selected projects</Link></li>
              <li><Link href="/work">Open source</Link></li>
              <li><Link href="/about">Resume / CV</Link></li>
            </ul>
          </div>
          <div className="v3-foot-col">
            <h5>Writing</h5>
            <ul>
              <li><Link href="/blog">Field Notes</Link></li>
              <li><Link href="/blog">Newsletter</Link></li>
              <li><Link href="/feed.xml">RSS</Link></li>
            </ul>
          </div>
          <div className="v3-foot-col">
            <h5>Site</h5>
            <ul>
              <li><Link href="/uses">/uses</Link></li>
              <li><Link href="/guestbook">/guestbook</Link></li>
              <li><Link href="/changelog">/changelog</Link></li>
            </ul>
          </div>
          <div className="v3-foot-col">
            <h5>Elsewhere</h5>
            <ul>
              <li><a href="https://github.com/michojekunle" target="_blank" rel="noopener noreferrer">GitHub ↗</a></li>
              <li><a href="https://x.com/devvmichael" target="_blank" rel="noopener noreferrer">Twitter ↗</a></li>
              <li><a href="https://linkedin.com/in/michael-ojekunle" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
            </ul>
          </div>
        </div>

        <div className="v3-foot-bottom">
          <div>© {year} · Built with intent in Lagos, NG</div>
          <div className="verse">
            &ldquo;Whatever you do, do it all to the glory of God.&rdquo; — Col&nbsp;3:17
          </div>
        </div>
      </div>
    </footer>
  )
}
