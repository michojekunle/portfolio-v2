"use client";

import { useState, useEffect, useCallback } from "react";
import { Palette, X, Sun, Moon } from "lucide-react";
import { ThemeSelector } from "@/components/theme-selector";
import { useTheme } from "next-themes";

/**
 * ThemeTweaker – floating palette FAB that opens a premium sheet with:
 *  - colour theme picker
 *  - font picker (affects entire BookBreaks app via CSS var)
 *  - light / dark mode toggle (synced with next-themes + localStorage)
 */
export function ThemeTweaker() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const toggleDark = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    // Also keep the ThemeSelector's palette in sync
    const current = localStorage.getItem("portfolio-theme") ?? "ochre";
    // Dispatch a class change so the existing MutationObserver in ThemeSelector picks it up
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark, setTheme]);

  return (
    <>
      {/* Floating palette FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open theme tweaker"
        style={{ zIndex: 200 }}
        className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--v3-accent)] text-white shadow-xl ring-4 ring-[color-mix(in_oklab,var(--v3-accent)_40%,transparent)] transition-all duration-200 hover:scale-110 hover:shadow-2xl active:scale-95"
      >
        <Palette size={20} />
      </button>

      {/* Overlay sheet */}
      {open && (
        <div className="fixed inset-0 z-[190] flex items-end justify-end sm:items-start sm:justify-end p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          {/* Sheet */}
          <div
            className="relative w-full max-w-sm rounded-[16px] shadow-2xl overflow-hidden sm:mt-0 mt-4"
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--rule)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--rule)" }}
            >
              <div className="flex items-center gap-2">
                <Palette size={14} className="text-[var(--v3-accent)]" />
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase font-semibold text-[var(--ink-3)]">
                  Theme Tweaks
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-transparent border-none cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
              {/* Light / Dark mode toggle – at the top for quick access */}
              <div className="flex flex-col gap-3">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] font-semibold">
                  Appearance
                </div>
                <button
                  onClick={toggleDark}
                  aria-pressed={isDark}
                  className="group flex items-center gap-3 w-full rounded-[10px] px-4 py-3 border border-[var(--rule)] bg-transparent cursor-pointer transition-all duration-200 hover:border-[var(--v3-accent)] hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)]"
                >
                  {/* Toggle pill */}
                  <div
                    className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors duration-200 ${isDark ? "bg-[var(--v3-accent)]" : "bg-[var(--rule)]"}`}
                  >
                    <span
                      className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-[var(--bg)] transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex items-center justify-center ${isDark ? "translate-x-[20px]" : "translate-x-0"}`}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    {mounted && (
                      isDark ? (
                        <Moon size={14} className="text-[var(--v3-accent)]" />
                      ) : (
                        <Sun size={14} className="text-[var(--ink-3)]" />
                      )
                    )}
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--ink-2)]">
                      {mounted ? (isDark ? "Dark mode" : "Light mode") : "Mode"}
                    </span>
                  </div>
                </button>
              </div>

              {/* ThemeSelector: colour palette + font picker (already has these sections) */}
              <ThemeSelector />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
