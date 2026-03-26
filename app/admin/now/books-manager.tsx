"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  progress: number;
  status: string;
  notes: string | null;
  cover_url: string | null;
  sort_order: number;
}

interface BookRowProps {
  book: Book;
  onDelete: (id: string) => Promise<void>;
}

function BookRow({ book, onDelete }: BookRowProps): React.ReactElement {
  const [form, setForm] = useState({
    title: book.title,
    author: book.author,
    progress: book.progress,
    status: book.status,
    notes: book.notes ?? "",
    cover_url: book.cover_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const save = async (): Promise<void> => {
    setSaving(true);
    await supabase
      .from("books")
      .update({ ...form, notes: form.notes || null, cover_url: form.cover_url || null, updated_at: new Date().toISOString() })
      .eq("id", book.id);
    setSaving(false);
    router.refresh();
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
          onChange={(e) => setForm((f) => ({ ...f, progress: Number(e.target.value) }))}
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

      <textarea
        value={form.notes}
        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        rows={3}
        placeholder="Notes (markdown)..."
        className="w-full bg-muted/60 border border-border rounded-md p-3 text-sm font-mono resize-y focus:outline-none focus:ring-1 focus:ring-ring"
      />

      <div className="flex justify-end gap-2">
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
  );
}

interface BooksManagerProps {
  initialBooks: Book[];
}

export function BooksManager({ initialBooks }: BooksManagerProps): React.ReactElement {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [adding, setAdding] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const addBook = async (): Promise<void> => {
    setAdding(true);
    const { data } = await supabase
      .from("books")
      .insert([{ title: "New Book", author: "", progress: 0, status: "queued" }])
      .select()
      .single();
    if (data) setBooks((b) => [...b, data as Book]);
    setAdding(false);
    router.refresh();
  };

  const deleteBook = async (id: string): Promise<void> => {
    if (!confirm("Delete this book?")) return;
    await supabase.from("books").delete().eq("id", id);
    setBooks((b) => b.filter((book) => book.id !== id));
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {books.map((book) => (
        <BookRow key={book.id} book={book} onDelete={deleteBook} />
      ))}
      <Button variant="outline" size="sm" onClick={addBook} disabled={adding}>
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
