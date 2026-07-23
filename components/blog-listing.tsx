"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, ExternalLink, X, ArrowRight } from "lucide-react";

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
    <div className="max-w-(--maxw) mx-auto px-(--gutter) pb-30">
      {/* Search + Filter */}
      <div className="flex flex-col gap-6 mb-16">
        <div className="relative w-full max-w-[480px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
          <input
            className="w-full bg-(--bg-2) border border-(--rule) rounded-full py-3 pl-11 pr-10 text-[15px] text-(--ink) placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground focus:bg-(--paper) transition-all duration-200"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-(--ink) p-1 cursor-pointer"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-widest transition-all duration-200 cursor-pointer ${activeCategory === cat ? "bg-(--ink) text-(--bg) border border-(--ink)" : "bg-transparent text-secondary-foreground border border-(--rule) hover:border-muted-foreground hover:text-(--ink)"}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
          {(searchQuery || activeCategory !== "All") && (
            <button
              className="px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-widest transition-all duration-200 cursor-pointer text-(--v3-accent) border border-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_10%,transparent)]"
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
            >
              Clear ×
            </button>
          )}
        </div>
      </div>

      {/* Post rows */}
      {!filteredPosts.length ? (
        <div className="py-20 text-center border-t border-(--rule)">
          <p className="font-display italic text-[18px] text-muted-foreground">
            No notes found{searchQuery ? ` matching "${searchQuery}"` : ""}{activeCategory !== "All" ? ` in ${activeCategory}` : ""}.
          </p>
        </div>
      ) : (
        <div className="border-t border-(--rule)">
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
                className="group flex flex-col sm:grid sm:grid-cols-[120px_1fr_100px_40px] items-start sm:items-center gap-3 sm:gap-6 py-8 border-b border-(--rule) no-underline transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--bg-2)_50%,transparent)]"
              >
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mt-1 sm:mt-0">
                  {dateStr}
                </span>
                
                <div className="flex flex-col gap-1.5">
                  <div className="font-display text-[22px] leading-[1.2] text-(--ink) group-hover:text-(--v3-accent) transition-colors duration-200 fvs-text">
                    {post.title}
                    <span className="inline-flex items-center ml-3 font-mono text-[10px] uppercase tracking-widest px-2 py-0.75 rounded bg-(--bg-2) border border-(--rule) text-muted-foreground align-middle">
                      {isExternal && <ExternalLink size={10} className="mr-1" />}
                      {post.category}
                    </span>
                  </div>
                  {post.excerpt && (
                    <span className="text-[15px] text-secondary-foreground leading-normal max-w-[64ch]">
                      {post.excerpt}
                    </span>
                  )}
                </div>
                
                <span className="hidden sm:block font-mono text-[11px] text-muted-foreground text-right">
                  {post.read_time ?? ""}
                </span>
                
                <span className="hidden sm:flex justify-end text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-(--v3-accent)" aria-hidden="true">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
