"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  Quote,
  FileText,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NoteType = "note" | "quote" | "takeaway";

interface BookNote {
  id: string;
  book_id: string;
  type: NoteType;
  content: string;
  page_ref: string | null;
}

interface Book {
  id: string;
  title: string;
  author: string;
  progress: number;
  status: string;
  cover_url: string | null;
  sort_order: number;
}

const noteTypeConfig: Record<
  NoteType,
  { label: string; icon: React.ReactNode; placeholder: string }
> = {
  note: {
    label: "Note",
    icon: <FileText className="h-3.5 w-3.5" />,
    placeholder: "Write a note...",
  },
  quote: {
    label: "Quote",
    icon: <Quote className="h-3.5 w-3.5" />,
    placeholder: "A passage worth remembering...",
  },
  takeaway: {
    label: "Takeaway",
    icon: <Lightbulb className="h-3.5 w-3.5" />,
    placeholder: "Key insight or lesson...",
  },
};

// ── Note entry ───────────────────────────────────────────────────────────────

interface NoteEntryProps {
  note: BookNote;
  onDelete: (id: string) => Promise<void>;
}

function NoteEntry({ note, onDelete }: NoteEntryProps): React.ReactElement {
  const [deleting, setDeleting] = useState(false);
  const cfg = noteTypeConfig[note.type];

  const handleDelete = async (): Promise<void> => {
    setDeleting(true);
    await onDelete(note.id);
    setDeleting(false);
  };

  return (
    <div className="group flex items-start gap-3 py-2.5 border-b border-border/60 last:border-0">
      <span className="shrink-0 mt-0.5 text-muted-foreground">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {note.content}
        </p>
        {note.page_ref && (
          <p className="text-xs text-muted-foreground mt-1">
            p.&nbsp;{note.page_ref}
          </p>
        )}
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        aria-label="Delete note"
      >
        {deleting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

// ── Add note form ────────────────────────────────────────────────────────────

interface AddNoteFormProps {
  bookId: string;
  onAdded: (note: BookNote) => void;
}

function AddNoteForm({
  bookId,
  onAdded,
}: AddNoteFormProps): React.ReactElement {
  const [type, setType] = useState<NoteType>("note");
  const [content, setContent] = useState("");
  const [pageRef, setPageRef] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const save = async (): Promise<void> => {
    if (!content.trim()) return;
    setSaving(true);
    const { data } = await supabase
      .from("book_notes")
      .insert({
        book_id: bookId,
        type,
        content: content.trim(),
        page_ref: pageRef.trim() || null,
      })
      .select()
      .single();
    setSaving(false);
    if (data) {
      onAdded(data as BookNote);
      setContent("");
      setPageRef("");
    }
  };

  return (
    <div className="pt-3 space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {(Object.keys(noteTypeConfig) as NoteType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
              type === t
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {noteTypeConfig[t].icon}
            {noteTypeConfig[t].label}
          </button>
        ))}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder={noteTypeConfig[type].placeholder}
        className="w-full bg-muted/60 border border-border rounded-md p-3 text-sm font-mono resize-y focus:outline-none focus:ring-1 focus:ring-ring"
      />

      <div className="flex items-center gap-2">
        <Input
          value={pageRef}
          onChange={(e) => setPageRef(e.target.value)}
          placeholder="Page (optional)"
          className="w-32 h-8 text-sm"
        />
        <Button
          size="sm"
          onClick={save}
          disabled={saving || !content.trim()}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5 mr-1.5" />
          )}
          Add {noteTypeConfig[type].label}
        </Button>
      </div>
    </div>
  );
}

// ── Notes panel ──────────────────────────────────────────────────────────────

interface NotesPanelProps {
  bookId: string;
  initialNotes: BookNote[];
}

