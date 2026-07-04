"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type {
  ChBook,
  ChNote,
  ChHighlight,
  HighlightColor,
} from "@/lib/chapterly/types";
import type { ConceptCard } from "@/app/api/chapterly/shorts/route";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  Download,
  BookOpen,
  StickyNote,
  Loader2,
  BookMarked,
  Brain,
  ExternalLink,
  Check,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Zap,
  ChevronRight,
  ChevronLeft,
  BookmarkPlus,
  Share2,
} from "lucide-react";

const ACCENT = "#4F6D7A";

const HIGHLIGHT_STYLES: Record<
  HighlightColor,
  { bg: string; border: string; label: string }
> = {
  yellow: { bg: "rgba(254,240,138,0.25)", border: "#CA8A04", label: "Yellow" },
  green: { bg: "rgba(187,247,208,0.25)", border: "#16A34A", label: "Green" },
  blue: { bg: "rgba(191,219,254,0.25)", border: "#1D4ED8", label: "Blue" },
  pink: { bg: "rgba(251,207,232,0.25)", border: "#9D174D", label: "Pink" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renderNoteContent(md: string): React.ReactElement {
  const lines = md.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith("> ")) {
      nodes.push(
        <blockquote
          key={i}
          className="pl-[12px] py-[8px] italic text-[13px] text-[var(--ink-3)] my-[8px]"
          style={{ borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}
        >
          {line.slice(2)}
        </blockquote>
      );
    } else {
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, pi) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={pi} className="font-semibold text-[var(--ink)]">{part.slice(2, -2)}</strong>
          : part
      );
      nodes.push(<p key={i} className="text-[14px] leading-[1.7] text-[var(--ink)] m-0 mb-[6px]">{parts}</p>);
    }
    i++;
  }
  return <div className="flex flex-col gap-[2px]">{nodes}</div>;
}

// ── NoteEditor ────────────────────────────────────────────────
// Defined at module scope so React sees a stable component type across renders.
// If defined inside ChNotesClient, every parent re-render produces a new type
// reference, causing React to unmount+remount the editor (losing focus).

interface NoteEditorProps {
  content: string;
  chapter: string;
  saving: boolean;
  onContent: (v: string) => void;
  onChapter: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder: string;
}

