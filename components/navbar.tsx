"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu, X, Github, Twitter } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Blog", href: "/blog" },
  { name: "Now", href: "#now" },
  { name: "Contact", href: "#contact" },
]

export function Navbar(): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close on route change
  useEffect(() => { setIsOpen(false) }, [pathname])

  // Close on Escape
  const onKeyDown = useCallback((e: KeyboardEvent): void => {
    if (e.key === "Escape" && isOpen) setIsOpen(false)
  }, [isOpen])
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onKeyDown])

  // Prevent body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const isActive = (href: string): boolean =>
    href.startsWith("/") ? pathname === href : false

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border py-3"
          : "py-6",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="Michael Ojekunle — home"
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            Michael.dev
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "text-sm transition-colors",
                  isActive(link.href)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.name}
              </Link>
            ))}

            <div className="flex items-center space-x-3 ml-6">
              <Link
                href="https://github.com/michojekunle"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile (opens in new tab)"
              >
                <Button variant="ghost" size="icon" className="h-8 w-8" tabIndex={-1}>
                  <Github className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link
                href="https://x.com/devvmichael"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X profile (opens in new tab)"
              >
                <Button variant="ghost" size="icon" className="h-8 w-8" tabIndex={-1}>
                  <Twitter className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <ModeToggle />
            </div>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-1">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen((v) => !v)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              className="ml-1"
            >
              {isOpen
                ? <X className="h-5 w-5" aria-hidden="true" />
                : <Menu className="h-5 w-5" aria-hidden="true" />
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="md:hidden bg-background/95 backdrop-blur-md border-t border-border animate-fade-in"
        >
          <nav aria-label="Mobile navigation" className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "block py-2 text-base transition-colors",
                  isActive(link.href)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center space-x-4 pt-4 border-t border-border/50 mt-2">
              <Link
                href="https://github.com/michojekunle"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile (opens in new tab)"
              >
                <Button variant="ghost" size="icon" tabIndex={-1}>
                  <Github className="h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link
                href="https://x.com/devvmichael"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X profile (opens in new tab)"
              >
                <Button variant="ghost" size="icon" tabIndex={-1}>
                  <Twitter className="h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </nav>
  )
}
