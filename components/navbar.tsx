"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { CommandPaletteTrigger } from "@/components/command-palette"
import { Menu, X } from "lucide-react"

const navLinks = [
  { name: "Work", href: "/work" },
  { name: "Notes", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Uses", href: "/uses" },
  { name: "Guestbook", href: "/guestbook" },
  { name: "Log", href: "/changelog" },
]

export function Navbar(): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setIsOpen(false) }, [pathname])

  const onKeyDown = useCallback((e: KeyboardEvent): void => {
    if (e.key === "Escape" && isOpen) setIsOpen(false)
  }, [isOpen])

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onKeyDown])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const isActive = (href: string): boolean =>
    pathname === href || (href !== "/" && pathname.startsWith(href))

  if (pathname?.startsWith("/admin")) return null

  const isDark = resolvedTheme === "dark"

  return (
    <nav className="v3-nav" aria-label="Main navigation">
      <div className="inner">
        <Link href="/" aria-label="Michael Ojekunle — home" className="mark">
          <span className="dot" aria-hidden="true" />
          <span>Michael<em>.</em></span>
        </Link>

        <div className="v3-nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={isActive(link.href) ? "active" : ""}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="v3-nav-right">
          <CommandPaletteTrigger />

          <button
            className="v3-theme-toggle"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            suppressHydrationWarning
          >
            {mounted ? (isDark ? "☾" : "☀") : "☀"}
          </button>

          <Link
            href="/contact"
            className="v3-btn v3-btn-accent v3-btn-sm v3-book-cta"
            aria-label="Book a call"
          >
            Book a call <span className="arr" aria-hidden="true">→</span>
          </Link>

          <button
            className="v3-hamburger"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-controls="v3-mobile-menu"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="v3-mobile-menu"
        className={`v3-mobile-menu${isOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
            className={isActive(link.href) ? "active" : ""}
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <div className="v3-mobile-bottom">
          <button
            className="v3-theme-toggle"
            onClick={() => {
              setTheme(isDark ? "light" : "dark")
              setIsOpen(false)
            }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            suppressHydrationWarning
          >
            {mounted ? (isDark ? "☾" : "☀") : "☀"}
          </button>
          <Link
            href="/contact"
            className="v3-btn v3-btn-accent v3-btn-sm"
            onClick={() => setIsOpen(false)}
          >
            Book a call <span className="arr" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
