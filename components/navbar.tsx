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
    <nav 
      className="sticky top-0 z-[100] bg-[color-mix(in_oklab,var(--bg)_86%,transparent)] backdrop-blur-[14px] border-b border-[var(--rule)]" 
      aria-label="Main navigation"
    >
      <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[18px] grid grid-cols-[auto_1fr_auto] items-center gap-[32px]">
        <Link 
          href="/" 
          aria-label="Michael Ojekunle — home" 
          className="flex items-center gap-[10px] font-[family:var(--display-font)] italic text-[22px] font-normal cursor-pointer text-[var(--ink)] no-underline [font-variation-settings:'opsz'_144,'SOFT'_100]"
        >
          <span className="w-[8px] h-[8px] rounded-full bg-[var(--v3-accent)] shrink-0" aria-hidden="true" />
          <span>Michael<em>.</em></span>
        </Link>

        <div className="max-[920px]:hidden flex gap-[4px] justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              data-active={isActive(link.href)}
              className="px-[14px] py-[8px] rounded-full text-[13px] font-medium text-[var(--ink-2)] transition-all duration-150 no-underline hover:text-[var(--ink)] hover:bg-[var(--paper)] data-[active=true]:text-[var(--ink)] data-[active=true]:bg-[var(--paper)]"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex gap-[8px] items-center">
          <CommandPaletteTrigger />

          <button
            className="w-[38px] h-[38px] rounded-full border border-[var(--rule)] bg-transparent text-[var(--ink-2)] cursor-pointer flex items-center justify-center transition-all duration-150 text-[16px] hover:border-[var(--ink-3)] hover:text-[var(--ink)]"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            suppressHydrationWarning
          >
            {mounted ? (isDark ? "☾" : "☀") : "☀"}
          </button>

          <Link
            href="/contact"
            className="group max-[600px]:hidden inline-flex items-center gap-[10px] px-[16px] py-[9px] rounded-full font-sans text-[13px] font-medium tracking-[-0.005em] cursor-pointer border border-transparent transition-all duration-200 no-underline bg-[var(--v3-accent)] text-[var(--bg)] hover:bg-[var(--v3-accent-2)]"
            aria-label="Book a call"
          >
            Book a call <span className="inline-block transition-transform duration-250 group-hover:translate-x-[4px]" aria-hidden="true">→</span>
          </Link>

          <button
            className="hidden max-[920px]:flex items-center justify-center w-[38px] h-[38px] rounded-[8px] border border-[var(--rule)] bg-transparent text-[var(--ink-2)] cursor-pointer transition-all duration-150 hover:border-[var(--ink-3)] hover:text-[var(--ink)]"
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
        className={`${isOpen ? 'flex' : 'hidden'} flex-col pt-[16px] px-[var(--gutter)] pb-[24px] border-t border-[var(--rule)] bg-[var(--bg)] gap-[2px]`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
            data-active={isActive(link.href)}
            className="py-[12px] text-[16px] font-medium text-[var(--ink-2)] no-underline border-b border-[var(--rule-2)] transition-colors duration-150 hover:text-[var(--ink)] data-[active=true]:text-[var(--ink)] last-of-type:border-b-0"
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <div className="flex items-center gap-[12px] pt-[16px] mt-[8px]">
          <button
            className="w-[38px] h-[38px] rounded-full border border-[var(--rule)] bg-transparent text-[var(--ink-2)] cursor-pointer flex items-center justify-center transition-all duration-150 text-[16px] hover:border-[var(--ink-3)] hover:text-[var(--ink)]"
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
            className="group inline-flex items-center gap-[10px] px-[16px] py-[9px] rounded-full font-sans text-[13px] font-medium tracking-[-0.005em] cursor-pointer border border-transparent transition-all duration-200 no-underline bg-[var(--v3-accent)] text-[var(--bg)] hover:bg-[var(--v3-accent-2)]"
            onClick={() => setIsOpen(false)}
          >
            Book a call <span className="inline-block transition-transform duration-250 group-hover:translate-x-[4px]" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

