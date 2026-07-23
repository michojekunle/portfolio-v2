"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Rendition, Location, Contents } from "epubjs";
import { HIGHLIGHT_COLORS } from "@/lib/chapterly/types";
import type { HighlightColor } from "@/lib/chapterly/types";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";

const ACCENT = "var(--ch-accent)";

interface EpubTheme {
  bg: string;
  text: string;
}

export interface SavedEpubHighlight {
  cfi_range: string;
  color: HighlightColor;
}

interface Props {
  url: string;
  theme: EpubTheme;
  fontSize: number;
  /** Reading progress 0-100 to resume from on open. */
  initialProgress?: number;
  /** Previously saved highlights, re-painted onto the book on load. */
  savedHighlights?: SavedEpubHighlight[];
  onHighlight: (text: string, cfiRange: string, color: HighlightColor) => Promise<void>;
  /** Called with the plain text of each newly rendered chapter, for TTS. */
  onChapterText?: (text: string) => void;
  /** Called on every page/chapter navigation with progress percentage (0-100). */
  onProgress?: (pct: number, saveToDb?: boolean) => void;
  /** Called when book metadata (title, creator, cover base64) is parsed on mount. */
  onMetadata?: (meta: { title?: string; author?: string; coverUrl?: string }) => void;
}

const HIGHLIGHT_FILL: Record<HighlightColor, string> = Object.fromEntries(
  HIGHLIGHT_COLORS.map((c) => [c.id, c.bg])
) as Record<HighlightColor, string>;

function annotationStyles(color: HighlightColor): Record<string, string> {
  return {
    fill: HIGHLIGHT_FILL[color] ?? "#FEF08A",
    "fill-opacity": "0.45",
    "mix-blend-mode": "multiply",
  };
}

function compressCoverToDataUrl(blob: Blob, maxW = 240, maxH = 360): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);
    img.onload = (): void => {
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(objectUrl);
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      } else {
        resolve("");
      }
    };
    img.onerror = (): void => {
      URL.revokeObjectURL(objectUrl);
      resolve("");
    };
    img.src = objectUrl;
  });
}

