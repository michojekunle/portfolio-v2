"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  ChBook,
  ChNote,
  ChHighlight,
  HighlightColor,
} from "@/lib/chapterly/types";
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
  const [tab, setTab] = useState<"notes" | "highlights">("notes");

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
      <div className="flex gap-[2px] mb-[32px] p-[4px] rounded-[10px] bg-[var(--bg-2)] w-full sm:w-fit border border-[var(--rule)]">
        {(["notes", "highlights"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-[7px] px-[16px] py-[8px] rounded-[7px] font-mono text-[10px] tracking-[0.1em] uppercase font-semibold border-none cursor-pointer transition-all"
            style={
              tab === t
                ? { background: ACCENT, color: "#fff" }
                : { background: "transparent", color: "var(--ink-3)" }
            }
          >
            {t === "notes" ? <StickyNote size={12} /> : <BookOpen size={12} />}
            {t === "notes"
              ? `Notes${notes.length > 0 ? ` (${notes.length})` : ""}`
              : `Highlights${
                  highlights.length > 0 ? ` (${highlights.length})` : ""
                }`}
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
    </div>
  );
}
