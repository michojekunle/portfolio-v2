"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from "pdfjs-dist";
import { HIGHLIGHT_COLORS } from "@/lib/chapterly/types";
import type { HighlightColor, HighlightStyle } from "@/lib/chapterly/types";
import { findMatchingSpans } from "@/lib/chapterly/text-range";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, X, Brain, Underline, Trash2 } from "lucide-react";

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

interface HighlightBox {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: HighlightColor;
  style: HighlightStyle;
}

interface ActiveHighlight {
  id: string;
  x: number;
  y: number;
}

// Mirrors HighlightStyles.tsx's ::highlight() colors — kept as overlay
// backgrounds here since PDF highlights are painted as rects, not ranges.
const HIGHLIGHT_BG: Record<HighlightColor, string> = {
  yellow: "rgba(254, 240, 138, 0.55)",
  green: "rgba(187, 247, 208, 0.55)",
  blue: "rgba(191, 219, 254, 0.55)",
  pink: "rgba(251, 207, 232, 0.55)",
};

const HIGHLIGHT_RING: Record<HighlightColor, string> = Object.fromEntries(
  HIGHLIGHT_COLORS.map(({ id, ring }) => [id, ring])
) as Record<HighlightColor, string>;

interface Props {
  url: string;
  /** Page number (1-based) to open on load. */
  initialPage?: number;
  /** Controlled zoom level. Falls back to internal state if omitted. */
  scale?: number;
  /** Required alongside `scale` to make zoom controlled from the parent (e.g. the shared toolbar). Accepts an updater like React's `setState`. */
  onScaleChange?: (value: number | ((prev: number) => number)) => void;
  /** Highlights to repaint onto the matching page's text layer, page-filtered. */
  savedHighlights?: { id: string; text: string; color: HighlightColor; style: HighlightStyle; page: number | null }[];
  onHighlight: (text: string, color: HighlightColor, page: number) => Promise<void>;
  /** Recolor or restyle (highlight/underline) an existing saved highlight. */
  onUpdateHighlight?: (id: string, changes: { color?: HighlightColor; style?: HighlightStyle }) => Promise<void>;
  /** Remove an existing saved highlight. */
  onDeleteHighlight?: (id: string) => Promise<void>;
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
  scale: scaleProp,
  onScaleChange,
  savedHighlights,
  onHighlight,
  onUpdateHighlight,
  onDeleteHighlight,
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
  const [internalScale, setInternalScale] = useState(1.0);
  const scale = scaleProp ?? internalScale;
  const setScale = useCallback(
    (updater: (s: number) => number) => {
      if (onScaleChange) onScaleChange(updater);
      else setInternalScale(updater);
    },
    [onScaleChange]
  );

