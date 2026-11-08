"use client";

import { useState, useRef, useCallback } from "react";
import { X, BookOpen, Bookmark, Share2, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { stripMarkdown } from "@/components/ui/Markdown";

const ACCENT = "var(--ch-accent)";
const ACCENT_SOFT = "color-mix(in srgb, var(--ch-accent) 10%, transparent)";

interface Chapter {
  number: number;
  title: string;
  quote: string;
  takeaway: string;
}

interface Props {
  bookId: string;
  bookTitle: string;
  docContent: string;
  onClose: () => void;
  onSaveFlashcard: (text: string) => Promise<void>;
}

// Parse docContent into 3-12 chapters via ## headings or numbered section heuristic
function parseChapters(text: string): Chapter[] {
  const lines = text.split("\n");
  const chapters: Chapter[] = [];

  // Try heading-based split first (##, ###, or numbered "Chapter N")
  const sectionIndices: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (
      line.startsWith("## ") ||
      line.startsWith("### ") ||
      /^chapter\s+\d+/i.test(line.trim()) ||
      /^\d+[\.\)]\s+[A-Z]/.test(line.trim())
    ) {
      sectionIndices.push(i);
    }
  }

  if (sectionIndices.length >= 2) {
    const cap = Math.min(sectionIndices.length, 12);
    for (let s = 0; s < cap; s++) {
      const start = sectionIndices[s] ?? 0;
      const end = sectionIndices[s + 1] ?? lines.length;
      const sectionLines = lines.slice(start, end).filter((l) => l.trim());
      const rawTitle = (sectionLines[0] ?? "")
        .replace(/^#+\s*/, "")
        .replace(/^chapter\s+\d+[\.\:—\s]*/i, "")
        .replace(/^\d+[\.\)]\s+/, "")
        .trim();
      const title = stripMarkdown(rawTitle) || `Chapter ${s + 1}`;
      const body = sectionLines.slice(1).join(" ").trim();
      const quote = extractQuote(body);
      const takeaway = extractTakeaway(body);
      chapters.push({ number: s + 1, title, quote, takeaway });
    }
    return chapters;
  }

  // Fallback: split into equal thirds, min 3 chunks, max 6
  const wordCount = text.trim().split(/\s+/).length;
  const chunkCount = Math.min(Math.max(3, Math.floor(wordCount / 400)), 6);
  const words = text.trim().split(/\s+/);
  const chunkSize = Math.ceil(words.length / chunkCount);
  for (let i = 0; i < chunkCount; i++) {
    const chunk = words.slice(i * chunkSize, (i + 1) * chunkSize).join(" ");
    chapters.push({
      number: i + 1,
      title: `Part ${i + 1}`,
      quote: extractQuote(chunk),
      takeaway: extractTakeaway(chunk),
    });
  }
  return chapters;
}

