"use client";

import { useState, useEffect, useCallback } from "react";
import { Palette, X, Sun, Moon, BookMarked } from "lucide-react";
import { ThemeSelector } from "@/components/theme-selector";
import { useTheme } from "next-themes";

/**
 * ChapterlyThemeTweaker – floating palette FAB that opens a premium sheet with:
 *  - light / dark mode toggle (synced with next-themes + localStorage)
 *  - Chapterly accent note (slate-teal #4F6D7A – Chapterly's own brand)
 *  - colour palette + font picker from portfolio ThemeSelector
 *
 * Chapterly uses its own accent (#4F6D7A) independently of the global
 * --v3-accent variable that BookBreaks uses, so switching portfolio
 * themes won't break Chapterly's core identity.
 */

const CH_ACCENT = "#4F6D7A";

export function ChapterlyThemeTweaker() {
  const [open, setOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const toggleDark = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
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
        style={{ zIndex: 200, background: CH_ACCENT }}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl ring-4 transition-all duration-200 hover:scale-110 hover:shadow-2xl active:scale-95"
      >
        <Palette size={20} />
      </button>

      {/* Overlay sheet */}
      {open && (
        <div className="fixed inset-0 z-[190] flex items-end justify-end p-3 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          {/* Sheet */}
          <div
            className="relative w-full max-w-sm rounded-[16px] shadow-2xl overflow-hidden mt-4 sm:mt-0"
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
                <BookMarked size={14} style={{ color: CH_ACCENT }} />
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
              {/* Light / Dark mode toggle */}
              <div className="flex flex-col gap-3">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] font-semibold">
                  Appearance
                </div>
                <button
                  onClick={toggleDark}
                  aria-pressed={isDark}
                  className="group flex items-center gap-3 w-full rounded-[10px] px-4 py-3 border border-[var(--rule)] bg-transparent cursor-pointer transition-all duration-200 hover:bg-[var(--bg)]"
                  style={{
                    borderColor: isDark ? CH_ACCENT + "60" : undefined,
                  }}
                >
                  {/* Toggle pill */}
                  <div
                    className="relative w-10 h-5 rounded-full flex-shrink-0 transition-colors duration-200"
                    style={{ background: isDark ? CH_ACCENT : "var(--rule)" }}
                  >
                    <span
                      className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
                        isDark ? "translate-x-[20px]" : "translate-x-0"
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    {mounted &&
                      (isDark ? (
                        <Moon size={14} style={{ color: CH_ACCENT }} />
                      ) : (
                        <Sun size={14} className="text-[var(--ink-3)]" />
                      ))}
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--ink-2)]">
                      {mounted ? (isDark ? "Dark mode" : "Light mode") : "Mode"}
                    </span>
                  </div>
                </button>
              </div>

              {/* Chapterly accent note */}
              <div className="flex flex-col gap-2">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] font-semibold">
                  Chapterly Accent
                </div>
                <div
                  className="flex items-center gap-3 rounded-[10px] px-4 py-3 border"
                  style={{
                    background: CH_ACCENT + "10",
                    borderColor: CH_ACCENT + "40",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full shrink-0 ring-2 ring-offset-1"
                    style={{
                      background: CH_ACCENT,
                      outline: `2px solid ${CH_ACCENT}40`,
                    }}
                  />
                  <div>
                    <div
                      className="font-mono text-[10px] tracking-[0.1em] uppercase font-semibold"
                      style={{ color: CH_ACCENT }}
                    >
                      Slate Teal
                    </div>
                    <div className="font-mono text-[9px] text-[var(--ink-3)]">
                      Chapterly's default identity
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio theme palette + font picker */}
              <div className="flex flex-col gap-2">
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] font-semibold">
                  Global Palette & Font
                </div>
                <ThemeSelector />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