function NotesPanel({
  bookId,
  initialNotes,
}: NotesPanelProps): React.ReactElement {
  const [notes, setNotes] = useState<BookNote[]>(initialNotes);
  const [activeType, setActiveType] = useState<NoteType>("note");
  const supabase = createClient();

  const filtered = notes.filter((n) => n.type === activeType);
  const countOf = (t: NoteType): number =>
    notes.filter((n) => n.type === t).length;

  const handleDelete = async (id: string): Promise<void> => {
    await supabase.from("book_notes").delete().eq("id", id);
    setNotes((n) => n.filter((note) => note.id !== id));
  };

  const handleAdded = (note: BookNote): void => {
    setNotes((n) => [...n, note]);
    setActiveType(note.type);
  };

  return (
    <div className="mt-4 pt-4 border-t border-border">
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-3 flex-wrap">
        {(Object.keys(noteTypeConfig) as NoteType[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors",
              activeType === t
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {noteTypeConfig[t].icon}
            {noteTypeConfig[t].label}s
            {countOf(t) > 0 && (
              <span className="ml-0.5 opacity-60">({countOf(t)})</span>
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[24px]">
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground py-1">
            No {noteTypeConfig[activeType].label.toLowerCase()}s yet.
          </p>
        ) : (
          filtered.map((note) => (
            <NoteEntry key={note.id} note={note} onDelete={handleDelete} />
          ))
        )}
      </div>

      <AddNoteForm bookId={bookId} onAdded={handleAdded} />
    </div>
  );
}

// ── Book row ─────────────────────────────────────────────────────────────────

interface BookRowProps {
  book: Book;
  initialNotes: BookNote[];
  onDelete: (id: string) => Promise<void>;
}

function BookRow({
  book,
  initialNotes,
  onDelete,
}: BookRowProps): React.ReactElement {
  const [form, setForm] = useState({
    title: book.title,
    author: book.author,
    progress: book.progress,
    status: book.status,
    cover_url: book.cover_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  const save = async (): Promise<void> => {
    setSaving(true);
    await supabase
      .from("books")
      .update({
        ...form,
        cover_url: form.cover_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", book.id);
    setSaving(false);
    startTransition(() => router.refresh());
  };

  const handleDelete = async (): Promise<void> => {
    setDeleting(true);
    await onDelete(book.id);
    setDeleting(false);
  };

  return (
    <div className="content-card space-y-3 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Title"
        />
        <Input
          value={form.author}
          onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
          placeholder="Author"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground w-16 shrink-0">
          Progress
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={form.progress}
          onChange={(e) =>
            setForm((f) => ({ ...f, progress: Number(e.target.value) }))
          }
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-10 text-right">
          {form.progress}%
        </span>
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          className="h-8 bg-muted border border-border rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="reading">reading</option>
          <option value="completed">completed</option>
          <option value="queued">queued</option>
        </select>
      </div>

      <Input
        value={form.cover_url}
        onChange={(e) =>
          setForm((f) => ({ ...f, cover_url: e.target.value }))
        }
        placeholder="Cover image URL (optional)"
        className="text-sm"
      />

      <div className="flex items-center justify-between">
        <button
          onClick={() => setNotesOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {notesOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          Notes &amp; quotes
          {initialNotes.length > 0 && (
            <Badge
              variant="secondary"
              className="text-xs ml-0.5 h-4 px-1.5"
            >
              {initialNotes.length}
            </Badge>
          )}
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5" />
            )}
            Save
          </Button>
        </div>
      </div>

      {notesOpen && (
        <NotesPanel bookId={book.id} initialNotes={initialNotes} />
      )}
    </div>
  );
}

// ── Manager ──────────────────────────────────────────────────────────────────

interface BooksManagerProps {
  initialBooks: Book[];
  initialNotes: BookNote[];
}

export function BooksManager({
  initialBooks,
  initialNotes,
}: BooksManagerProps): React.ReactElement {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [adding, setAdding] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const notesByBook = new Map<string, BookNote[]>();
  for (const note of initialNotes) {
    const bucket = notesByBook.get(note.book_id) ?? [];
    notesByBook.set(note.book_id, [...bucket, note]);
  }

  const addBook = async (): Promise<void> => {
    setAdding(true);
    const { data } = await supabase
      .from("books")
      .insert([
        { title: "New Book", author: "", progress: 0, status: "queued" },
      ])
      .select()
      .single();
    if (data) setBooks((b) => [...b, data as Book]);
    setAdding(false);
    router.refresh();
  };

  const deleteBook = async (id: string): Promise<void> => {
    if (!confirm("Delete this book and all its notes?")) return;
    await supabase.from("books").delete().eq("id", id);
    setBooks((b) => b.filter((book) => book.id !== id));
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {books.map((book) => (
        <BookRow
          key={book.id}
          book={book}
          initialNotes={notesByBook.get(book.id) ?? []}
          onDelete={deleteBook}
        />
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addBook}
        disabled={adding}
      >
        {adding ? (
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5 mr-1.5" />
        )}
        Add book
      </Button>
    </div>
  );
}
