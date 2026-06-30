"use client";

import { useState, useEffect } from "react";
import { Settings, X } from "lucide-react";

/**
 * ThemeTweaker – a lightweight floating button that opens a small sheet
 * allowing the user to adjust the colour theme (light/dark) and base font size.
 * The adjustments are applied by mutating CSS custom properties on the root
 * element, which are already used throughout the project (e.g. var(--bg),
 * var(--ink), var(--v3-accent)).
 */
export function ThemeTweaker() {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16);

  // Initialise from existing root styles (if any)
  useEffect(() => {
    const root = document.documentElement;
    const currentSize = parseInt(root.style.fontSize) || 16;
    setFontSize(currentSize);
    setDarkMode(root.classList.contains("dark"));
  }, []);

  // Apply changes whenever controls update
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.fontSize = `${fontSize}px`;
  }, [darkMode, fontSize]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open theme tweaker"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--v3-accent)] text-white shadow-lg transition-transform hover:scale-105"
      >
        <Settings size={24} />
      </button>

      {/* Sliding sheet – only rendered when open */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-30"
            onClick={() => setOpen(false)}
          />
          {/* Sheet */}
          <div className="relative w-full max-w-md rounded-t-[12px] bg-[var(--bg-2)] p-6 shadow-lg sm:rounded-[12px] sm:mt-0">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 text-[var(--ink-2)]"
            >
              <X size={20} />
            </button>

            <h2 className="mb-4 text-lg font-medium text-[var(--ink)]">Theme Tweaker</h2>

            {/* Theme toggle */}
            <div className="mb-4">
              <label className="mr-2 text-[var(--ink-2)]">Theme:</label>
              <select
                value={darkMode ? "dark" : "light"}
                onChange={(e) => setDarkMode(e.target.value === "dark")}
                className="rounded border border-[var(--rule)] bg-[var(--bg)] px-2 py-1 text-[var(--ink)]"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            {/* Font size slider */}
            <div>
              <label className="mr-2 text-[var(--ink-2)]">Base font size (px):</label>
              <input
                type="range"
                min={12}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="vertical-align middle"
              />
              <span className="ml-2 text-[var(--ink)]">{fontSize}px</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
