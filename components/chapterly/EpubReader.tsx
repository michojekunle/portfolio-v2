"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Rendition, Location } from "epubjs";
import { HIGHLIGHT_COLORS } from "@/lib/chapterly/types";
import type { HighlightColor } from "@/lib/chapterly/types";
import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";

const ACCENT = "#4F6D7A";

interface EpubTheme {
  bg: string;
  text: string;
}

interface Props {
  url: string;
  theme: EpubTheme;
  fontSize: number;
  /** Reading progress 0-100 to resume from on open. */
  initialProgress?: number;
  onHighlight: (text: string, cfiRange: string, color: HighlightColor) => Promise<void>;
  /** Called with the plain text of each newly rendered chapter, for TTS. */
  onChapterText?: (text: string) => void;
  /** Called on every chapter navigation with the current progress percentage (0-100). */
  onProgress?: (pct: number) => void;
  /** Called when book metadata (title, creator, cover base64) is parsed on mount. */
  onMetadata?: (meta: { title?: string; author?: string; coverUrl?: string }) => void;
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

export function EpubReader({ url, theme, fontSize, initialProgress, onHighlight, onChapterText, onProgress, onMetadata }: Props): React.ReactElement {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [pendingSelection, setPendingSelection] = useState<{ cfi: string; text: string } | null>(null);

  useEffect(() => {
    if (!viewerRef.current) return;
    let destroyed = false;

    const init = async (): Promise<void> => {
      try {
        const ePub = (await import("epubjs")).default;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const book = (ePub as any)(url);

        const rendition: Rendition = book.renderTo(viewerRef.current!, {
          width: "100%",
          height: "100%",
          flow: "paginated",
          spread: "none",
        });

        if (destroyed) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (book as any).destroy?.();
          return;
        }
        renditionRef.current = rendition;

        rendition.themes.register("reader", buildTheme(theme, fontSize));
        rendition.themes.select("reader");

        // Parse and report metadata & cover image
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

        // Generate locations to enable CFI-based navigation and progress tracking
        book.ready.then(() => {
          return book.locations.generate(1024);
        }).then(() => {
          if (destroyed) return;
          // Resume from saved position if provided (and meaningfully non-zero)
          if (initialProgress && initialProgress > 0) {
            const resumeCfi = book.locations.cfiFromPercentage(initialProgress / 100);
            if (resumeCfi) {
              void rendition.display(resumeCfi);
              return;
            }
          }
          // Report initial position
          if (rendition.location) {
            const progressVal = book.locations.percentageFromCfi(rendition.location.start.cfi);
            const pct = Math.round(progressVal * 100);
            setProgress(pct);
            onProgress?.(pct);
          }
        }).catch(() => undefined);

        rendition.on("relocated", (location: Location) => {
          if (book.locations && location.start?.cfi) {
            const progressVal = book.locations.percentageFromCfi(location.start.cfi);
            const pct = Math.round(progressVal * 100);
            setProgress(pct);
            onProgress?.(pct);
          } else if (location.start?.percentage !== undefined) {
            const pct = Math.round(location.start.percentage * 100);
            setProgress(pct);
            onProgress?.(pct);
          }
          if (onChapterText) {
            // Extract plain text of the current viewport content for TTS
            const contents = rendition.getContents();
            const text = contents
              .map((c: any) => c.document?.body?.innerText ?? "")
              .join("\n")
              .trim();
            if (text) onChapterText(text);
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
    renditionRef.current?.annotations.highlight(
      cfi,
      {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      undefined as any,
      "ch-highlight"
    );
    await onHighlight(text, cfi, color);
  }, [pendingSelection, onHighlight]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-[16px] p-[40px]">
        <div className="font-mono text-[12px] text-[var(--ink-3)]">{error}</div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] tracking-[0.1em] uppercase font-semibold px-[16px] py-[10px] rounded-[8px] no-underline"
          style={{ background: ACCENT, color: "#fff" }}
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
        className="absolute left-0 top-0 bottom-[48px] w-[12%] z-10 bg-transparent border-none cursor-pointer opacity-0 hover:opacity-100 transition-opacity flex items-center pl-[12px]"
        aria-label="Previous page"
      >
        <ChevronLeft size={22} style={{ color: theme.text, opacity: 0.5 }} />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-0 bottom-[48px] w-[12%] z-10 bg-transparent border-none cursor-pointer opacity-0 hover:opacity-100 transition-opacity flex items-center justify-end pr-[12px]"
        aria-label="Next page"
      >
        <ChevronRight size={22} style={{ color: theme.text, opacity: 0.5 }} />
      </button>

      {/* epubjs render target */}
      <div ref={viewerRef} className="flex-1 overflow-hidden" />

      {/* Bottom navigation strip */}
      <div
        className="h-[48px] flex items-center justify-center gap-[32px] shrink-0 border-t"
        style={{ background: theme.bg, borderColor: `${theme.text}15` }}
      >
        <button
          onClick={prev}
          className="w-[32px] h-[32px] flex items-center justify-center rounded-full border-none cursor-pointer transition-opacity hover:opacity-60"
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
          className="w-[32px] h-[32px] flex items-center justify-center rounded-full border-none cursor-pointer transition-opacity hover:opacity-60"
          style={{ background: `${theme.text}10`, color: theme.text }}
          aria-label="Next"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Highlight color picker — appears at bottom when epub text is selected */}
      {pendingSelection && (
        <div
          className="fixed bottom-[72px] max-[1024px]:bottom-[96px] left-1/2 z-50 flex items-center gap-[8px] px-[12px] py-[10px] rounded-[14px] shadow-2xl border"
          style={{
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
              className="w-[22px] h-[22px] rounded-full border-[2px] cursor-pointer transition-transform hover:scale-110"
              style={{ background: bg, borderColor: ring }}
              aria-label={`Highlight ${id}`}
            />
          ))}
          <button
            onClick={() => setPendingSelection(null)}
            className="ml-[2px] w-[18px] h-[18px] flex items-center justify-center rounded-full border-none cursor-pointer text-white opacity-40 hover:opacity-80 bg-transparent"
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
  return {
    html: { "background-color": theme.bg },
    body: {
      "background-color": `${theme.bg} !important`,
      color: `${theme.text} !important`,
      "font-size": `${fontSize}px !important`,
      "line-height": "1.75 !important",
      padding: "0 !important",
    },
    "p, div, span, li, td, th, blockquote, h1, h2, h3, h4, h5, h6": {
      color: `${theme.text} !important`,
    },
    a: { color: "#4F6D7A !important" },
  };
}