function NoteEditor({
  content,
  chapter,
  saving,
  onContent,
  onChapter,
  onSave,
  onCancel,
  placeholder,
}: NoteEditorProps): React.ReactElement {
  return (
    <div
      className="rounded-[12px] border p-[16px] space-y-[12px]"
      style={{ borderColor: ACCENT + "40", background: ACCENT + "06" }}
    >
      <input
        type="text"
        value={chapter}
        onChange={(e) => onChapter(e.target.value)}
        placeholder="Chapter or section (optional)"
        className="w-full text-[12px] font-mono tracking-[0.06em] px-[12px] py-[8px] rounded-[6px] border outline-none bg-[var(--bg)] text-[var(--ink)] placeholder:text-[var(--ink-3)]"
        style={{ borderColor: "var(--rule)" }}
      />
      <textarea
        value={content}
        onChange={(e) => onContent(e.target.value)}
        placeholder={placeholder}
        rows={5}
        autoFocus
        className="w-full resize-none text-[14px] leading-[1.65] px-[12px] py-[10px] rounded-[8px] border outline-none bg-[var(--bg)] text-[var(--ink)] placeholder:text-[var(--ink-3)]"
        style={{ borderColor: "var(--rule)" }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.metaKey) void onSave();
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
          ⌘↵ to save · Esc to cancel
        </span>
        <div className="flex gap-[8px]">
          <button
            onClick={onCancel}
            className="font-mono text-[10px] tracking-[0.1em] uppercase px-[12px] py-[6px] rounded-[6px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => void onSave()}
            disabled={saving || !content.trim()}
            className="flex items-center gap-[6px] font-mono text-[10px] tracking-[0.1em] uppercase px-[12px] py-[6px] rounded-[6px] border-none cursor-pointer font-semibold text-(--bg) transition-all disabled:opacity-40"
            style={{ background: ACCENT }}
          >
            {saving ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Save size={11} />
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Props {
  book: ChBook;
  initialNotes: ChNote[];
  initialHighlights: ChHighlight[];
}

export function ChNotesClient({
  book,
  initialNotes,
  initialHighlights,
}: Props): React.ReactElement {
  const [notes, setNotes] = useState<ChNote[]>(initialNotes);
  const [highlights, setHighlights] =
    useState<ChHighlight[]>(initialHighlights);
  const [tab, setTab] = useState<"notes" | "highlights" | "quiz" | "shorts">("notes");

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const generateQuiz = async (): Promise<void> => {
    setGeneratingQuiz(true);
    setQuizQuestions([]);
    setQuizScore(0);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setQuizSubmitted(false);
    setQuizFinished(false);

    try {
      const res = await fetch("/api/chapterly/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: book.id,
          book_title: book.title,
          book_author: book.author,
        }),
      });

      if (!res.ok) throw new Error("Quiz generation failed");
      const data = (await res.json()) as { questions: QuizQuestion[] };
      setQuizQuestions(data.questions);
    } catch (err) {
      console.error("[quiz] generation error:", err);
      alert("Failed to generate quiz. Please check your API settings and try again.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleAnswerSubmit = (): void => {
    if (selectedOptionIndex === null || quizSubmitted) return;
    const currentQ = quizQuestions[currentQuestionIndex];
    if (selectedOptionIndex === currentQ.correctIndex) {
      setQuizScore((s) => s + 1);
    }
    setQuizSubmitted(true);
  };

  const handleNextQuestion = (): void => {
    if (currentQuestionIndex + 1 >= quizQuestions.length) {
      setQuizFinished(true);
    } else {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedOptionIndex(null);
      setQuizSubmitted(false);
    }
  };

  // Shorts state
  const [shortsCards, setShortsCards] = useState<ConceptCard[]>([]);
  const [shortsIndex, setShortsIndex] = useState(0);
  const [shortsLoading, setShortsLoading] = useState(false);
  const [shortsError, setShortsError] = useState<string | null>(null);
  const [shortsSavedIds, setShortsSavedIds] = useState<Set<number>>(new Set());
  const [shortsSaving, setShortsSaving] = useState<number | null>(null);
  const [shareConceptIdx, setShareConceptIdx] = useState<number | null>(null);
  const dragStartX = useRef<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const generateShorts = async (): Promise<void> => {
    setShortsLoading(true);
    setShortsCards([]);
    setShortsIndex(0);
    setShortsError(null);
    setShortsSavedIds(new Set());
    try {
      const res = await fetch("/api/chapterly/shorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: book.id,
          book_title: book.title,
          book_author: book.author,
        }),
      });
      if (!res.ok) throw new Error("Shorts generation failed");
      const data = (await res.json()) as { cards: ConceptCard[] };
      setShortsCards(data.cards);
    } catch (err) {
      console.error("[shorts] generation error:", err);
      setShortsError(err instanceof Error ? err.message : "Failed to generate shorts. Check your API settings and try again.");
    } finally {
      setShortsLoading(false);
    }
  };

  const saveConceptAsNote = async (card: ConceptCard, idx: number): Promise<void> => {
    if (shortsSavedIds.has(idx) || shortsSaving === idx) return;
    setShortsSaving(idx);
    try {
      const content = `**${card.title}**\n\n${card.concept}\n\n${card.insight}${card.quote ? `\n\n> "${card.quote}"` : ""}`;
      const res = await fetch("/api/chapterly/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: book.id,
          content_md: content,
          chapter_ref: "Concept Short",
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      const { note } = (await res.json()) as { note: ChNote };
      setNotes((prev) => [note, ...prev]);
      setShortsSavedIds((prev) => new Set([...prev, idx]));
    } catch (err) {
      console.error("[shorts] save note error:", err);
    } finally {
      setShortsSaving(null);
    }
  };

  const advanceCard = (direction: "next" | "prev"): void => {
    if (direction === "next" && shortsIndex < shortsCards.length - 1) {
      setShortsIndex((i) => i + 1);
    } else if (direction === "prev" && shortsIndex > 0) {
      setShortsIndex((i) => i - 1);
    }
    setDragDelta(0);
  };

  // Note editor state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editChapter, setEditChapter] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newChapter, setNewChapter] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [deletingHighlightId, setDeletingHighlightId] = useState<string | null>(
    null
  );
  const [flashcardingId, setFlashcardingId] = useState<string | null>(null);
  const [bridgeCopied, setBridgeCopied] = useState(false);
  const [shareHighlight, setShareHighlight] = useState<ChHighlight | null>(null);

  // ── Note CRUD ─────────────────────────────────────────────────

  const startEdit = (note: ChNote): void => {
    setEditingId(note.id);
    setEditContent(note.content_md);
    setEditChapter(note.chapter_ref ?? "");
    setAddingNew(false);
  };

  const cancelEdit = (): void => {
    setEditingId(null);
    setEditContent("");
    setEditChapter("");
  };

  const saveEdit = async (): Promise<void> => {
    if (!editingId || !editContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/chapterly/notes/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_md: editContent.trim(),
          chapter_ref: editChapter.trim() || null,
          chapter_title: editChapter.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      const { note } = (await res.json()) as { note: ChNote };
      setNotes((prev) => prev.map((n) => (n.id === editingId ? note : n)));
      cancelEdit();
    } catch (err) {
      console.error("[notes] update error:", err);
    } finally {
      setSaving(false);
    }
  };

  const createNote = async (): Promise<void> => {
    if (!newContent.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/chapterly/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: book.id,
          content_md: newContent.trim(),
          chapter_ref: newChapter.trim() || undefined,
          chapter_title: newChapter.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      const { note } = (await res.json()) as { note: ChNote };
      setNotes((prev) => [note, ...prev]);
      setNewContent("");
      setNewChapter("");
      setAddingNew(false);
    } catch (err) {
      console.error("[notes] create error:", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (noteId: string): Promise<void> => {
    setDeletingNoteId(noteId);
    try {
      const res = await fetch(`/api/chapterly/notes/${noteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error("[notes] delete error:", err);
    } finally {
      setDeletingNoteId(null);
    }
  };

  const makeFlashcard = async (highlight: ChHighlight): Promise<void> => {
    if (highlight.is_flashcard || flashcardingId === highlight.id) return;
    setFlashcardingId(highlight.id);
    try {
      const res = await fetch("/api/chapterly/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ highlight_id: highlight.id, book_id: book.id }),
      });
      if (!res.ok && res.status !== 409) throw new Error("Flashcard creation failed");
      setHighlights((prev) =>
        prev.map((h) => (h.id === highlight.id ? { ...h, is_flashcard: true } : h))
      );
    } catch (err) {
      console.error("[notes] flashcard error:", err);
    } finally {
      setFlashcardingId(null);
    }
  };

  const deleteHighlight = async (highlightId: string): Promise<void> => {
    setDeletingHighlightId(highlightId);
    try {
      const res = await fetch(`/api/chapterly/highlights/${highlightId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
    } catch (err) {
      console.error("[notes] delete highlight error:", err);
    } finally {
      setDeletingHighlightId(null);
    }
  };

  // ── BookBreaks bridge ─────────────────────────────────────────
  // Copies this book's highlights + notes as structured markdown so you can
  // paste them into BookBreaks → Thread Studio or Carousel Lab to create
  // social content from your reading.

  const copyForBookBreaks = async (): Promise<void> => {
    const lines: string[] = [
      `# ${book.title}${book.author ? ` — ${book.author}` : ""}`,
      "",
      `## Key Highlights (${highlights.length})`,
      "",
    ];

    for (const h of highlights) {
      lines.push(`> "${h.text}"`);
      if (h.note) lines.push(`> *${h.note}*`);
      lines.push("");
    }

    if (notes.length > 0) {
      lines.push("## Notes", "");
      for (const note of notes) {
        if (note.chapter_ref) lines.push(`### ${note.chapter_ref}`, "");
        lines.push(note.content_md, "");
      }
    }

    const md = lines.join("\n");
    try {
      await navigator.clipboard.writeText(md);
      setBridgeCopied(true);
      setTimeout(() => setBridgeCopied(false), 4000);
      window.open("/tools/bookbreaks", "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("[notes] clipboard error:", err);
    }
  };

  // ── Export ────────────────────────────────────────────────────

  const exportMarkdown = (): void => {
    const lines: string[] = [
      `# Notes — ${book.title}`,
      book.author ? `*by ${book.author}*` : "",
      "",
      `Exported ${new Date().toLocaleDateString()}`,
      "",
    ];

    if (notes.length > 0) {
      lines.push("## Notes", "");
      for (const note of notes) {
        if (note.chapter_ref) lines.push(`### ${note.chapter_ref}`, "");
        lines.push(note.content_md, "");
        lines.push(`*${formatDate(note.created_at)}*`, "", "---", "");
      }
    }

    if (highlights.length > 0) {
      lines.push("## Highlights", "");
      for (const h of highlights) {
        lines.push(`> ${h.text}`);
        if (h.note) lines.push(`> *${h.note}*`);
        lines.push(`> — *${h.color} · ${formatDate(h.created_at)}*`, "");
      }
    }

    const blob = new Blob(
      [lines.filter((l, i) => !(l === "" && lines[i - 1] === "")).join("\n")],
      {
        type: "text/markdown;charset=utf-8",
      }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book.title.replace(/[^a-z0-9]/gi, "_")}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-[40px] pt-[48px] pb-[48px] max-[1024px]:pt-[80px] max-[720px]:px-[24px] max-[720px]:pb-[32px] max-w-[800px]">
      {/* ── Header ── */}
      <div className="mb-[40px]">
        <div className="flex items-center gap-[12px] mb-[16px]">
          <Link
            href={`/tools/chapterly/read/${book.id}`}
            className="inline-flex items-center gap-[6px] font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] hover:text-[var(--ink)] no-underline transition-colors"
          >
            <ArrowLeft size={12} />
            Back to reader
          </Link>
          <span className="text-[var(--rule)]">·</span>
          <Link
            href={`/tools/chapterly/chat/${book.id}`}
            className="inline-flex items-center gap-[6px] font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] hover:text-[var(--ink)] no-underline transition-colors"
          >
            <BookMarked size={12} />
            AI chat
          </Link>
        </div>

        <div className="flex items-start justify-between gap-[16px] flex-wrap">
          <div>
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[6px]">
              {book.author ? `${book.author} · ` : ""}Notes & Highlights
            </div>
            <h1 className="font-display text-[28px] font-normal tracking-[-0.02em] fvs-text text-[var(--ink)] m-0 leading-[1.1]">
              {book.title}
            </h1>
          </div>
          <div className="flex items-center gap-[8px] flex-wrap mt-[12px] sm:mt-0">
            <div className="flex flex-col items-end gap-[4px]">
              <button
                onClick={() => void copyForBookBreaks()}
                disabled={highlights.length === 0 && notes.length === 0}
                className="shrink-0 inline-flex items-center gap-[6px] font-mono text-[10px] tracking-[0.1em] uppercase font-semibold px-[14px] py-[8px] rounded-[8px] border-none cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={
                  bridgeCopied
                    ? { background: "#16A34A", color: "#fff" }
                    : { background: "#C85A2C", color: "#fff" }
                }
                title="Copy your highlights as Markdown, then paste them into BookBreaks to generate threads or carousels from your reading"
              >
                {bridgeCopied ? <Check size={13} /> : <ExternalLink size={13} />}
                {bridgeCopied ? "Copied — paste in BookBreaks" : "Create content in BookBreaks"}
              </button>
              {!bridgeCopied && (highlights.length > 0 || notes.length > 0) && (
                <span className="font-mono text-[8px] tracking-[0.08em] text-[var(--ink-3)] opacity-60 max-w-[240px] text-right leading-[1.4]">
                  Copies your {highlights.length > 0 ? `${highlights.length} highlight${highlights.length !== 1 ? "s" : ""}` : "notes"} as Markdown · Paste into Thread Studio or Carousel Lab
                </span>
              )}
            </div>
            <button
              onClick={exportMarkdown}
              disabled={notes.length === 0 && highlights.length === 0}
              className="shrink-0 inline-flex items-center gap-[6px] font-mono text-[10px] tracking-[0.1em] uppercase font-semibold px-[14px] py-[8px] rounded-[8px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] hover:border-[var(--ink-2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download size={13} />
              Export .md
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-[2px] mb-[32px] p-[4px] rounded-[10px] bg-[var(--bg-2)] w-full sm:w-fit border border-[var(--rule)] flex-wrap">
        {(["notes", "highlights", "quiz", "shorts"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-[7px] px-[14px] py-[8px] rounded-[7px] font-mono text-[10px] tracking-[0.1em] uppercase font-semibold border-none cursor-pointer transition-all"
            style={
              tab === t
                ? { background: ACCENT, color: "#fff" }
                : { background: "transparent", color: "var(--ink-3)" }
            }
          >
            {t === "notes" && <StickyNote size={12} />}
            {t === "highlights" && <BookOpen size={12} />}
            {t === "quiz" && <Brain size={12} />}
            {t === "shorts" && <Zap size={12} />}
            {t === "notes" && `Notes${notes.length > 0 ? ` (${notes.length})` : ""}`}
            {t === "highlights" && `Highlights${highlights.length > 0 ? ` (${highlights.length})` : ""}`}
            {t === "quiz" && "AI Quiz"}
            {t === "shorts" && `Shorts${shortsCards.length > 0 ? ` (${shortsCards.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* ── Notes tab ── */}
      {tab === "notes" && (
        <div className="space-y-[16px]">
          {/* Add new */}
          {addingNew ? (
            <NoteEditor
              content={newContent}
              chapter={newChapter}
              saving={saving}
              onContent={setNewContent}
              onChapter={setNewChapter}
              onSave={createNote}
              onCancel={() => {
                setAddingNew(false);
                setNewContent("");
                setNewChapter("");
              }}
              placeholder={`Your thoughts on "${book.title}"…`}
            />
          ) : (
            <button
              onClick={() => {
                setAddingNew(true);
                setEditingId(null);
              }}
              className="w-full flex items-center gap-[10px] h-[52px] px-[16px] rounded-[12px] border border-dashed border-[var(--rule)] bg-transparent cursor-pointer font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--ink-3)] hover:text-[var(--ink)] hover:border-[var(--ink-2)] transition-all"
            >
              <Plus size={14} style={{ color: ACCENT }} />
              Add a note
            </button>
          )}

          {/* Note list */}
          {notes.length === 0 && !addingNew ? (
            <div className="text-center py-[64px]">
              <StickyNote
                size={36}
                className="mx-auto mb-[16px] text-[var(--ink-3)] opacity-30"
              />
              <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
                No notes yet
              </div>
              <div className="text-[13px] text-[var(--ink-3)] mt-[6px]">
                Use the sticky note button in the reader, or add one above.
              </div>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="rounded-[12px] border border-[var(--rule)] bg-[var(--bg-2)] overflow-hidden"
              >
                {editingId === note.id ? (
                  <div className="p-[16px]">
                    <NoteEditor
                      content={editContent}
                      chapter={editChapter}
                      saving={saving}
                      onContent={setEditContent}
                      onChapter={setEditChapter}
                      onSave={saveEdit}
                      onCancel={cancelEdit}
                      placeholder="Edit note…"
                    />
                  </div>
                ) : (
                  <div className="p-[20px]">
                    {note.chapter_ref && (
                      <div
                        className="font-mono text-[9px] tracking-[0.12em] uppercase mb-[10px] px-[8px] py-[3px] rounded-full inline-block"
                        style={{ background: ACCENT + "15", color: ACCENT }}
                      >
                        {note.chapter_ref}
                      </div>
                    )}
                    {renderNoteContent(note.content_md)}
                    <div className="flex items-center justify-between mt-[16px]">
                      <span className="font-mono text-[10px] text-[var(--ink-3)]">
                        {formatDate(note.created_at)}
                        {note.updated_at !== note.created_at && " · edited"}
                      </span>
                      <div className="flex gap-[6px]">
                        <button
                          onClick={() => startEdit(note)}
                          className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
                          aria-label="Edit note"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => void deleteNote(note.id)}
                          disabled={deletingNoteId === note.id}
                          className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-red-500 transition-colors disabled:opacity-40"
                          aria-label="Delete note"
                        >
                          {deletingNoteId === note.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Highlights tab ── */}
      {tab === "highlights" && (
        <div className="space-y-[12px]">
          {highlights.length === 0 ? (
            <div className="text-center py-[64px]">
              <BookOpen
                size={36}
                className="mx-auto mb-[16px] text-[var(--ink-3)] opacity-30"
              />
              <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
                No highlights yet
              </div>
              <div className="text-[13px] text-[var(--ink-3)] mt-[6px]">
                Select text in the reader and choose a highlight color.
              </div>
            </div>
          ) : (
            highlights.map((h) => {
              const style = HIGHLIGHT_STYLES[h.color];
              return (
                <div
                  key={h.id}
                  className="rounded-[12px] p-[20px] border"
                  style={{
                    background: style.bg,
                    borderColor: style.border + "60",
                  }}
                >
                  <blockquote
                    className="m-0 text-[15px] leading-[1.7] text-[var(--ink)] italic"
                    style={{ borderLeft: "none" }}
                  >
                    "{h.text}"
                  </blockquote>
                  {h.note && (
                    <p className="mt-[10px] text-[13px] text-[var(--ink-2)] not-italic">
                      {h.note}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-[14px]">
                    <div className="flex items-center gap-[8px]">
                      <div
                        className="w-[10px] h-[10px] rounded-full"
                        style={{ background: style.border }}
                      />
                      <span className="font-mono text-[10px] text-[var(--ink-3)]">
                        {style.label} · {formatDate(h.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-[6px]">
                      {/* Share card */}
                      <button
                        onClick={() => setShareHighlight(h)}
                        className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[#C85A2C] hover:border-[#C85A2C] transition-colors"
                        aria-label="Share as card"
                        title="Share as card"
                      >
                        <Share2 size={12} />
                      </button>
                      {/* Mark as flashcard */}
                      <button
                        onClick={() => void makeFlashcard(h)}
                        disabled={h.is_flashcard || flashcardingId === h.id}
                        className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border border-[var(--rule)] bg-transparent cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style={
                          h.is_flashcard
                            ? { color: ACCENT, borderColor: ACCENT + "40" }
                            : { color: "var(--ink-3)" }
                        }
                        aria-label={h.is_flashcard ? "Already a flashcard" : "Add to flashcards"}
                        title={h.is_flashcard ? "Already a flashcard" : "Add to flashcards"}
                      >
                        {flashcardingId === h.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Brain size={12} />
                        )}
                      </button>
                      <button
                        onClick={() => void deleteHighlight(h.id)}
                        disabled={deletingHighlightId === h.id}
                        className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-red-500 transition-colors disabled:opacity-40"
                        aria-label="Delete highlight"
                      >
                        {deletingHighlightId === h.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <X size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Shorts tab ── */}
      {tab === "shorts" && (
        <div>
          {/* Empty / loading / generate state */}
          {shortsCards.length === 0 && !shortsLoading && (
            <div className="text-center py-[64px] rounded-[20px] border border-[var(--rule)] bg-[var(--bg-2)] p-[32px] max-w-[480px] mx-auto">
              <div
                className="w-[60px] h-[60px] rounded-[16px] flex items-center justify-center mx-auto mb-[20px]"
                style={{ background: `${ACCENT}15` }}
              >
                <Zap size={28} style={{ color: ACCENT }} />
              </div>
              <h3 className="text-[18px] font-semibold text-[var(--ink)] m-0 mb-[8px]">
                Concept Shorts
              </h3>
              <p className="text-[13px] leading-[1.6] text-[var(--ink-3)] m-0 mb-[24px]">
                AI extracts the 6 most powerful concepts from &ldquo;{book.title}&rdquo; — distilled into snackable cards you can swipe through.
              </p>
              {shortsError && (
                <p className="text-[12px] text-red-500 mb-[16px] px-[12px] py-[8px] rounded-[8px] bg-[rgba(220,38,38,0.06)] border border-[rgba(220,38,38,0.15)]">
                  {shortsError}
                </p>
              )}
              <button
                onClick={() => void generateShorts()}
                className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[20px] py-[12px] rounded-[10px] border-none cursor-pointer transition-all hover:opacity-90 text-white"
                style={{ background: ACCENT }}
              >
                <Sparkles size={13} />
                {shortsError ? "Try Again" : "Generate Shorts"}
              </button>
            </div>
          )}

          {shortsLoading && (
            <div className="text-center py-[80px] rounded-[20px] border border-[var(--rule)] bg-[var(--bg-2)] p-[32px] max-w-[480px] mx-auto">
              <Loader2 size={32} className="animate-spin mx-auto mb-[16px]" style={{ color: ACCENT }} />
              <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
                Extracting Concepts…
              </div>
              <div className="text-[13px] text-[var(--ink-3)] mt-[6px]">
                Analyzing highlights and book themes. Give it a moment.
              </div>
            </div>
          )}

          {shortsCards.length > 0 && (
            <div className="max-w-[520px] mx-auto">
              {/* Progress */}
              <div className="flex items-center justify-between mb-[20px]">
                <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
                  Concept {shortsIndex + 1} of {shortsCards.length}
                </div>
                <div className="flex items-center gap-[6px]">
                  {shortsCards.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setShortsIndex(i); setDragDelta(0); }}
                      className="w-[6px] h-[6px] rounded-full border-none cursor-pointer transition-all p-0"
                      style={{ background: i === shortsIndex ? ACCENT : "var(--rule)", transform: i === shortsIndex ? "scale(1.4)" : "scale(1)" }}
                      aria-label={`Go to card ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => void generateShorts()}
                  className="flex items-center gap-[5px] font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] hover:text-[var(--ink)] border-none bg-transparent cursor-pointer transition-colors"
                >
                  <RefreshCw size={10} />
                  Redo
                </button>
              </div>

              {/* Card stack — decorative background cards */}
              <div className="relative h-[360px] mb-[24px]">
                {/* Back cards (decorative) */}
                {[2, 1].map((offset) => {
                  const nextIdx = (shortsIndex + offset) % shortsCards.length;
                  return (
                    <div
                      key={offset}
                      className="absolute inset-x-0 rounded-[20px] border border-[var(--rule)] bg-[var(--bg-2)]"
                      style={{
                        top: `${offset * 10}px`,
                        bottom: `-${offset * 4}px`,
                        transform: `scale(${1 - offset * 0.025}) rotate(${offset * 1.5}deg)`,
                        opacity: 1 - offset * 0.3,
                        zIndex: 10 - offset,
                      }}
                      aria-hidden="true"
                    >
                      {shortsCards[nextIdx] && (
                        <div className="p-[28px] opacity-20 pointer-events-none">
                          <div className="font-mono text-[9px] tracking-[0.12em] uppercase mb-[10px]" style={{ color: ACCENT }}>
                            concept
                          </div>
                          <div className="text-[16px] font-semibold text-[var(--ink)] leading-[1.3]">
                            {shortsCards[nextIdx].title}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Active card */}
                {(() => {
                  const card = shortsCards[shortsIndex];
                  const isSaved = shortsSavedIds.has(shortsIndex);
                  const saving = shortsSaving === shortsIndex;
                  return (
                    <div
                      className="absolute inset-0 rounded-[20px] border border-[var(--rule)] bg-[var(--bg-2)] p-[28px] flex flex-col z-20 select-none"
                      style={{
                        transform: isDragging ? `translateX(${dragDelta}px) rotate(${dragDelta * 0.04}deg)` : "translateX(0) rotate(0)",
                        transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                        cursor: isDragging ? "grabbing" : "grab",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                      }}
                      onMouseDown={(e) => {
                        dragStartX.current = e.clientX;
                        setIsDragging(true);
                      }}
                      onMouseMove={(e) => {
                        if (!isDragging || dragStartX.current === null) return;
                        setDragDelta(e.clientX - dragStartX.current);
                      }}
                      onMouseUp={() => {
                        if (Math.abs(dragDelta) > 80) {
                          advanceCard(dragDelta < 0 ? "next" : "prev");
                        } else {
                          setDragDelta(0);
                        }
                        setIsDragging(false);
                        dragStartX.current = null;
                      }}
                      onMouseLeave={() => {
                        if (isDragging) {
                          setDragDelta(0);
                          setIsDragging(false);
                          dragStartX.current = null;
                        }
                      }}
                      onTouchStart={(e) => {
                        dragStartX.current = e.touches[0].clientX;
                        setIsDragging(true);
                      }}
                      onTouchMove={(e) => {
                        if (dragStartX.current === null) return;
                        setDragDelta(e.touches[0].clientX - dragStartX.current);
                      }}
                      onTouchEnd={() => {
                        if (Math.abs(dragDelta) > 60) {
                          advanceCard(dragDelta < 0 ? "next" : "prev");
                        } else {
                          setDragDelta(0);
                        }
                        setIsDragging(false);
                        dragStartX.current = null;
                      }}
                    >
                      <div
                        className="font-mono text-[9px] tracking-[0.14em] uppercase mb-[12px] inline-block"
                        style={{ color: ACCENT }}
                      >
                        concept {shortsIndex + 1} / {shortsCards.length}
                      </div>
                      <h2 className="text-[20px] font-semibold text-[var(--ink)] leading-[1.3] m-0 mb-[10px]">
                        {card.title}
                      </h2>
                      <p className="text-[13px] font-medium text-[var(--ink-2)] leading-[1.5] m-0 mb-[14px]">
                        {card.concept}
                      </p>
                      <p className="text-[13px] leading-[1.7] text-[var(--ink-3)] m-0 flex-1">
                        {card.insight}
                      </p>
                      {card.quote && (
                        <blockquote
                          className="mt-[14px] mb-0 pl-[12px] text-[12px] italic leading-[1.6] text-[var(--ink-3)]"
                          style={{ borderLeft: "none", borderTop: "1px solid var(--rule)", paddingTop: "12px" }}
                        >
                          &ldquo;{card.quote}&rdquo;
                        </blockquote>
                      )}
                      <div className="mt-[16px] flex items-center justify-between gap-[8px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareConceptIdx(shortsIndex);
                          }}
                          className="flex items-center gap-[6px] font-mono text-[9px] tracking-[0.1em] uppercase font-semibold px-[12px] py-[7px] rounded-[8px] border cursor-pointer transition-all"
                          style={{ background: "transparent", color: "var(--ink-3)", borderColor: "var(--rule)" }}
                          title="Share this concept"
                        >
                          <Share2 size={10} />
                          Share
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void saveConceptAsNote(card, shortsIndex);
                          }}
                          disabled={isSaved || saving}
                          className="flex items-center gap-[6px] font-mono text-[9px] tracking-[0.1em] uppercase font-semibold px-[12px] py-[7px] rounded-[8px] border cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={
                            isSaved
                              ? { background: "#16A34A", color: "#fff", borderColor: "#16A34A" }
                              : { background: "transparent", color: "var(--ink-3)", borderColor: "var(--rule)" }
                          }
                          title="Save as note"
                        >
                          {saving ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : isSaved ? (
                            <Check size={10} />
                          ) : (
                            <BookmarkPlus size={10} />
                          )}
                          {isSaved ? "Saved" : "Save to notes"}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => advanceCard("prev")}
                  disabled={shortsIndex === 0}
                  className="flex items-center gap-[6px] font-mono text-[10px] tracking-[0.1em] uppercase px-[14px] py-[9px] rounded-[8px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] hover:border-[var(--ink-2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={13} />
                  Prev
                </button>
                <span className="font-mono text-[9px] text-[var(--ink-3)] opacity-60">
                  drag or click to navigate
                </span>
                <button
                  onClick={() => advanceCard("next")}
                  disabled={shortsIndex === shortsCards.length - 1}
                  className="flex items-center gap-[6px] font-mono text-[10px] tracking-[0.1em] uppercase px-[14px] py-[9px] rounded-[8px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] hover:border-[var(--ink-2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── AI Quiz tab ── */}
      {tab === "quiz" && (
        <div className="space-y-[24px]">
          {quizQuestions.length === 0 && !generatingQuiz && (
            <div className="text-center py-[64px] rounded-[16px] border border-[var(--rule)] bg-[var(--bg-2)] p-[32px] max-w-[500px] mx-auto">
              <div
                className="w-[56px] h-[56px] rounded-full flex items-center justify-center mx-auto mb-[20px]"
                style={{ background: `${ACCENT}18` }}
              >
                <HelpCircle size={26} style={{ color: ACCENT }} />
              </div>
              <h3 className="text-[18px] font-semibold text-[var(--ink)] m-0 mb-[8px]">
                AI Comprehension Quiz
              </h3>
              <p className="text-[13px] leading-[1.6] text-[var(--ink-3)] m-0 mb-[24px]">
                Test your understanding, themes, and key concepts of &ldquo;{book.title}&rdquo; with a custom generated 5-question quiz.
              </p>
              <button
                onClick={generateQuiz}
                className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[20px] py-[12px] rounded-[10px] border-none cursor-pointer transition-all hover:opacity-90 text-white"
                style={{ background: ACCENT }}
              >
                <Sparkles size={13} />
                Generate Quiz
              </button>
            </div>
          )}

          {generatingQuiz && (
            <div className="text-center py-[80px] rounded-[16px] border border-[var(--rule)] bg-[var(--bg-2)] p-[32px] max-w-[500px] mx-auto">
              <Loader2 size={32} className="animate-spin mx-auto mb-[16px]" style={{ color: ACCENT }} />
              <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
                Creating Quiz Questions…
              </div>
              <div className="text-[13px] text-[var(--ink-3)] mt-[6px]">
                Analyzing book chapters and highlights. Please wait…
              </div>
            </div>
          )}

          {quizQuestions.length > 0 && !quizFinished && (
            <div className="rounded-[16px] border border-[var(--rule)] bg-[var(--bg-2)] p-[32px] max-[480px]:p-[20px] max-w-[640px] mx-auto space-y-[24px]">
              {/* Progress */}
              <div className="flex items-center justify-between border-b border-[var(--rule)] pb-[16px]">
                <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
                  Question {currentQuestionIndex + 1} of {quizQuestions.length}
                </div>
                <div className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: ACCENT }}>
                  Score: {quizScore}
                </div>
              </div>

              {/* Question text */}
              <div className="text-[16px] font-medium leading-[1.5] text-[var(--ink)]">
                {quizQuestions[currentQuestionIndex].question}
              </div>

              {/* Options */}
              <div className="space-y-[10px]">
                {quizQuestions[currentQuestionIndex].options.map((opt: string, oIdx: number) => {
                  const isSelected = selectedOptionIndex === oIdx;
                  const isCorrect = oIdx === quizQuestions[currentQuestionIndex].correctIndex;
                  
                  let optionBg = "var(--bg)";
                  let optionBorder = "var(--rule)";
                  let optionColor = "var(--ink)";

                  if (quizSubmitted) {
                    if (isCorrect) {
                      optionBg = "rgba(22,163,74,0.08)";
                      optionBorder = "#16A34A";
                      optionColor = "#16A34A";
                    } else if (isSelected) {
                      optionBg = "rgba(220,38,38,0.08)";
                      optionBorder = "#DC2626";
                      optionColor = "#DC2626";
                    }
                  } else if (isSelected) {
                    optionBorder = ACCENT;
                    optionBg = `${ACCENT}08`;
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={quizSubmitted}
                      onClick={() => setSelectedOptionIndex(oIdx)}
                      className="w-full text-left p-[16px] rounded-[10px] border text-[13px] leading-[1.5] transition-all cursor-pointer disabled:cursor-default"
                      style={{
                        background: optionBg,
                        borderColor: optionBorder,
                        color: optionColor,
                        fontWeight: isSelected ? 500 : 400,
                      }}
                    >
                      <div className="flex items-start gap-[12px]">
                        <span className="font-mono text-[11px] mt-[1px] opacity-60">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation block */}
              {quizSubmitted && (
                <div
                  className="rounded-[10px] p-[16px] text-[13px] leading-[1.6]"
                  style={{
                    background: "rgba(79,109,122,0.05)",
                    borderLeft: `3px solid ${ACCENT}`,
                  }}
                >
                  <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--ink-2)] mb-[4px] font-semibold">
                    Explanation
                  </div>
                  <div className="text-[var(--ink-2)]">
                    {quizQuestions[currentQuestionIndex].explanation}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end pt-[8px]">
                {!quizSubmitted ? (
                  <button
                    disabled={selectedOptionIndex === null}
                    onClick={handleAnswerSubmit}
                    className="font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[20px] py-[12px] rounded-[10px] border-none cursor-pointer text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: ACCENT }}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[20px] py-[12px] rounded-[10px] border-none cursor-pointer text-white transition-all"
                    style={{ background: ACCENT }}
                  >
                    {currentQuestionIndex + 1 === quizQuestions.length ? "Finish Quiz" : "Next Question"}
                  </button>
                )}
              </div>
            </div>
          )}

          {quizFinished && (
            <div className="text-center py-[64px] rounded-[16px] border border-[var(--rule)] bg-[var(--bg-2)] p-[32px] max-w-[500px] mx-auto space-y-[24px]">
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto"
                style={{ background: `${ACCENT}18` }}
              >
                <Sparkles size={32} style={{ color: ACCENT }} />
              </div>
              <div>
                <h3 className="text-[22px] font-semibold text-[var(--ink)] m-0 mb-[6px]">
                  Quiz Completed
                </h3>
                <div className="text-[32px] font-bold text-[var(--ink)] leading-[1] my-[12px]" style={{ color: ACCENT }}>
                  {quizScore} / {quizQuestions.length} Correct
                </div>
                <p className="text-[13px] leading-[1.6] text-[var(--ink-3)] m-0 max-w-[360px] mx-auto">
                  {quizScore === quizQuestions.length
                    ? "Perfect! You have a masterful understanding of this book's concepts."
                    : quizScore >= 3
                    ? "Great job! You retained most of the core concepts."
                    : "Good effort! Try reviewing your highlights and notes before trying again."}
                </p>
              </div>

              <div className="flex gap-[10px] justify-center pt-[8px]">
                <button
                  onClick={() => setTab("notes")}
                  className="font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[20px] py-[12px] rounded-[10px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] hover:border-[var(--ink-2)] transition-colors"
                >
                  Back to Notes
                </button>
                <button
                  onClick={generateQuiz}
                  className="inline-flex items-center gap-[6px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[20px] py-[12px] rounded-[10px] border-none cursor-pointer transition-all hover:opacity-90 text-white"
                  style={{ background: ACCENT }}
                >
                  <RefreshCw size={12} />
                  Retake Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Share Card Modal ── */}
      {shareHighlight && (
        <ShareCardModal
          highlight={shareHighlight}
          book={book}
          onClose={() => setShareHighlight(null)}
        />
      )}

      {/* ── Concept Share Modal ── */}
      {shareConceptIdx !== null && shortsCards[shareConceptIdx] && (
        <ConceptShareModal
          card={shortsCards[shareConceptIdx]}
          book={book}
          onClose={() => setShareConceptIdx(null)}
        />
      )}
    </div>
  );
}

// ── Share Card Modal ───────────────────────────────────────────

interface ShareCardModalProps {
  highlight: ChHighlight;
  book: ChBook;
  onClose: () => void;
}

function ShareCardModal({ highlight, book, onClose }: ShareCardModalProps): React.ReactElement {
  const [downloading, setDownloading] = useState(false);
  const BB_ORANGE = "#C85A2C";

  const cardUrl = `/api/chapterly/share-card?${new URLSearchParams({
    quote: highlight.text,
    book: book.title,
    author: book.author ?? "",
    color: highlight.color,
  }).toString()}`;

  const downloadCard = async (): Promise<void> => {
    setDownloading(true);
    try {
      const res = await fetch(cardUrl);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${book.title.replace(/[^a-z0-9]/gi, "_")}-highlight.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[share-card] download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  const HIGHLIGHT_PREVIEW: Record<ChHighlight["color"], { dot: string; textColor: string; quoteBg: string }> = {
    yellow: { dot: "#F59E0B", textColor: "#FDE68A", quoteBg: "rgba(245,158,11,0.08)" },
    green:  { dot: "#22C55E", textColor: "#BBF7D0", quoteBg: "rgba(34,197,94,0.08)" },
    blue:   { dot: "#3B82F6", textColor: "#BFDBFE", quoteBg: "rgba(59,130,246,0.08)" },
    pink:   { dot: "#EC4899", textColor: "#FBCFE8", quoteBg: "rgba(236,72,153,0.08)" },
  };
  const ps = HIGHLIGHT_PREVIEW[highlight.color];

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-[20px] pointer-events-none">
        <div
          className="w-full max-w-[520px] rounded-[24px] border border-[var(--rule)] shadow-2xl pointer-events-auto flex flex-col overflow-hidden"
          style={{ background: "var(--bg)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-[24px] py-[18px] border-b border-[var(--rule)]">
            <div>
              <div className="font-semibold text-[15px] text-[var(--ink)]">Share Highlight</div>
              <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)] mt-[2px]">
                BookBreaks × Chapterly · 1080×1080 PNG
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-[8px] border-none cursor-pointer bg-transparent text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Card preview */}
          <div className="px-[24px] pt-[20px]">
            <div
              className="w-full rounded-[16px] p-[22px] relative overflow-hidden flex flex-col"
              style={{ background: "#141010", minHeight: "280px" }}
            >
              {/* Top gradient stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, ${BB_ORANGE}, ${ps.dot})` }}
              />

              {/* Logo */}
              <div className="flex items-center gap-[8px] mb-[16px]">
                <div
                  className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center font-bold text-[10px]"
                  style={{ background: BB_ORANGE, color: "#fff" }}
                >
                  B
                </div>
                <span className="font-semibold text-[12px]" style={{ color: "#fff" }}>BookBreaks</span>
                <span className="font-mono text-[8px] uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  × Chapterly
                </span>
              </div>

              {/* Quote */}
              <div
                className="rounded-[10px] p-[14px] mb-[14px] flex-1"
                style={{ background: ps.quoteBg }}
              >
                <p
                  className="text-[13px] italic leading-[1.6] m-0 line-clamp-4"
                  style={{ color: ps.textColor }}
                >
                  &ldquo;{highlight.text}&rdquo;
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[11px] font-semibold" style={{ color: "#fff" }}>{book.title}</div>
                  {book.author && (
                    <div className="text-[9px] font-mono mt-[2px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                      by {book.author}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-[5px]">
                  <div className="w-[6px] h-[6px] rounded-full" style={{ background: ps.dot }} />
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {highlight.color}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-[24px] py-[16px] flex items-center gap-[10px]">
            <button
              onClick={() => void downloadCard()}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold h-[44px] rounded-[10px] border-none cursor-pointer transition-all hover:opacity-90 disabled:opacity-50 text-white"
              style={{ background: BB_ORANGE }}
            >
              {downloading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {downloading ? "Generating…" : "Download PNG"}
            </button>
            <button
              onClick={onClose}
              className="h-[44px] px-[20px] rounded-[10px] border border-[var(--rule)] bg-transparent font-mono text-[10px] tracking-[0.1em] uppercase cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] transition-all"
            >
              Close
            </button>
          </div>

          <div className="pb-[14px]">
            <p className="font-mono text-[9px] text-[var(--ink-3)] text-center tracking-[0.08em] m-0">
              Perfect for Instagram · Twitter · Stories
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Concept Share Modal ────────────────────────────────────────

interface ConceptShareModalProps {
  card: ConceptCard;
  book: ChBook;
  onClose: () => void;
}

const CH_ACCENT = "#4F6D7A";

function renderConceptToCanvas(card: ConceptCard, book: ChBook): HTMLCanvasElement {
  const SIZE = 1080;
  const PAD = 80;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = "#F4F7F8";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle mesh glows
  const g1 = ctx.createRadialGradient(SIZE * 0.15, SIZE * 0.15, 40, SIZE * 0.15, SIZE * 0.15, SIZE * 0.55);
  g1.addColorStop(0, `${CH_ACCENT}18`);
  g1.addColorStop(1, "transparent");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Top accent bar
  ctx.fillStyle = CH_ACCENT;
  ctx.fillRect(0, 0, SIZE, 6);

  // Wrap text helper
  const wrap = (text: string, maxW: number, font: string): string[] => {
    ctx.font = font;
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const drawLines = (lines: string[], x: number, y: number, lh: number): number => {
    for (const l of lines) { ctx.fillText(l, x, y); y += lh; }
    return y;
  };

  let y = PAD + 32;

  // Logo badge background
  ctx.fillStyle = `${CH_ACCENT}18`;
  ctx.beginPath();
  ctx.roundRect(PAD, y, 180, 32, 16);
  ctx.fill();
  ctx.fillStyle = CH_ACCENT;
  ctx.font = "bold 14px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText("⚡  CHAPTERLY", PAD + 16, y + 21);

  y += 56;

  // Concept short label
  ctx.fillStyle = `${CH_ACCENT}99`;
  ctx.font = "13px 'Courier New', monospace";
  ctx.fillText("💡 CONCEPT SHORT", PAD, y);
  y += 28;

  // Book title label
  const bookLabel = `from "${book.title}"${book.author ? ` · ${book.author}` : ""}`;
  ctx.fillStyle = `${CH_ACCENT}88`;
  ctx.font = "12px 'Courier New', monospace";
  const maxBookW = SIZE - PAD * 2;
  const bookLabelText = ctx.measureText(bookLabel).width > maxBookW
    ? bookLabel.slice(0, Math.floor(bookLabel.length * (maxBookW / ctx.measureText(bookLabel).width))) + "…"
    : bookLabel;
  ctx.fillText(bookLabelText, PAD, y);
  y += 40;

  // Divider
  ctx.strokeStyle = `${CH_ACCENT}30`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(SIZE - PAD, y);
  ctx.stroke();
  y += 36;

  // Title
  const titleFont = "bold 52px Georgia, serif";
  const titleLines = wrap(card.title, SIZE - PAD * 2, titleFont);
  ctx.fillStyle = "#1a2a30";
  ctx.font = titleFont;
  y = drawLines(titleLines, PAD, y, 62);
  y += 28;

  // Concept text
  const conceptFont = "500 30px 'Inter', system-ui, sans-serif";
  const conceptLines = wrap(card.concept, SIZE - PAD * 2, conceptFont);
  ctx.fillStyle = "#2d4a55";
  ctx.font = conceptFont;
  y = drawLines(conceptLines, PAD, y, 42);
  y += 24;

  // Insight text
  if (card.insight) {
    const insightFont = "italic 24px Georgia, serif";
    const insightLines = wrap(card.insight, SIZE - PAD * 2 - 20, insightFont);
    ctx.fillStyle = `${CH_ACCENT}cc`;
    ctx.font = insightFont;
    y = drawLines(insightLines, PAD + 10, y, 34);
    y += 20;
  }

  // Quote block
  if (card.quote) {
    const quoteFont = "italic 22px Georgia, serif";
    const quoteLines = wrap(`"${card.quote}"`, SIZE - PAD * 2 - 48, quoteFont);
    const quoteH = quoteLines.length * 32 + 28;
    ctx.fillStyle = `${CH_ACCENT}12`;
    ctx.beginPath();
    ctx.roundRect(PAD, y, SIZE - PAD * 2, quoteH, 12);
    ctx.fill();
    ctx.fillStyle = CH_ACCENT;
    ctx.font = quoteFont;
    y = drawLines(quoteLines, PAD + 24, y + 22, 32);
    y += 22;
  }

  // Bottom CTA bar
  const barY = SIZE - PAD - 48;
  ctx.strokeStyle = `${CH_ACCENT}25`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, barY);
  ctx.lineTo(SIZE - PAD, barY);
  ctx.stroke();

  ctx.fillStyle = `${CH_ACCENT}66`;
  ctx.font = "13px 'Courier New', monospace";
  ctx.textAlign = "left";
  ctx.fillText("Read & grow with Chapterly", PAD, barY + 32);

  // CTA pill
  const ctaText = "Try Chapterly →";
  ctx.font = "bold 13px 'Courier New', monospace";
  const ctaW = ctx.measureText(ctaText).width + 28;
  ctx.fillStyle = CH_ACCENT;
  ctx.beginPath();
  ctx.roundRect(SIZE - PAD - ctaW, barY + 14, ctaW, 28, 14);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "right";
  ctx.fillText(ctaText, SIZE - PAD - 14, barY + 32);

  return canvas;
}

function ConceptShareModal({ card, book, onClose }: ConceptShareModalProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareText = `💡 ${card.title}\n\n${card.concept}\n\n"${card.insight}"\n\n— From "${book.title}"${book.author ? ` by ${book.author}` : ""}\n\nRead & grow with Chapterly 📖`;
  const twitterText = encodeURIComponent(`💡 ${card.title}\n\n${card.concept}\n\n— From "${book.title}"\n\nRead & grow with Chapterly 📖`);
  const whatsappText = encodeURIComponent(shareText);

  const getBlob = (): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const canvas = renderConceptToCanvas(card, book);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
    });

  const handleDownload = async (): Promise<void> => {
    setImgLoading(true);
    try {
      const blob = await getBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${card.title.slice(0, 30).replace(/\s+/g, "-").toLowerCase()}-chapterly.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[concept-share] download error:", err);
    } finally {
      setImgLoading(false);
    }
  };

  const handleNativeShare = async (): Promise<void> => {
    setSharing(true);
    try {
      const blob = await getBlob();
      const file = new File([blob], "concept-chapterly.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
      } else {
        await navigator.share({ text: shareText });
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("[concept-share] share error:", err);
      }
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("[concept-share] clipboard error:", err);
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-[16px] pointer-events-none">
        <div
          className="w-full max-w-[500px] max-h-[90vh] rounded-[24px] border border-[var(--rule)] shadow-2xl pointer-events-auto flex flex-col overflow-hidden"
          style={{ background: "var(--bg)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-[24px] py-[18px] border-b border-[var(--rule)] shrink-0">
            <div>
              <div className="font-semibold text-[15px] text-[var(--ink)]">Share Concept</div>
              <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)] mt-[2px]">
                Chapterly · Concept Short
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-[8px] border-none cursor-pointer bg-transparent text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">
            {/* Card preview */}
            <div className="px-[24px] pt-[20px]">
              <div
                className="rounded-[16px] p-[20px] flex flex-col gap-[10px] relative overflow-hidden"
                style={{ background: "#F4F7F8", borderTop: `3px solid ${CH_ACCENT}` }}
              >
                <div className="flex items-center gap-[6px]">
                  <span
                    className="font-mono text-[9px] tracking-[0.12em] uppercase px-[10px] py-[3px] rounded-full font-semibold"
                    style={{ background: `${CH_ACCENT}18`, color: CH_ACCENT }}
                  >
                    ⚡ CHAPTERLY
                  </span>
                  <span className="font-mono text-[9px] text-[var(--ink-3)]">💡 Concept Short</span>
                </div>
                <h3 className="text-[16px] font-bold m-0 leading-[1.3]" style={{ color: "#1a2a30" }}>
                  {card.title}
                </h3>
                <p className="text-[13px] font-medium m-0 leading-[1.5]" style={{ color: "#2d4a55" }}>
                  {card.concept}
                </p>
                {card.insight && (
                  <p className="text-[12px] italic m-0 leading-[1.6]" style={{ color: `${CH_ACCENT}cc` }}>
                    {card.insight}
                  </p>
                )}
                {card.quote && (
                  <div
                    className="text-[11px] italic leading-[1.6] px-[12px] py-[8px] rounded-[8px]"
                    style={{ background: `${CH_ACCENT}10`, color: CH_ACCENT }}
                  >
                    &ldquo;{card.quote}&rdquo;
                  </div>
                )}
                <div
                  className="flex items-center justify-between pt-[10px] mt-[4px]"
                  style={{ borderTop: `1px solid ${CH_ACCENT}20` }}
                >
                  <span className="font-mono text-[9px] tracking-[0.06em]" style={{ color: `${CH_ACCENT}88` }}>
                    {book.author ? `by ${book.author}` : book.title}
                  </span>
                  <span
                    className="font-mono text-[8px] tracking-[0.1em] uppercase px-[8px] py-[3px] rounded-full text-white"
                    style={{ background: CH_ACCENT }}
                  >
                    Try Chapterly →
                  </span>
                </div>
              </div>
            </div>

            {/* Export & Share actions */}
            <div className="px-[24px] pt-[16px] pb-[4px] flex flex-col gap-[10px]">
              {/* Primary: Save image */}
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={imgLoading}
                className="w-full h-[44px] flex items-center justify-center gap-[8px] font-mono text-[10px] tracking-[0.1em] uppercase font-semibold rounded-[12px] border-none cursor-pointer transition-all text-white disabled:opacity-60"
                style={{ background: CH_ACCENT }}
              >
                <Download size={13} />
                {imgLoading ? "Rendering…" : "Save as Image"}
              </button>

              {/* Platform share row */}
              <div className="grid grid-cols-3 gap-[8px]">
                {/* X / Twitter */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${twitterText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-[40px] flex items-center justify-center gap-[6px] font-mono text-[9px] tracking-[0.08em] uppercase font-semibold rounded-[10px] cursor-pointer transition-all no-underline"
                  style={{
                    background: "#000000",
                    color: "#ffffff",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.731-8.835L1.254 2.25H8.08l4.259 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                  </svg>
                  Post to X
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-[40px] flex items-center justify-center gap-[6px] font-mono text-[9px] tracking-[0.08em] uppercase font-semibold rounded-[10px] cursor-pointer transition-all no-underline"
                  style={{ background: "#25D366", color: "#ffffff" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>

                {/* Native Share (mobile) or Copy Image */}
                {canNativeShare ? (
                  <button
                    type="button"
                    onClick={() => void handleNativeShare()}
                    disabled={sharing}
                    className="h-[40px] flex items-center justify-center gap-[6px] font-mono text-[9px] tracking-[0.08em] uppercase font-semibold rounded-[10px] cursor-pointer transition-all border disabled:opacity-60"
                    style={{
                      background: "var(--bg-2)",
                      borderColor: "var(--rule)",
                      color: "var(--ink)",
                    }}
                  >
                    <Share2 size={12} />
                    {sharing ? "…" : "More"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleDownload()}
                    disabled={imgLoading}
                    className="h-[40px] flex items-center justify-center gap-[6px] font-mono text-[9px] tracking-[0.08em] uppercase font-semibold rounded-[10px] cursor-pointer transition-all border disabled:opacity-60"
                    style={{
                      background: "var(--bg-2)",
                      borderColor: "var(--rule)",
                      color: "var(--ink)",
                    }}
                  >
                    <Download size={12} />
                    PNG
                  </button>
                )}
              </div>

              {/* Copy text */}
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="w-full h-[36px] flex items-center justify-center gap-[6px] font-mono text-[9px] tracking-[0.1em] uppercase font-semibold rounded-[10px] cursor-pointer transition-all border"
                style={{
                  background: copied ? "#16A34A08" : "transparent",
                  borderColor: copied ? "#16A34A40" : "var(--rule)",
                  color: copied ? "#16A34A" : "var(--ink-3)",
                }}
              >
                {copied ? <><Check size={11} /> Text Copied!</> : <><Share2 size={11} /> Copy Text</>}
              </button>
            </div>

            {/* Text preview (collapsed) */}
            <div className="px-[24px] pb-[20px] pt-[4px]">
              <details className="group">
                <summary className="font-mono text-[9px] tracking-[0.08em] text-[var(--ink-4)] cursor-pointer list-none flex items-center gap-[4px] pb-[8px]">
                  <ChevronRight size={10} className="group-open:rotate-90 transition-transform" />
                  Preview share text
                </summary>
                <div
                  className="rounded-[10px] p-[12px] text-[11px] leading-[1.7] whitespace-pre-wrap font-mono"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--rule)", color: "var(--ink-3)" }}
                >
                  {shareText}
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
