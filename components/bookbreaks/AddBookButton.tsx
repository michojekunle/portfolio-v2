"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BOOK_THEMES } from "@/lib/bookbreaks/constants";
import type { BookTheme } from "@/lib/bookbreaks/types";

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
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-[8px] h-[44px] px-[20px] rounded-[8px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-white transition-all duration-150 hover:opacity-90 border-none cursor-pointer"
        style={{ background: "#C85A2C" }}
      >
        + Add Book
      </button>
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
      className="fixed inset-0 z-50 flex items-center justify-center p-[24px]"
      style={{ background: "rgba(44,44,44,0.5)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[580px] max-h-[90vh] overflow-y-auto rounded-[16px]"
        style={{ background: "#FAF5EC", border: "1px solid #D4B896" }}
      >
        <div
          className="sticky top-0 flex items-center justify-between px-[28px] py-[20px] z-10"
          style={{ background: "#FAF5EC", borderBottom: "1px solid #D4B896" }}
        >
          <div
            className="font-display text-[20px] fvs-text"
            style={{ color: "#2C2C2C" }}
          >
            Add a Book
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-full border-none bg-transparent cursor-pointer font-mono text-[14px]"
            style={{ color: "#8B6F47" }}
            aria-label="Close"
          >
            ✕
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
                  className="flex items-center gap-[8px] px-[12px] h-[36px] rounded-[8px] font-mono text-[10px] uppercase tracking-[0.08em] transition-all cursor-pointer border-none"
                  style={{
                    background:
                      theme === t.value ? t.bg : "rgba(44,44,44,0.06)",
                    color: theme === t.value ? t.accent : "#4A3728",
                    outline:
                      theme === t.value ? `2px solid ${t.accent}` : "none",
                    outlineOffset: "2px",
                  }}
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
                  className="w-[36px] h-[36px] rounded-[6px] font-mono text-[16px] transition-all cursor-pointer border-none"
                  style={{
                    background:
                      n <= rating
                        ? "rgba(200,90,44,0.15)"
                        : "rgba(44,44,44,0.06)",
                    color: n <= rating ? "#C85A2C" : "#8B6F47",
                    outline:
                      n <= rating ? "1.5px solid rgba(200,90,44,0.3)" : "none",
                  }}
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
                  className="inline-flex items-center gap-[4px] font-mono text-[10px] uppercase tracking-[0.08em] px-[8px] py-[3px] rounded-full"
                  style={{
                    background: "rgba(200,90,44,0.1)",
                    color: "#C85A2C",
                  }}
                >
                  {g}
                  <button
                    type="button"
                    onClick={() => removeGenre(g)}
                    className="bg-transparent border-none cursor-pointer p-0 leading-none text-[11px]"
                    style={{ color: "#C85A2C" }}
                    aria-label={`Remove ${g}`}
                  >
                    ✕
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
                    className="font-mono text-[9px] uppercase tracking-[0.1em] px-[8px] py-[3px] rounded-full cursor-pointer border-none transition-all"
                    style={{
                      background: "rgba(44,44,44,0.06)",
                      color: "#8B6F47",
                    }}
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
                    className="font-mono text-[10px] mt-[14px] flex-shrink-0 w-[16px]"
                    style={{ color: "#8B6F47" }}
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
              className="rounded-[8px] px-[14px] py-[10px] font-mono text-[11px]"
              style={{
                background: "rgba(220,38,38,0.08)",
                color: "#DC2626",
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              {error}
            </div>
          )}

          <div className="flex gap-[12px] pt-[8px]">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-[48px] rounded-[8px] font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-white transition-all duration-150 disabled:opacity-60 cursor-pointer border-none hover:opacity-90"
              style={{ background: "#C85A2C" }}
            >
              {loading ? "Saving…" : "Save Book"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-[48px] px-[20px] rounded-[8px] font-mono text-[11px] uppercase tracking-[0.12em] cursor-pointer border-none transition-all"
              style={{
                background: "rgba(44,44,44,0.06)",
                color: "#8B6F47",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

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
          background: #F5E6D3;
          border: 1.5px solid #D4B896;
          color: #2C2C2C;
        }
        .bb-input::placeholder { color: #B3A08A; }
        .bb-input:focus { border-color: #C85A2C; }
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
        className="block font-mono text-[10px] tracking-[0.12em] uppercase mb-[8px]"
        style={{ color: "#8B6F47" }}
      >
        {label}
        {required && (
          <span className="ml-[4px]" style={{ color: "#C85A2C" }}>
            *
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
