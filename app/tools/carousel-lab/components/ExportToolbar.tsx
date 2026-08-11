import { Download, FileText, Layers } from "lucide-react";
import type { ExportKind } from "../lib/types";

interface Props {
  accent: string;
  slideNumber: number;
  slideCount: number;
  exportLoading: ExportKind | null;
  onExportPng: () => void;
  onExportZip: () => void;
  onExportPdf: () => void;
}

const buttonClass =
  "inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.15em] uppercase font-semibold px-3.5 py-2 rounded-lg border border-(--rule) bg-transparent text-(--ink) cursor-pointer hover:border-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed";

export function ExportToolbar({ accent, slideNumber, slideCount, exportLoading, onExportPng, onExportZip, onExportPdf }: Props): React.ReactElement {
  return (
    <div className="flex items-center justify-between border-b pb-3.5 border-(--rule) flex-wrap gap-3">
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-(--ink)">
          Slide {slideNumber} of {slideCount}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" onClick={onExportPng} disabled={!!exportLoading} className={buttonClass}>
          <Download size={11} />
          {exportLoading === "png" ? "Saving…" : "This Slide PNG"}
        </button>
        <button type="button" onClick={onExportZip} disabled={!!exportLoading} className={buttonClass}>
          <Layers size={11} />
          {exportLoading === "zip" ? "Zipping…" : "All Slides ZIP"}
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          disabled={!!exportLoading}
          className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.15em] uppercase font-semibold px-3.5 py-2 rounded-lg border-none text-white cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: accent }}
        >
          <FileText size={11} />
          {exportLoading === "pdf" ? "Building PDF…" : "LinkedIn PDF"}
        </button>
      </div>
    </div>
  );
}
