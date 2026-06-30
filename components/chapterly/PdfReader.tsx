"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from "pdfjs-dist";
import type { HighlightColor } from "@/lib/chapterly/types";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, X } from "lucide-react";

// webpack 5 processes this at build time and replaces it with the bundled asset URL.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDF_WORKER_URL = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url);

const ACCENT = "#4F6D7A";

const HIGHLIGHT_COLORS: { id: HighlightColor; bg: string; ring: string }[] = [
  { id: "yellow", bg: "#FEF08A", ring: "#CA8A04" },
  { id: "green", bg: "#BBF7D0", ring: "#16A34A" },
  { id: "blue", bg: "#BFDBFE", ring: "#1D4ED8" },
  { id: "pink", bg: "#FBCFE8", ring: "#9D174D" },
];

const TEXT_LAYER_CSS = `
.ch-pdf-text-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  user-select: text;
  line-height: 1;
  pointer-events: none;
}
.ch-pdf-text-layer span,
.ch-pdf-text-layer br {
  color: transparent;
  position: absolute;
  white-space: pre;
  cursor: text;
  transform-origin: 0% 0%;
  pointer-events: all;
}
.ch-pdf-text-layer ::selection {
  background: rgba(79, 109, 122, 0.35);
  color: transparent;
}
`;

interface TextSel {
  text: string;
  x: number;
  y: number;
}

interface Props {
  url: string;
  onHighlight: (text: string, color: HighlightColor) => Promise<void>;
}

export function PdfReader({ url, onHighlight }: Props): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.4);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [textSel, setTextSel] = useState<TextSel | null>(null);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      const pdfjs = await import("pdfjs-dist");

      if (!workerRef.current && typeof window !== "undefined") {
        const w = new Worker(PDF_WORKER_URL, { type: "module" });
        workerRef.current = w;
        pdfjs.GlobalWorkerOptions.workerPort = w;
      }

      const task = pdfjs.getDocument({ url });
      const pdf = await task.promise;
      if (cancelled) {
        void pdf.cleanup();
        return;
      }
      pdfRef.current = pdf;
      setTotalPages(pdf.numPages);
      setLoadingPdf(false);
    };

    void load().catch((err: unknown) => {
      console.error("[pdf] load error:", err);
      if (!cancelled) setLoadingPdf(false);
    });

    return () => {
      cancelled = true;
      void pdfRef.current?.cleanup();
      pdfRef.current = null;
    };
  }, [url]);

  // Render page to canvas + text layer
  const renderPage = useCallback(async (pageNum: number): Promise<void> => {
    const pdf = pdfRef.current;
    if (!pdf || !canvasRef.current || !textLayerRef.current) return;

    renderTaskRef.current?.cancel();
    setRendering(true);

    try {
      const page: PDFPageProxy = await pdf.getPage(pageNum);
      const viewport: PageViewport = page.getViewport({ scale });
      const dpr = window.devicePixelRatio || 1;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      ctx.scale(dpr, dpr);

      const renderTask = page.render({ canvas, canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      // Build text layer for selection
      const tl = textLayerRef.current;
      tl.innerHTML = "";
      tl.style.width = `${Math.floor(viewport.width)}px`;
      tl.style.height = `${Math.floor(viewport.height)}px`;

      const pdfjs = await import("pdfjs-dist");
      const textStream = page.streamTextContent();
      const textLayer = new pdfjs.TextLayer({
        textContentSource: textStream,
        container: tl,
        viewport,
      });
      await textLayer.render();

      page.cleanup();
    } catch (err: unknown) {
      // RenderingCancelledException is expected when scale/page changes rapidly
      if ((err as { name?: string }).name !== "RenderingCancelledException") {
        console.error("[pdf] render error:", err);
      }
    } finally {
      setRendering(false);
    }
  }, [scale]);

  useEffect(() => {
    if (!loadingPdf && totalPages > 0) {
      void renderPage(currentPage);
    }
  }, [loadingPdf, currentPage, scale, renderPage, totalPages]);

  const handleMouseUp = (): void => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setTextSel(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setTextSel({
      text: sel.toString().trim().slice(0, 2000),
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY - 56,
    });
  };

  const saveHighlight = async (color: HighlightColor): Promise<void> => {
    if (!textSel) return;
    const { text } = textSel;
    setTextSel(null);
    window.getSelection()?.removeAllRanges();
    await onHighlight(text, color);
  };

  if (loadingPdf) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 size={24} className="animate-spin" style={{ color: ACCENT }} />
      </div>
    );
  }

  return (
    <>
      <style>{TEXT_LAYER_CSS}</style>
      <div className="flex flex-col items-center pb-[88px] pt-[32px]">
        {/* Page canvas + text layer */}
        <div className="relative shadow-lg" onMouseUp={handleMouseUp}>
          <canvas ref={canvasRef} className="block" />
          <div ref={textLayerRef} className="ch-pdf-text-layer" />
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/20">
              <Loader2 size={18} className="animate-spin" style={{ color: ACCENT }} />
            </div>
          )}
        </div>

        {/* Floating highlight toolbar */}
        {textSel && (
          <div
            className="fixed z-50 flex items-center gap-[6px] px-[10px] py-[8px] rounded-[10px] shadow-xl border"
            style={{
              left: `${textSel.x}px`,
              top: `${textSel.y}px`,
              transform: "translateX(-50%)",
              background: "#1A1A1A",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-white opacity-40 mr-[2px]">
              Highlight
            </span>
            {HIGHLIGHT_COLORS.map(({ id, bg, ring }) => (
              <button
                key={id}
                onClick={() => void saveHighlight(id)}
                className="w-[20px] h-[20px] rounded-full border-[2px] cursor-pointer transition-transform hover:scale-110"
                style={{ background: bg, borderColor: ring }}
                aria-label={`Highlight ${id}`}
              />
            ))}
            <button
              onClick={() => setTextSel(null)}
              className="ml-[2px] w-[16px] h-[16px] flex items-center justify-center rounded-full border-none cursor-pointer text-white opacity-40 hover:opacity-80 bg-transparent"
              aria-label="Dismiss"
            >
              <X size={10} />
            </button>
          </div>
        )}

        {/* Controls: zoom + pagination */}
        <div className="fixed bottom-[12px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-[6px] px-[18px] py-[10px] rounded-[16px] shadow-xl border border-[var(--rule)] bg-[var(--bg-2)]">
          <button
            onClick={() => setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(1)))}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="font-mono text-[10px] text-[var(--ink-3)] w-[36px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(1)))}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <div className="w-px h-[20px] bg-[var(--rule)] mx-[4px]" />
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-[10px] text-[var(--ink-3)] min-w-[56px] text-center tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
