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
    <div className="v3-blog-listing">
      {/* Search + Filter */}
      <div className="v3-blog-controls">
        <div className="v3-blog-search-wrap">
          <Search className="v3-blog-search-icon" size={14} />
          <input
            className="v3-blog-search"
            placeholder="Search posts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="v3-blog-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="v3-blog-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`v3-filter-pill${activeCategory === cat ? " active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
          {(searchQuery || activeCategory !== "All") && (
            <button
              className="v3-filter-pill"
              style={{ color: "var(--v3-accent)", borderColor: "var(--v3-accent)" }}
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
            >
              Clear ×
            </button>
          )}
        </div>
      </div>

      {/* Post rows */}
      {!filteredPosts.length ? (
        <div className="v3-blog-empty">
          <p>No posts found{searchQuery ? ` matching "${searchQuery}"` : ""}{activeCategory !== "All" ? ` in ${activeCategory}` : ""}.</p>
        </div>
      ) : (
        <div>
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
                className="v3-blog-row"
              >
                <span className="date">{dateStr}</span>
                <div className="title">
                  {post.title}
                  <span className="tag">
                    {isExternal && <ExternalLink size={8} style={{ display: "inline", marginRight: 3 }} />}
                    {post.category}
                  </span>
                  {post.excerpt && <span className="excerpt">{post.excerpt}</span>}
                </div>
                <span className="read">{post.read_time ?? ""}</span>
                <span className="arrow" aria-hidden="true">→</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
