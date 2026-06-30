"use client";

import { useState } from "react";

interface CarouselSlide {
  headline: string;
  subtext?: string;
  bullets: string[];
}

interface Props {
  content: string;
  bookTheme: {
    bg: string;
    accent: string;
    text: string;
    label: string;
  };
  bookTitle: string;
}

function parseCarouselContent(raw: string): CarouselSlide[] {
  const slides: CarouselSlide[] = [];
  const blocks = raw.split(/\n(?=SLIDE\s+\d+)/i).filter(Boolean);

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // Remove the "SLIDE N" header line
    const contentLines = lines.filter((l) => !/^SLIDE\s+\d+$/i.test(l));

    const slide: CarouselSlide = { headline: "", bullets: [] };

    for (const line of contentLines) {
      if (/^Headline:\s*/i.test(line)) {
        slide.headline = line.replace(/^Headline:\s*/i, "").replace(/^["']|["']$/g, "");
      } else if (/^Subtext:\s*/i.test(line)) {
        slide.subtext = line.replace(/^Subtext:\s*/i, "");
      } else if (/^Bullet\s*\d+:\s*/i.test(line)) {
        slide.bullets.push(line.replace(/^Bullet\s*\d+:\s*/i, ""));
      }
    }

    if (slide.headline) slides.push(slide);
  }

  return slides;
}

// Gradient maps matching book themes + carousel_template.html
const THEME_GRADIENTS: Record<string, string> = {
  "#1F2937": "linear-gradient(135deg, #1F2937 0%, #374151 100%)",
  "#6366F1": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
  "#DC2626": "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)",
  "#1E40AF": "linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)",
};

function getGradient(bg: string): string {
  return THEME_GRADIENTS[bg] ?? `linear-gradient(135deg, ${bg} 0%, ${bg}cc 100%)`;
}

export function CarouselPreview({ content, bookTheme, bookTitle }: Props): React.ReactElement {
  const slides = parseCarouselContent(content);
  const [active, setActive] = useState(0);

  if (slides.length === 0) {
    return (
      <div
        className="rounded-[12px] flex items-center justify-center h-[320px] text-center p-[32px]"
        style={{ background: bookTheme.bg, color: bookTheme.text, opacity: 0.7 }}
      >
        <p className="font-mono text-[11px] tracking-[0.1em] uppercase">
          Carousel slides will appear here after generation
        </p>
      </div>
    );
  }

  const current = slides[active];
  const gradient = getGradient(bookTheme.bg);
  const isCTA = active === slides.length - 1;

  return (
    <div className="w-full">
      {/* Slide viewer */}
      <div
        className="relative w-full rounded-[16px] overflow-hidden flex flex-col items-center justify-center text-center p-[40px]"
        style={{
          background: gradient,
          color: bookTheme.text,
          aspectRatio: "1 / 1",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Slide number */}
        <div
          className="absolute top-[20px] right-[24px] font-mono text-[11px] tracking-[0.12em] uppercase opacity-60"
          style={{ color: bookTheme.text }}
        >
          {active + 1} / {slides.length}
        </div>

        {/* Book label on slide 1 */}
        {active === 0 && (
          <div
            className="absolute top-[20px] left-[24px] font-mono text-[9px] tracking-[0.14em] uppercase opacity-70 max-w-[50%] text-left leading-[1.4]"
            style={{ color: bookTheme.accent }}
          >
            {bookTitle}
          </div>
        )}

        {/* CTA slide icon */}
        {isCTA && (
          <div className="text-[40px] mb-[16px]" aria-hidden="true">
            📚
          </div>
        )}

        {/* Headline */}
        <h2
          className="font-bold leading-[1.15] tracking-[-0.02em] mb-[14px] max-w-[80%]"
          style={{
            fontSize: current.headline.length > 40 ? "clamp(22px, 4vw, 28px)" : "clamp(26px, 5vw, 36px)",
            color: isCTA ? bookTheme.accent : bookTheme.text,
          }}
        >
          {current.headline}
        </h2>

        {/* Subtext (slides 1 and CTA) */}
        {current.subtext && (
          <p
            className="text-[15px] leading-[1.55] max-w-[72ch] opacity-90"
            style={{ color: isCTA ? bookTheme.text : bookTheme.accent }}
          >
            {current.subtext}
          </p>
        )}

        {/* Bullets */}
        {current.bullets.length > 0 && (
          <ul className="mt-[8px] space-y-[10px] max-w-[80%] text-left">
            {current.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-[10px] text-[14px] leading-[1.5]">
                <span
                  className="mt-[4px] shrink-0 w-[6px] h-[6px] rounded-full"
                  style={{ background: bookTheme.accent }}
                  aria-hidden="true"
                />
                <span style={{ color: bookTheme.text, opacity: 0.9 }}>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {/* CTA website decoration */}
        {isCTA && (
          <div
            className="mt-[20px] px-[20px] py-[10px] rounded-full font-mono text-[11px] tracking-[0.12em] uppercase font-semibold"
            style={{ background: bookTheme.accent, color: "#fff" }}
          >
            michaelojekunle.dev
          </div>
        )}
      </div>

      {/* Slide navigation dots */}
      <div className="flex items-center justify-center gap-[8px] mt-[20px]">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="transition-all duration-200 rounded-full font-mono text-[10px] font-semibold cursor-pointer border-none flex items-center justify-center"
            style={{
              width: i === active ? "36px" : "28px",
              height: i === active ? "36px" : "28px",
              background: i === active ? bookTheme.bg : "transparent",
              color: i === active ? bookTheme.accent : bookTheme.bg,
              outline: i === active ? `2px solid ${bookTheme.bg}` : `1.5px solid ${bookTheme.bg}40`,
            }}
            aria-label={`Go to slide ${i + 1}`}
            aria-pressed={i === active}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Prev / Next controls */}
      <div className="flex items-center justify-between mt-[16px]">
        <button
          onClick={() => setActive((v) => Math.max(0, v - 1))}
          disabled={active === 0}
          className="font-mono text-[10px] tracking-[0.12em] uppercase px-[16px] py-[8px] rounded-full cursor-pointer border-none transition-all disabled:opacity-30"
          style={{ background: `${bookTheme.bg}20`, color: bookTheme.bg }}
        >
          ← Prev
        </button>
        <span className="font-mono text-[10px] tracking-[0.1em] uppercase" style={{ color: `${bookTheme.bg}70` }}>
          Slide {active + 1} of {slides.length}
        </span>
        <button
          onClick={() => setActive((v) => Math.min(slides.length - 1, v + 1))}
          disabled={active === slides.length - 1}
          className="font-mono text-[10px] tracking-[0.12em] uppercase px-[16px] py-[8px] rounded-full cursor-pointer border-none transition-all disabled:opacity-30"
          style={{ background: `${bookTheme.bg}20`, color: bookTheme.bg }}
        >
          Next →
        </button>
      </div>

      {/* Slide count summary */}
      <p
        className="text-center font-mono text-[9px] tracking-[0.1em] uppercase mt-[12px] opacity-50"
        style={{ color: bookTheme.bg }}
      >
        {slides.length} slides · Instagram 1:1 format · {bookTheme.label} theme
      </p>
    </div>
  );
}
