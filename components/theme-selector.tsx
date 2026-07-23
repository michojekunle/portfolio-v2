"use client"

import { useState, useEffect, useCallback } from "react"

interface ThemePalette {
  "--bg": string
  "--bg-2": string
  "--paper": string
  "--ink": string
  "--ink-2": string
  "--ink-3": string
  "--ink-4": string
  "--rule": string
  "--rule-2": string
  "--accent": string
  "--accent-2": string
  "--accent-soft": string
}

interface ThemeEntry {
  name: string
  light: ThemePalette
  dark: ThemePalette
}

const THEMES: Record<string, ThemeEntry> = {
  ochre: {
    name: "Ochre",
    light:  { "--bg": "#f4f0e6", "--bg-2": "#ece8de", "--paper": "#faf6ec", "--ink": "#14130f", "--ink-2": "#4a463d", "--ink-3": "#847d6e", "--ink-4": "#b3ac9a", "--rule": "#d4ccb6", "--rule-2": "#e0d9c4", "--accent": "#b8842b", "--accent-2": "#8a5a17", "--accent-soft": "#f0d99c" },
    dark:   { "--bg": "#0f0e0a", "--bg-2": "#14130e", "--paper": "#18170f", "--ink": "#f0ebdd", "--ink-2": "#d6cfb8", "--ink-3": "#8c8472", "--ink-4": "#4a4538", "--rule": "#2a2620", "--rule-2": "#1f1c17", "--accent": "#d9a64f", "--accent-2": "#f0c87a", "--accent-soft": "#423314" },
  },
  ink: {
    name: "Ink",
    light:  { "--bg": "#f5f3ee", "--bg-2": "#ebe8e0", "--paper": "#fbf9f3", "--ink": "#0a0a0a", "--ink-2": "#3d3d3d", "--ink-3": "#7a7a7a", "--ink-4": "#b0b0b0", "--rule": "#cfccc2", "--rule-2": "#dedbd1", "--accent": "#c8412e", "--accent-2": "#962e1f", "--accent-soft": "#f4d4cf" },
    dark:   { "--bg": "#0a0a0a", "--bg-2": "#121212", "--paper": "#161616", "--ink": "#f0eee8", "--ink-2": "#c8c4ba", "--ink-3": "#7a7770", "--ink-4": "#3d3b36", "--rule": "#252320", "--rule-2": "#1a1816", "--accent": "#e85a44", "--accent-2": "#f57e6b", "--accent-soft": "#3a1812" },
  },
  forest: {
    name: "Forest",
    light:  { "--bg": "#eef0e8", "--bg-2": "#e3e6da", "--paper": "#f5f7ee", "--ink": "#0e1610", "--ink-2": "#384038", "--ink-3": "#6e7a6c", "--ink-4": "#a5ad9c", "--rule": "#c5cdb6", "--rule-2": "#d6dcc8", "--accent": "#3e7a45", "--accent-2": "#2a5430", "--accent-soft": "#cfe0c8" },
    dark:   { "--bg": "#0a0f0c", "--bg-2": "#0f1511", "--paper": "#131a15", "--ink": "#e8eee5", "--ink-2": "#c5cdb6", "--ink-3": "#7a8474", "--ink-4": "#3d473a", "--rule": "#1f2820", "--rule-2": "#161e18", "--accent": "#6ba872", "--accent-2": "#8cc792", "--accent-soft": "#1a2e1d" },
  },
  cobalt: {
    name: "Cobalt",
    light:  { "--bg": "#eef0f5", "--bg-2": "#e2e6ee", "--paper": "#f5f7fb", "--ink": "#0a1024", "--ink-2": "#34405c", "--ink-3": "#6c7896", "--ink-4": "#a5adc4", "--rule": "#c5ccdc", "--rule-2": "#d8dfeb", "--accent": "#2e4ec8", "--accent-2": "#1d369a", "--accent-soft": "#cdd5f0" },
    dark:   { "--bg": "#08090f", "--bg-2": "#0d0f17", "--paper": "#11141d", "--ink": "#e6e9f3", "--ink-2": "#bcc1d4", "--ink-3": "#74798f", "--ink-4": "#3a3e4f", "--rule": "#1d2030", "--rule-2": "#13162a", "--accent": "#6c84e8", "--accent-2": "#90a3f0", "--accent-soft": "#1a2240" },
  },
  rose: {
    name: "Rose",
    light:  { "--bg": "#f4eeee", "--bg-2": "#ebe2e4", "--paper": "#faf4f4", "--ink": "#1a0f12", "--ink-2": "#4a3a3d", "--ink-3": "#857074", "--ink-4": "#b3a4a8", "--rule": "#d6c4c8", "--rule-2": "#e2d5d8", "--accent": "#a83d6c", "--accent-2": "#7a2849", "--accent-soft": "#efd0db" },
    dark:   { "--bg": "#100a0c", "--bg-2": "#15100f", "--paper": "#1a1413", "--ink": "#f0e6e8", "--ink-2": "#d6c4c8", "--ink-3": "#8c7a7e", "--ink-4": "#4a3d40", "--rule": "#2a2122", "--rule-2": "#1f1818", "--accent": "#d96a96", "--accent-2": "#f08bb1", "--accent-soft": "#3d1f2c" },
  },
  noir: {
    name: "Noir",
    light:  { "--bg": "#f0eee9", "--bg-2": "#e6e3dc", "--paper": "#f7f5f0", "--ink": "#0a0a0a", "--ink-2": "#3a3a38", "--ink-3": "#7a7a76", "--ink-4": "#b0aea8", "--rule": "#cecbc2", "--rule-2": "#dcd9d0", "--accent": "#0a0a0a", "--accent-2": "#3a3a38", "--accent-soft": "#cecbc2" },
    dark:   { "--bg": "#080808", "--bg-2": "#0e0e0e", "--paper": "#121212", "--ink": "#ededed", "--ink-2": "#bdbdbd", "--ink-3": "#7d7d7d", "--ink-4": "#3a3a3a", "--rule": "#1f1f1f", "--rule-2": "#161616", "--accent": "#ededed", "--accent-2": "#bdbdbd", "--accent-soft": "#1f1f1f" },
  },
}