export function EpubReader({
  url,
  theme,
  fontSize,
  initialProgress,
  savedHighlights,
  onHighlight,
  onChapterText,
  onProgress,
  onMetadata,
}: Props): React.ReactElement {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const appliedCfisRef = useRef<Set<string>>(new Set());
  const savedHighlightsRef = useRef<SavedEpubHighlight[]>(savedHighlights ?? []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [pendingSelection, setPendingSelection] = useState<{ cfi: string; text: string } | null>(null);

  // Keep the latest saved highlights available to the rendition callbacks
  useEffect(() => {
    savedHighlightsRef.current = savedHighlights ?? [];
    // Paint any highlights that arrived after the book finished loading
    const rendition = renditionRef.current;
    if (!rendition) return;
    for (const h of savedHighlightsRef.current) {
      if (appliedCfisRef.current.has(h.cfi_range)) continue;
      try {
        rendition.annotations.highlight(
          h.cfi_range,
          {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          undefined as any,
          "ch-highlight",
          annotationStyles(h.color)
        );
        appliedCfisRef.current.add(h.cfi_range);
      } catch {
        // A CFI from another epub build of the same book can fail — skip it
      }
    }
  }, [savedHighlights]);

  useEffect(() => {
    if (!viewerRef.current) return;
    let destroyed = false;

    const init = async (): Promise<void> => {
      try {
        const ePub = (await import("epubjs")).default;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const book = (ePub as any)(url);

        // Paginated flow: real page turns instead of one endless scroll —
        // "read a page, move to the next" like a physical book.
        const rendition: Rendition = book.renderTo(viewerRef.current!, {
          width: "100%",
          height: "100%",
          flow: "paginated",
          spread: "none",
          allowScriptedContent: false,
        });

        if (destroyed) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (book as any).destroy?.();
          return;
        }
        renditionRef.current = rendition;

        rendition.themes.register("reader", buildTheme(theme, fontSize));
        rendition.themes.select("reader");

        // Inject the reading font + swipe handlers into every chapter document.
        // epub.js renders chapters in iframes, so fonts and touch events must
        // be wired inside each document as it loads.
        rendition.hooks.content.register((contents: Contents) => {
          const doc = contents.document;

          const fontLink = doc.createElement("link");
          fontLink.rel = "stylesheet";
          fontLink.href = "https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400&display=swap";
          doc.head.appendChild(fontLink);

          // Swipe left/right → next/previous page
          let touchStartX = 0;
          let touchStartY = 0;
          doc.addEventListener("touchstart", (e: TouchEvent) => {
            touchStartX = e.changedTouches[0]?.clientX ?? 0;
            touchStartY = e.changedTouches[0]?.clientY ?? 0;
          }, { passive: true });
          doc.addEventListener("touchend", (e: TouchEvent) => {
            // Don't page-turn while the user is selecting text to highlight
            const sel = contents.window.getSelection();
            if (sel && !sel.isCollapsed) return;
            const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX;
            const dy = (e.changedTouches[0]?.clientY ?? 0) - touchStartY;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
              if (dx < 0) void rendition.next();
              else void rendition.prev();
            }
          }, { passive: true });
        });

        // Parse and report metadata & cover image
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        book.loaded.metadata.then((meta: any) => {
          const author = meta.creator || null;
          const title = meta.title || null;

          book.coverUrl().then((coverUrl: string | null) => {
            if (coverUrl && onMetadata) {
              fetch(coverUrl)
                .then((r) => r.blob())
                .then((blob) => compressCoverToDataUrl(blob))
                .then((dataUrl) => {
                  onMetadata({
                    title: title || undefined,
                    author: author || undefined,
                    coverUrl: dataUrl || undefined,
                  });
                })
                .catch(() => {
                  onMetadata({ title: title || undefined, author: author || undefined });
                });
            } else if (onMetadata) {
              onMetadata({ title: title || undefined, author: author || undefined });
            }
          });
        });

        // Gate progress reporting until locations are ready — prevents the initial
        // display() call from firing onProgress(0) and overwriting saved progress
        // before generate() completes (which can take 3-6 s on large EPUBs).
        let locationsReady = false;

        book.ready.then(() => {
          return book.locations.generate(1024);
        }).then(() => {
          if (destroyed) return;
          locationsReady = true;
          if (initialProgress != null && initialProgress > 0) {
            const resumeCfi = book.locations.cfiFromPercentage(initialProgress / 100);
            if (resumeCfi) {
              void rendition.display(resumeCfi);
              return;
            }
          }
          if (rendition.location?.start?.cfi) {
            const progressVal = book.locations.percentageFromCfi(rendition.location.start.cfi);
            const pct = Math.round((progressVal ?? 0) * 100);
            setProgress(pct);
            onProgress?.(pct, true);
          }
        }).catch(() => undefined);

        rendition.on("relocated", (location: Location) => {
          if (locationsReady && book.locations && location.start?.cfi) {
            const progressVal = book.locations.percentageFromCfi(location.start.cfi);
            const pct = Math.round((progressVal ?? 0) * 100);
            setProgress(pct);
            onProgress?.(pct, true);
          } else if (!locationsReady && location.start?.percentage !== undefined) {
            const pct = Math.round(location.start.percentage * 100);
            setProgress(pct);
            onProgress?.(pct, false);
          }
          if (onChapterText) {
            const contents = rendition.getContents();
            const text = contents
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((c: any) => c.document?.body?.innerText ?? "")
              .join("\n")
              .trim();
            if (text) onChapterText(text);
          }
        });

        // Re-paint saved highlights once the first chapter renders
        rendition.on("rendered", () => {
          for (const h of savedHighlightsRef.current) {
            if (appliedCfisRef.current.has(h.cfi_range)) continue;
            try {
              rendition.annotations.highlight(
                h.cfi_range,
                {},
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                undefined as any,
                "ch-highlight",
                annotationStyles(h.color)
              );
              appliedCfisRef.current.add(h.cfi_range);
            } catch {
              // Invalid/foreign CFI — skip
            }
          }
        });

        rendition.on("selected", (cfiRange: string, contents: { window: Window }) => {
          const sel = contents.window.getSelection();
          const text = sel?.toString().trim();
          if (!text || text.length < 2) return;
          setPendingSelection({ cfi: cfiRange, text: text.slice(0, 2000) });
        });

        rendition.on("keyup", (e: KeyboardEvent) => {
          if (e.key === "ArrowRight") void rendition.next();
          if (e.key === "ArrowLeft") void rendition.prev();
        });

        await rendition.display();
        if (!destroyed) setLoading(false);
      } catch (err) {
        console.error("[epub] load error:", err);
        if (!destroyed) {
          setError("Could not load EPUB");
          setLoading(false);
        }
      }
    };

    void init();

    return () => {
      destroyed = true;
      appliedCfisRef.current.clear();
      renditionRef.current?.destroy?.();
      renditionRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Sync theme/fontSize changes into the live rendition
  useEffect(() => {
    const r = renditionRef.current;
    if (!r) return;
    r.themes.register("reader", buildTheme(theme, fontSize));
    r.themes.select("reader");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme.bg, theme.text, fontSize]);

  // Arrow-key page turns when focus is outside the epub iframe
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "ArrowRight") void renditionRef.current?.next();
      if (e.key === "ArrowLeft") void renditionRef.current?.prev();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const prev = useCallback((): void => {
    void renditionRef.current?.prev();
  }, []);

  const next = useCallback((): void => {
    void renditionRef.current?.next();
  }, []);

  const saveHighlight = useCallback(async (color: HighlightColor): Promise<void> => {
    if (!pendingSelection) return;
    const { cfi, text } = pendingSelection;
    setPendingSelection(null);
    try {
      renditionRef.current?.annotations.highlight(
        cfi,
        {},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        undefined as any,
        "ch-highlight",
        annotationStyles(color)
      );
      appliedCfisRef.current.add(cfi);
    } catch (err) {
      console.error("[epub] annotation paint error:", err);
    }
    await onHighlight(text, cfi, color);
  }, [pendingSelection, onHighlight]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-10">
        <div className="font-mono text-[12px] text-muted-foreground">{error}</div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] tracking-widest uppercase font-semibold px-4 py-2.5 rounded-lg no-underline"
          style={{ background: ACCENT, color: "var(--ch-bg)" }}
        >
          Open externally
        </a>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full" style={{ background: theme.bg }}>
      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center z-20"
          style={{ background: theme.bg }}
        >
          <Loader2 size={22} className="animate-spin" style={{ color: ACCENT }} />
        </div>
      )}

      {/* Side click zones for page turning */}
      <button
        onClick={prev}
        className="absolute left-0 top-0 bottom-12 w-[12%] z-10 bg-transparent border-none cursor-pointer opacity-0 hover:opacity-100 transition-opacity flex items-center pl-3"
        aria-label="Previous page"
      >
        <ChevronLeft size={22} style={{ color: theme.text, opacity: 0.5 }} />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-0 bottom-12 w-[12%] z-10 bg-transparent border-none cursor-pointer opacity-0 hover:opacity-100 transition-opacity flex items-center justify-end pr-3"
        aria-label="Next page"
      >
        <ChevronRight size={22} style={{ color: theme.text, opacity: 0.5 }} />
      </button>

      {/* epubjs render target — paginated, no internal scroll */}
      <div ref={viewerRef} className="flex-1 overflow-hidden" />

      {/* Bottom navigation strip */}
      <div
        className="h-12 flex items-center justify-center gap-8 shrink-0 border-t"
        style={{ background: theme.bg, borderColor: `${theme.text}15` }}
      >
        <button
          onClick={prev}
          className="w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer transition-opacity hover:opacity-60"
          style={{ background: `${theme.text}10`, color: theme.text }}
          aria-label="Previous"
        >
          <ChevronLeft size={16} />
        </button>
        <span
          className="font-mono text-[11px] tabular-nums"
          style={{ color: theme.text, opacity: 0.35 }}
        >
          {progress}%
        </span>
        <button
          onClick={next}
          className="w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer transition-opacity hover:opacity-60"
          style={{ background: `${theme.text}10`, color: theme.text }}
          aria-label="Next"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Highlight color picker — appears at bottom when epub text is selected */}
      {pendingSelection && (
        <div
          className="fixed bottom-18 max-256:bottom-24 left-1/2 z-50 flex items-center gap-2 px-3 py-2.5 rounded-[14px] shadow-2xl border"
          style={{
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
              className="w-5.5 h-5.5 rounded-full border-0.5 cursor-pointer transition-transform hover:scale-110"
              style={{ background: bg, borderColor: ring }}
              aria-label={`Highlight ${id}`}
            />
          ))}
          <button
            onClick={() => setPendingSelection(null)}
            className="ml-0.5 w-4.5 h-4.5 flex items-center justify-center rounded-full border-none cursor-pointer text-white opacity-40 hover:opacity-80 bg-transparent"
            aria-label="Dismiss"
          >
            <X size={10} />
          </button>
        </div>
      )}
    </div>
  );
}

