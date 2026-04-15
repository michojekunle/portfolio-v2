"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, Eye, Heart, MessageSquare, X, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function BlogListing({ initialPosts }: { initialPosts: Post[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const handleExternalClick = async (postId: string) => {
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
    <div className="space-y-8">
      {/* Search and Filter UI */}
      <div className="space-y-4">
        <div className="relative px-10">
          {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
          <Input
            placeholder="Search posts by title or excerpt..."
            className=""
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-md border transition-all",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
          Showing {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
          {activeCategory !== "All" && ` in ${activeCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
        {(searchQuery || activeCategory !== "All") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("All");
            }}
            className="text-[10px] uppercase font-bold text-primary hover:underline underline-offset-4"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Post List */}
      {!filteredPosts.length ? (
        <div className="py-20 text-center border border-dashed rounded-lg border-muted-foreground/20">
          <p className="text-sm text-muted-foreground">No posts found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredPosts.map((post) => {
            const isExternal = !!post.external_url;
            const href = isExternal ? post.external_url! : `/blog/${post.slug}`;
            
            return (
              <Link
                key={post.id}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                onClick={isExternal ? () => handleExternalClick(post.id) : undefined}
                className="group flex flex-col gap-2 py-6 hover:bg-muted/30 transition-all no-underline border-b border-border/40 last:border-0 p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-[10px] uppercase tracking-wider h-5 font-bold transition-colors",
                      "bg-muted/50 border-border/40 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20",
                      isExternal && "text-amber-500 bg-amber-500/10 border-amber-500/20"
                    )}
                  >
                    {post.category}
                  </Badge>
                  {isExternal && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                      <ExternalLink className="h-2.5 w-2.5" />
                      External
                    </span>
                  )}
                  {post.read_time && (
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity ml-auto">
                      {post.read_time}
                    </span>
                  )}
                </div>
                
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <h2 className={cn(
                      "text-lg font-semibold tracking-tight transition-colors mb-2 line-clamp-2",
                      "group-hover:text-primary",
                      isExternal && "group-hover:text-amber-500"
                    )}>
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <time className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest shrink-0 mt-1.5 opacity-60">
                    {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
                  </time>
                </div>

                <div className="flex items-center gap-4 mt-1">
                  {isExternal ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-amber-500 transition-all duration-300">
                      <MousePointerClick className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                      <span className="text-[11px] font-mono font-bold tracking-tight">{post.clicks || 0}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-all duration-300">
                        <Eye className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[11px] font-mono font-bold tracking-tight">{post.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-all duration-300">
                        <Heart className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity group-hover:fill-primary/20" />
                        <span className="text-[11px] font-mono font-bold tracking-tight">{post.reactionCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-all duration-300">
                        <MessageSquare className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[11px] font-mono font-bold tracking-tight">{post.commentCount}</span>
                      </div>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
