"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { FREE_BOOK_LIMIT } from "@/lib/chapterly/types";
import type {
  ChBookWithStats,
  ReadingStatus,
} from "@/lib/chapterly/types";
import {
  BookMarked,
  Plus,
  Search,
  Upload,
  X,
  BookOpen,
  CheckCircle,
  PauseCircle,
  XCircle,
  Circle,
  Loader2,
  AlertCircle,
  Sparkles,
  Pencil,
  Trash2,
  Camera,
  Save,
  Check,
} from "lucide-react";

const ACCENT = "#4F6D7A";

const STATUS_CONFIG: Record<
  ReadingStatus,
  { label: string; icon: React.ReactElement; color: string }
> = {
  unread: { label: "Unread", icon: <Circle size={12} />, color: "#9CA3AF" },
  reading: { label: "Reading", icon: <BookOpen size={12} />, color: ACCENT },
  finished: {
    label: "Finished",
    icon: <CheckCircle size={12} />,
    color: "#16A34A",
  },
  abandoned: {
    label: "Abandoned",
    icon: <XCircle size={12} />,
    color: "#DC2626",
  },
  on_hold: {
    label: "On Hold",
    icon: <PauseCircle size={12} />,
    color: "#D97706",
  },
};

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".epub",
  ".docx",
  ".txt",
  ".md",
  ".html",
  ".fb2",
  ".cbz",
];
const MAX_FILE_MB = 5;



interface RecommendedBook {
  title: string;
  author: string;
  tagline: string;
  description: string;
  cover_url: string;
  content: string;
}

const DAILY_PICK: RecommendedBook = {
  title: "Atomic Habits",
  author: "James Clear",
  tagline: "Tiny Changes, Remarkable Results.",
  description: "An easy & proven way to build good habits & break bad ones. Learn the 4 laws of behavior change: Make it obvious, attractive, easy, and satisfying.",
  cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200",
  content: `# Summary of Atomic Habits by James Clear

## Chapter 1: The Surprising Power of Atomic Habits
Success is the product of daily habits—not once-in-a-lifetime transformations. Your outcomes are a lagging measure of your habits. Your net worth is a lagging measure of your financial habits. Your weight is a lagging measure of your eating habits. Your knowledge is a lagging measure of your learning habits. Your clutter is a lagging measure of your cleaning habits. You get what you repeat.

## Chapter 2: How Your Habits Shape Your Identity (and Vice Versa)
Changing our habits is challenging for two reasons: (1) we try to change the wrong thing and (2) we try to change our habits in the wrong way. There are three layers of behavior change: a change in your outcomes, a change in your processes, or a change in your identity. The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become.

## The 4 Laws of Behavior Change
1. **First Law (Cue)**: Make it obvious. Design your environment so cues are visible.
2. **Second Law (Craving)**: Make it attractive. Use temptation bundling.
3. **Third Law (Response)**: Make it easy. Reduce friction, prime the environment.
4. **Fourth Law (Reward)**: Make it satisfying. Use immediate rewards and habit trackers.
`
};

