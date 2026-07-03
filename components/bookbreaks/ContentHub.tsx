"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CONTENT_TYPE_LABELS, CONTENT_TYPE_ICONS, BOOK_THEMES } from "@/lib/bookbreaks/constants";
import { BBContentActions } from "@/components/bookbreaks/ContentActions";
import { Sparkles, Search, ChevronDown, FileText, Filter, X } from "lucide-react";

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  content_type: string;
  status: string;
  book_id: string;
  book_title: string;
  book_author: string;
}

interface ContentHubProps {
  content: ContentItem[];
  books: { id: string; theme: string }[];
}

/** Very lightweight markdown → HTML renderer for the most common patterns */
function renderMarkdown(raw: string): string {
  let html = raw
    // Escape HTML entities first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Blockquote
    .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
    // Unordered list items (handle -, * , +)
    .replace(/^[*\-+] (.+)$/gm, "<li>$1</li>")
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Horizontal rules
    .replace(/^---+$/gm, "<hr />")
    // Double newline → paragraph break
    .replace(/\n\n/g, "</p><p>")
    // Single newline → <br>
    .replace(/\n/g, "<br />");

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*?<\/li>(\s*<br \/>)*)+/g, (match) => {
    const cleaned = match.replace(/<br \/>/g, "");
    return `<ul>${cleaned}</ul>`;
  });

  return `<p>${html}</p>`;
}