const FONTS: Record<string, { name: string; value: string }> = {
  fraunces: { name: "Fraunces", value: '"Fraunces", Georgia, serif' },
  playfair: { name: "Playfair", value: '"Playfair Display", Georgia, serif' },
  grotesk:  { name: "Grotesk",  value: '"Space Grotesk", system-ui, sans-serif' },
}

function applyPalette(themeKey: string, isDark: boolean): void {
  const t = THEMES[themeKey]
  if (!t) return
  const palette = isDark ? t.dark : t.light
  const root = document.documentElement
  Object.entries(palette).forEach(([k, v]) => {
    const prop =
      k === "--accent" ? "--v3-accent" :
      k === "--accent-2" ? "--v3-accent-2" :
      k === "--accent-soft" ? "--v3-accent-soft" : k
    root.style.setProperty(prop, v)
  })
  // Directly patch body so theme change is instant regardless of CSS cascade order
  document.body.style.setProperty("background-color", palette["--bg"])
  document.body.style.setProperty("color", palette["--ink"])
}

function applyFont(fontKey: string): void {
  const f = FONTS[fontKey]
  if (!f) return
  document.documentElement.style.setProperty("--display-font", f.value)
  // data-display-font lets CSS target font-specific size/metric adjustments
  document.documentElement.setAttribute("data-display-font", fontKey)
}

function applyMarginalia(show: boolean): void {
  if (show) {
    document.documentElement.removeAttribute("data-no-marginalia")
  } else {
    document.documentElement.setAttribute("data-no-marginalia", "")
  }
}