function buildTheme(
  theme: EpubTheme,
  fontSize: number
): Record<string, Record<string, string>> {
  const serif = `"Literata", "Iowan Old Style", "Palatino Linotype", Georgia, serif`;
  return {
    html: { "background-color": theme.bg },
    body: {
      "background-color": `${theme.bg} !important`,
      color: `${theme.text} !important`,
      "font-family": `${serif} !important`,
      "font-size": `${fontSize}px !important`,
      "line-height": "1.7 !important",
      padding: "0 6% !important",
      "text-rendering": "optimizeLegibility",
      "-webkit-font-smoothing": "antialiased",
      hyphens: "auto",
    },
    "p, div, span, li, td, th, blockquote": {
      color: `${theme.text} !important`,
      "font-family": `${serif} !important`,
    },
    p: {
      "margin": "0 0 0.9em !important",
      "text-align": "justify",
      "text-justify": "inter-word",
    },
    "h1, h2, h3, h4, h5, h6": {
      color: `${theme.text} !important`,
      "font-family": `${serif} !important`,
      "font-weight": "600 !important",
      "line-height": "1.3 !important",
      "margin": "1.4em 0 0.6em !important",
    },
    blockquote: {
      "font-style": "italic",
      opacity: "0.88",
      margin: "1em 0 1em 1em !important",
    },
    img: {
      "max-width": "100% !important",
      height: "auto !important",
    },
    a: { color: "var(--ch-accent) !important" },
    "::selection": {
      background: "color-mix(in oklab, var(--ch-accent) 28.000000000000004%, transparent)",
    },
  };
}