  useEffect(() => {
    if (typeof window !== "undefined" && scaleProp === undefined) {
      setInternalScale(window.innerWidth < 768 ? 0.75 : 1.0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [textSel, setTextSel] = useState<TextSel | null>(null);
  const [highlightBoxes, setHighlightBoxes] = useState<HighlightBox[]>([]);
  const [activeHighlight, setActiveHighlight] = useState<ActiveHighlight | null>(null);

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

  // Repaint saved highlights onto the current page. Every span in pdf.js's
  // text layer is individually `position: absolute` + `transform`-scaled to
  // match its glyph run — Range.getClientRects() does not reliably account
  // for that (boxes can end up offset from, or far larger than, the actual
  // text), so instead of registering a Range into `CSS.highlights` (the
  // approach used for normal in-flow text/epub content) or reading
  // Range.getClientRects(), we resolve the matched <span> elements directly
  // and use each one's own getBoundingClientRect() — a much more reliable
  // primitive for transformed elements — to paint an overlay box per span.
  //
  // useLayoutEffect (not useEffect + requestAnimationFrame): during a zoom
  // change, `rendering` flips false→true→false in quick succession, and each
  // re-run of a plain effect would cancel the previous run's still-pending
  // RAF before it ever fired — starving the callback that actually calls
  // setHighlightBoxes, leaving boxes frozen at whatever scale they were last
  // successfully computed at. useLayoutEffect runs synchronously on every
  // commit with no scheduling gap to starve, so this can't happen.
  useLayoutEffect(() => {
    const tl = textLayerRef.current;
    const canvas = canvasRef.current;
    if (!savedHighlights || savedHighlights.length === 0 || rendering || !tl || !canvas) {
      setHighlightBoxes([]);
      return;
    }

    const originRect = canvas.getBoundingClientRect();
    const boxes: HighlightBox[] = [];
    for (const h of savedHighlights) {
      if (h.page !== null && h.page !== currentPage) continue;
      const spans = findMatchingSpans(tl, h.text);
      if (!spans) continue;
      for (const span of spans) {
        const r = span.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const left = r.left - originRect.left;
        const top = r.top - originRect.top;
        // pdf.js can render a text-layer span's DOM width wider than its
        // visible glyphs for certain fonts (a font-metric/substitution
        // mismatch between the embedded font used for canvas rendering and
        // the one used to measure the invisible selection span) — clamp so
        // an oversized span can never paint a highlight past the page edge.
        const width = Math.min(r.width, Math.max(0, originRect.width - left));
        boxes.push({
          id: h.id,
          left,
          top,
          width,
          height: r.height,
          color: h.color,
          style: h.style,
        });
      }
    }
    setHighlightBoxes(boxes);
  }, [savedHighlights, currentPage, rendering, scale]);

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

  // Highlight boxes stay `pointer-events: none` (see render below) so they
  // never block native text-selection dragging through a highlighted region —
  // pdf.js's invisible text spans sit on top of them and must stay the thing
  // that actually receives selection events. So "click an existing highlight"
  // is handled here instead: on a plain click (collapsed selection), hit-test
  // the click position against the current highlight boxes ourselves.
  const handleMouseUp = (e: React.MouseEvent): void => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setTextSel(null);
      const canvas = canvasRef.current;
      if (canvas) {
        const originRect = canvas.getBoundingClientRect();
        const x = e.clientX - originRect.left;
        const y = e.clientY - originRect.top;
        const hit = highlightBoxes.find(
          (b) => x >= b.left && x <= b.left + b.width && y >= b.top && y <= b.top + b.height
        );
        if (hit) {
          setActiveHighlight({ id: hit.id, x: e.clientX, y: e.clientY + window.scrollY - 56 });
          return;
        }
      }
      setActiveHighlight(null);
      return;
    }
    setActiveHighlight(null);
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
    await onHighlight(text, color, currentPage);
  };

  const activeHighlightData = activeHighlight
    ? savedHighlights?.find((h) => h.id === activeHighlight.id)
    : undefined;

  const handleRecolor = async (color: HighlightColor): Promise<void> => {
    if (!activeHighlight) return;
    const id = activeHighlight.id;
    setActiveHighlight(null);
    await onUpdateHighlight?.(id, { color });
  };

  const handleToggleUnderline = async (): Promise<void> => {
    if (!activeHighlight || !activeHighlightData) return;
    const id = activeHighlight.id;
    const nextStyle: HighlightStyle = activeHighlightData.style === "underline" ? "highlight" : "underline";
    setActiveHighlight(null);
    await onUpdateHighlight?.(id, { style: nextStyle });
  };

  const handleDeleteHighlight = async (): Promise<void> => {
    if (!activeHighlight) return;
    const id = activeHighlight.id;
    setActiveHighlight(null);
    await onDeleteHighlight?.(id);
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
      <div className="flex flex-col items-center pb-[88px] pt-8" data-lenis-prevent="true">
        {/* Page canvas + text layer */}
        <div className="relative shadow-lg" onMouseUp={handleMouseUp}>
          <canvas ref={canvasRef} className="block" />
          {highlightBoxes.map((box, i) => (
            // pointer-events: none — clicks are hit-tested manually in
            // handleMouseUp so these never intercept text-selection dragging
            // (see the comment there for why).
            <div
              key={i}
              className="absolute pointer-events-none"
              style={
                box.style === "underline"
                  ? {
                      // Hit area (for handleMouseUp's manual hit-test) stays
                      // the full box — thin bars are hard to hit; only the
                      // visible line is 2px, via an inset shadow.
                      left: box.left,
                      top: box.top,
                      width: box.width,
                      height: box.height,
                      boxShadow: `inset 0 -2px 0 0 ${HIGHLIGHT_RING[box.color]}`,
                    }
                  : {
                      left: box.left,
                      top: box.top,
                      width: box.width,
                      height: box.height,
                      background: HIGHLIGHT_BG[box.color],
                    }
              }
            />
          ))}
          <div ref={textLayerRef} className="ch-pdf-text-layer" />
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/20">
              <Loader2 size={18} className="animate-spin" style={{ color: ACCENT }} />
            </div>
          )}
          {renderError && !rendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/60">
              <p className="font-mono text-[11px] tracking-[0.08em] text-center px-6" style={{ color: "#DC2626" }}>
                {renderError}
              </p>
            </div>
          )}
        </div>

