"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BOOK_THEMES, CONTENT_TYPE_LABELS, CONTENT_TYPE_ICONS, TONE_OPTIONS } from "@/lib/bookbreaks/constants";
import type { BBBookWithContent, ContentType } from "@/lib/bookbreaks/types";
import { CarouselPreview } from "@/components/bookbreaks/CarouselPreview";
import { Sparkles, BookOpen, ArrowRight } from "lucide-react";

const CONTENT_TYPES: ContentType[] = ["article", "thread", "carousel", "tiktok", "caption"];

interface Props {
  books: BBBookWithContent[];
  defaultTone: string;
  defaultWordCount: number;
}

export function BBGenerator({ books, defaultTone, defaultWordCount }: Props): React.ReactElement {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const preselectedBook = searchParams.get("book") ?? "";

  const [bookId, setBookId] = useState(preselectedBook || (books[0]?.id ?? ""));
  const [contentType, setContentType] = useState<ContentType>("thread");
  const [tone, setTone] = useState(defaultTone);
  const [wordCount, setWordCount] = useState(defaultWordCount);
  const [keywords, setKeywords] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outputRef = useRef<HTMLDivElement>(null);

  const selectedBook = books.find((b) => b.id === bookId);
  const selectedTheme = selectedBook ? (BOOK_THEMES[selectedBook.theme] ?? BOOK_THEMES.custom) : BOOK_THEMES.custom;

  const handleGenerate = async (): Promise<void> => {
    if (!bookId) {
      setError("Please select a book.");
      return;
    }

    setGenerating(true);
    setGenerated("");
    setSaved(false);
    setError(null);

    const res = await fetch("/api/bookbreaks/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        book_id: bookId,
        content_type: contentType,
        tone,
        word_count: contentType === "article" ? wordCount : undefined,
        seo_keywords: keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        custom_instructions: customInstructions.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const data: unknown = await res.json().catch(() => ({}));
      const msg =
        data && typeof data === "object" && "error" in data
          ? String((data as { error: unknown }).error)
          : "Generation failed";
      setError(msg);
      setGenerating(false);
      return;
    }

    if (!res.body) {
      setError("No response body from server.");
      setGenerating(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";

    // Scroll output into view
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        accumulated += text;
        setGenerated(accumulated);
      }
    } catch (streamErr) {
      const msg = streamErr instanceof Error ? streamErr.message : "Stream interrupted";
      setError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!generated || !selectedBook) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setSaving(false);
      return;
    }

    const title = `${CONTENT_TYPE_LABELS[contentType]}: ${selectedBook.title}`;
    const wordCountEstimate = generated.split(/\s+/).length;

    const { error: saveError } = await supabase
      .from("bb_generated_content")
      .insert({
        user_id: user.id,
        book_id: bookId,
        content_type: contentType,
        platform: contentType === "article" ? "blog" : contentType === "thread" ? "x" : contentType === "caption" ? "instagram" : contentType,
        title,
        content: generated,
        metadata: {
          word_count: wordCountEstimate,
          seo_keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        },
        status: "draft",
        regenerate_count: 0,
      });

    if (saveError) {
      setError(saveError.message);
    } else {
      setSaved(true);
    }

    setSaving(false);
  };

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(generated);
  };

  if (books.length === 0) {
    return (
      <div
        className="rounded-[12px] p-[48px] text-center bg-[var(--bg-2)] border-[1.5px] border-dashed border-[var(--rule)]"
      >
        <div className="mb-[16px] text-[var(--v3-accent)]"><BookOpen size={48} className="mx-auto" /></div>
        <p className="font-mono text-[12px] uppercase tracking-[0.1em] mb-[20px] text-[var(--ink-3)]">
          No books in your library yet
        </p>
        <a
          href="/tools/bookbreaks/books"
          className="inline-flex items-center gap-[8px] font-mono text-[12px] uppercase tracking-[0.12em] font-semibold no-underline text-[var(--v3-accent)] hover:opacity-80"
        >
          Add a book first <ArrowRight size={14} className="ml-1 inline-block" />
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[360px_1fr] max-[1100px]:grid-cols-1 gap-[32px] items-start">
      {/* Controls panel */}
      <div
        className="rounded-[16px] overflow-hidden sticky top-[24px] max-[1100px]:static bg-[var(--bg-2)] border border-[var(--rule)]"
      >
        <div
          className="px-[24px] py-[20px] border-b border-[var(--rule)] bg-[color-mix(in_oklab,var(--bg-2)_95%,var(--ink))] "
        >
          <div
            className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--ink-3)]"
          >
            Configuration
          </div>
        </div>

        <div className="p-[24px] space-y-[20px]">
          {/* Book selector */}
          <div>
            <label
              className="block font-mono text-[11px] tracking-[0.12em] uppercase mb-[8px] text-[var(--ink-3)]"
            >
              Book
            </label>
            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              className="w-full h-[44px] px-[14px] rounded-[8px] font-mono text-[14px] outline-none cursor-pointer bg-[var(--bg)] border-[1.5px] border-[var(--rule)] text-[var(--ink)] focus:border-[var(--v3-accent)]"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
            {selectedBook && (
              <div
                className="mt-[8px] h-[3px] rounded-full"
                style={{ background: selectedTheme.bg }}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Content type */}
          <div>
            <label
              className="block font-mono text-[11px] tracking-[0.12em] uppercase mb-[10px] text-[var(--ink-3)]"
            >
              Content Type
            </label>
            <div className="grid grid-cols-2 gap-[6px] max-[480px]:grid-cols-3">
              {CONTENT_TYPES.map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => setContentType(ct)}
                  className="flex items-center gap-[6px] h-[38px] px-[10px] rounded-[8px] font-mono text-[10px] uppercase tracking-[0.08em] transition-all cursor-pointer border-none text-left"
                  style={{
                    background:
                      contentType === ct
                        ? "color-mix(in oklab, var(--v3-accent) 15%, transparent)"
                        : "var(--bg)",
                    color: contentType === ct ? "var(--v3-accent)" : "var(--ink-2)",
                    fontWeight: contentType === ct ? 600 : 400,
                    outline:
                      contentType === ct
                        ? "1.5px solid var(--v3-accent)"
                        : "1px solid var(--rule)",
                  }}
                >
                  <span aria-hidden="true">{CONTENT_TYPE_ICONS[ct]}</span>
                  {ct === "tiktok" ? "TikTok" : ct === "carousel" ? "Carousel" : ct.charAt(0).toUpperCase() + ct.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label
              className="block font-mono text-[11px] tracking-[0.12em] uppercase mb-[8px] text-[var(--ink-3)]"
            >
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full h-[44px] px-[14px] rounded-[8px] font-mono text-[14px] outline-none cursor-pointer bg-[var(--bg)] border-[1.5px] border-[var(--rule)] text-[var(--ink)] focus:border-[var(--v3-accent)]"
            >
              {TONE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Word count — articles only */}
          {contentType === "article" && (
            <div>
              <label
                className="block font-mono text-[10px] tracking-[0.12em] uppercase mb-[8px]"
                style={{ color: "var(--ink-3)" }}
              >
                Target Word Count
              </label>
              <input
                type="number"
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                min={500}
                max={3000}
                step={100}
                className="w-full h-[44px] px-[14px] rounded-[8px] font-mono text-[14px] outline-none bg-[var(--bg)] border-[1.5px] border-[var(--rule)] text-[var(--ink)] focus:border-[var(--v3-accent)]"
              />
            </div>
          )}

          {/* SEO keywords — articles only */}
          {contentType === "article" && (
            <div>
              <label
                className="block font-mono text-[10px] tracking-[0.12em] uppercase mb-[8px]"
                style={{ color: "var(--ink-3)" }}
              >
                SEO Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="book review, entrepreneurship, productivity"
                className="w-full h-[44px] px-[14px] rounded-[8px] font-mono text-[14px] outline-none bg-[var(--bg)] border-[1.5px] border-[var(--rule)] text-[var(--ink)] focus:border-[var(--v3-accent)]"
              />
            </div>
          )}

          {/* Custom instructions */}
          <div>
            <label
              className="block font-mono text-[11px] tracking-[0.12em] uppercase mb-[8px] text-[var(--ink-3)]"
            >
              Custom Instructions (optional)
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Any specific angle, format, or style notes…"
              rows={3}
              className="w-full px-[14px] py-[12px] rounded-[8px] font-mono text-[14px] outline-none resize-none bg-[var(--bg)] border-[1.5px] border-[var(--rule)] text-[var(--ink)] focus:border-[var(--v3-accent)]"
            />
          </div>

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

          <button
            onClick={handleGenerate}
            disabled={generating || !bookId}
            className="w-full h-[52px] rounded-[10px] font-mono text-[12px] uppercase tracking-[0.14em] font-semibold text-white transition-all duration-150 disabled:opacity-60 cursor-pointer border-none hover:opacity-90 bg-[var(--v3-accent)]"
          >
            {generating
              ? "Generating…"
              : `Generate ${CONTENT_TYPE_LABELS[contentType]}`}
          </button>
        </div>
      </div>

      {/* Output panel */}
      <div ref={outputRef}>
        {generating || generated ? (
          <div
            className="rounded-[16px] overflow-hidden border border-[var(--rule)]"
          >
            {/* Output header */}
            <div
              className="flex items-center justify-between px-[24px] py-[16px]"
              style={{
                background: selectedTheme.bg,
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex items-center gap-[10px]">
                <span className="text-[16px]" aria-hidden="true">
                  {CONTENT_TYPE_ICONS[contentType]}
                </span>
                <div>
                  <div
                    className="font-mono text-[10px] tracking-[0.12em] uppercase"
                    style={{ color: selectedTheme.accent }}
                  >
                    {CONTENT_TYPE_LABELS[contentType]}
                  </div>
                  <div
                    className="font-display text-[16px] fvs-text leading-[1.1]"
                    style={{ color: selectedTheme.text }}
                  >
                    {selectedBook?.title ?? ""}
                  </div>
                </div>
              </div>

              {generating && (
                <div
                  className="flex items-center gap-[6px] font-mono text-[10px] uppercase tracking-[0.1em]"
                  style={{ color: selectedTheme.accent }}
                >
                  <span
                    className="inline-block w-[6px] h-[6px] rounded-full"
                    style={{
                      background: selectedTheme.accent,
                      animation: "pulse 1s infinite",
                    }}
                    aria-hidden="true"
                  />
                  Writing…
                </div>
              )}
            </div>

            {/* Content body */}
            {contentType === "carousel" && generated && !generating ? (
              <div className="p-[28px] max-[720px]:p-[20px]" style={{ background: "var(--bg-2)" }}>
                {/* Visual preview */}
                <CarouselPreview
                  content={generated}
                  bookTheme={selectedTheme}
                  bookTitle={selectedBook?.title ?? ""}
                />
                {/* Raw text toggle */}
                <details className="mt-[20px]">
                  <summary
                    className="font-mono text-[10px] tracking-[0.12em] uppercase cursor-pointer"
                    style={{ color: "var(--ink-3)" }}
                  >
                    View raw slide text ▾
                  </summary>
                  <pre
                    className="whitespace-pre-wrap text-[12px] leading-[1.7] font-mono mt-[12px] p-[16px] rounded-[8px]"
                    style={{ background: "var(--bg)", color: "#4A3728", border: "1px solid #D4B896" }}
                  >
                    {generated}
                  </pre>
                </details>
              </div>
            ) : (
              <div
                className="p-[28px] max-[720px]:p-[20px]"
                style={{ background: "var(--bg-2)" }}
              >
                <pre
                  className="whitespace-pre-wrap text-[14px] leading-[1.75] font-[inherit] m-0"
                  style={{ color: "var(--ink)", fontFamily: "inherit" }}
                >
                  {generated}
                  {generating && (
                    <span
                      className="inline-block w-[2px] h-[18px] ml-[2px] align-middle"
                      style={{
                        background: "#C85A2C",
                        animation: "cursor-blink 1s step-end infinite",
                      }}
                      aria-hidden="true"
                    />
                  )}
                </pre>
              </div>
            )}

            {/* Actions */}
            {!generating && generated && (
              <div
                className="flex items-center gap-[12px] px-[24px] py-[16px] flex-wrap"
                style={{ borderTop: "1px solid #D4B896", background: "#EDD9BA" }}
              >
                <ActionButton
                  onClick={handleCopy}
                  label="Copy"
                  icon="⎘"
                />
                <ActionButton
                  onClick={handleSave}
                  disabled={saving || saved}
                  label={saved ? "✓ Saved" : saving ? "Saving…" : "Save to Hub"}
                  icon="◈"
                  primary={!saved}
                />
                <ActionButton
                  onClick={handleGenerate}
                  label="Regenerate"
                  icon="↻"
                />
                {saved && (
                  <a
                    href="/tools/bookbreaks/content"
                    className="font-mono text-[10px] uppercase tracking-[0.1em] no-underline"
                    style={{ color: "#2D5016" }}
                  >
                    View in Hub →
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            className="rounded-[16px] h-[400px] flex flex-col items-center justify-center text-center p-[40px]"
            style={{ border: "1.5px dashed #D4B896", background: "var(--bg-2)" }}
          >
            <div className="text-[48px] mb-[16px]">✦</div>
            <p
              className="font-mono text-[12px] uppercase tracking-[0.12em] mb-[8px]"
              style={{ color: "var(--ink-3)" }}
            >
              Ready to generate
            </p>
            <p
              className="text-[13px] leading-[1.6] max-w-[32ch]"
              style={{ color: "#B3A08A", fontFamily: "inherit" }}
            >
              Configure your options on the left and hit Generate to create AI-powered content.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function ActionButton({
  onClick,
  label,
  icon,
  disabled,
  primary,
}: {
  onClick: () => void;
  label: string;
  icon: string;
  disabled?: boolean;
  primary?: boolean;
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-[6px] h-[36px] px-[14px] rounded-[6px] font-mono text-[10px] uppercase tracking-[0.1em] font-semibold transition-all duration-150 disabled:opacity-50 cursor-pointer border-none hover:opacity-80"
      style={{
        background: primary ? "#2D5016" : "rgba(44,44,44,0.08)",
        color: primary ? "#FFF" : "#4A3728",
      }}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}