interface Props {
  books: ChBookWithStats[];
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

interface EditModalProps {
  book: ChBookWithStats;
  onClose: () => void;
  onSaved: (updated: ChBookWithStats) => void;
  onDeleted: (id: string) => void;
}

function EditBookModal({ book, onClose, onSaved, onDeleted }: EditModalProps): React.ReactElement {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author ?? "");
  const [status, setStatus] = useState<ReadingStatus>(book.status);
  const [coverPreview, setCoverPreview] = useState<string | null>(book.cover_url ?? null);
  const [coverBase64, setCoverBase64] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Cover image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCoverPreview(dataUrl);
      setCoverBase64(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (): Promise<void> => {
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        author: author.trim() || null,
        status,
      };
      if (coverBase64) body.cover_url = coverBase64;

      const res = await fetch(`/api/chapterly/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Failed to save");
      }
      const { book: updated } = await res.json() as { book: ChBookWithStats };
      setSaved(true);
      onSaved({ ...updated, total_reading_time_minutes: book.total_reading_time_minutes, highlight_count: book.highlight_count, note_count: book.note_count, session_count: book.session_count });
      setTimeout(onClose, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/chapterly/books/${book.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      onDeleted(book.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[520px] rounded-[20px] shadow-2xl border border-[var(--rule)] bg-[var(--bg)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[18px] border-b border-[var(--rule)]">
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
            Edit Book
          </div>
          <button
            onClick={onClose}
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-[24px] space-y-[20px]">
          {/* Cover + title/author side-by-side */}
          <div className="flex items-start gap-[20px]">
            {/* Cover picker */}
            <div className="shrink-0">
              <div
                className="w-[88px] h-[120px] rounded-[10px] relative overflow-hidden cursor-pointer group border border-[var(--rule)]"
                style={{ background: ACCENT + "18" }}
                onClick={() => coverInputRef.current?.click()}
                title="Change cover"
              >
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverPreview}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookMarked size={28} style={{ color: ACCENT, opacity: 0.5 }} />
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-[4px] transition-opacity">
                  <Camera size={18} className="text-white" />
                  <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-white">
                    Change
                  </span>
                </div>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleCoverChange}
              />
              <button
                onClick={() => coverInputRef.current?.click()}
                className="mt-[6px] w-full font-mono text-[8px] tracking-[0.08em] uppercase text-center text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer p-0 transition-colors"
              >
                Upload cover
              </button>
            </div>

            {/* Title + Author */}
            <div className="flex-1 space-y-[12px]">
              <div>
                <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] block mb-[6px]">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-[40px] px-[12px] rounded-[8px] text-[14px] outline-none bg-[var(--bg-2)] border border-[var(--rule)] text-[var(--ink)] focus:border-[var(--ink-2)] transition-colors"
                  placeholder="Book title"
                />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] block mb-[6px]">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full h-[40px] px-[12px] rounded-[8px] text-[14px] outline-none bg-[var(--bg-2)] border border-[var(--rule)] text-[var(--ink)] focus:border-[var(--ink-2)] transition-colors"
                  placeholder="Author name"
                />
              </div>
            </div>
          </div>

          {/* Status selector */}
          <div>
            <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] block mb-[10px]">
              Reading Status
            </label>
            <div className="grid grid-cols-3 max-[360px]:grid-cols-2 gap-[8px]">
              {(Object.keys(STATUS_CONFIG) as ReadingStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const active = status === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className="h-[38px] rounded-[8px] border font-mono text-[9px] tracking-[0.08em] uppercase cursor-pointer transition-all flex items-center justify-center gap-[6px]"
                    style={
                      active
                        ? { background: cfg.color + "20", borderColor: cfg.color, color: cfg.color, fontWeight: 600 }
                        : { background: "var(--bg-2)", borderColor: "var(--rule)", color: "var(--ink-3)" }
                    }
                  >
                    {cfg.icon}
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-[8px] px-[14px] py-[10px] flex items-center gap-[8px] text-[12px]"
              style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}
            >
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-[10px] pt-[4px]">
            {/* Delete */}
            {confirmDelete ? (
              <div className="flex items-center gap-[8px]">
                <span className="font-mono text-[10px] text-[#DC2626]">Sure?</span>
                <button
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  className="h-[36px] px-[14px] rounded-[8px] font-mono text-[9px] tracking-[0.08em] uppercase font-semibold cursor-pointer border-none transition-all disabled:opacity-60"
                  style={{ background: "#DC2626", color: "#fff" }}
                >
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="h-[36px] px-[14px] rounded-[8px] font-mono text-[9px] tracking-[0.08em] uppercase cursor-pointer border border-[var(--rule)] bg-transparent text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="h-[36px] px-[12px] rounded-[8px] font-mono text-[9px] tracking-[0.08em] uppercase cursor-pointer flex items-center gap-[6px] border border-[var(--rule)] bg-transparent text-[#DC2626] hover:bg-[rgba(220,38,38,0.06)] transition-colors"
              >
                <Trash2 size={13} />
                Delete
              </button>
            )}

            <div className="flex-1" />

            <button
              onClick={onClose}
              className="h-[36px] px-[14px] rounded-[8px] font-mono text-[9px] tracking-[0.08em] uppercase cursor-pointer border border-[var(--rule)] bg-transparent text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={saving || saved}
              className="h-[36px] px-[18px] rounded-[8px] font-mono text-[9px] tracking-[0.08em] uppercase font-semibold cursor-pointer border-none flex items-center gap-[6px] transition-all disabled:opacity-70"
              style={saved ? { background: "#16A34A", color: "#fff" } : { background: ACCENT, color: "#fff" }}
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : saved ? (
                <><Check size={13} /> Saved</>
              ) : (
                <><Save size={13} /> Save changes</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Library Client ──────────────────────────────────────────────────────

export function ChLibraryClient({ books: initialBooks }: Props): React.ReactElement {
  const [books, setBooks] = useState(initialBooks);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | "all">("all");
  const [uploading, setUploading] = useState(false);
  const [importingPick, setImportingPick] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [editingBook, setEditingBook] = useState<ChBookWithStats | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleBookSaved = useCallback((updated: ChBookWithStats): void => {
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }, []);

  const handleBookDeleted = useCallback((id: string): void => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const importDailyPick = async (): Promise<void> => {
    if (books.length >= FREE_BOOK_LIMIT) {
      setUploadError(`Free plan limit: ${FREE_BOOK_LIMIT} books. Upgrade to add more.`);
      return;
    }
    setImportingPick(true);
    setUploadError(null);
    try {
      const dataUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(DAILY_PICK.content)}`;
      const res = await fetch("/api/chapterly/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Summary: ${DAILY_PICK.title}`,
          author: DAILY_PICK.author,
          cover_url: DAILY_PICK.cover_url,
          file_url: dataUrl,
          file_format: "md",
          file_size_bytes: DAILY_PICK.content.length,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || "Failed to import pick");
      }

      const { book } = (await res.json()) as { book: ChBookWithStats };
      setBooks((prev) => [
        { ...book, total_reading_time_minutes: 0, highlight_count: 0, note_count: 0, session_count: 0 },
        ...prev,
      ]);
    } catch (err) {
      console.error("[library] daily pick error:", err);
      setUploadError(err instanceof Error ? err.message : "Failed to import daily pick");
    } finally {
      setImportingPick(false);
    }
  };

  const filtered = books.filter((b) => {
    const matchQuery =
      !query ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author?.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const handleFile = async (file: File): Promise<void> => {
    if (books.length >= FREE_BOOK_LIMIT) {
      setUploadError(`Free plan is limited to ${FREE_BOOK_LIMIT} books. Upgrade to add more.`);
      return;
    }

    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > MAX_FILE_MB) {
      setUploadError(`File too large. Maximum is ${MAX_FILE_MB}MB.`);
      return;
    }

    const ext = file.name.toLowerCase().split(".").pop();
    if (!ALLOWED_EXTENSIONS.some((e) => e === `.${ext}`)) {
      setUploadError(`Unsupported format. Supported: ${ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const titleGuess = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", titleGuess);

      const res = await fetch("/api/chapterly/upload", { method: "POST", body: formData });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Upload failed");
      }

      const { book } = (await res.json()) as { book: ChBookWithStats };
      setBooks((prev) => [
        { ...book, total_reading_time_minutes: 0, highlight_count: 0, note_count: 0, session_count: 0 },
        ...prev,
      ]);
      setShowUpload(false);
    } catch (err) {
      console.error("[chapterly/library] upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-[32px] gap-[16px] flex-wrap">
        <div>
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[6px]">
            {books.length} {books.length === 1 ? "book" : "books"}
          </div>
          <h1 className="font-display text-[32px] max-[720px]:text-[26px] font-normal tracking-[-0.02em] fvs-text text-[var(--ink)] m-0 leading-[1.1]">
            Library
          </h1>
        </div>
        <button
          onClick={() => {
            if (books.length < FREE_BOOK_LIMIT) setShowUpload(true);
            else setUploadError(`Free plan limit: ${FREE_BOOK_LIMIT} books. Upgrade to add more.`);
          }}
          className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[16px] py-[10px] rounded-[10px] text-(--bg) cursor-pointer border-none transition-all hover:opacity-90"
          style={{ background: ACCENT }}
        >
          <Plus size={14} /> Add Book
        </button>
      </div>

      {/* ── Upload panel ── */}
      {showUpload && (
        <div className="mb-[32px] rounded-[16px] border border-[var(--rule)] bg-[var(--bg-2)] overflow-hidden">
          <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[var(--rule)]">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
              Upload a book
            </div>
            <button
              onClick={() => { setShowUpload(false); setUploadError(null); }}
              className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)]"
            >
              <X size={16} />
            </button>
          </div>
          <div
            className={`m-[20px] rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center py-[48px] max-[480px]:py-[28px] px-[24px] text-center transition-all cursor-pointer ${
              dragOver ? "border-[#4F6D7A] bg-[rgba(79,109,122,0.06)]" : "border-[var(--rule)]"
            } ${uploading ? "pointer-events-none opacity-60" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.epub,.docx,.txt,.md,.html,.fb2,.cbz"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
            />
            {uploading ? (
              <Loader2 size={36} className="animate-spin mb-[16px]" style={{ color: ACCENT }} />
            ) : (
              <Upload size={36} className="mb-[16px] opacity-40 text-[var(--ink)]" />
            )}
            <div className="font-semibold text-[14px] text-[var(--ink)] mb-[6px]">
              {uploading ? "Uploading…" : "Drop your book here"}
            </div>
            <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
              PDF, EPUB, DOCX, TXT, MD, HTML, FB2, CBZ · Max {MAX_FILE_MB}MB
            </div>
            {!uploading && (
              <button
                type="button"
                className="mt-[20px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[14px] py-[8px] rounded-[8px] border-none cursor-pointer transition-all hover:opacity-90 text-(--bg)"
                style={{ background: ACCENT }}
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              >
                Browse files
              </button>
            )}
          </div>
          {uploadError && (
            <div
              className="mx-[20px] mb-[20px] rounded-[8px] px-[16px] py-[12px] flex items-start gap-[10px] text-[13px]"
              style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}
            >
              <AlertCircle size={16} className="shrink-0 mt-[1px]" />
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* ── Daily Pick Banner ── */}
      <div
        className="mb-[32px] rounded-[16px] border p-[24px] flex items-center justify-between gap-[24px] max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-[16px]"
        style={{ borderColor: "var(--rule)", background: "linear-gradient(135deg, rgba(79,109,122,0.08) 0%, rgba(79,109,122,0.02) 100%)" }}
      >
        <div className="flex items-start gap-[16px]">
          <div
            className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center shrink-0"
            style={{ background: "rgba(79,109,122,0.12)" }}
          >
            <Sparkles size={20} style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-3)] mb-[4px] flex items-center gap-[6px]">
              <span className="w-[6px] h-[6px] rounded-full animate-pulse inline-block" style={{ background: ACCENT }} />
              Daily Summary Pick
            </div>
            <h2 className="text-[18px] font-semibold text-[var(--ink)] m-0 mb-[6px]">
              {DAILY_PICK.title} <span className="font-normal text-[14px] text-[var(--ink-3)]">by {DAILY_PICK.author}</span>
            </h2>
            <p className="text-[12px] leading-[1.5] text-[var(--ink-3)] m-0 max-w-[580px]">
              {DAILY_PICK.description}
            </p>
          </div>
        </div>

        <button
          onClick={importDailyPick}
          disabled={importingPick}
          className="shrink-0 font-mono text-[9px] tracking-[0.12em] uppercase font-semibold px-[16px] py-[10px] rounded-[8px] border cursor-pointer transition-all disabled:opacity-50 text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--ink-2)] bg-transparent"
          style={{ borderColor: "var(--rule)" }}
        >
          {importingPick ? "Importing…" : "Read Summary"}
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-[12px] mb-[28px] flex-wrap">
        <div className="relative flex-1 min-w-[140px]">
          <Search size={14} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
          <input
            type="text"
            placeholder="Search books…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-[40px] pl-[36px] pr-[12px] rounded-[8px] text-[14px] outline-none bg-[var(--bg-2)] border border-[var(--rule)] text-[var(--ink)] focus:border-[var(--ink-2)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-[6px] overflow-x-auto pb-[2px] scrollbar-none">
          {(["all", "unread", "reading", "finished", "on_hold", "abandoned"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="font-mono text-[9px] tracking-[0.1em] uppercase px-[10px] py-[6px] rounded-full border-none cursor-pointer transition-all whitespace-nowrap"
              style={
                statusFilter === s
                  ? { background: ACCENT, color: "#fff" }
                  : { background: "var(--bg-2)", color: "var(--ink-3)", outline: "1px solid var(--rule)" }
              }
            >
              {s === "all" ? "All" : STATUS_CONFIG[s as ReadingStatus]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-[80px]">
          <BookMarked size={48} className="mx-auto mb-[16px] opacity-20 text-[var(--ink)]" />
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--ink-3)] mb-[20px]">
            {query || statusFilter !== "all" ? "No books match your filters" : "Your library is empty"}
          </div>
          {!query && statusFilter === "all" && (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[16px] py-[10px] rounded-[10px] text-(--bg) border-none cursor-pointer"
              style={{ background: ACCENT }}
            >
              <Plus size={14} /> Upload your first book
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-5 max-[1300px]:grid-cols-4 max-[1000px]:grid-cols-3 max-[700px]:grid-cols-2 max-[400px]:grid-cols-2 gap-[20px]">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={() => setEditingBook(book)}
            />
          ))}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingBook && (
        <EditBookModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSaved={handleBookSaved}
          onDeleted={handleBookDeleted}
        />
      )}
    </>
  );
}

// ─── Book Card ────────────────────────────────────────────────────────────────

function BookCard({ book, onEdit }: { book: ChBookWithStats; onEdit: () => void }): React.ReactElement {
  const cfg = STATUS_CONFIG[book.status] ?? STATUS_CONFIG.unread;

  return (
    <div className="group relative block rounded-[14px] border border-[var(--rule)] bg-[var(--bg-2)] hover:border-[var(--ink-3)] hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Edit button — appears on hover */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
        className="absolute top-[8px] right-[8px] z-10 w-[28px] h-[28px] rounded-full flex items-center justify-center border-none cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
        title="Edit book"
      >
        <Pencil size={12} />
      </button>

      {/* Card is a link for reading */}
      <Link href={`/tools/chapterly/read/${book.id}`} className="block no-underline">
        {/* Cover */}
        <div
          className="w-full aspect-[3/4] flex items-center justify-center relative overflow-hidden"
          style={{ background: ACCENT + "18" }}
        >
          {book.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <BookMarked size={32} style={{ color: ACCENT, opacity: 0.6 }} />
          )}
        </div>

        {/* Meta */}
        <div className="p-[12px]">
          <div className="text-[13px] font-semibold text-[var(--ink)] line-clamp-2 leading-[1.3] mb-[4px]">
            {book.title}
          </div>
          {book.author && (
            <div className="font-mono text-[10px] text-[var(--ink-3)] truncate">
              {book.author}
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-[10px] h-[3px] rounded-full bg-[var(--rule)]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${book.progress_pct}%`, background: `linear-gradient(90deg, ${ACCENT}, #6B8FA0)` }}
            />
          </div>

          {/* Status + % */}
          <div className="flex items-center justify-between mt-[8px]">
            <span
              className="inline-flex items-center gap-[4px] font-mono text-[8px] tracking-[0.08em] uppercase px-[6px] py-[2px] rounded-full"
              style={{ background: cfg.color + "18", color: cfg.color }}
            >
              {cfg.icon}
              {cfg.label}
            </span>
            <span className="font-mono text-[9px] text-[var(--ink-3)]">
              {Math.round(book.progress_pct)}%
            </span>
          </div>

          {/* Mini stats */}
          <div className="flex items-center gap-[10px] mt-[8px] pt-[8px] border-t border-[var(--rule)]">
            {book.highlight_count > 0 && (
              <span className="font-mono text-[8px] text-[var(--ink-3)]">
                {book.highlight_count} ✦
              </span>
            )}
            {book.note_count > 0 && (
              <span className="font-mono text-[8px] text-[var(--ink-3)]">
                {book.note_count} notes
              </span>
            )}
            {book.total_reading_time_minutes > 0 && (
              <span className="font-mono text-[8px] text-[var(--ink-3)]">
                {book.total_reading_time_minutes}m read
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