        {/* Floating highlight toolbar */}
        {textSel && (
          <div
            className="fixed z-50 flex items-center gap-1.5 px-2.5 py-2 rounded-[10px] shadow-xl border"
            style={{
              left: `${textSel.x}px`,
              top: `${textSel.y}px`,
              transform: "translateX(-50%)",
              background: "#1A1A1A",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <span className="font-mono text-[9px] tracking-widest uppercase text-white opacity-40 mr-0.5">
              Highlight
            </span>
            {HIGHLIGHT_COLORS.map(({ id, bg, ring }) => (
              <button
                key={id}
                onClick={() => void saveHighlight(id)}
                className="w-5 h-5 rounded-full border-0.5 cursor-pointer transition-transform hover:scale-110"
                style={{ background: bg, borderColor: ring }}
                aria-label={`Highlight ${id}`}
              />
            ))}
            {onMakeFlashcard && (
              <button
                onClick={() => void saveAsFlashcard()}
                className="ml-1 px-2 py-1 rounded bg-(--ch-accent) hover:opacity-90 text-(--ch-bg) font-mono text-[9px] uppercase tracking-wider font-semibold cursor-pointer border-none flex items-center gap-1 transition-colors"
                title="Add to flashcards"
              >
                <Brain size={11} />
                <span>Flashcard</span>
              </button>
            )}
            <button
              onClick={() => setTextSel(null)}
              className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full border-none cursor-pointer text-white opacity-40 hover:opacity-80 bg-transparent"
              aria-label="Dismiss"
            >
              <X size={10} />
            </button>
          </div>
        )}

        {/* Existing-highlight menu: recolor / underline / remove */}
        {activeHighlight && activeHighlightData && (
          <div
            className="fixed z-50 flex items-center gap-1.5 px-2.5 py-2 rounded-[10px] shadow-xl border"
            style={{
              left: `${activeHighlight.x}px`,
              top: `${activeHighlight.y}px`,
              transform: "translateX(-50%)",
              background: "#1A1A1A",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            {HIGHLIGHT_COLORS.map(({ id, bg, ring }) => (
              <button
                key={id}
                onClick={() => void handleRecolor(id)}
                className="w-5 h-5 rounded-full border-0.5 cursor-pointer transition-transform hover:scale-110"
                style={{
                  background: bg,
                  borderColor: ring,
                  outline: activeHighlightData.color === id ? `1.5px solid ${ring}` : "none",
                  outlineOffset: 1.5,
                }}
                aria-label={`Recolor ${id}`}
              />
            ))}
            <button
              onClick={() => void handleToggleUnderline()}
              className="ml-1 w-6 h-6 flex items-center justify-center rounded cursor-pointer border-none transition-colors"
              style={{
                background: activeHighlightData.style === "underline" ? "rgba(255,255,255,0.15)" : "transparent",
                color: "white",
              }}
              aria-label="Toggle underline style"
              title="Underline instead of highlight"
            >
              <Underline size={13} />
            </button>
            <button
              onClick={() => void handleDeleteHighlight()}
              className="w-6 h-6 flex items-center justify-center rounded cursor-pointer border-none bg-transparent text-white opacity-70 hover:opacity-100 hover:text-red-400 transition-colors"
              aria-label="Remove highlight"
              title="Remove highlight"
            >
              <Trash2 size={13} />
            </button>
            <button
              onClick={() => setActiveHighlight(null)}
              className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full border-none cursor-pointer text-white opacity-40 hover:opacity-80 bg-transparent"
              aria-label="Dismiss"
            >
              <X size={10} />
            </button>
          </div>
        )}

        {/* Controls: zoom + pagination */}
        <div className="fixed bottom-4 max-[1024px]:bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-4.5 py-2.5 rounded-2xl shadow-xl border border-(--rule) bg-(--bg-2) max-[480px]:w-[92%] max-[480px]:justify-between">
          <button
            onClick={() => setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(1)))}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-md border border-(--rule) bg-transparent cursor-pointer text-muted-foreground hover:text-(--ink) transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="font-mono text-[10px] text-muted-foreground w-9 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(1)))}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-md border border-(--rule) bg-transparent cursor-pointer text-muted-foreground hover:text-(--ink) transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <div className="w-px h-5 bg-(--rule) mx-1" />
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-md border border-(--rule) bg-transparent cursor-pointer text-muted-foreground hover:text-(--ink) transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-[10px] text-muted-foreground min-w-14 text-center tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-md border border-(--rule) bg-transparent cursor-pointer text-muted-foreground hover:text-(--ink) transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
