import Link from "next/link";
import { ArrowLeft, Smartphone } from "lucide-react";

interface Props {
  accent: string;
  accentSoft: string;
  accentBorder: string;
  isPro?: boolean;
  onUpgradeClick?: () => void;
}

export function PageHeader({ accent, accentSoft, accentBorder, isPro, onUpgradeClick }: Props): React.ReactElement {
  return (
    <section className="pt-32 pb-14 max-[720px]:pt-[90px] max-[720px]:pb-8 border-b" style={{ borderColor: "var(--rule)" }}>
      <div className="max-w-310 mx-auto px-[var(--gutter,24px)] flex items-center justify-between gap-8 max-[720px]:flex-col max-[720px]:items-start">
        <div>
          {/* Breadcrumb linking to /tools on michaelojekunle.dev */}
          <div className="flex items-center gap-2 mb-4 font-mono text-[10px] tracking-widest uppercase text-muted-foreground flex-wrap">
            <Link href="/tools" className="hover:text-(--ink) transition-colors flex items-center gap-1">
              <ArrowLeft size={11} /> Workbench
            </Link>
            <span className="text-(--rule)">/</span>
            <span className="text-secondary-foreground font-medium">michaelojekunle.dev/tools/carousel-lab</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap mb-5">
            <div
              className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase px-2.5 py-1 rounded-full"
              style={{ background: accentSoft, color: accent, border: `1px solid ${accentBorder}` }}
            >
              <span className="w-1.25 h-1.25 rounded-full" style={{ background: accent }} aria-hidden="true" />
              Carousel Lab Suite
            </div>
          </div>
          <h1
            className="font-display font-normal leading-[0.9] tracking-[-0.04em] fvs-display m-0 mb-4"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)", color: "var(--ink)" }}
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
