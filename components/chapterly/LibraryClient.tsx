"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type {
  ChBookWithStats,
  ReadingStatus,
  FileFormat,
} from "@/lib/chapterly/types";
import {
  BookMarked,
  Plus,
  Search,
  Upload,
  X,
  BookOpen,
  CheckCircle,
  Clock,
  PauseCircle,
  XCircle,
  Circle,
  Loader2,
  AlertCircle,
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

function detectFormat(filename: string): FileFormat {
  const ext = filename.toLowerCase().split(".").pop();
  const map: Record<string, FileFormat> = {
    pdf: "pdf",
    epub: "epub",
    docx: "docx",
    txt: "txt",
    md: "md",
    html: "html",
    htm: "html",
    fb2: "fb2",
    cbz: "cbz",
    azw3: "azw3",
    mobi: "mobi",
  };
  return map[ext ?? ""] ?? "other";
}

interface Props {
  books: ChBookWithStats[];
  atFreeLimit: boolean;
  freeLimit: number;
}

export function ChLibraryClient({
  books: initialBooks,
  atFreeLimit,
  freeLimit,
}: Props): React.ReactElement {
  const [books, setBooks] = useState(initialBooks);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | "all">(
    "all"
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const filtered = books.filter((b) => {
    const matchQuery =
      !query ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author?.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const handleFile = async (file: File): Promise<void> => {
    if (atFreeLimit && books.length >= freeLimit) {
      setUploadError(
        `Free plan is limited to ${freeLimit} books. Upgrade to add more.`
      );
      return;
    }

    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > MAX_FILE_MB) {
      setUploadError(`File too large. Maximum is ${MAX_FILE_MB}MB.`);
      return;
    }

    const ext = file.name.toLowerCase().split(".").pop();
    if (!ALLOWED_EXTENSIONS.some((e) => e === `.${ext}`)) {
      setUploadError(
        `Unsupported format. Supported: ${ALLOWED_EXTENSIONS.join(", ")}`
      );
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const safeName = `${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      )}`;
      const path = `chapterly/${user.id}/${safeName}`;

      const { error: storageError } = await supabase.storage
        .from("user-uploads")
        .upload(path, file, { upsert: false });

      if (storageError) throw new Error(storageError.message);

      const { data: urlData } = supabase.storage
        .from("user-uploads")
        .getPublicUrl(path);

      const titleGuess = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]/g, " ");
      const format = detectFormat(file.name);

      const { data: bookRow, error: dbError } = await supabase
        .from("ch_books")
        .insert({
          user_id: user.id,
          title: titleGuess,
          file_url: urlData.publicUrl,
          file_format: format,
          file_size_bytes: file.size,
          status: "unread",
        })
        .select()
        .single();

      if (dbError) throw new Error(dbError.message);

      setBooks((prev) => [
        {
          ...bookRow,
          total_reading_time_minutes: 0,
          highlight_count: 0,
          note_count: 0,
          session_count: 0,
        },
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
            if (!atFreeLimit || books.length < freeLimit) setShowUpload(true);
            else
              setUploadError(
                `Free plan limit: ${freeLimit} books. Upgrade to add more.`
              );
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
              onClick={() => {
                setShowUpload(false);
                setUploadError(null);
              }}
              className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)]"
            >
              <X size={16} />
            </button>
          </div>
          <div
            className={`m-[20px] rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center py-[48px] max-[480px]:py-[28px] px-[24px] text-center transition-all cursor-pointer ${
              dragOver
                ? "border-[#4F6D7A] bg-[rgba(79,109,122,0.06)]"
                : "border-[var(--rule)]"
            } ${uploading ? "pointer-events-none opacity-60" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.epub,.docx,.txt,.md,.html,.fb2,.cbz"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
            {uploading ? (
              <Loader2
                size={36}
                className="animate-spin mb-[16px]"
                style={{ color: ACCENT }}
              />
            ) : (
              <Upload
                size={36}
                className="mb-[16px] opacity-40 text-[var(--ink)]"
              />
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
                onClick={(e) => {
                  e.stopPropagation();
                  fileRef.current?.click();
                }}
              >
                Browse files
              </button>
            )}
          </div>
          {uploadError && (
            <div
              className="mx-[20px] mb-[20px] rounded-[8px] px-[16px] py-[12px] flex items-start gap-[10px] text-[13px]"
              style={{
                background: "rgba(220,38,38,0.08)",
                color: "#DC2626",
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              <AlertCircle size={16} className="shrink-0 mt-[1px]" />
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex items-center gap-[12px] mb-[28px] flex-wrap">
        <div className="relative flex-1 min-w-[140px]">
          <Search
            size={14}
            className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[var(--ink-3)]"
          />
          <input
            type="text"
            placeholder="Search books…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-[40px] pl-[36px] pr-[12px] rounded-[8px] text-[14px] outline-none bg-[var(--bg-2)] border border-[var(--rule)] text-[var(--ink)] focus:border-[var(--ink-2)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-[6px] overflow-x-auto pb-[2px] scrollbar-none">
          {(
            [
              "all",
              "unread",
              "reading",
              "finished",
              "on_hold",
              "abandoned",
            ] as const
          ).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="font-mono text-[9px] tracking-[0.1em] uppercase px-[10px] py-[6px] rounded-full border-none cursor-pointer transition-all"
              style={
                statusFilter === s
                  ? { background: ACCENT, color: "#fff" }
                  : {
                      background: "var(--bg-2)",
                      color: "var(--ink-3)",
                      outline: "1px solid var(--rule)",
                    }
              }
            >
              {s === "all"
                ? "All"
                : STATUS_CONFIG[s as ReadingStatus]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-[80px]">
          <BookMarked
            size={48}
            className="mx-auto mb-[16px] opacity-20 text-[var(--ink)]"
          />
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--ink-3)] mb-[20px]">
            {query || statusFilter !== "all"
              ? "No books match your filters"
              : "Your library is empty"}
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
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </>
  );
}

function BookCard({ book }: { book: ChBookWithStats }): React.ReactElement {
  const cfg = STATUS_CONFIG[book.status] ?? STATUS_CONFIG.unread;

  return (
    <Link
      href={`/tools/chapterly/read/${book.id}`}
      className="group block no-underline rounded-[14px] border border-[var(--rule)] bg-[var(--bg-2)] hover:border-[var(--ink-3)] hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Cover */}
      <div
        className="w-full aspect-[3/4] flex items-center justify-center"
        style={{ background: ACCENT + "18" }}
      >
        <BookMarked size={32} style={{ color: ACCENT, opacity: 0.6 }} />
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
  );
}
