"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { HIGHLIGHT_COLORS } from "@/lib/chapterly/types";
import type { ChBook, HighlightColor } from "@/lib/chapterly/types";

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
} from "lucide-react";
import { TtsPlayer } from "./TtsPlayer";

const ACCENT = "#4F6D7A";

type ReaderTheme = "white" | "sepia" | "dark" | "oled";

const THEMES: Record<ReaderTheme, { bg: string; text: string; label: string }> =
  {
    white: { bg: "#FFFFFF", text: "#1A1A1A", label: "White" },
    sepia: { bg: "#F5ECD7", text: "#3B2F1E", label: "Sepia" },
    dark: { bg: "#1E1E1E", text: "#E8E4DE", label: "Dark" },
    oled: { bg: "#000000", text: "#E8E4DE", label: "OLED" },
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

  // Phase 3: text selection → highlight
  const [textSelection, setTextSelection] = useState<TextSelection | null>(
    null
  );

  const sessionStartRef = useRef<number>(Date.now());
  // Prevents double-firing: visibilitychange (hidden) + cleanup can both call
  // logSession in the same navigation event. Track whether this session was
  // already logged so the second call is a no-op.
  const sessionLoggedRef = useRef(false);
  const notePanelRef = useRef<HTMLTextAreaElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = THEMES[theme];
  const isTextFormat = ["docx", "txt", "md", "html", "fb2"].includes(
    book.file_format
  );
  const isPdf = book.file_format === "pdf";
  const isEpub = book.file_format === "epub";

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

  // ── Document loading for text-based formats ───────────────────
  useEffect(() => {
    if (!isTextFormat) return;
    setDocLoading(true);

    (async () => {
      try {
        const res = await fetch(book.file_url);
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
  }, [book.file_url, book.file_format, isTextFormat]);

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

  // ── Progress persistence (debounced 2 s) ──────────────────────
  const saveProgress = useCallback(
    (updates: { current_page?: number; progress_pct?: number; total_pages?: number }): void => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      progressTimerRef.current = setTimeout(() => {
        void fetch(`/api/chapterly/books/${book.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }).catch((err: unknown) => console.error("[reader] progress save error:", err));
      }, 2000);
    },
    [book.id]
  );

  // ── Text selection → highlight ────────────────────────────────
  const handleTextMouseUp = (): void => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setTextSelection(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setTextSelection({
      text: sel.toString().trim().slice(0, 2000),
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY - 52,
    });
  };

  const saveHighlight = async (color: HighlightColor): Promise<void> => {
    if (!textSelection) return;
    setTextSelection(null);
    window.getSelection()?.removeAllRanges();
    try {
      const res = await fetch("/api/chapterly/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: book.id,
          text: textSelection.text,
          color,
        }),
      });
      if (!res.ok) throw new Error("Highlight save failed");
    } catch (err) {
      console.error("[reader] highlight error:", err);
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

  const openNotePanel = (): void => {
    setShowNotePanel(true);
    setTimeout(() => notePanelRef.current?.focus(), 50);
  };

  return (
    <div
      className="relative min-h-screen flex flex-col"
      style={{ background: current.bg, color: current.text }}
    >
      {/* ── Top bar ── */}
      <div
        className={`fixed top-0 max-[1024px]:top-[60px] left-0 right-0 z-50 flex items-center justify-between px-[16px] sm:px-[20px] h-[56px] transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: current.bg + "F2",
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${current.text}15`,
        }}
      >
        <div className="flex items-center gap-[16px]">
          <Link
            href="/tools/chapterly/library"
            className="flex items-center gap-[6px] no-underline font-mono text-[10px] tracking-[0.12em] uppercase transition-opacity hover:opacity-60"
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
        </div>

        <div className="flex items-center gap-[6px]">
          {/* Font size */}
          <div className="flex items-center gap-[2px]">
            <button
              onClick={() => setFontSize((s) => Math.max(12, s - 1))}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] border-none cursor-pointer transition-opacity hover:opacity-60"
              style={{ background: current.text + "12", color: current.text }}
              aria-label="Decrease font size"
            >
              <Type size={11} />
            </button>
            <span
              className="font-mono text-[10px] w-[26px] text-center"
              style={{ color: current.text, opacity: 0.6 }}
            >
              {fontSize}
            </span>
            <button
              onClick={() => setFontSize((s) => Math.min(32, s + 1))}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] border-none cursor-pointer transition-opacity hover:opacity-60"
              style={{ background: current.text + "12", color: current.text }}
              aria-label="Increase font size"
            >
              <Type size={15} />
            </button>
          </div>

          {/* Theme */}
          <button
            onClick={() => setShowThemePanel((v) => !v)}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] border-none cursor-pointer transition-opacity hover:opacity-60"
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
            className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] border-none cursor-pointer transition-opacity hover:opacity-60"
            style={{
              background: showTtsPlayer ? ACCENT + "30" : current.text + "12",
              color: showTtsPlayer ? ACCENT : current.text,
            }}
            aria-label={showTtsPlayer ? "Close TTS player" : "Read aloud"}
          >
            <Volume2 size={14} />
          </button>

          {/* Quick note */}
          <button
            onClick={openNotePanel}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] border-none cursor-pointer transition-opacity hover:opacity-60"
            style={{ background: current.text + "12", color: current.text }}
            aria-label="Add note"
            title="Add quick note"
          >
            <StickyNote size={14} />
          </button>

          {/* Notes page */}
          <Link
            href={`/tools/chapterly/notes/${book.id}`}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] no-underline transition-opacity hover:opacity-60"
            style={{ background: current.text + "12", color: current.text }}
            aria-label="All notes & highlights"
            title="Notes & highlights"
          >
            <FileText size={14} />
          </Link>

          {/* AI Chat */}
          <Link
            href={`/tools/chapterly/chat/${book.id}`}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] no-underline transition-opacity hover:opacity-60"
            style={{ background: current.text + "12", color: current.text }}
            aria-label="Open AI chat"
            title="AI chat"
          >
            <MessageSquare size={14} />
          </Link>
        </div>
      </div>

      {/* Theme panel */}
      {showThemePanel && (
        <div
          className="fixed top-[64px] right-[20px] z-50 rounded-[12px] p-[16px] shadow-xl border"
          style={{ background: current.bg, borderColor: current.text + "20" }}
        >
          <div
            className="font-mono text-[9px] tracking-[0.12em] uppercase mb-[12px]"
            style={{ color: current.text, opacity: 0.5 }}
          >
            Theme
          </div>
          <div className="flex gap-[8px]">
            {(Object.keys(THEMES) as ReaderTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  setShowThemePanel(false);
                }}
                className="w-[40px] h-[40px] rounded-[8px] border-[2px] cursor-pointer transition-all"
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
      <div className="flex-1 pt-[56px]">
        {isEpub ? (
          <div className="h-[calc(100vh-56px)]">
            <EpubReader
              url={book.file_url}
              theme={current}
              fontSize={fontSize}
              onChapterText={setChapterText}
              onProgress={(pct) => saveProgress({ progress_pct: pct })}
              onHighlight={async (text, cfi, color) => {
                try {
                  const res = await fetch("/api/chapterly/highlights", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ book_id: book.id, text, cfi_range: cfi, color }),
                  });
                  if (!res.ok) throw new Error("Highlight save failed");
                } catch (err) {
                  console.error("[reader] epub highlight error:", err);
                }
              }}
            />
          </div>
        ) : isPdf ? (
          <div className="overflow-auto h-[calc(100vh-56px)]" style={{ background: current.bg }}>
            <PdfReader
              url={book.file_url}
              onChapterText={setChapterText}
              onProgress={(page, total) =>
                saveProgress({
                  current_page: page,
                  total_pages: total,
                  progress_pct: Math.round((page / total) * 100),
                })
              }
              onHighlight={async (text, color) => {
                try {
                  const res = await fetch("/api/chapterly/highlights", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ book_id: book.id, text, color }),
                  });
                  if (!res.ok) throw new Error("Highlight save failed");
                } catch (err) {
                  console.error("[reader] pdf highlight error:", err);
                }
              }}
            />
          </div>
        ) : isTextFormat ? (
          <div
            id="reader-content"
            className="max-w-[72ch] mx-auto px-[32px] py-[64px] leading-[1.75] min-h-[calc(100vh-56px)]"
            style={{ fontSize: `${fontSize}px`, color: current.text }}
            onMouseUp={handleTextMouseUp}
          >
            {docLoading ? (
              <div
                className="flex items-center justify-center py-[120px] gap-[12px]"
                style={{ color: current.text, opacity: 0.4 }}
              >
                <Loader2 size={20} className="animate-spin" />
                <span className="font-mono text-[12px] tracking-[0.1em] uppercase">
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
              <div className="text-center py-[80px]">
                <BookMarked
                  size={48}
                  className="mx-auto mb-[24px] opacity-20"
                  style={{ color: current.text }}
                />
                <div
                  className="font-display text-[24px] font-normal mb-[12px]"
                  style={{ color: current.text }}
                >
                  Could not load document
                </div>
                <a
                  href={book.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-[8px] font-mono text-[11px] tracking-[0.12em] uppercase font-semibold no-underline px-[20px] py-[12px] rounded-[8px] transition-opacity hover:opacity-80"
                  style={{ background: ACCENT, color: "#fff" }}
                >
                  <ExternalLink size={14} />
                  Open in new tab
                </a>
              </div>
            )}
          </div>
        ) : (
          <div
            id="reader-content"
            className="max-w-[68ch] mx-auto px-[24px] py-[64px] leading-[1.75]"
            style={{ fontSize: `${fontSize}px`, color: current.text }}
          >
            <div className="text-center py-[80px]">
              <BookMarked
                size={48}
                className="mx-auto mb-[24px] opacity-20"
                style={{ color: current.text }}
              />
              <div
                className="font-display text-[24px] font-normal mb-[12px]"
                style={{ color: current.text }}
              >
                {book.title}
              </div>
              {book.author && (
                <div
                  className="font-mono text-[12px] tracking-[0.1em] uppercase mb-[32px]"
                  style={{ color: current.text, opacity: 0.5 }}
                >
                  {book.author}
                </div>
              )}
              <a
                href={book.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-[8px] font-mono text-[11px] tracking-[0.12em] uppercase font-semibold no-underline px-[20px] py-[12px] rounded-[8px] transition-opacity hover:opacity-80"
                style={{ background: ACCENT, color: "#fff" }}
              >
                <ExternalLink size={14} />
                Open in new tab
              </a>
              <p
                className="mt-[20px] text-[13px] max-w-[40ch] mx-auto leading-[1.6]"
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
          className="fixed z-50 flex items-center gap-[6px] px-[10px] py-[8px] rounded-[10px] shadow-xl border"
          style={{
            left: `${textSelection.x}px`,
            top: `${textSelection.y}px`,
            transform: "translateX(-50%)",
            background: "#1A1A1A",
            borderColor: "#ffffff18",
          }}
        >
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-(--bg) opacity-50 mr-[2px]">
            Highlight
          </span>
          {HIGHLIGHT_COLORS.map(({ id, bg, ring }) => (
            <button
              key={id}
              onClick={() => void saveHighlight(id)}
              className="w-[20px] h-[20px] rounded-full border-[2px] cursor-pointer transition-transform hover:scale-110"
              style={{ background: bg, borderColor: ring }}
              aria-label={`Highlight ${id}`}
              title={id}
            />
          ))}
          <button
            onClick={() => setTextSelection(null)}
            className="ml-[2px] w-[18px] h-[18px] flex items-center justify-center rounded-full border-none cursor-pointer opacity-40 hover:opacity-80 bg-transparent"
            style={{ color: "#fff" }}
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
            className="fixed top-[56px] right-0 bottom-0 z-50 w-[360px] max-[480px]:w-full flex flex-col shadow-2xl border-l"
            style={{ background: current.bg, borderColor: current.text + "20" }}
          >
            <div
              className="flex items-center justify-between px-[20px] py-[16px] border-b"
              style={{ borderColor: current.text + "15" }}
            >
              <div className="flex items-center gap-[8px]">
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
                className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border-none cursor-pointer transition-opacity hover:opacity-60 bg-transparent"
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
              className="flex-1 resize-none px-[20px] py-[16px] text-[14px] leading-[1.65] outline-none border-none bg-transparent"
              style={{ color: current.text, fontFamily: "inherit" }}
            />

            <div
              className="px-[20px] py-[16px] border-t flex items-center justify-between"
              style={{ borderColor: current.text + "15" }}
            >
              <Link
                href={`/tools/chapterly/notes/${book.id}`}
                className="font-mono text-[10px] tracking-[0.1em] uppercase no-underline transition-opacity hover:opacity-60"
                style={{ color: current.text, opacity: 0.5 }}
                onClick={() => setShowNotePanel(false)}
              >
                All notes →
              </Link>
              <button
                onClick={() => void saveNote()}
                disabled={noteSaving || !noteText.trim()}
                className="flex items-center gap-[6px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[14px] py-[8px] rounded-[8px] border-none cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: noteSaved ? "#16A34A" : ACCENT,
                  color: "#fff",
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
          className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-[12px] px-[16px] py-[10px] rounded-[12px] shadow-lg"
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
            className="shrink-0 font-mono text-[9px] tracking-[0.1em] uppercase font-semibold no-underline px-[10px] py-[5px] rounded-[6px] transition-opacity hover:opacity-80"
            style={{ background: ACCENT, color: "#fff" }}
          >
            AI chat
          </Link>
          <button
            onClick={() => setShowDebrief(false)}
            className="shrink-0 w-[18px] h-[18px] flex items-center justify-center rounded-full border-none cursor-pointer bg-transparent transition-opacity hover:opacity-60"
            style={{ color: current.text, opacity: 0.4 }}
            aria-label="Dismiss"
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* ── Progress bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 h-[3px] z-50"
        style={{ background: current.text + "20" }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${book.progress_pct}%`, background: ACCENT }}
        />
      </div>
    </div>
  );
}
