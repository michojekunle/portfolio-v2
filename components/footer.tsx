import { Heart } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-12 border-t border-border">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-muted-foreground">© {currentYear} Michael Ojekunle. All rights reserved.</p>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart className="h-3 w-3 mx-1 text-accent" />
          <span>and</span>
          <span className="ml-1 font-medium text-primary">Next.js</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          "And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God
          the Father through him." — Colossians 3:17
        </p>
      </div>
    </footer>
  )
}