function MarkdownContent({ content }: { content: string }) {
  const html = useMemo(() => renderMarkdown(content), [content]);
  return (
    <div
      className="bb-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const STATUS_CONFIG = {
  published: {
    label: "Published",
    bg: "color-mix(in oklab, #22c55e 12%, transparent)",
    color: "color-mix(in oklab, #16a34a 100%, transparent)",
    border: "color-mix(in oklab, #22c55e 25%, transparent)",
  },
  draft: {
    label: "Draft",
    bg: "color-mix(in oklab, var(--ink-3) 8%, transparent)",
    color: "var(--ink-3)",
    border: "color-mix(in oklab, var(--ink-3) 15%, transparent)",
  },
} as const;

export function ContentHub({ content, books }: ContentHubProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const contentTypes = useMemo(
    () => [...new Set(content.map((c) => c.content_type))],
    [content]
  );

  const filtered = useMemo(() => {
    return content.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q) ||
        c.book_title.toLowerCase().includes(q);
      const matchesType = typeFilter === "all" || c.content_type === typeFilter;
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter, content]);

  const grouped = useMemo(() => {
    const map: Record<string, ContentItem[]> = {};
    filtered.forEach((c) => {
      if (!map[c.content_type]) map[c.content_type] = [];
      map[c.content_type].push(c);
    });
    return map;
  }, [filtered]);

  const hasFilters = search || typeFilter !== "all" || statusFilter !== "all";

  return (
    <div className="px-[48px] py-[48px] max-[1024px]:pt-[80px] max-[720px]:px-[24px] max-[720px]:pb-[24px] max-[720px]:pt-[80px]">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-[40px] max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-[16px]">
        <div>
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase mb-[8px] text-[var(--ink-3)]">
            Content Hub
          </div>
          <h1 className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.025em] fvs-text m-0 text-[var(--ink)]">
            All Content
          </h1>
          <p className="text-[14px] mt-[6px] m-0 text-[var(--ink-3)]">
            {content.length} piece{content.length !== 1 ? "s" : ""} generated
          </p>
        </div>

        {/* Generate CTA */}
        <a
          href="/tools/bookbreaks/generate"
          className="group inline-flex items-center gap-[10px] h-[48px] px-[24px] rounded-[12px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-(--bg) no-underline transition-all duration-200 hover:opacity-90 hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0"
          style={{
            background: "var(--v3-accent)",
            boxShadow: "0 2px 12px color-mix(in oklab, var(--v3-accent) 30%, transparent)",
          }}
        >
          <Sparkles size={14} className="transition-transform duration-200 group-hover:rotate-12" />
          Generate More
        </a>
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div
        className="rounded-[12px] p-[16px] mb-[32px] flex flex-wrap gap-[10px] items-center"
        style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[140px]">
          <Search
            size={13}
            className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[var(--ink-4)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search content, books…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[38px] pl-[34px] pr-[12px] rounded-[8px] text-[13px] font-[inherit] outline-none transition-all"
            style={{
              background: "var(--bg)",
              border: "1.5px solid var(--rule)",
              color: "var(--ink)",
            }}
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-[6px] flex-wrap">
          {["all", ...contentTypes].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="h-[34px] px-[12px] rounded-[8px] font-mono text-[9px] uppercase tracking-[0.1em] cursor-pointer border transition-all duration-150"
              style={{
                background: typeFilter === t
                  ? "color-mix(in oklab, var(--v3-accent) 12%, transparent)"
                  : "transparent",
                borderColor: typeFilter === t ? "var(--v3-accent)" : "var(--rule)",
                color: typeFilter === t ? "var(--v3-accent)" : "var(--ink-3)",
              }}
            >
              {t === "all" ? "All Types" : (CONTENT_TYPE_LABELS[t] ?? t)}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-[6px]">
          {["all", "published", "draft"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="h-[34px] px-[12px] rounded-[8px] font-mono text-[9px] uppercase tracking-[0.1em] cursor-pointer border transition-all duration-150"
              style={{
                background: statusFilter === s
                  ? "color-mix(in oklab, var(--v3-accent) 12%, transparent)"
                  : "transparent",
                borderColor: statusFilter === s ? "var(--v3-accent)" : "var(--rule)",
                color: statusFilter === s ? "var(--v3-accent)" : "var(--ink-3)",
              }}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }}
            className="flex items-center gap-[4px] h-[34px] px-[10px] rounded-[8px] font-mono text-[9px] uppercase tracking-[0.1em] cursor-pointer border-none bg-transparent text-[var(--ink-4)] hover:text-[var(--ink-2)] transition-colors"
          >
            <X size={10} /> Clear
          </button>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-[32px]">
          {Object.entries(grouped).map(([type, items]) => (
            <section key={type}>
              {/* Group header */}
              <div className="flex items-center gap-[10px] mb-[14px]">
                <span className="text-[var(--v3-accent)] text-[16px]">
                  {CONTENT_TYPE_ICONS[type]}
                </span>
                <h2 className="font-mono text-[10px] tracking-[0.16em] uppercase font-semibold text-[var(--ink-3)] m-0">
                  {CONTENT_TYPE_LABELS[type] ?? type}
                </h2>
                <span className="font-mono text-[9px] text-[var(--ink-4)]">
                  ({items.length})
                </span>
                <div className="flex-1 h-[1px] bg-[var(--rule)]" />
              </div>

              <div className="flex flex-col gap-[10px]">
                {items.map((c) => {
                  const bookTheme = books.find((b) => b.id === c.book_id)?.theme ?? "custom";
                  const theme = BOOK_THEMES[bookTheme] ?? BOOK_THEMES.custom;
                  const isExpanded = expandedId === c.id;
                  const statusCfg =
                    STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG] ??
                    STATUS_CONFIG.draft;

                  return (
                    <div
                      key={c.id}
                      className="rounded-[12px] overflow-hidden transition-all duration-200"
                      style={{
                        border: isExpanded
                          ? "1.5px solid color-mix(in oklab, var(--v3-accent) 35%, var(--rule))"
                          : "1.5px solid var(--rule)",
                        background: "var(--bg-2)",
                        boxShadow: isExpanded
                          ? "0 4px 20px color-mix(in oklab, var(--v3-accent) 8%, transparent)"
                          : "none",
                      }}
                    >
                      {/* Card header / summary */}
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        className="w-full flex items-center gap-[14px] p-[18px] cursor-pointer bg-transparent border-none text-left transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--bg)_50%,transparent)]"
                      >
                        {/* Book colour swatch */}
                        <div
                          className="w-[38px] h-[38px] rounded-[8px] flex items-center justify-center text-[15px] flex-shrink-0"
                          style={{
                            background: `${theme.bg}22`,
                            border: `1.5px solid ${theme.bg}44`,
                          }}
                          aria-hidden="true"
                        >
                          {CONTENT_TYPE_ICONS[c.content_type]}
                        </div>

                        {/* Title + meta */}
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-[14px] font-semibold leading-[1.3] text-[var(--ink)] break-words"
                          >
                            {c.title}
                          </div>
                          <div className="font-mono text-[10px] mt-[4px] flex items-center gap-[8px] flex-wrap text-[var(--ink-4)]">
                            <span
                              className="px-[7px] py-[2px] rounded-full text-[8px] uppercase tracking-[0.1em]"
                              style={{
                                background: `${theme.bg}1A`,
                                color: theme.bg,
                                border: `1px solid ${theme.bg}33`,
                              }}
                            >
                              {CONTENT_TYPE_LABELS[c.content_type]}
                            </span>
                            <span
                              className="hidden max-[480px]:inline-block font-mono text-[8px] uppercase tracking-[0.15em] px-[8px] py-[2px] rounded-full"
                              style={{
                                  background: statusCfg.bg,
                                  color: statusCfg.color,
                                  border: `1px solid ${statusCfg.border}`,
                              }}
                            >
                              {statusCfg.label}
                            </span>
                            <span className="truncate max-[480px]:max-w-[120px]">{c.book_title}</span>
                            <span>·</span>
                            <span className="truncate max-[480px]:max-w-[100px]">{c.book_author}</span>
                          </div>
                        </div>

                        {/* Status badge + chevron */}
                        <div className="flex items-center gap-[10px] flex-shrink-0">
                          <span
                            className="font-mono text-[8px] uppercase tracking-[0.1em] px-[8px] py-[3px] rounded-full max-[480px]:hidden"
                            style={{
                              background: statusCfg.bg,
                              color: statusCfg.color,
                              border: `1px solid ${statusCfg.border}`,
                            }}
                          >
                            {statusCfg.label}
                          </span>
                          <ChevronDown
                            size={14}
                            className="text-[var(--ink-4)] transition-transform duration-200"
                            style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                          />
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div
                          className="px-[18px] pb-[18px]"
                          style={{ borderTop: "1px solid var(--rule)" }}
                        >
                          {/* Markdown content */}
                          <div
                            className="mt-[16px] mb-[16px] max-h-[500px] overflow-y-auto rounded-[8px] p-[16px]"
                            style={{
                              background: "color-mix(in oklab, var(--bg) 60%, var(--bg-2))",
                              border: "1px solid var(--rule-2)",
                            }}
                          >
                            <MarkdownContent content={c.content} />
                          </div>
                          <BBContentActions
                            contentId={c.id}
                            content={c.content}
                            status={c.status}
                            bookTitle={c.book_title}
                            bookAuthor={c.book_author}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        // Empty state
        <div
          className="rounded-[16px] p-[80px] text-center"
          style={{
            border: "1.5px dashed var(--rule)",
            background: "var(--bg-2)",
          }}
        >
          <div className="mb-[16px] text-[var(--v3-accent)]">
            <Sparkles size={48} className="mx-auto opacity-60" />
          </div>
          {hasFilters ? (
            <>
              <h2 className="font-display text-[22px] fvs-text font-normal m-0 mb-[8px] text-[var(--ink)]">
                No results found.
              </h2>
              <p className="text-[14px] leading-[1.65] mb-[24px] max-w-[36ch] mx-auto text-[var(--ink-3)]">
                Try adjusting your search or filters.
              </p>
              <button
                onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }}
                className="inline-flex items-center gap-[8px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold cursor-pointer bg-transparent border-none text-[var(--v3-accent)] hover:opacity-70 transition-opacity"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <h2 className="font-display text-[24px] fvs-text font-normal m-0 mb-[10px] text-[var(--ink)]">
                No content yet.
              </h2>
              <p className="text-[14px] leading-[1.65] mb-[24px] max-w-[40ch] mx-auto text-[var(--ink-3)]">
                Generate your first piece of content and it'll appear here for easy access and management.
              </p>
              <Link
                href="/tools/bookbreaks/generate"
                className="inline-flex items-center gap-[8px] h-[44px] px-[22px] rounded-[10px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold no-underline text-(--bg) transition-all duration-200 hover:opacity-90"
                style={{ background: "var(--v3-accent)" }}
              >
                <Sparkles size={13} /> Generate Content
              </Link>
            </>
          )}
        </div>
      )}

      {/* Markdown prose styles */}
      <style>{`
        .bb-prose {
          font-size: 13.5px;
          line-height: 1.75;
          color: var(--ink-2);
          font-family: inherit;
        }
        .bb-prose p { margin: 0 0 0.75em; }
        .bb-prose p:last-child { margin-bottom: 0; }
        .bb-prose h1, .bb-prose h2, .bb-prose h3 {
          font-family: var(--display-font, inherit);
          font-weight: 600;
          color: var(--ink);
          margin: 1.2em 0 0.4em;
          line-height: 1.2;
        }
        .bb-prose h1 { font-size: 1.4em; }
        .bb-prose h2 { font-size: 1.2em; }
        .bb-prose h3 { font-size: 1.05em; }
        .bb-prose strong { font-weight: 700; color: var(--ink); }
        .bb-prose em { font-style: italic; }
        .bb-prose code {
          font-family: ui-monospace, monospace;
          font-size: 0.85em;
          padding: 1px 5px;
          border-radius: 4px;
          background: color-mix(in oklab, var(--v3-accent) 8%, transparent);
          color: var(--v3-accent);
        }
        .bb-prose blockquote {
          border-left: 3px solid var(--v3-accent);
          margin: 0.75em 0;
          padding: 0.25em 0 0.25em 1em;
          color: var(--ink-3);
          font-style: italic;
        }
        .bb-prose ul {
          margin: 0.5em 0 0.75em;
          padding-left: 1.4em;
          list-style: disc;
        }
        .bb-prose li { margin: 0.2em 0; }
        .bb-prose hr {
          border: none;
          border-top: 1px solid var(--rule);
          margin: 1.2em 0;
        }
      `}</style>
    </div>
  );
}
