---
name: Portfolio v2
description: Personal portfolio and blog for Michael Ojekunle with custom CMS
colors:
  bg: "#f0eee9"
  bg-dark: "#080808"
  paper: "#f7f5f0"
  paper-dark: "#121212"
  ink: "#0a0a0a"
  ink-dark: "#ededed"
  ink-muted: "#7a7a76"
  rule: "#cecbc2"
  rule-dark: "#1f1f1f"
  good: "#6e8c2e"
  destructive: "#ef4444"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
  eyebrow:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.18em"
rounded:
  sm: "2px"
  md: "4px"
  lg: "6px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  gutter: "48px"
  maxw: "1320px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.ink-muted}"
  content-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Portfolio v2

## Overview

**Creative North Star: "The Editorial Sanctuary"**

The visual language of Portfolio v2 pairs tactile editorial warmth with sharp technical precision. Built for Michael Ojekunle's digital home, the interface rejects saturated tech visual clutter in favor of quiet paper surfaces, literary typography, and high-contrast typography hierarchy.

In light mode, warm off-white linen backgrounds (`#f0eee9`) set a calm, reader-first tone. In dark mode, deep obsidian surfaces (`#080808`) create focused contrast. The system uses Fraunces for expressive serif headlines and optical size variations, Inter for clean body copy, and JetBrains Mono for eyebrows and technical details.

**Key Characteristics:**
- **Editorial Warmth:** Tactile paper tones (`#f0eee9` light, `#080808` dark) rather than harsh pure whites.
- **Expressive Serif Typography:** Fraunces variable serif with italic emphasis and custom optical sizing (`opsz 144`).
- **Precision Eyebrows:** JetBrains Mono uppercase eyebrows with wide letter-spacing (`0.18em`).
- **Subtle Rule Division:** Clean border dividers (`#cecbc2`) defining visual containers.

## Colors

The palette relies on high-contrast monochrome tones with warm paper undertones, eliminating unnecessary decorative accent colors.

### Primary
- **Deep Ink** (`#0a0a0a` / `#ededed` in dark mode): Used for high-emphasis primary text, primary button backgrounds, and strong typographic hierarchy.

### Neutral
- **Warm Paper Background** (`#f0eee9` light / `#080808` dark): The foundational page background color.
- **Surface Container Paper** (`#f7f5f0` light / `#121212` dark): Background for cards, popovers, and elevated content blocks.
- **Muted Ink** (`#7a7a76` light / `#7d7d7d` dark): Secondary text, subtitles, and metadata labels.
- **Rule Divider** (`#cecbc2` light / `#1f1f1f` dark): Subtle 1px borders separating structural sections.

### Functional
- **Success Green** (`#6e8c2e`): Active status indicators and confirmation badges.
- **Destructive Red** (`#ef4444`): Error states, unpublish triggers, and destructive actions.

### Named Rules
**The One Voice Rule.** The interface avoids bright accent floods. Ink and paper contrast carry 95% of the visual hierarchy; status colors appear only on specific indicators.

## Typography

**Display Font:** Fraunces (variable serif with optical size `opsz 144`)
**Body Font:** Inter (clean sans-serif)
**Mono / Eyebrow Font:** JetBrains Mono (monospace)

**Character:** A pairing of editorial serif headings with sans-serif body prose and monospace eyebrows.

### Hierarchy
- **Display** (Fraunces, 400, `clamp(2.25rem, 5vw, 4rem)`, line-height 1.1): Page titles and hero headings.
- **Headline** (Fraunces, 400, `1.75rem`, line-height 1.2): Section headers and post titles.
- **Title** (Fraunces / Inter, 500, `1.25rem`, line-height 1.3): Card titles and modal headers.
- **Body** (Inter, 400, `1rem`, line-height 1.6): Long-form text and blog post reading content (max line length 65-75ch).
- **Eyebrow / Label** (JetBrains Mono, 500, `11px`, letter-spacing `0.18em`, uppercase): Eyebrows, tags, dates, and category markers.

