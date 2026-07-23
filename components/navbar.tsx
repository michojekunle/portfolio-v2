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
      className="sticky top-0 z-100 bg-[color-mix(in_oklab,var(--bg)_86%,transparent)] backdrop-blur-3.5 border-b border-(--rule)"
      aria-label="Main navigation"
    >
      <div className="max-w-(--maxw) mx-auto px-(--gutter) py-4.5 flex justify-between items-center gap-8">
        <MagneticWrapper strength={10}>
          <Link
            href="/"
            aria-label="Michael Ojekunle — home"
            className="flex items-center gap-4 font-display italic text-[22px] font-normal cursor-pointer text-(--ink) no-underline fvs-soft group"
          >
            <div className="flex items-center justify-center w-8 h-8 bg-(--ink) text-(--bg) font-display not-italic text-[16px] font-medium leading-[0.9] tracking-widest uppercase transition-transform duration-300 group-hover:scale-105">
              <span>m</span>
              <span>i</span>
            </div>
            <span className="max-[480px]:hidden">
              A M D<em>.</em>
            </span>
          </Link>
        </MagneticWrapper>

        {/* Center: Desktop Nav Links */}
        <div className="flex gap-6 max-[820px]:hidden items-center">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              data-active={isActive(link.href)}
              className="font-mono text-[10px] uppercase tracking-widest font-medium transition-colors duration-150 no-underline text-secondary-foreground hover:text-(--ink) data-[active=true]:text-(--v3-accent) data-[active=true]:font-bold"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <CommandPaletteTrigger />

          <MagneticWrapper strength={15}>
            <button
              className="w-9.5 h-9.5 rounded-full border border-(--rule) bg-transparent text-secondary-foreground cursor-pointer flex items-center justify-center transition-all duration-150 text-[16px] hover:border-muted-foreground hover:text-(--ink)"
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
              className="group max-[820px]:hidden inline-flex items-center justify-center px-5 h-9.5 rounded-full font-mono text-[11px] uppercase tracking-widest font-medium cursor-pointer border border-(--rule) transition-all duration-200 no-underline bg-(--ink) text-(--bg) hover:-translate-y-0.25 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.4)]"
              aria-label="Book a call"
            >
              Book a call{" "}
              <ArrowRight className="inline-block transition-transform duration-250 group-hover:translate-x-1 ml-1.5 w-4 h-4" aria-hidden="true" />
            </Link>
          </MagneticWrapper>

          <button
            ref={triggerRef}
            className="hidden max-[820px]:flex items-center justify-center w-9.5 h-9.5 rounded-lg border border-(--rule) bg-transparent text-secondary-foreground cursor-pointer transition-all duration-150 hover:border-muted-foreground hover:text-(--ink)"
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
        className={`${isOpen ? "flex" : "hidden"} flex-col pt-4 px-(--gutter) pb-6 border-t border-(--rule) bg-(--bg) gap-0.5`}
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
            className="py-3 text-[16px] font-medium text-secondary-foreground no-underline border-b border-(--rule-2) transition-colors duration-150 hover:text-(--ink) data-[active=true]:text-(--ink)"
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <div className="flex items-center gap-3 pt-4 mt-2">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2.5 px-4 py-2.25 rounded-full font-sans text-[13px] font-medium tracking-[-0.005em] cursor-pointer border border-transparent transition-all duration-200 no-underline bg-(--v3-accent) text-(--bg) hover:bg-(--v3-accent-2)"
            onClick={() => setIsOpen(false)}
          >
            Book a call{" "}
            <ArrowRight className="inline-block transition-transform duration-250 group-hover:translate-x-1 w-4 h-4 ml-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
