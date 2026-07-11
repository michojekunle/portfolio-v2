"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from "pdfjs-dist";
import { HIGHLIGHT_COLORS } from "@/lib/chapterly/types";
import type { HighlightColor } from "@/lib/chapterly/types";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, X, Brain } from "lucide-react";

// webpack 5 processes this at build time and replaces it with the bundled asset URL.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDF_WORKER_URL = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url);

const ACCENT = "var(--ch-accent)";

const TEXT_LAYER_CSS = `
.ch-pdf-text-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  user-select: text;
  line-height: 1;
  pointer-events: auto;
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
  background: color-mix(in oklab, var(--ch-accent) 35%, transparent);
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
  /** Page number (1-based) to open on load. */
  initialPage?: number;
  onHighlight: (text: string, color: HighlightColor) => Promise<void>;
  onMakeFlashcard?: (text: string) => Promise<void>;
  /** Called with the plain text of each rendered page, for TTS. */
  onChapterText?: (text: string) => void;
  /** Called after each page render with current page and total pages. */
  onProgress?: (currentPage: number, totalPages: number) => void;
  /** Called when book metadata (title, creator, cover base64) is parsed. */
  onMetadata?: (meta: { title?: string; author?: string; coverUrl?: string }) => void;
}

export function PdfReader({
  url,
  initialPage,
  onHighlight,
  onMakeFlashcard,
  onChapterText,
  onProgress,
  onMetadata,
}: Props): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage && initialPage > 1 ? initialPage : 1);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScale(window.innerWidth < 768 ? 0.75 : 1.0);
    }
  }, []);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
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
      const startPage = initialPage && initialPage > 1 && initialPage <= pdf.numPages ? initialPage : 1;
      onProgress?.(startPage, pdf.numPages);

      // Extract metadata
      pdf.getMetadata().then((meta: any) => {
        if (cancelled) return;
        const title = meta.info?.Title;
        const author = meta.info?.Author;
        if (onMetadata && (title || author)) {
          onMetadata({
            title: title || undefined,
            author: author || undefined,
          });
        }
      }).catch(() => undefined);
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
    setRenderError(null);

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

      // Collect page text for TTS
      if (onChapterText) {
        const spans = tl.querySelectorAll("span");
        const text = Array.from(spans).map((s) => s.textContent ?? "").join(" ").trim();
        if (text) onChapterText(text);
      }
      onProgress?.(pageNum, pdf.numPages);

      // If page 1, capture canvas contents to generate a cover image URL
      if (pageNum === 1 && canvasRef.current && onMetadata) {
        setTimeout(() => {
          if (canvasRef.current) {
            try {
              const coverDataUrl = canvasRef.current.toDataURL("image/jpeg", 0.6);
              onMetadata({ coverUrl: coverDataUrl });
            } catch (err) {
              console.warn("[pdf] cover export error:", err);
            }
          }
        }, 100);
      }

      page.cleanup();
    } catch (err: unknown) {
      // RenderingCancelledException is expected when scale/page changes rapidly
      if ((err as { name?: string }).name !== "RenderingCancelledException") {
        console.error("[pdf] render error:", err);
        setRenderError("Failed to render this page. Try zooming or navigating to another page.");
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

  // Arrow-key page turns
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        setCurrentPage((p) => Math.max(1, p - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [totalPages]);

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

  const saveAsFlashcard = async (): Promise<void> => {
    if (!textSel) return;
    const { text } = textSel;
    setTextSel(null);
    window.getSelection()?.removeAllRanges();
    if (onMakeFlashcard) {
      await onMakeFlashcard(text);
    }
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
      <div className="flex flex-col items-center pb-[88px] pt-[32px]" data-lenis-prevent="true">
        {/* Page canvas + text layer */}
        <div className="relative shadow-lg" onMouseUp={handleMouseUp}>
          <canvas ref={canvasRef} className="block" />
          <div ref={textLayerRef} className="ch-pdf-text-layer" />
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/20">
              <Loader2 size={18} className="animate-spin" style={{ color: ACCENT }} />
            </div>
          )}
          {renderError && !rendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/60">
              <p className="font-mono text-[11px] tracking-[0.08em] text-center px-[24px]" style={{ color: "#DC2626" }}>
                {renderError}
              </p>
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
            {onMakeFlashcard && (
              <button
                onClick={() => void saveAsFlashcard()}
                className="ml-[4px] px-[8px] py-[4px] rounded bg-[var(--ch-accent)] hover:opacity-90 text-[var(--ch-bg)] font-mono text-[9px] uppercase tracking-[0.05em] font-semibold cursor-pointer border-none flex items-center gap-[4px] transition-colors"
                title="Add to flashcards"
              >
                <Brain size={11} />
                <span>Flashcard</span>
              </button>
            )}
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
        <div className="fixed bottom-[16px] max-[1024px]:bottom-[32px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-[6px] px-[18px] py-[10px] rounded-[16px] shadow-xl border border-[var(--rule)] bg-[var(--bg-2)] max-[480px]:w-[92%] max-[480px]:justify-between">
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
