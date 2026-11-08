"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { HIGHLIGHT_COLORS } from "@/lib/chapterly/types";
import type { ChBook, HighlightColor, HighlightStyle } from "@/lib/chapterly/types";
import { findTextRange } from "@/lib/chapterly/text-range";

const EpubReader = dynamic(
  () => import("./EpubReader").then((m) => ({ default: m.EpubReader })),
  { ssr: false }
);
const PdfReader = dynamic(
  () => import("./PdfReader").then((m) => ({ default: m.PdfReader })),
  { ssr: false }
);
import {
  ArrowLeft,
  MessageSquare,
  Volume2,
  Sun,
  Moon,
  Type,
  BookMarked,
  ExternalLink,
  FileText,
  StickyNote,
  X,
  Loader2,
  Save,
  Brain,
  Sparkles,
  Headphones,
  BookOpen,
  Layers,
  WifiOff,
} from "lucide-react";
import { TtsPlayer } from "./TtsPlayer";
import { ChapterCanvas } from "./ChapterCanvas";
import { HighlightStyles } from "./HighlightStyles";
import { stripMarkdown } from "@/components/ui/Markdown";

const ACCENT = "var(--ch-accent)";

// Lightweight inline markdown → JSX renderer (no external deps)
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Line-by-line parser that handles AI-generated structured summaries correctly.
function renderMarkdown(text: string, textColor: string): React.ReactElement {
  const raw = text.split("\n");
  const elements: React.ReactElement[] = [];
  let i = 0;
  let key = 0;

  while (i < raw.length) {
    const line = raw[i] ?? "";

    if (!line.trim()) { i++; continue; }

    // ── H2: section header ──
    if (line.startsWith("## ")) {
      elements.push(
        <div key={key++} className="mt-8 mb-3">
          <div
            className="font-mono text-[9px] tracking-[0.18em] uppercase font-bold mb-0.5"
            style={{ color: ACCENT }}
          >
            {line.slice(3)}
          </div>
          <div className="h-0.25 w-full" style={{ background: `color-mix(in srgb, var(--ch-accent) 16%, transparent)` }} />
        </div>
      );
      i++;
      continue;
    }

    // ── H3 ──
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-[14px] font-bold mt-4.5 mb-1" style={{ color: textColor }}>
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // ── Blockquote ──
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < raw.length && (raw[i]?.startsWith("> ") ?? false)) {
        quoteLines.push((raw[i] ?? "").replace(/^>\s?/, ""));
        i++;
      }
      elements.push(
        <div
          key={key++}
          className="my-3 px-4 py-3 rounded-[10px]"
          style={{ background: `color-mix(in srgb, var(--ch-accent) 7%, transparent)` }}
        >
          <p className="italic text-[13px] leading-[1.75] m-0" style={{ color: textColor, opacity: 0.9 }}>
            &ldquo;{renderInline(quoteLines.join(" "))}&rdquo;
          </p>
        </div>
      );
      continue;
    }

    // ── Bullet list ──
    if (line.trimStart().startsWith("- ")) {
      const items: string[] = [];
      while (i < raw.length && (raw[i]?.trimStart().startsWith("- ") ?? false)) {
        items.push((raw[i] ?? "").replace(/^\s*-\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={key++} className="space-y-2 my-2.5 list-none p-0">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2.5 text-[14px] leading-[1.65]" style={{ color: textColor }}>
              <span
                className="mt-2 w-1.25 h-1.25 rounded-full shrink-0"
                style={{ background: ACCENT, opacity: 0.7 }}
              />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Numbered insight ──
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const num = numMatch[1] ?? "";
      const titleLine = numMatch[2] ?? "";
      i++;

      const descLines: string[] = [];
      const quoteLines: string[] = [];
      while (i < raw.length) {
        const next = raw[i] ?? "";
        if (!next.trim()) { i++; break; }
        if (next.startsWith("## ") || next.startsWith("### ") || /^\d+\.\s/.test(next) || next.trimStart().startsWith("- ")) break;
        if (next.startsWith("> ")) { quoteLines.push(next.replace(/^>\s?/, "")); }
        else { descLines.push(next); }
        i++;
      }

      elements.push(
        <div
          key={key++}
          className="flex items-start gap-3.5 my-4.5 rounded-xl px-3.5 py-3.5"
          style={{ background: `color-mix(in srgb, var(--ch-accent) 3%, transparent)` }}
        >
          <span
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono font-bold mt-0.25"
            style={{ background: ACCENT, color: "var(--ch-bg)" }}
          >
            {num}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold leading-[1.4] mb-1.5" style={{ color: textColor }}>
              {renderInline(titleLine)}
            </div>
            {descLines.length > 0 && (
              <p className="text-[13px] leading-[1.75] m-0" style={{ color: textColor, opacity: 0.85 }}>
                {renderInline(descLines.join(" "))}
              </p>
            )}
            {quoteLines.length > 0 && (
              <div
                className="mt-2.5 px-3 py-2 rounded-lg"
                style={{ background: `color-mix(in srgb, var(--ch-accent) 8%, transparent)` }}
              >
                <p className="italic text-[12px] leading-[1.6] m-0" style={{ color: textColor, opacity: 0.8 }}>
                  &ldquo;{renderInline(quoteLines.join(" "))}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      );
      continue;
    }

    // ── Regular paragraph ──
    const paragraphLines: string[] = [];
    while (i < raw.length) {
      const next = raw[i] ?? "";
      if (!next.trim()) { i++; break; }
      if (next.startsWith("## ") || next.startsWith("### ") || next.startsWith("> ") || next.trimStart().startsWith("- ") || /^\d+\.\s/.test(next)) break;
      paragraphLines.push(next);
      i++;
    }
    if (paragraphLines.length > 0) {
      elements.push(
        <p key={key++} className="text-[14px] leading-[1.8] m-0" style={{ color: textColor }}>
          {renderInline(paragraphLines.join(" "))}
        </p>
      );
    }
  }

  return <div className="space-y-1.5">{elements}</div>;
}

type ReaderTheme = "white" | "sepia" | "dark" | "oled";

// Warm, print-like palettes — pure white/black backgrounds are harsh over
// long reading sessions, so every theme is tinted slightly toward paper.
const THEMES: Record<ReaderTheme, { bg: string; text: string; label: string }> =
  {
    white: { bg: "#FBF9F4", text: "#211E19", label: "Paper" },
    sepia: { bg: "#F5EBD6", text: "#3B2F1E", label: "Sepia" },
    dark: { bg: "#1B1A17", text: "#E8E3DA", label: "Dark" },
    oled: { bg: "#000000", text: "#D9D4CB", label: "OLED" },
  };


interface TextSelection {
  text: string;
  x: number;
  y: number;
}

interface Props {
  book: ChBook;
}

export function ChReaderClient({ book }: Props): React.ReactElement {
  const [theme, setTheme] = useState<ReaderTheme>("white");
  const [fontSize, setFontSize] = useState(17);
  const [pdfScale, setPdfScale] = useState(1.0);
  // Mirrors PdfReader's old uncontrolled-mode default — now needed here since
  // ReaderClient always controls `scale`, which suppresses that effect there.
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPdfScale(window.innerWidth < 768 ? 0.75 : 1.0);
    }
  }, []);
  const [isOffline, setIsOffline] = useState(
    typeof window !== "undefined" ? !navigator.onLine : false
  );

  // Track online/offline status
  useEffect(() => {
    const handleOnline = (): void => setIsOffline(false);
    const handleOffline = (): void => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Offline highlight queueing
  const queueHighlightOffline = useCallback((highlight: { text: string; cfi_range?: string; color: string; page_number?: number }): void => {
    try {
      const key = `chapterly_queued_highlights_${book.id}`;
      const existing = localStorage.getItem(key);
      const list = existing ? JSON.parse(existing) : [];
      list.push(highlight);
      localStorage.setItem(key, JSON.stringify(list));
      console.info("[pwa] Queued highlight offline:", highlight);
    } catch (e) {
      console.error("[pwa] Failed to queue highlight:", e);
    }
  }, [book.id]);

  // Sync queued progress and highlights when coming back online
  useEffect(() => {
    if (isOffline) return;

    const syncQueued = async (): Promise<void> => {
      try {
        // 1. Sync Highlights
        const hKey = `chapterly_queued_highlights_${book.id}`;
        const queuedH = localStorage.getItem(hKey);
        if (queuedH) {
          const list = JSON.parse(queuedH) as { text: string; cfi_range?: string; color: string; page_number?: number }[];
          for (const h of list) {
            await fetch("/api/chapterly/highlights", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ book_id: book.id, ...h }),
            });
          }
          localStorage.removeItem(hKey);
          console.info("[pwa] Successfully synced offline highlights.");
        }

        // 2. Sync Progress
        const pKey = `chapterly_queued_progress_${book.id}`;
        const queuedP = localStorage.getItem(pKey);
        if (queuedP) {
          const updates = JSON.parse(queuedP);
          await fetch(`/api/chapterly/books/${book.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });
          localStorage.removeItem(pKey);
          console.info("[pwa] Successfully synced offline progress.");
        }
      } catch (e) {
        console.error("[pwa] Syncing queued data failed:", e);
      }
    };

    void syncQueued();
  }, [isOffline, book.id]);
  const [showControls, setShowControls] = useState(true);
  const [showTtsPlayer, setShowTtsPlayer] = useState(false);
  const [chapterText, setChapterText] = useState("");
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);

  // Phase 2: doc rendering
  const [docContent, setDocContent] = useState<string | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  // Phase 3: quick note panel
  const [showNotePanel, setShowNotePanel] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  // AI Summary States
  const [showSummary, setShowSummary] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [showSummaryTts, setShowSummaryTts] = useState(false);

  // Phase 3: text selection → highlight
  const [showChapterCanvas, setShowChapterCanvas] = useState(false);

  const [textSelection, setTextSelection] = useState<TextSelection | null>(
    null
  );

  // Saved highlights for this book — painted onto epub pages (via annotations)
  // and text-format content (via the CSS Custom Highlight API).
  const [savedHighlights, setSavedHighlights] = useState<
    { id: string; text: string; color: HighlightColor; style: HighlightStyle; cfi_range: string | null; page_number: number | null }[]
  >([]);

  const [liveProgress, setLiveProgress] = useState<number>(book.progress_pct ?? 0);

  // Swipe gesture for text-format page scrolling
  const swipeTouchStartRef = useRef<{ x: number; y: number } | null>(null);

  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objUrl: string | null = null;
    if (book.file_url.startsWith("local://")) {
      const localId = book.file_url.replace("local://", "");
      import("@/lib/chapterly/idb").then(({ getLocalFile }) => {
        getLocalFile(localId).then((blob) => {
          if (!active) return;
          if (blob) {
            objUrl = URL.createObjectURL(blob);
            setResolvedUrl(objUrl);
          } else {
            console.error("[reader] Local file not found in IndexedDB");
          }
        });
      });
    } else {
      setResolvedUrl(book.file_url);
    }
    return () => {
      active = false;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [book.file_url]);

  const sessionStartRef = useRef<number>(Date.now());
  // Prevents double-firing: visibilitychange (hidden) + cleanup can both call
  // logSession in the same navigation event. Track whether this session was
  // already logged so the second call is a no-op.
  const sessionLoggedRef = useRef(false);
  const notePanelRef = useRef<HTMLTextAreaElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingProgressRef = useRef<{ current_page?: number; progress_pct?: number; total_pages?: number } | null>(null);

  const current = THEMES[theme];
  const isTextFormat = ["docx", "txt", "md", "html", "fb2"].includes(
    book.file_format
  );
  const isPdf = book.file_format === "pdf";
  const isEpub = book.file_format === "epub";

  // Memoized so PdfReader's repaint effect (which walks the text layer and
  // forces layout via getBoundingClientRect) only re-fires when highlights
  // actually change, not on every unrelated ReaderClient re-render.
  const pdfSavedHighlights = useMemo(
    () =>
      savedHighlights.map((h) => ({
        id: h.id,
        text: h.text,
        color: h.color,
        style: h.style,
        page: h.page_number,
      })),
    [savedHighlights]
  );

  // ── Session tracking ──────────────────────────────────────────
  useEffect(() => {
    sessionStartRef.current = Date.now();
    sessionLoggedRef.current = false;

    const logSession = (): void => {
      if (sessionLoggedRef.current) return;
      const duration = Math.round(
        (Date.now() - sessionStartRef.current) / 1000
      );
      if (duration < 10) return;
      sessionLoggedRef.current = true;
      const localDate = new Date().toLocaleDateString("en-CA");
      const blob = new Blob(
        [JSON.stringify({ book_id: book.id, duration_seconds: duration, local_date: localDate })],
        { type: "application/json" }
      );
      navigator.sendBeacon("/api/chapterly/session", blob);
      // Fire-and-forget achievement check — use sendBeacon so it survives page unload
      navigator.sendBeacon("/api/chapterly/achievements", new Blob(["{}"], { type: "application/json" }));
    };

    const handleVisibility = (): void => {
      if (document.visibilityState === "hidden") {
        logSession();
      } else {
        // Tab became visible again — start a new session segment
        sessionStartRef.current = Date.now();
        sessionLoggedRef.current = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      logSession();
    };
  }, [book.id]);

  // ── Load saved highlights for this book ───────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/chapterly/highlights?book_id=${book.id}`);
        if (!res.ok) return;
        const data = await res.json() as {
          highlights: { id: string; text: string; color: HighlightColor; style: HighlightStyle; cfi_range: string | null; page_number: number | null }[];
        };
        if (!cancelled) setSavedHighlights(data.highlights);
      } catch (err) {
        console.error("[reader] highlights fetch error:", err);
      }
    })();
    return () => { cancelled = true; };
  }, [book.id]);

  // ── Paint saved highlights onto text-format content ───────────
  // Uses the CSS Custom Highlight API (Chrome 105+, Safari 17.2+, FF 140+):
  // finds each saved snippet in the rendered text nodes and registers a
  // styled Range — no DOM mutation, survives re-renders.
  useEffect(() => {
    if (!isTextFormat || !docContent) return;
    const registry = (CSS as unknown as { highlights?: Map<string, unknown> }).highlights;
    const HighlightCtor = (window as unknown as { Highlight?: new (...ranges: Range[]) => unknown }).Highlight;
    if (!registry || !HighlightCtor) return; // unsupported browser — highlights still save, just aren't painted

    const raf = requestAnimationFrame(() => {
      const container = document.getElementById("reader-content");
      if (!container) return;

      const byColor = new Map<HighlightColor, Range[]>();
      for (const h of savedHighlights) {
        const range = findTextRange(container, h.text);
        if (!range) continue;
        const list = byColor.get(h.color) ?? [];
        list.push(range);
        byColor.set(h.color, list);
      }

      for (const { id } of HIGHLIGHT_COLORS) {
        const ranges = byColor.get(id) ?? [];
        if (ranges.length > 0) registry.set(`ch-${id}`, new HighlightCtor(...ranges));
        else registry.delete(`ch-${id}`);
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [isTextFormat, docContent, savedHighlights]);

  // ── Document loading for text-based formats ───────────────────
  useEffect(() => {
    if (!isTextFormat || !resolvedUrl) return;
    setDocLoading(true);

    (async () => {
      try {
        const res = await fetch(resolvedUrl);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        if (book.file_format === "docx") {
          const buffer = await res.arrayBuffer();
          const mammoth = await import("mammoth");
          const result = await mammoth.default.convertToHtml({
            arrayBuffer: buffer,
          });
          setDocContent(result.value);
        } else {
          const text = await res.text();
          setDocContent(text);
        }
      } catch (err) {
        console.error("[reader] doc load error:", err);
        setDocContent(null);
      } finally {
        setDocLoading(false);
      }
    })();
  }, [resolvedUrl, book.file_format, isTextFormat]);

  // ── Controls auto-hide ────────────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reset = (): void => {
      setShowControls(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowControls(false), 4000);
    };
    window.addEventListener("mousemove", reset);
    window.addEventListener("touchstart", reset);
    reset();
    return () => {
      window.removeEventListener("mousemove", reset);
      window.removeEventListener("touchstart", reset);
      clearTimeout(timer);
    };
  }, []);

  // ── Debrief pill: show after 3 minutes of reading ────────────
  useEffect(() => {
    const timer = setTimeout(() => setShowDebrief(true), 3 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);

  // ── TTS helpers ───────────────────────────────────────────────
  const getTtsText = useCallback((): string => {
    if (chapterText) return chapterText;
    const el = document.getElementById("reader-content");
    return el?.innerText?.trim() || book.title;
  }, [chapterText, book.title]);

  // ── Progress persistence (debounced 2 s, flushed on unmount) ──
  const saveProgress = useCallback(
    (updates: { current_page?: number; progress_pct?: number; total_pages?: number }): void => {
      pendingProgressRef.current = updates;
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      progressTimerRef.current = setTimeout(() => {
        pendingProgressRef.current = null;
        if (navigator.onLine) {
          void fetch(`/api/chapterly/books/${book.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          }).catch((err: unknown) => console.error("[reader] progress save error:", err));
        } else {
          try {
            const key = `chapterly_queued_progress_${book.id}`;
            const existing = localStorage.getItem(key);
            const merged = existing ? { ...JSON.parse(existing), ...updates } : updates;
            localStorage.setItem(key, JSON.stringify(merged));
            console.info("[pwa] Queued progress offline:", merged);
          } catch (e) {
            console.error("[pwa] Failed to queue progress:", e);
          }
        }
      }, 2000);
    },
    [book.id]
  );

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      const pending = pendingProgressRef.current;
      if (pending) {
        // Flush on unmount (in-app navigation). fetch may not complete on full tab close
        // but survives normal Next.js client-side route changes.
        if (navigator.onLine) {
          void fetch(`/api/chapterly/books/${book.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pending),
          }).catch(() => undefined);
        } else {
          try {
            const key = `chapterly_queued_progress_${book.id}`;
            const existing = localStorage.getItem(key);
            const merged = existing ? { ...JSON.parse(existing), ...pending } : pending;
            localStorage.setItem(key, JSON.stringify(merged));
          } catch {}
        }
      }
    };
  }, [book.id]);

  const handleMetadata = useCallback((meta: { title?: string; author?: string; coverUrl?: string }) => {
    const updates: Record<string, string | null> = {};
    let needsUpdate = false;

    if (meta.title && book.title !== meta.title) {
      updates.title = meta.title;
      needsUpdate = true;
    }
    if (meta.author && !book.author) {
      updates.author = meta.author;
      needsUpdate = true;
    }
    if (meta.coverUrl && !book.cover_url) {
      updates.cover_url = meta.coverUrl;
      needsUpdate = true;
    }

    if (needsUpdate) {
      void fetch(`/api/chapterly/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).catch((err) => console.error("[reader] metadata save error:", err));
    }
  }, [book.id, book.title, book.author, book.cover_url]);

  // ── Scroll progress tracking for text-based formats ───────────
  useEffect(() => {
    if (!isTextFormat || docLoading || !docContent) return;

    const handleScroll = (): void => {
      const container = document.getElementById("reader-text-container");
      if (!container) return;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      if (scrollHeight <= 0) {
        setLiveProgress(100);
        saveProgress({ progress_pct: 100 });
        return;
      }
      const pct = Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));
      setLiveProgress(pct);
      saveProgress({ progress_pct: pct });
    };

    const container = document.getElementById("reader-text-container");
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }
    // Run once on load/render to compute current scroll/progress
    handleScroll();

    return () => {
      const containerToClean = document.getElementById("reader-text-container");
      if (containerToClean) {
        containerToClean.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isTextFormat, docLoading, docContent, saveProgress]);

  // ── Restore scroll position for text-based formats ────────────
  useEffect(() => {
    if (!isTextFormat || docLoading || !docContent) return;
    const pct = book.progress_pct ?? 0;
    if (pct > 0) {
      const timer = setTimeout(() => {
        const container = document.getElementById("reader-text-container");
        if (container) {
          const scrollHeight = container.scrollHeight - container.clientHeight;
          if (scrollHeight > 0) {
            container.scrollTo({ top: Math.round((pct / 100) * scrollHeight), behavior: "instant" });
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isTextFormat, docLoading, docContent, book.progress_pct]);

  // ── Text selection → highlight ────────────────────────────────
  const handleTextSelectionEnd = (): void => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setTextSelection(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    // rect.top is already viewport-relative — no scrollY adjustment needed for position:fixed toolbar
    setTextSelection({
      text: sel.toString().trim().slice(0, 2000),
      x: rect.left + rect.width / 2,
      y: rect.top - 56,
    });
  };

  const saveHighlight = async (color: HighlightColor): Promise<void> => {
    if (!textSelection) return;
    const selectionText = textSelection.text;
    setTextSelection(null);
    window.getSelection()?.removeAllRanges();
    try {
      const res = await fetch("/api/chapterly/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: book.id,
          text: selectionText,
          color,
        }),
      });
      if (!res.ok) throw new Error("Highlight save failed");
      const { highlight } = await res.json() as { highlight: { id: string } };
      // Paint immediately — the highlight effect re-runs off this state
      setSavedHighlights((prev) => [
        ...prev,
        { id: highlight.id, text: selectionText, color, style: "highlight", cfi_range: null, page_number: null },
      ]);
    } catch (err) {
      console.error("[reader] highlight error:", err);
    }
  };

  const saveHighlightAsFlashcard = async (customText?: string): Promise<void> => {
    const textToUse = customText || textSelection?.text;
    if (!textToUse) return;
    
    setTextSelection(null);
    window.getSelection()?.removeAllRanges();

    try {
      // 1. Create highlight
      const hlRes = await fetch("/api/chapterly/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: book.id,
          text: textToUse,
          color: "yellow",
        }),
      });
      if (!hlRes.ok) throw new Error("Highlight save failed");
      const { highlight } = await hlRes.json();

      // 2. Convert to flashcard
      const fcRes = await fetch("/api/chapterly/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          highlight_id: highlight.id,
          book_id: book.id,
        }),
      });
      if (!fcRes.ok) throw new Error("Flashcard creation failed");
    } catch (err) {
      console.error("[reader] flashcard save error:", err);
    }
  };

  // ── Quick note ────────────────────────────────────────────────
  const saveNote = async (): Promise<void> => {
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      const res = await fetch("/api/chapterly/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: book.id, content_md: noteText.trim() }),
      });
      if (!res.ok) throw new Error("Note save failed");
      setNoteText("");
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch (err) {
      console.error("[reader] note save error:", err);
    } finally {
      setNoteSaving(false);
    }
  };

  const openSummaryPanel = async (): Promise<void> => {
    setShowSummary(true);
    setSummaryLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("ch_notes")
        .select("content_md")
        .eq("book_id", book.id)
        .eq("chapter_title", "AI Book Summary")
        .maybeSingle();

      if (data) {
        setSummaryText(data.content_md);
      } else {
        setSummaryText("");
      }
    } catch (err) {
      console.error("[reader] summary fetch error:", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const startSummaryStream = async (): Promise<void> => {
    setGeneratingSummary(true);
    setSummaryText("");
    try {
      const res = await fetch("/api/chapterly/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: book.id,
          book_title: book.title,
          book_author: book.author,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errData.error || "Failed to generate summary");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream available");

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setSummaryText((prev) => prev + text);
      }
    } catch (err) {
      setSummaryText((prev) => prev + `\n\n[Error: ${err instanceof Error ? err.message : "Generation failed"}]`);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const openNotePanel = (): void => {
    setShowNotePanel(true);
    setTimeout(() => notePanelRef.current?.focus(), 50);
  };

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ background: current.bg, color: current.text }}
    >
      <HighlightStyles />

      {/* ── Top bar ── */}
      <div
        className={`fixed top-0 max-[1024px]:top-15 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-5 h-14 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: current.bg + "F2",
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${current.text}15`,
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/tools/chapterly/library"
            className="flex items-center gap-1.5 no-underline font-mono text-[10px] tracking-[0.12em] uppercase transition-opacity hover:opacity-60"
            style={{ color: current.text }}
          >
            <ArrowLeft size={14} />
            Library
          </Link>
          <span
            className="font-mono text-[9px] opacity-40"
            style={{ color: current.text }}
          >
            ·
          </span>
          <span
            className="font-mono text-[11px] truncate max-w-[100px] sm:max-w-[180px]"
            style={{ color: current.text, opacity: 0.7 }}
          >
            {book.title}
          </span>
          {isOffline && (
            <span
              className="font-mono text-[8px] tracking-widest uppercase font-bold px-2 py-0.75 rounded-full inline-flex items-center gap-1 shrink-0"
              style={{ background: "#EF44441F", color: "#EF4444" }}
              title="You are currently reading offline"
            >
              <WifiOff size={10} />
              Offline
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Font size (or zoom, for PDFs which render to canvas) */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() =>
                isPdf
                  ? setPdfScale((s) => Math.max(0.5, +(s - 0.1).toFixed(2)))
                  : setFontSize((s) => Math.max(12, s - 1))
              }
              className="w-7.5 h-7.5 flex items-center justify-center rounded-md border-none cursor-pointer transition-opacity hover:opacity-60"
              style={{ background: current.text + "12", color: current.text }}
              aria-label={isPdf ? "Zoom out" : "Decrease font size"}
            >
              <Type size={11} />
            </button>
            <span
              className="font-mono text-[10px] w-6.5 text-center"
              style={{ color: current.text, opacity: 0.6 }}
            >
              {isPdf ? `${Math.round(pdfScale * 100)}%` : fontSize}
            </span>
            <button
              onClick={() =>
                isPdf
                  ? setPdfScale((s) => Math.min(3, +(s + 0.1).toFixed(2)))
                  : setFontSize((s) => Math.min(32, s + 1))
              }
              className="w-7.5 h-7.5 flex items-center justify-center rounded-md border-none cursor-pointer transition-opacity hover:opacity-60"
              style={{ background: current.text + "12", color: current.text }}
              aria-label={isPdf ? "Zoom in" : "Increase font size"}
            >
              <Type size={15} />
            </button>
          </div>

          {/* Theme */}
          <button
            onClick={() => setShowThemePanel((v) => !v)}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-md border-none cursor-pointer transition-opacity hover:opacity-60"
            style={{ background: current.text + "12", color: current.text }}
            aria-label="Toggle theme"
          >
            {theme === "dark" || theme === "oled" ? (
              <Sun size={14} />
            ) : (
              <Moon size={14} />
            )}
          </button>

          {/* TTS */}
          <button
            onClick={() => setShowTtsPlayer((v) => !v)}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-md border-none cursor-pointer transition-opacity hover:opacity-60"
            style={{
              background: showTtsPlayer ? "color-mix(in srgb, var(--ch-accent) 19%, transparent)" : current.text + "12",
              color: showTtsPlayer ? ACCENT : current.text,
            }}
            aria-label={showTtsPlayer ? "Close TTS player" : "Read aloud"}
          >
            <Volume2 size={14} />
          </button>

          {/* Quick note */}
          <button
            onClick={openNotePanel}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-md border-none cursor-pointer transition-opacity hover:opacity-60"
            style={{ background: current.text + "12", color: current.text }}
            aria-label="Add note"
            title="Add quick note"
          >
            <StickyNote size={14} />
          </button>

          {/* Notes page */}
          <Link
            href={`/tools/chapterly/notes/${book.id}`}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-md no-underline transition-opacity hover:opacity-60"
            style={{ background: current.text + "12", color: current.text }}
            aria-label="All notes & highlights"
            title="Notes & highlights"
          >
            <FileText size={14} />
          </Link>

          {/* AI Chat */}
          <Link
            href={`/tools/chapterly/chat/${book.id}`}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-md no-underline transition-opacity hover:opacity-60"
            style={{ background: current.text + "12", color: current.text }}
            aria-label="Open AI chat"
            title="AI chat"
          >
            <MessageSquare size={14} />
          </Link>

          {/* AI Summary */}
          <button
            onClick={() => void openSummaryPanel()}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-md border-none cursor-pointer transition-opacity hover:opacity-60"
            style={{ background: current.text + "12", color: current.text }}
            aria-label="Open AI summary"
            title="AI book summary"
          >
            <Sparkles size={14} />
          </button>

          {/* Chapter Canvas — only available when text content is loaded */}
          {isTextFormat && docContent && (
            <button
              onClick={() => setShowChapterCanvas(true)}
              className="w-7.5 h-7.5 flex items-center justify-center rounded-md border-none cursor-pointer transition-opacity hover:opacity-60"
              style={{
                background: showChapterCanvas ? "color-mix(in srgb, var(--ch-accent) 19%, transparent)" : current.text + "12",
                color: showChapterCanvas ? ACCENT : current.text,
              }}
              aria-label="Chapter canvas"
              title="Chapter canvas"
            >
              <Layers size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Theme panel */}
      {showThemePanel && (
        <div
          className="fixed top-16 right-5 z-50 rounded-xl p-4 shadow-xl border"
          style={{ background: current.bg, borderColor: current.text + "20" }}
        >
          <div
            className="font-mono text-[9px] tracking-[0.12em] uppercase mb-3"
            style={{ color: current.text, opacity: 0.5 }}
          >
            Theme
          </div>
          <div className="flex gap-2">
            {(Object.keys(THEMES) as ReaderTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  setShowThemePanel(false);
                }}
                className="w-10 h-10 rounded-lg border-0.5 cursor-pointer transition-all"
                style={{
                  background: THEMES[t].bg,
                  borderColor: t === theme ? ACCENT : "transparent",
                  outline:
                    t === theme ? `2px solid ${ACCENT}` : "1px solid #00000020",
                }}
                title={THEMES[t].label}
                aria-label={`Switch to ${THEMES[t].label} theme`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Reader area ── */}
      <div className="flex-1 pt-14">
        {isEpub ? (
          <div className="h-[calc(100vh-56px)] overflow-y-auto overscroll-contain" data-lenis-prevent="true">
            {resolvedUrl ? (
              <EpubReader
                url={resolvedUrl}
                theme={current}
              fontSize={fontSize}
              initialProgress={book.progress_pct}
              savedHighlights={savedHighlights
                .filter((h): h is typeof h & { cfi_range: string } => h.cfi_range !== null)
                .map((h) => ({ cfi_range: h.cfi_range, color: h.color }))}
              onChapterText={setChapterText}
              onProgress={(pct, saveToDb = true) => {
                setLiveProgress(pct);
                if (saveToDb) {
                  saveProgress({ progress_pct: pct });
                }
              }}
              onMetadata={handleMetadata}
              onHighlight={async (text, cfi, color) => {
                const highlight = { text, cfi_range: cfi, color };
                if (!navigator.onLine) {
                  queueHighlightOffline(highlight);
                  return;
                }
                try {
                  const res = await fetch("/api/chapterly/highlights", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ book_id: book.id, ...highlight }),
                  });
                  if (!res.ok) throw new Error("Highlight save failed");
                } catch (err) {
                  console.error("[reader] epub highlight error:", err);
                }
              }}
            />
            ) : (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-muted-foreground" size={32} />
              </div>
            )}
          </div>
        ) : isPdf ? (
          <div className="overflow-auto h-[calc(100vh-56px)] overscroll-contain" style={{ background: current.bg }} data-lenis-prevent="true">
            {resolvedUrl ? (
              <PdfReader
                url={resolvedUrl}
                initialPage={book.current_page > 0 ? book.current_page : undefined}
              scale={pdfScale}
              onScaleChange={setPdfScale}
              savedHighlights={pdfSavedHighlights}
              onChapterText={setChapterText}
              onProgress={(page, total) => {
                const pct = Math.round((page / total) * 100);
                setLiveProgress(pct);
                saveProgress({ current_page: page, total_pages: total, progress_pct: pct });
              }}
              onMetadata={handleMetadata}
              onHighlight={async (text, color, page) => {
                const highlight = { text, color, page_number: page };
                if (!navigator.onLine) {
                  queueHighlightOffline(highlight);
                  return;
                }
                try {
                  const res = await fetch("/api/chapterly/highlights", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ book_id: book.id, ...highlight }),
                  });
                  if (!res.ok) throw new Error("Highlight save failed");
                  const { highlight: saved } = await res.json() as { highlight: { id: string } };
                  setSavedHighlights((prev) => [
                    ...prev,
                    { id: saved.id, text, color, style: "highlight", cfi_range: null, page_number: page },
                  ]);
                } catch (err) {
                  console.error("[reader] pdf highlight error:", err);
                }
              }}
              onUpdateHighlight={async (id, changes) => {
                try {
                  const res = await fetch("/api/chapterly/highlights", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id, ...changes }),
                  });
                  if (!res.ok) throw new Error("Highlight update failed");
                  setSavedHighlights((prev) =>
                    prev.map((h) => (h.id === id ? { ...h, ...changes } : h))
                  );
                } catch (err) {
                  console.error("[reader] pdf highlight update error:", err);
                }
              }}
              onDeleteHighlight={async (id) => {
                try {
                  const res = await fetch(`/api/chapterly/highlights?id=${id}`, { method: "DELETE" });
                  if (!res.ok) throw new Error("Highlight delete failed");
                  setSavedHighlights((prev) => prev.filter((h) => h.id !== id));
                } catch (err) {
                  console.error("[reader] pdf highlight delete error:", err);
                }
              }}
              onMakeFlashcard={saveHighlightAsFlashcard}
            />
            ) : (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-muted-foreground" size={32} />
              </div>
            )}
          </div>
        ) : isTextFormat ? (
          <div 
            id="reader-text-container" 
            className="overflow-y-auto overscroll-contain h-[calc(100vh-56px)]" 
            data-lenis-prevent="true"
          >
            <div
              id="reader-content"
              className="max-w-[72ch] mx-auto px-8 py-16 leading-[1.75]"
              style={{ fontSize: `${fontSize}px`, color: current.text }}
            onMouseUp={handleTextSelectionEnd}
            onTouchStart={(e) => {
              swipeTouchStartRef.current = {
                x: e.touches[0]?.clientX ?? 0,
                y: e.touches[0]?.clientY ?? 0,
              };
            }}
            onTouchEnd={(e) => {
              const start = swipeTouchStartRef.current;
              if (start) {
                const dx = (e.changedTouches[0]?.clientX ?? 0) - start.x;
                const dy = (e.changedTouches[0]?.clientY ?? 0) - start.y;
                if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                  // Horizontal swipe: scroll one viewport height
                  const container = document.getElementById("reader-text-container");
                  if (container) {
                    container.scrollBy({ top: dx < 0 ? container.clientHeight * 0.85 : -container.clientHeight * 0.85, behavior: "smooth" });
                  }
                  swipeTouchStartRef.current = null;
                  return;
                }
              }
              swipeTouchStartRef.current = null;
              handleTextSelectionEnd();
            }}
          >
            {docLoading ? (
              <div
                className="flex items-center justify-center py-30 gap-3"
                style={{ color: current.text, opacity: 0.4 }}
              >
                <Loader2 size={20} className="animate-spin" />
                <span className="font-mono text-[12px] tracking-widest uppercase">
                  Loading…
                </span>
              </div>
            ) : docContent ? (
              book.file_format === "docx" ? (
                <div
                  className="prose-reader"
                  style={{
                    // Reset mammoth's inline font colors to respect the reader theme
                    color: current.text,
                  }}
                  // User controls their own content; no cross-user XSS risk
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: docContent }}
                />
              ) : book.file_format === "md" ? (
                <div className="prose-reader" style={{ color: current.text }}>
                  {renderMarkdown(docContent, current.text)}
                </div>
              ) : book.file_format === "html" ? (
                <div
                  className="prose-reader"
                  style={{ color: current.text }}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: docContent }}
                />
              ) : (
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    margin: 0,
                    color: current.text,
                  }}
                >
                  {docContent}
                </pre>
              )
            ) : (
              <div className="text-center py-20">
                <BookMarked
                  size={48}
                  className="mx-auto mb-6 opacity-20"
                  style={{ color: current.text }}
                />
                <div
                  className="font-display text-[24px] font-normal mb-3"
                  style={{ color: current.text }}
                >
                  Could not load document
                </div>
                <a
                  href={book.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase font-semibold no-underline px-5 py-3 rounded-lg transition-opacity hover:opacity-80"
                  style={{ background: ACCENT, color: "var(--ch-bg)" }}
                >
                  <ExternalLink size={14} />
                  Open in new tab
                </a>
              </div>
            )}
          </div>
        </div>
        ) : (
          <div
            id="reader-content"
            className="max-w-[68ch] mx-auto px-6 py-16 leading-[1.75]"
            style={{ fontSize: `${fontSize}px`, color: current.text }}
          >
            <div className="text-center py-20">
              <BookMarked
                size={48}
                className="mx-auto mb-6 opacity-20"
                style={{ color: current.text }}
              />
              <div
                className="font-display text-[24px] font-normal mb-3"
                style={{ color: current.text }}
              >
                {book.title}
              </div>
              {book.author && (
                <div
                  className="font-mono text-[12px] tracking-widest uppercase mb-8"
                  style={{ color: current.text, opacity: 0.5 }}
                >
                  {book.author}
                </div>
              )}
              <a
                href={book.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase font-semibold no-underline px-5 py-3 rounded-lg transition-opacity hover:opacity-80"
                style={{ background: ACCENT, color: "var(--ch-bg)" }}
              >
                <ExternalLink size={14} />
                Open in new tab
              </a>
              <p
                className="mt-5 text-[13px] max-w-[40ch] mx-auto leading-[1.6]"
                style={{ color: current.text, opacity: 0.5 }}
              >
                Inline reading for {book.file_format.toUpperCase()} coming soon.
                Your session is still tracked.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Text selection highlight toolbar ── */}
      {textSelection && (
        <div
          className="fixed z-50 flex items-center gap-1.5 px-2.5 py-2 rounded-[10px] shadow-xl border"
          style={{
            left: `${textSelection.x}px`,
            top: `${textSelection.y}px`,
            transform: "translateX(-50%)",
            background: "#1A1A1A",
            borderColor: "#ffffff18",
          }}
        >
          <span className="font-mono text-[9px] tracking-widest uppercase text-(--bg) opacity-50 mr-0.5">
            Highlight
          </span>
          {HIGHLIGHT_COLORS.map(({ id, bg, ring }) => (
            <button
              key={id}
              onClick={() => void saveHighlight(id)}
              className="w-5 h-5 rounded-full border-0.5 cursor-pointer transition-transform hover:scale-110"
              style={{ background: bg, borderColor: ring }}
              aria-label={`Highlight ${id}`}
              title={id}
            />
          ))}
          <button
            onClick={() => void saveHighlightAsFlashcard()}
            className="ml-1 px-2 py-1 rounded bg-(--ch-accent) hover:opacity-90 text-(--ch-bg) font-mono text-[9px] uppercase tracking-wider font-semibold cursor-pointer border-none flex items-center gap-1 transition-colors"
            title="Add to flashcards"
          >
            <Brain size={11} />
            <span>Flashcard</span>
          </button>
          <button
            onClick={() => setTextSelection(null)}
            className="ml-0.5 w-4.5 h-4.5 flex items-center justify-center rounded-full border-none cursor-pointer opacity-40 hover:opacity-80 bg-transparent"
            style={{ color: "var(--ch-bg)" }}
            aria-label="Dismiss"
          >
            <X size={10} />
          </button>
        </div>
      )}

      {/* ── Quick note slide-in panel ── */}
      {showNotePanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotePanel(false)}
            aria-hidden="true"
          />
          <div
            className="fixed top-14 max-[1024px]:top-[116px] right-0 bottom-0 z-50 w-90 max-[480px]:w-full flex flex-col shadow-2xl border-l"
            style={{ background: current.bg, borderColor: current.text + "20" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: current.text + "15" }}
            >
              <div className="flex items-center gap-2">
                <StickyNote size={14} style={{ color: ACCENT }} />
                <span
                  className="font-mono text-[10px] tracking-[0.12em] uppercase font-semibold"
                  style={{ color: current.text }}
                >
                  Quick Note
                </span>
              </div>
              <button
                onClick={() => setShowNotePanel(false)}
                className="w-7 h-7 flex items-center justify-center rounded-md border-none cursor-pointer transition-opacity hover:opacity-60 bg-transparent"
                style={{ color: current.text }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <textarea
              ref={notePanelRef}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={`Thoughts on "${book.title}"…`}
              className="flex-1 resize-none px-5 py-4 text-[14px] leading-[1.65] outline-none border-none bg-transparent"
              style={{ color: current.text, fontFamily: "inherit" }}
            />

            <div
              className="px-5 py-4 border-t flex items-center justify-between"
              style={{ borderColor: current.text + "15" }}
            >
              <Link
                href={`/tools/chapterly/notes/${book.id}`}
                className="font-mono text-[10px] tracking-widest uppercase no-underline transition-opacity hover:opacity-60"
                style={{ color: current.text, opacity: 0.5 }}
                onClick={() => setShowNotePanel(false)}
              >
                All notes →
              </Link>
              <button
                onClick={() => void saveNote()}
                disabled={noteSaving || !noteText.trim()}
                className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-3.5 py-2 rounded-lg border-none cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: noteSaved ? "#16A34A" : ACCENT,
                  color: "var(--ch-bg)",
                }}
              >
                {noteSaving ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                {noteSaved ? "Saved!" : "Save note"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── TTS floating player ── */}
      {showTtsPlayer && (
        <TtsPlayer
          text={getTtsText()}
          theme={current}
          onClose={() => setShowTtsPlayer(false)}
        />
      )}

      {/* ── Session debrief pill (appears after 3 min) ── */}
      {showDebrief && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-lg"
          style={{
            background: current.bg,
            border: `1px solid ${current.text}18`,
          }}
        >
          <span
            className="font-mono text-[10px] tracking-[0.08em] uppercase"
            style={{ color: current.text, opacity: 0.7 }}
          >
            Good session — want to discuss what you read?
          </span>
          <Link
            href={`/tools/chapterly/chat/${book.id}`}
            className="shrink-0 font-mono text-[9px] tracking-widest uppercase font-semibold no-underline px-2.5 py-1.25 rounded-md transition-opacity hover:opacity-80"
            style={{ background: ACCENT, color: "var(--ch-bg)" }}
          >
            AI chat
          </Link>
          <button
            onClick={() => setShowDebrief(false)}
            className="shrink-0 w-4.5 h-4.5 flex items-center justify-center rounded-full border-none cursor-pointer bg-transparent transition-opacity hover:opacity-60"
            style={{ color: current.text, opacity: 0.4 }}
            aria-label="Dismiss"
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* ── AI Summary slide-in panel ── */}
      {showSummary && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSummary(false)}
            aria-hidden="true"
          />
          <div
            className="fixed top-14 max-[1024px]:top-[116px] right-0 bottom-0 z-50 w-105 max-[560px]:w-full flex flex-col shadow-2xl border-l overflow-hidden"
            style={{ background: current.bg, borderColor: current.text + "20" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b shrink-0"
              style={{ borderColor: current.text + "15" }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles size={14} style={{ color: ACCENT }} />
                <span
                  className="font-mono text-[10px] tracking-[0.12em] uppercase font-semibold shrink-0"
                  style={{ color: current.text }}
                >
                  AI Summary
                </span>
                <span
                  className="font-mono text-[9px] opacity-40 truncate"
                  style={{ color: current.text }}
                >
                  · {book.title}
                </span>
              </div>
              <button
                onClick={() => setShowSummary(false)}
                className="w-7 h-7 flex items-center justify-center rounded-md border-none cursor-pointer transition-opacity hover:opacity-60 bg-transparent shrink-0"
                style={{ color: current.text }}
                aria-label="Close summary"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5" data-lenis-prevent="true">
              {summaryLoading ? (
                <div
                  className="flex items-center justify-center py-15 gap-2.5"
                  style={{ color: current.text, opacity: 0.4 }}
                >
                  <Loader2 size={18} className="animate-spin" />
                  <span className="font-mono text-[11px] tracking-widest uppercase">
                    Loading…
                  </span>
                </div>
              ) : summaryText ? (
                <div>
                  {showSummaryTts && (
                    <div className="mb-4">
                      <TtsPlayer
                        text={stripMarkdown(summaryText)}
                        onClose={() => setShowSummaryTts(false)}
                        theme={{ bg: current.bg, text: current.text }}
                      />
                    </div>
                  )}
                  {renderMarkdown(summaryText, current.text)}
                  {generatingSummary && (
                    <span
                      className="inline-flex items-center gap-1.5 mt-2 font-mono text-[10px] tracking-widest uppercase opacity-50"
                      style={{ color: current.text }}
                    >
                      <Loader2 size={10} className="animate-spin" />
                    </span>
                  )}
                </div>
              ) : !generatingSummary ? (
                <div className="text-center py-15">
                  <Sparkles
                    size={32}
                    className="mx-auto mb-4"
                    style={{ color: ACCENT, opacity: 0.4 }}
                  />
                  <div
                    className="text-[15px] font-semibold mb-2"
                    style={{ color: current.text }}
                  >
                    No summary yet
                  </div>
                  <p
                    className="text-[13px] mb-7 max-w-[260px] mx-auto leading-[1.6]"
                    style={{ color: current.text, opacity: 0.5 }}
                  >
                    Generate a Headway-style 15-minute structured summary of this book using AI.
                  </p>
                  <button
                    onClick={() => void startSummaryStream()}
                    className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-4.5 py-2.5 rounded-lg border-none cursor-pointer transition-opacity hover:opacity-90"
                    style={{ background: ACCENT, color: "var(--ch-bg)" }}
                  >
                    <Sparkles size={13} />
                    Generate Summary
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 py-15 justify-center"
                  style={{ color: ACCENT, opacity: 0.6 }}
                >
                  <Loader2 size={16} className="animate-spin" />
                  <span className="font-mono text-[11px] tracking-widest uppercase">
                    Generating…
                  </span>
                </div>
              )}
            </div>

            {summaryText && !generatingSummary && (
              <div
                className="px-5 py-3.5 border-t shrink-0 space-y-2.5"
                style={{ borderColor: current.text + "15" }}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSummaryTts((v) => !v)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 font-mono text-[9px] tracking-widest uppercase font-semibold px-3 py-2 rounded-lg border-none cursor-pointer transition-all"
                    style={
                      showSummaryTts
                        ? { background: ACCENT, color: "var(--ch-bg)" }
                        : { background: "color-mix(in srgb, var(--ch-accent) 8%, transparent)", color: ACCENT }
                    }
                  >
                    <Headphones size={11} />
                    {showSummaryTts ? "Stop audio" : "Listen"}
                  </button>
                  <a
                    href={`/tools/chapterly/notes/${book.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 font-mono text-[9px] tracking-widest uppercase font-semibold px-3 py-2 rounded-lg no-underline transition-all"
                    style={{ background: current.text + "10", color: current.text, opacity: 0.7 }}
                  >
                    <BookOpen size={11} />
                    View in notes
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[9px] tracking-[0.08em] uppercase"
                    style={{ color: current.text, opacity: 0.3 }}
                  >
                    Saved as book summary
                  </span>
                  <button
                    onClick={() => void startSummaryStream()}
                    className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase border-none cursor-pointer bg-transparent transition-opacity hover:opacity-60"
                    style={{ color: ACCENT }}
                  >
                    <Sparkles size={11} />
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Progress bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 h-0.75 z-50"
        style={{ background: current.text + "20" }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${liveProgress}%`, background: ACCENT }}
        />
      </div>

      {/* ── Chapter Canvas overlay ── */}
      {showChapterCanvas && docContent && (
        <ChapterCanvas
          bookId={book.id}
          bookTitle={book.title}
          docContent={docContent}
          onClose={() => setShowChapterCanvas(false)}
          onSaveFlashcard={saveHighlightAsFlashcard}
        />
      )}
    </div>
  );
}
