import Link from "next/link"
import { Heart, Rss } from "lucide-react"

const footerLinks = [
  { name: "Blog", href: "/blog" },
  { name: "Uses", href: "/uses" },
  { name: "Guestbook", href: "/guestbook" },
  { name: "Changelog", href: "/changelog" },
] as const

export function Footer(): React.ReactElement {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-12 border-t border-border">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm text-muted-foreground">© {currentYear} Michael Ojekunle. All rights reserved.</p>
        </div>

        <nav aria-label="Footer navigation" className="flex items-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/feed.xml"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="RSS feed"
          >
            <Rss className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </div>

      <div className="flex items-center justify-center text-sm text-muted-foreground mt-6">
        <span>Made with</span>
        <Heart className="h-3 w-3 mx-1 text-muted-foreground" />
        <span>and</span>
        <span className="ml-1 font-medium text-foreground">Next.js</span>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          &ldquo;And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God
          the Father through him.&rdquo; — Colossians 3:17
        </p>
      </div>
    </footer>
  )
}
