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
  const [shortsSavedIds, setShortsSavedIds] = useState<Set<number>>(new Set());
  const [shortsSaving, setShortsSaving] = useState<number | null>(null);
  const dragStartX = useRef<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const generateShorts = async (): Promise<void> => {
    setShortsLoading(true);
    setShortsCards([]);
    setShortsIndex(0);
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
      setTimeout(() => setBridgeCopied(false), 2500);
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
            <button
              onClick={() => void copyForBookBreaks()}
              disabled={highlights.length === 0 && notes.length === 0}
              className="shrink-0 inline-flex items-center gap-[6px] font-mono text-[10px] tracking-[0.1em] uppercase font-semibold px-[14px] py-[8px] rounded-[8px] border-none cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={
                bridgeCopied
                  ? { background: "#16A34A", color: "#fff" }
                  : { background: "#C85A2C", color: "#fff" }
              }
              title="Copy highlights as Markdown and open BookBreaks"
            >
              {bridgeCopied ? <Check size={13} /> : <ExternalLink size={13} />}
              {bridgeCopied ? "Copied!" : "BookBreaks"}
            </button>
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
            {t === "shorts" && "Shorts"}
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
                    <p className="text-[14px] leading-[1.7] text-[var(--ink)] m-0 whitespace-pre-wrap">
                      {note.content_md}
                    </p>
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
              <button
                onClick={() => void generateShorts()}
                className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[20px] py-[12px] rounded-[10px] border-none cursor-pointer transition-all hover:opacity-90 text-white"
                style={{ background: ACCENT }}
              >
                <Sparkles size={13} />
                Generate Shorts
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
                      <div className="mt-[16px] flex items-center justify-end">
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
