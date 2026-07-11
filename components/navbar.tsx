"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { CommandPaletteTrigger } from "@/components/command-palette";
import { Menu, X, ArrowRight } from "lucide-react";
import { MagneticWrapper } from "./magnetic-wrapper";

const navLinks = [
  { name: "Work", href: "/work" },
  { name: "Tools", href: "/tools" },
  { name: "Notes", href: "/blog" },
  { name: "Videos", href: "/videos" },
  { name: "About", href: "/about" },
];

export function Navbar(): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      triggerRef.current?.focus();
      return;
    }

    const menuElement = menuRef.current;
    if (!menuElement) return;

    const focusable = menuElement.querySelectorAll<HTMLElement>(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = menuElement.querySelectorAll<HTMLElement>(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleFocusTrap);
    return () => {
      document.removeEventListener("keydown", handleFocusTrap);
    };
  }, [isOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    },
    [isOpen],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (href: string): boolean =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  if (pathname?.startsWith("/admin")) return null;
  if (pathname?.startsWith("/tools/bookbreaks")) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <nav
      className="sticky top-0 z-100 bg-[color-mix(in_oklab,var(--bg)_86%,transparent)] backdrop-blur-[14px] border-b border-[var(--rule)]"
      aria-label="Main navigation"
    >
      <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[18px] flex justify-between items-center gap-[32px]">
        <MagneticWrapper strength={10}>
          <Link
            href="/"
            aria-label="Michael Ojekunle — home"
            className="flex items-center gap-[16px] font-display italic text-[22px] font-normal cursor-pointer text-[var(--ink)] no-underline fvs-soft group"
          >
            <div className="flex items-center justify-center w-[32px] h-[32px] bg-[var(--ink)] text-[var(--bg)] font-display not-italic text-[16px] font-medium leading-[0.9] tracking-[0.1em] uppercase transition-transform duration-300 group-hover:scale-105">
              <span>m</span>
              <span>i</span>
            </div>
            <span className="max-[480px]:hidden">
              A M D<em>.</em>
            </span>
          </Link>
        </MagneticWrapper>

        {/* Center: Desktop Nav Links */}
        <div className="flex gap-[24px] max-[820px]:hidden items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              data-active={isActive(link.href)}
              className="font-mono text-[10px] uppercase tracking-[0.1em] font-medium transition-colors duration-150 no-underline text-[var(--ink-2)] hover:text-[var(--ink)] data-[active=true]:text-[var(--v3-accent)] data-[active=true]:font-bold"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex gap-[12px] items-center">
          <CommandPaletteTrigger />

          <MagneticWrapper strength={15}>
            <button
              className="w-[38px] h-[38px] rounded-full border border-[var(--rule)] bg-transparent text-[var(--ink-2)] cursor-pointer flex items-center justify-center transition-all duration-150 text-[16px] hover:border-[var(--ink-3)] hover:text-[var(--ink)]"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              suppressHydrationWarning
            >
              {mounted ? (isDark ? "☾" : "☀") : "☀"}
            </button>
          </MagneticWrapper>

          <MagneticWrapper strength={20}>
            <Link
              href="/contact"
              className="group max-[820px]:hidden inline-flex items-center justify-center px-[20px] h-[38px] rounded-full font-mono text-[11px] uppercase tracking-[0.1em] font-medium cursor-pointer border border-[var(--rule)] transition-all duration-200 no-underline bg-[var(--ink)] text-[var(--bg)] hover:-translate-y-[1px] hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.4)]"
              aria-label="Book a call"
            >
              Book a call{" "}
              <ArrowRight className="inline-block transition-transform duration-250 group-hover:translate-x-[4px] ml-[6px] w-4 h-4" aria-hidden="true" />
            </Link>
          </MagneticWrapper>

          <button
            ref={triggerRef}
            className="hidden max-[820px]:flex items-center justify-center w-[38px] h-[38px] rounded-[8px] border border-[var(--rule)] bg-transparent text-[var(--ink-2)] cursor-pointer transition-all duration-150 hover:border-[var(--ink-3)] hover:text-[var(--ink)]"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-controls="v3-mobile-menu"
            aria-label={
              isOpen ? "Close navigation menu" : "Open navigation menu"
            }
          >
            {isOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        ref={menuRef}
        id="v3-mobile-menu"
        className={`${isOpen ? "flex" : "hidden"} flex-col pt-[16px] px-[var(--gutter)] pb-[24px] border-t border-[var(--rule)] bg-[var(--bg)] gap-[2px]`}
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
            className="py-[12px] text-[16px] font-medium text-[var(--ink-2)] no-underline border-b border-[var(--rule-2)] transition-colors duration-150 hover:text-[var(--ink)] data-[active=true]:text-[var(--ink)]"
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <div className="flex items-center gap-[12px] pt-[16px] mt-[8px]">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-[10px] px-[16px] py-[9px] rounded-full font-sans text-[13px] font-medium tracking-[-0.005em] cursor-pointer border border-transparent transition-all duration-200 no-underline bg-[var(--v3-accent)] text-[var(--bg)] hover:bg-[var(--v3-accent-2)]"
            onClick={() => setIsOpen(false)}
          >
            Book a call{" "}
            <ArrowRight className="inline-block transition-transform duration-250 group-hover:translate-x-[4px] w-4 h-4 ml-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
