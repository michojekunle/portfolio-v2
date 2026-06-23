"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, ExternalLink, X } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  read_time: string | null;
  published_at: string | null;
  views: number;
  reactionCount: number;
  commentCount: number;
  external_url?: string;
  clicks?: number;
}

const CATEGORIES = ["All", "Technical", "Web3", "Reflection", "ZKML", "First Principles", "Life & Learning"];

export function BlogListing({ initialPosts }: { initialPosts: Post[] }): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const handleExternalClick = async (postId: string): Promise<void> => {
    try {
      await fetch("/api/posts/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId }),
      });
    } catch (error) {
      console.error("Failed to track click:", error);
    }
  };

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesCategory = activeCategory === "All" || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [initialPosts, searchQuery, activeCategory]);

  return (
    <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] pb-[120px]">
      {/* Search + Filter */}
      <div className="flex flex-col gap-[24px] mb-[64px]">
        <div className="relative w-full max-w-[480px]">
          <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[var(--ink-3)] pointer-events-none" size={16} />
          <input
            className="w-full bg-[var(--bg-2)] border border-[var(--rule)] rounded-full py-[12px] pl-[44px] pr-[40px] text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-[var(--ink-3)] focus:bg-[var(--paper)] transition-all duration-200"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)] p-[4px] cursor-pointer"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-[10px]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`px-[16px] py-[8px] rounded-full font-mono text-[11px] uppercase tracking-[0.1em] transition-all duration-200 cursor-pointer ${activeCategory === cat ? "bg-[var(--ink)] text-[var(--bg)] border border-[var(--ink)]" : "bg-transparent text-[var(--ink-2)] border border-[var(--rule)] hover:border-[var(--ink-3)] hover:text-[var(--ink)]"}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
          {(searchQuery || activeCategory !== "All") && (
            <button
              className="px-[16px] py-[8px] rounded-full font-mono text-[11px] uppercase tracking-[0.1em] transition-all duration-200 cursor-pointer text-[var(--v3-accent)] border border-[var(--v3-accent)] hover:bg-[color-mix(in_oklab,var(--v3-accent)_10%,transparent)]"
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
            >
              Clear ×
            </button>
          )}
        </div>
      </div>

      {/* Post rows */}
      {!filteredPosts.length ? (
        <div className="py-[80px] text-center border-t border-[var(--rule)]">
          <p className="font-display italic text-[18px] text-[var(--ink-3)]">
            No notes found{searchQuery ? ` matching "${searchQuery}"` : ""}{activeCategory !== "All" ? ` in ${activeCategory}` : ""}.
          </p>
        </div>
      ) : (
        <div className="border-t border-[var(--rule)]">
          {filteredPosts.map((post) => {
            const isExternal = !!post.external_url;
            const href = isExternal ? post.external_url! : `/blog/${post.slug}`;
            const dateStr = post.published_at
              ? format(new Date(post.published_at), "MMM yyyy")
              : "";

            return (
              <Link
                key={post.id}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                onClick={isExternal ? () => handleExternalClick(post.id) : undefined}
                className="group flex flex-col sm:grid sm:grid-cols-[120px_1fr_100px_40px] items-start sm:items-center gap-[12px] sm:gap-[24px] py-[32px] border-b border-[var(--rule)] no-underline transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--bg-2)_50%,transparent)]"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--ink-3)] mt-[4px] sm:mt-0">
                  {dateStr}
                </span>
                
                <div className="flex flex-col gap-[6px]">
                  <div className="font-display text-[22px] leading-[1.2] text-[var(--ink)] group-hover:text-[var(--v3-accent)] transition-colors duration-200 fvs-text">
                    {post.title}
                    <span className="inline-flex items-center ml-[12px] font-mono text-[10px] uppercase tracking-[0.1em] px-[8px] py-[3px] rounded bg-[var(--bg-2)] border border-[var(--rule)] text-[var(--ink-3)] align-middle">
                      {isExternal && <ExternalLink size={10} className="mr-[4px]" />}
                      {post.category}
                    </span>
                  </div>
                  {post.excerpt && (
                    <span className="text-[15px] text-[var(--ink-2)] leading-[1.5] max-w-[64ch]">
                      {post.excerpt}
                    </span>
                  )}
                </div>
                
                <span className="hidden sm:block font-mono text-[11px] text-[var(--ink-3)] text-right">
                  {post.read_time ?? ""}
                </span>
                
                <span className="hidden sm:flex justify-end text-[var(--ink-3)] transition-transform duration-300 group-hover:translate-x-[4px] group-hover:text-[var(--v3-accent)]" aria-hidden="true">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
