"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, ExternalLink, X, ArrowRight } from "lucide-react";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  read_time: string | null;
  published_at: string | null;
  updated_at?: string | null;
  views: number;
  reactionCount: number;
  commentCount: number;
  external_url?: string;
  clicks?: number;
  cover_image?: string | null;
}

const CATEGORIES = ["All", "Technical", "Web3", "Reflection", "First Principles", "Life & Learning"];

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
              className={`px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeCategory === cat ? "bg-(--ink) text-(--bg) border border-(--ink)" : "bg-transparent text-secondary-foreground border border-(--rule) hover:border-muted-foreground hover:text-(--ink)"}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
          {(searchQuery || activeCategory !== "All") && (
            <button
              className="px-4 py-2 rounded-full font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer text-(--v3-accent) border border-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_10%,transparent)]"
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
            const publishedDate = post.published_at ? new Date(post.published_at) : null;
            const updatedDate = post.updated_at ? new Date(post.updated_at) : null;
            const isUpdated = publishedDate && updatedDate && format(publishedDate, "yyyy-MM-dd") !== format(updatedDate, "yyyy-MM-dd");
            const dateStr = publishedDate ? format(publishedDate, "MMM yyyy") : "";
            const updatedStr = isUpdated ? ` (Upd: ${format(updatedDate!, "MMM yyyy")})` : "";

            return (
              <Link
                key={post.id}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                onClick={isExternal ? () => handleExternalClick(post.id) : undefined}
                className="group flex flex-col sm:grid sm:grid-cols-[140px_1fr_auto] items-start sm:items-center gap-4 sm:gap-8 py-8 border-b border-(--rule) no-underline transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--bg-2)_50%,transparent)]"
              >
                {/* Date column */}
                <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-1 sm:mt-0 flex flex-col gap-0.5 shrink-0">
                  <span>{dateStr}</span>
                  {isUpdated && <span className="text-[11px] opacity-75">{updatedStr}</span>}
                </div>
                
                {/* Content column */}
                <div className="flex flex-col gap-1.5 min-w-0 pr-2 sm:pr-4">
                  <div className="font-display text-[22px] leading-[1.35] text-(--ink) group-hover:text-(--v3-accent) transition-colors duration-200 fvs-text">
                    {post.title}{" "}
                    <span className="inline-flex items-center ml-2.5 font-mono text-xs uppercase tracking-wider px-2 py-0.5 rounded bg-(--bg-2) border border-(--rule) text-muted-foreground align-middle">
                      {isExternal && <ExternalLink size={10} className="mr-1" />}
                      {post.category}
                    </span>
                  </div>
                  {post.excerpt && (
                    <p className="m-0 text-[15px] text-secondary-foreground leading-normal max-w-[64ch]">
                      {post.excerpt}
                    </p>
                  )}
                </div>
                
                {/* Right side cluster: thumbnail (if present) + read time + arrow */}
                <div className="hidden sm:flex items-center justify-end gap-5 shrink-0 ml-auto">
                  {post.cover_image && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-(--rule) bg-(--paper) shadow-xs">
                      <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
                    </div>
                  )}
                  
                  <span className="font-mono text-xs text-muted-foreground text-right whitespace-nowrap min-w-[70px]">
                    {post.read_time ?? ""}
                  </span>
                  
                  <span className="flex items-center text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-(--v3-accent)" aria-hidden="true">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>

                {/* Mobile meta footer */}
                <div className="flex sm:hidden items-center justify-between pt-2 border-t border-(--rule)/40 font-mono text-xs text-muted-foreground w-full">
                  <div className="flex items-center gap-3">
                    {post.cover_image && (
                      <div className="relative w-8 h-8 rounded overflow-hidden shrink-0 border border-(--rule)">
                        <Image src={post.cover_image} alt={post.title} fill className="object-cover" />
                      </div>
                    )}
                    <span>{post.read_time ?? ""}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-(--v3-accent)" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
