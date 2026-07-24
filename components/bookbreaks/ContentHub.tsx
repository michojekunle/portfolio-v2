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
    <div className="px-12 py-12 max-[1024px]:pt-20 max-[720px]:px-6 max-[720px]:pb-6 max-[720px]:pt-20">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-10 max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase mb-2 text-muted-foreground">
            Content Hub
          </div>
          <h1 className="font-display font-normal text-[36px] leading-[1.05] tracking-tight fvs-text m-0 text-(--ink)">
            All Content
          </h1>
          <p className="text-[14px] mt-1.5 m-0 text-muted-foreground">
            {content.length} piece{content.length !== 1 ? "s" : ""} generated
          </p>
        </div>

        {/* Generate CTA */}
        <a
          href="/tools/bookbreaks/generate"
          className="group inline-flex items-center gap-2.5 h-12 px-6 rounded-xl font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-(--bg) no-underline transition-all duration-200 hover:opacity-90 hover:-translate-y-0.25 hover:shadow-lg active:translate-y-0"
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
        className="rounded-xl p-4 mb-8 flex flex-wrap gap-2.5 items-center"
        style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-35">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-(--ink-4) pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search content, books…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9.5 pl-8.5 pr-3 rounded-lg text-[13px] font-[inherit] outline-none transition-all"
            style={{
              background: "var(--bg)",
              border: "1.5px solid var(--rule)",
              color: "var(--ink)",
            }}
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", ...contentTypes].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="h-8.5 px-3 rounded-lg font-mono text-[9px] uppercase tracking-widest cursor-pointer border transition-all duration-150"
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
        <div className="flex items-center gap-1.5">
          {["all", "published", "draft"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="h-8.5 px-3 rounded-lg font-mono text-[9px] uppercase tracking-widest cursor-pointer border transition-all duration-150"
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
            className="flex items-center gap-1 h-8.5 px-2.5 rounded-lg font-mono text-[9px] uppercase tracking-widest cursor-pointer border-none bg-transparent text-(--ink-4) hover:text-secondary-foreground transition-colors"
          >
            <X size={10} /> Clear
          </button>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([type, items]) => (
            <section key={type}>
              {/* Group header */}
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="text-(--v3-accent) text-[16px]">
                  {CONTENT_TYPE_ICONS[type]}
                </span>
                <h2 className="font-mono text-[10px] tracking-[0.16em] uppercase font-semibold text-muted-foreground m-0">
                  {CONTENT_TYPE_LABELS[type] ?? type}
                </h2>
                <span className="font-mono text-[9px] text-(--ink-4)">
                  ({items.length})
                </span>
                <div className="flex-1 h-0.25 bg-(--rule)" />
              </div>

              <div className="flex flex-col gap-2.5">
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
                      className="rounded-xl overflow-hidden transition-all duration-200"
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
                        className="w-full flex items-center gap-3.5 p-4.5 cursor-pointer bg-transparent border-none text-left transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--bg)_50%,transparent)]"
                      >
                        {/* Book colour swatch */}
                        <div
                          className="w-9.5 h-9.5 rounded-lg flex items-center justify-center text-[15px] flex-shrink-0"
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
                            className="text-[14px] font-semibold leading-[1.3] text-(--ink) break-words"
                          >
                            {c.title}
                          </div>
                          <div className="font-mono text-[10px] mt-1 flex items-center gap-2 flex-wrap text-(--ink-4)">
                            <span
                              className="px-1.75 py-0.5 rounded-full text-[8px] uppercase tracking-widest"
                              style={{
                                background: `${theme.bg}1A`,
                                color: theme.bg,
                                border: `1px solid ${theme.bg}33`,
                              }}
                            >
                              {CONTENT_TYPE_LABELS[c.content_type]}
                            </span>
                            <span
                              className="hidden max-[480px]:inline-block font-mono text-[8px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full"
                              style={{
                                  background: statusCfg.bg,
                                  color: statusCfg.color,
                                  border: `1px solid ${statusCfg.border}`,
                              }}
                            >
                              {statusCfg.label}
                            </span>
                            <span className="truncate max-[480px]:max-w-30">{c.book_title}</span>
                            <span>·</span>
                            <span className="truncate max-[480px]:max-w-[100px]">{c.book_author}</span>
                          </div>
                        </div>

                        {/* Status badge + chevron */}
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <span
                            className="font-mono text-[8px] uppercase tracking-widest px-2 py-0.75 rounded-full max-[480px]:hidden"
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
                            className="text-(--ink-4) transition-transform duration-200"
                            style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                          />
                        </div>
                      </button>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div
                          className="px-4.5 pb-4.5"
                          style={{ borderTop: "1px solid var(--rule)" }}
                        >
                          {/* Markdown content */}
                          <div
                            className="mt-4 mb-4 max-h-[500px] overflow-y-auto rounded-lg p-4"
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
          className="rounded-2xl p-20 text-center"
          style={{
            border: "1.5px dashed var(--rule)",
            background: "var(--bg-2)",
          }}
        >
          <div className="mb-4 text-(--v3-accent)">
            <Sparkles size={48} className="mx-auto opacity-60" />
          </div>
          {hasFilters ? (
            <>
              <h2 className="font-display text-[22px] fvs-text font-normal m-0 mb-2 text-(--ink)">
                No results found.
              </h2>
              <p className="text-[14px] leading-[1.65] mb-6 max-w-[36ch] mx-auto text-muted-foreground">
                Try adjusting your search or filters.
              </p>
              <button
                onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); }}
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] font-semibold cursor-pointer bg-transparent border-none text-(--v3-accent) hover:opacity-70 transition-opacity"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <h2 className="font-display text-[24px] fvs-text font-normal m-0 mb-2.5 text-(--ink)">
                No content yet.
              </h2>
              <p className="text-[14px] leading-[1.65] mb-6 max-w-[40ch] mx-auto text-muted-foreground">
                Generate your first piece of content and it'll appear here for easy access and management.
              </p>
              <Link
                href="/tools/bookbreaks/generate"
                className="inline-flex items-center gap-2 h-11 px-5.5 rounded-[10px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold no-underline text-(--bg) transition-all duration-200 hover:opacity-90"
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