export function ThemeSelector(): React.ReactElement {
  const [activeTheme, setActiveTheme] = useState<string>("ochre")
  const [activeFont, setActiveFont] = useState<string>("fraunces")
  const [showMarginalia, setShowMarginalia] = useState<boolean>(true)
  const [isDark, setIsDark] = useState<boolean>(false)

  const applyTheme = useCallback((key: string, dark: boolean): void => {
    applyPalette(key, dark)
    setActiveTheme(key)
    localStorage.setItem("portfolio-theme", key)
  }, [])

  const handleDarkMode = useCallback((dark: boolean): void => {
    setIsDark(dark)
    if (dark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("portfolio-dark", dark ? "1" : "0")
    const current = localStorage.getItem("portfolio-theme") ?? "ochre"
    applyPalette(current, dark)
  }, [])

  const handleFont = useCallback((key: string): void => {
    applyFont(key)
    setActiveFont(key)
    localStorage.setItem("portfolio-font", key)
  }, [])

  const handleMarginalia = useCallback((show: boolean): void => {
    applyMarginalia(show)
    setShowMarginalia(show)
    localStorage.setItem("portfolio-marginalia", show ? "on" : "off")
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem("portfolio-theme") ?? "ochre"
    const savedFont = localStorage.getItem("portfolio-font") ?? "fraunces"
    const savedMarginalia = localStorage.getItem("portfolio-marginalia") !== "off"
    const savedDark = localStorage.getItem("portfolio-dark")
    const dark = savedDark !== null
      ? savedDark === "1"
      : document.documentElement.classList.contains("dark")

    setIsDark(dark)
    setActiveFont(savedFont)
    setShowMarginalia(savedMarginalia)

    applyPalette(savedTheme, dark)
    applyFont(savedFont)
    applyMarginalia(savedMarginalia)
    setActiveTheme(savedTheme)

    const observer = new MutationObserver(() => {
      const nowDark = document.documentElement.classList.contains("dark")
      setIsDark(nowDark)
      const current = localStorage.getItem("portfolio-theme") ?? "ochre"
      applyPalette(current, nowDark)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col gap-8">

      {/* Color themes */}
      <div className="flex flex-col gap-3">
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-semibold">Color theme</div>
        <div className="v3-theme-selector">
          <div className="grid grid-cols-3 max-[920px]:grid-cols-2 max-180:grid-cols-3 gap-2">
            {Object.entries(THEMES).map(([key, t]) => {
              const palette = isDark ? t.dark : t.light
              return (
                <button
                  key={key}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md border bg-transparent cursor-pointer transition-all duration-150 font-inherit text-[13px] hover:border-(--v3-accent) hover:bg-(--paper) hover:text-(--ink) ${activeTheme === key ? " border-(--v3-accent) bg-[color-mix(in_oklab,var(--v3-accent)_8%,transparent)] text-(--ink)" : " border-(--rule) text-secondary-foreground"}`}
                  onClick={() => applyTheme(key, isDark)}
                  title={t.name}
                  aria-label={`Apply ${t.name} theme`}
                  aria-pressed={activeTheme === key}
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full shrink-0"
                    style={{ background: palette["--accent"] }}
                    aria-hidden="true"
                  />
                  {t.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Display font */}
      <div className="flex flex-col gap-3">
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-semibold">Display font</div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(FONTS).map(([key, f]) => (
            <button
              key={key}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-md border bg-transparent cursor-pointer transition-all duration-150 font-inherit text-[13px] flex-1 hover:border-(--v3-accent) hover:bg-(--paper) hover:text-(--ink) ${activeFont === key ? " border-(--v3-accent) bg-[color-mix(in_oklab,var(--v3-accent)_8%,transparent)] text-(--ink)" : " border-(--rule) text-secondary-foreground"}`}
              onClick={() => handleFont(key)}
              aria-pressed={activeFont === key}
            >
              <span className="text-[20px] leading-none text-(--ink)" style={{ fontFamily: f.value, fontVariationSettings: key === "fraunces" ? '"opsz" 96, "SOFT" 100' : undefined }}>Ag</span>
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Marginalia toggle */}
      <div className="flex flex-col gap-3">
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-semibold">Marginalia</div>
        <div className="flex items-center justify-between gap-4">
          <button
            className={`group flex items-center gap-2.5 bg-transparent border-none cursor-pointer font-inherit text-[13px] p-0 transition-colors duration-150 hover:text-(--ink) ${showMarginalia ? "text-(--ink)" : "text-secondary-foreground"}`}
            onClick={() => handleMarginalia(!showMarginalia)}
            aria-pressed={showMarginalia}
          >
            <span className={`w-9 h-5 rounded-full relative transition-colors duration-150 ${showMarginalia ? "bg-(--v3-accent)" : "bg-(--rule)"}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-(--bg) transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${showMarginalia ? "translate-x-4" : "translate-x-0"}`} />
            </span>
            <span>{showMarginalia ? "Visible" : "Hidden"}</span>
          </button>
          <span className="text-[13px] text-muted-foreground">Side notes in essays</span>
        </div>
      </div>

    </div>
  )
}
