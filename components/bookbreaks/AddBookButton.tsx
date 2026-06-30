"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BOOK_THEMES } from "@/lib/bookbreaks/constants";
import type { BookTheme } from "@/lib/bookbreaks/types";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";

const THEME_OPTIONS = Object.entries(BOOK_THEMES).map(([value, cfg]) => ({
  value: value as BookTheme,
  label: cfg.label,
  bg: cfg.bg,
  accent: cfg.accent,
}));

const GENRE_SUGGESTIONS = [
  "entrepreneurship",
  "sales",
  "marketing",
  "self-development",
  "creativity",
  "faith",
  "business",
  "psychology",
  "economics",
  "leadership",
];

export function BBAddBookButton(): React.ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-[8px] h-[44px] px-[20px] rounded-[8px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-white transition-all duration-150 hover:opacity-90 border-none cursor-pointer bg-[var(--v3-accent)]"
      >
        <Plus size={14} /> Add Book
      </motion.button>
      {open && <AddBookModal onClose={() => setOpen(false)} />}
    </>
  );
}

function AddBookModal({
  onClose,
}: {
  onClose: () => void;
}): React.ReactElement {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [theme, setTheme] = useState<BookTheme>("custom");
  const [rating, setRating] = useState<number>(0);
  const [genres, setGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState("");
  const [notes, setNotes] = useState("");
  const [insights, setInsights] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInsightChange = (i: number, val: string): void => {
    setInsights((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const addGenre = (g: string): void => {
    const trimmed = g.trim().toLowerCase();
    if (trimmed && !genres.includes(trimmed)) {
      setGenres((prev) => [...prev, trimmed]);
    }
    setGenreInput("");
  };

  const removeGenre = (g: string): void => {
    setGenres((prev) => prev.filter((x) => x !== g));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const filledInsights = insights.filter((s) => s.trim().length > 0);

    const { error: insertError } = await supabase.from("bb_books").insert({
      user_id: user.id,
      title: title.trim(),
      author: author.trim(),
      theme,
      rating: rating > 0 ? rating : null,
      genres,
      notes: notes.trim() || null,
      insights: filledInsights,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onClose();
    router.refresh();
  };

  const selectedTheme = BOOK_THEMES[theme];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-[20px] bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-[580px] max-h-[90vh] overflow-y-auto rounded-[16px] bg-[var(--bg-2)] border border-[var(--rule)]"
        data-lenis-prevent="true"
      >
        <div
          className="sticky top-0 flex items-center justify-between px-[28px] py-[20px] z-10 bg-[var(--bg-2)] border-b border-[var(--rule)]"
        >
          <div
            className="font-display text-[20px] fvs-text text-[var(--ink)]"
          >
            Add a Book
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] border-none bg-transparent cursor-pointer font-mono text-[14px] text-[var(--ink-2)] hover:bg-[color-mix(in_oklab,var(--bg)_80%,var(--ink))] hover:text-[var(--v3-accent)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-[28px] space-y-[20px]">
          {/* Title + Author */}
          <div className="grid grid-cols-2 max-[480px]:grid-cols-1 gap-[16px]">
            <Field label="Book Title" required>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="The Diary of a CEO"
                className="bb-input"
              />
            </Field>
            <Field label="Author" required>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                placeholder="Steven Bartlett"
                className="bb-input"
              />
            </Field>
          </div>

          {/* Theme */}
          <Field label="Visual Theme">
            <div className="flex flex-wrap gap-[8px]">
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  className={`flex items-center gap-[8px] px-[12px] h-[36px] rounded-[8px] font-mono text-[10px] uppercase tracking-[0.08em] transition-all cursor-pointer border-none ${
                    theme === t.value
                      ? "ring-2 ring-offset-2 ring-offset-transparent"
                      : "bg-[var(--bg-2)] text-[var(--ink-2)]"
                  }`}
                  style={
                    theme === t.value
                      ? { background: t.bg, color: t.accent, '--tw-ring-color': t.accent } as React.CSSProperties
                      : {}
                  }
                >
                  <span
                    className="w-[8px] h-[8px] rounded-full flex-shrink-0"
                    style={{ background: t.accent }}
                    aria-hidden="true"
                  />
                  {t.value}
                </button>
              ))}
            </div>
            <div
              className="mt-[8px] h-[4px] rounded-full"
              style={{ background: selectedTheme.bg }}
              aria-hidden="true"
            />
          </Field>

          {/* Rating */}
          <Field label="Your Rating">
            <div className="flex gap-[8px]">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? 0 : n)}
                  className={`w-[36px] h-[36px] rounded-[6px] font-mono text-[16px] transition-all cursor-pointer border-none ${
                    n <= rating
                      ? "bg-[var(--v3-accent)]/15 text-[var(--v3-accent)] ring-1 ring-[var(--v3-accent)]/30"
                      : "bg-[var(--bg-2)] text-[var(--ink-3)]"
                  }`}
                  aria-label={`${n} star${n !== 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>
          </Field>

          {/* Genres */}
          <Field label="Genres">
            <div className="flex flex-wrap gap-[6px] mb-[8px]">
              {genres.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-[4px] font-mono text-[10px] uppercase tracking-[0.08em] px-[8px] py-[3px] rounded-full bg-[var(--v3-accent)]/10 text-[var(--v3-accent)]"
                >
                  {g}
                  <button
                    type="button"
                    onClick={() => removeGenre(g)}
                    className="bg-transparent border-none cursor-pointer p-0 leading-none text-[11px] text-[var(--v3-accent)] hover:opacity-70 transition-opacity"
                    aria-label={`Remove ${g}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-[8px]">
              <input
                type="text"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addGenre(genreInput);
                  }
                }}
                placeholder="Type a genre and press Enter"
                className="bb-input flex-1"
              />
            </div>
            <div className="flex flex-wrap gap-[6px] mt-[8px]">
              {GENRE_SUGGESTIONS.filter((g) => !genres.includes(g)).map(
                (g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => addGenre(g)}
                    className="font-mono text-[9px] uppercase tracking-[0.1em] px-[8px] py-[3px] rounded-full cursor-pointer border-none transition-all bg-[var(--bg-2)] text-[var(--ink-3)] hover:text-[var(--ink)]"
                  >
                    + {g}
                  </button>
                )
              )}
            </div>
          </Field>

          {/* Key insights */}
          <Field label="Key Insights (up to 5)">
            <div className="space-y-[8px]">
              {insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-[8px]">
                  <span
                    className="font-mono text-[10px] mt-[14px] flex-shrink-0 w-[16px] text-[var(--ink-3)]"
                  >
                    {i + 1}.
                  </span>
                  <input
                    type="text"
                    value={ins}
                    onChange={(e) => handleInsightChange(i, e.target.value)}
                    placeholder={`Insight ${i + 1}…`}
                    className="bb-input flex-1"
                  />
                </div>
              ))}
            </div>
          </Field>

          {/* Notes */}
          <Field label="Personal Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did this book mean to you? How will you apply it?"
              rows={3}
              className="bb-input resize-none"
              style={{ height: "auto" }}
            />
          </Field>

          {error && (
            <div
              className="rounded-[8px] px-[14px] py-[10px] font-mono text-[11px] bg-red-500/10 text-red-500 border border-red-500/20"
            >
              {error}
            </div>
          )}

          <div className="flex gap-[12px] pt-[8px]">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="flex-1 h-[48px] rounded-[8px] font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-white transition-all duration-150 disabled:opacity-60 cursor-pointer border-none hover:opacity-90 bg-[var(--v3-accent)]"
            >
              {loading ? "Saving…" : "Save Book"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="h-[48px] px-[20px] rounded-[8px] font-mono text-[11px] uppercase tracking-[0.12em] cursor-pointer border-none transition-all bg-[var(--bg-2)] text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[color-mix(in_oklab,var(--bg)_80%,var(--ink))]"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>

      <style>{`
        .bb-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
          background: color-mix(in oklab, var(--bg-2) 60%, var(--bg));
          border: 1.5px solid var(--rule);
          color: var(--ink);
        }
        .bb-input::placeholder { color: var(--ink-3); }
        .bb-input:focus { border-color: var(--v3-accent); }
        textarea.bb-input { height: auto; padding: 12px 14px; }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div>
      <label
        className="block font-mono text-[10px] tracking-[0.12em] uppercase mb-[8px] text-[var(--ink-3)]"
      >
        {label}
        {required && (
          <span className="ml-[4px] text-[var(--v3-accent)]">
            *
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