function extractQuote(text: string): string {
  // Prefer blockquote-style lines
  const quoted = text.match(/[""]([^"""]{20,200})[""]|^>\s*(.{20,200})/m);
  if (quoted) return stripMarkdown((quoted[1] ?? quoted[2] ?? "").trim());
  // First full sentence that reads like a key statement
  const sentences = text.match(/[A-Z][^.!?]{30,200}[.!?]/g) ?? [];
  return stripMarkdown(sentences[0]?.trim() ?? text.slice(0, 180).trim());
}

function extractTakeaway(text: string): string {
  // Look for "key takeaway", "lesson", "remember", "in summary" patterns
  const match = text.match(
    /(?:key takeaway|takeaway|lesson|remember|in summary|conclusion)[:\s—]+([^.!?]{20,220}[.!?])/i
  );
  if (match) return stripMarkdown(match[1]?.trim() ?? "");
  // Last substantive sentence
  const sentences = text.match(/[A-Z][^.!?]{30,200}[.!?]/g) ?? [];
  const last = sentences[sentences.length - 1];
  return stripMarkdown(last?.trim() ?? text.slice(-180).trim());
}

export function ChapterCanvas({ bookId, bookTitle, docContent, onClose, onSaveFlashcard }: Props): React.ReactElement {
  const chapters = useRef<Chapter[]>(parseChapters(docContent)).current;
  const [current, setCurrent] = useState(0);
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const chapter = chapters[current];
  const total = chapters.length;

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent((c) => Math.min(total - 1, c + 1)), [total]);

  const handleSave = async (): Promise<void> => {
    if (!chapter || saving) return;
    setSaving(true);
    try {
      await onSaveFlashcard(`${chapter.quote}\n\n${chapter.takeaway}`);
      setSavedIdx((prev) => new Set(prev).add(current));
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async (): Promise<void> => {
    if (!chapter || sharing) return;
    setSharing(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = 1080;
      const H = 1080;
      canvas.width = W;
      canvas.height = H;

      // Background
      ctx.fillStyle = "#0f1a1e";
      ctx.fillRect(0, 0, W, H);

      // Accent strip at top
      ctx.fillStyle = ACCENT;
      ctx.fillRect(0, 0, W, 8);

      // Chapter label
      ctx.fillStyle = ACCENT;
      ctx.font = "bold 28px monospace";
      ctx.fillText(`CHAPTER ${chapter.number} · ${bookTitle.toUpperCase().slice(0, 40)}`, 80, 80);

      // Title
      ctx.fillStyle = "#f0ebe4";
      ctx.font = "bold 56px serif";
      wrapText(ctx, chapter.title, 80, 160, W - 160, 68);

      // Quote
      ctx.fillStyle = "#a89e8a";
      ctx.font = "italic 36px serif";
      const qY = wrapText(ctx, `"${chapter.quote}"`, 80, 340, W - 160, 46);

      // Divider
      ctx.fillStyle = "color-mix(in srgb, var(--ch-accent) 38%, transparent)";
      ctx.fillRect(80, qY + 20, 200, 2);

      // Takeaway label
      ctx.fillStyle = ACCENT;
      ctx.font = "bold 22px monospace";
      ctx.fillText("KEY TAKEAWAY", 80, qY + 60);

      // Takeaway text
      ctx.fillStyle = "#d4cfc9";
      ctx.font = "32px sans-serif";
      wrapText(ctx, chapter.takeaway, 80, qY + 100, W - 160, 40);

      // Bottom branding
      ctx.fillStyle = "#a89e8a";
      ctx.font = "20px monospace";
      ctx.fillText("chapterly · creator suite", 80, H - 60);

      const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));

      if (navigator.share && navigator.canShare({ files: [new File([blob], "chapter.png", { type: "image/png" })] })) {
        await navigator.share({
          title: `${chapter.title} — ${bookTitle}`,
          text: `"${chapter.quote}"\n\nKey takeaway: ${chapter.takeaway}`,
          files: [new File([blob], "chapter.png", { type: "image/png" })],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chapter-${chapter.number}-${bookTitle.slice(0, 20).replace(/\s+/g, "-")}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (err) {
      console.error("[chapter-canvas] share error:", err);
    } finally {
      setSharing(false);
    }
  };

  if (!chapter) return <></>;

  const isSaved = savedIdx.has(current);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-0.75"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Canvas (hidden, used for share export) */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[600px] max-h-[90vh] mx-4 flex flex-col rounded-[20px] shadow-2xl overflow-hidden"
        style={{ background: "var(--bg)", border: "1px solid var(--rule)" }}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between px-6 py-4.5 border-b border-(--rule)"
          style={{ background: "var(--bg-2)" }}
        >
          <div className="flex items-center gap-2.5">
            <BookOpen size={16} style={{ color: ACCENT }} />
            <div>
              <div className="font-mono text-[8px] tracking-[0.14em] uppercase" style={{ color: ACCENT }}>
                Chapter Canvas
              </div>
              <div className="text-[13px] font-semibold text-(--ink) leading-[1.2]">
                {bookTitle.length > 36 ? `${bookTitle.slice(0, 36)}…` : bookTitle}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7.5 h-7.5 flex items-center justify-center rounded-lg border-none bg-transparent cursor-pointer hover:bg-(--bg-3) text-muted-foreground"
            aria-label="Close chapter canvas"
          >
            <X size={16} />
          </button>
        </div>

        {/* Chapter nav strip */}
        <div className="shrink-0 flex items-center gap-1.5 px-6 py-3 overflow-x-auto scrollbar-none border-b border-(--rule)">
          {chapters.map((ch, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="shrink-0 font-mono text-[9px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-full border cursor-pointer transition-all"
              style={
                i === current
                  ? { background: ACCENT, color: "var(--ch-bg)", borderColor: ACCENT }
                  : { background: "transparent", color: "var(--ink-3)", borderColor: "var(--rule)" }
              }
            >
              {ch.number}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-7 py-7">
          {/* Chapter number + title */}
          <div className="mb-6">
            <div className="font-mono text-[9px] tracking-[0.16em] uppercase mb-1.5" style={{ color: ACCENT }}>
              Chapter {chapter.number} of {total}
            </div>
            <h2 className="text-[22px] font-semibold text-(--ink) leading-[1.3] m-0">
              {chapter.title}
            </h2>
          </div>

          {/* Quote */}
          <div
            className="rounded-xl px-5 py-4 mb-6"
            style={{ background: ACCENT_SOFT }}
          >
            <div className="font-mono text-[8px] tracking-[0.14em] uppercase mb-2" style={{ color: ACCENT }}>
              Key Quote
            </div>
            <blockquote className="text-[14px] leading-[1.75] text-(--ink) m-0 italic">
              &ldquo;{chapter.quote}&rdquo;
            </blockquote>
          </div>

          {/* Takeaway */}
          <div className="mb-2">
            <div className="font-mono text-[8px] tracking-[0.14em] uppercase mb-2" style={{ color: ACCENT }}>
              Key Takeaway
            </div>
            <p className="text-[14px] leading-[1.7] text-secondary-foreground m-0">
              {chapter.takeaway}
            </p>
          </div>
        </div>

        {/* Actions footer */}
        <div
          className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-(--rule)"
          style={{ background: "var(--bg-2)" }}
        >
          {/* Prev / Next */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              disabled={current === 0}
              className="w-8.5 h-8.5 flex items-center justify-center rounded-lg border-none cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "var(--bg-3)", color: "var(--ink-2)" }}
              aria-label="Previous chapter"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              disabled={current === total - 1}
              className="w-8.5 h-8.5 flex items-center justify-center rounded-lg border-none cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: "var(--bg-3)", color: "var(--ink-2)" }}
              aria-label="Next chapter"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Save + Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => void handleSave()}
              disabled={isSaved || saving}
              className="flex items-center gap-1.5 h-8.5 px-3.5 rounded-lg border-none cursor-pointer font-mono text-[10px] tracking-[0.08em] uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={
                isSaved
                  ? { background: "#16A34A15", color: "#16A34A" }
                  : { background: ACCENT_SOFT, color: ACCENT }
              }
            >
              {saving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : isSaved ? (
                <Check size={12} />
              ) : (
                <Bookmark size={12} />
              )}
              {isSaved ? "Saved" : "Flashcard"}
            </button>

            <button
              onClick={() => void handleShare()}
              disabled={sharing}
              className="flex items-center gap-1.5 h-8.5 px-3.5 rounded-lg border-none cursor-pointer font-mono text-[10px] tracking-[0.08em] uppercase text-(--ch-bg) transition-all disabled:opacity-60"
              style={{ background: shared ? "#16A34A" : ACCENT }}
            >
              {sharing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : shared ? (
                <Check size={12} />
              ) : (
                <Share2 size={12} />
              )}
              {shared ? "Shared!" : "Share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Returns the Y position after last text line
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      line = word;
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, curY);
    curY += lineHeight;
  }
  return curY;
}
