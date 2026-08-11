import { Smartphone } from "lucide-react";

interface Props {
  accent: string;
  accentSoft: string;
  accentBorder: string;
}

export function PageHeader({ accent, accentSoft, accentBorder }: Props): React.ReactElement {
  return (
    <section className="pt-35 pb-15 max-[720px]:pt-[100px] max-[720px]:pb-9 border-b" style={{ borderColor: "var(--rule)" }}>
      <div className="max-w-310 mx-auto px-[var(--gutter,24px)] flex items-center justify-between gap-8 max-[720px]:flex-col max-[720px]:items-start">
        <div>
          <div
            className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase mb-5 px-2.5 py-1 rounded-full"
            style={{ background: accentSoft, color: accent, border: `1px solid ${accentBorder}` }}
          >
            <span className="w-1.25 h-1.25 rounded-full" style={{ background: accent }} aria-hidden="true" />
            Carousel Lab Suite
          </div>
          <h1
            className="font-display font-normal leading-[0.9] tracking-[-0.04em] fvs-display m-0 mb-4"
            style={{ fontSize: "clamp(44px,7vw,72px)", color: "var(--ink)" }}
          >
            Design world-class{" "}
            <em className="not-italic italic fvs-soft" style={{ color: accent }}>
              content.
            </em>
          </h1>
          <p className="text-[16px] leading-[1.65] m-0 max-w-[500px]" style={{ color: "var(--ink-2)" }}>
            Generate high-impact content carousels. Mix layouts, customize branding, toggle styling elements, and export as native PDF/PNG.
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl max-w-85" style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}>
          <Smartphone className="shrink-0" size={24} style={{ color: accent }} />
          <div className="text-[12px] leading-[1.4] text-muted-foreground">
            <strong>LinkedIn PDF:</strong> We support compiling your slides directly into LinkedIn-compatible multi-page swipeable PDFs!
          </div>
        </div>
      </div>
    </section>
  );
}