### Named Rules
**The Italic Accent Rule.** Heading emphasis (`<em>`) uses Fraunces italic with soft optical size settings (`SOFT 100`, `opsz 144`) to add editorial voice to key phrases.

## Layout

The layout uses a constrained max-width container (`1320px`) with wide gutters (`48px` on desktop, `24px` on mobile). Content grid spans 12 columns for project cards, blog lists, and administrative dashboards.

Spacing follows an 8px rhythm scale (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`). Responsive layouts collapse 3-column project grids to single-column flows on screens smaller than `768px`.

## Elevation & Depth

Portfolio v2 is flat-by-default with subtle border boundaries (`#cecbc2`) rather than heavy drop shadows.

### Shadow Vocabulary
- **Surface Elevation** (`0 2px 8px rgba(0,0,0,0.04)`): Subtle floating depth used exclusively for active dropdown menus and popover cards.

### Named Rules
**The Border-Over-Shadow Rule.** Cards and containers rely on 1px crisp borders (`var(--rule)`) and background contrast (`var(--paper)`) rather than ambient drop shadows.

## Shapes

- **Border Radius Strategy:** Restrained and precise.
  - Small elements (tags, badges, chips): `2px` radius.
  - Medium elements (buttons, input fields): `4px` radius.
  - Large elements (content cards, dialogs): `6px` radius (`0.375rem`).
- **Borders:** 1px solid rule borders (`#cecbc2` light, `#1f1f1f` dark).

## Components

### Buttons
- **Shape:** `4px` corner radius.
- **Primary:** Background `#0a0a0a`, text `#f0eee9`, padding `8px 16px`.
- **Hover / Focus:** Background `#3a3a38`, subtle scale transition `0.2s ease`.
- **Secondary / Ghost:** Transparent background, text `#0a0a0a`, 1px border `#cecbc2`.

### Content Cards
- **Corner Style:** `6px` radius (`var(--radius-lg)`).
- **Background:** `#f7f5f0` light / `#121212` dark (`var(--paper)`).
- **Border:** 1px solid `#cecbc2` light / `#1f1f1f` dark (`var(--rule)`).
- **Internal Padding:** `24px`.

### GitHub Bento Cards
- **Corner Style:** `6px` radius (`var(--radius-lg)`).
- **Style:** Multi-column bento layout displaying pinned repositories, commit activity graphs, and star counts with JetBrains Mono stats.

### Book Cover Cards (`/now`)
- **Corner Style:** `4px` radius with subtle book spine border shadow.
- **Style:** Aspect ratio 2:3 displaying reading progress bar, status pill (`reading` / `completed`), and review notes.

### Command Palette (`Cmd+K`)
- **Style:** Centered modal container (`640px` max width), backdrop blur overlay (`backdrop-filter: blur(8px)`), JetBrains Mono search input, and keyboard shortcut chips.

### Eyebrow Tags & Badges
- **Style:** JetBrains Mono `11px` uppercase, letter-spacing `0.18em`.
- **Background:** Muted paper `#e6e3dc`, text `#0a0a0a`, radius `2px`.

### Inputs & Admin Forms
- **Style:** Background `#f7f5f0`, border 1px `#cecbc2`, radius `4px`, padding `10px 14px`.
- **Focus:** Border shift to `#0a0a0a` with subtle ring focus indicator.

## Do's and Don'ts

### Do:
- **Do** use Fraunces serif headings for hero sections and section titles.
- **Do** use JetBrains Mono for uppercase eyebrows (`11px`, `0.18em` tracking).
- **Do** use crisp 1px borders (`#cecbc2`) to structure cards and containers.
- **Do** keep long-form reading copy readable with a maximum width of `65-75ch`.

### Don't:
- **Don't** add bright gradient accents or loud neon color fills.
- **Don't** use heavy drop shadows for elevated cards; rely on border division.
- **Don't** mix non-monospace fonts in eyebrow labels or metadata tags.
- **Don't** use rounded pill buttons (`rounded-full`) where structured `4px` radius buttons belong.
