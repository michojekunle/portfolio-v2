"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  User,
  Zap,
  Heart,
  Sparkles,
  Moon,
  Sun,
  Star,
} from "lucide-react";

const AVATAR_THEMES = [
  {
    bg: "from-blue-600/20 to-cyan-400/20",
    text: "text-blue-500",
    border: "border-blue-500/20",
    icon: Zap,
  },
  {
    bg: "from-purple-600/20 to-pink-400/20",
    text: "text-purple-500",
    border: "border-purple-500/20",
    icon: Heart,
  },
  {
    bg: "from-amber-500/20 to-orange-400/20",
    text: "text-amber-500",
    border: "border-amber-500/20",
    icon: Sparkles,
  },
  {
    bg: "from-emerald-600/20 to-teal-400/20",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    icon: Sun,
  },
  {
    bg: "from-indigo-600/20 to-violet-400/20",
    text: "text-indigo-500",
    border: "border-indigo-500/20",
    icon: Moon,
  },
  {
    bg: "from-rose-600/20 to-red-400/20",
    text: "text-rose-500",
    border: "border-rose-500/20",
    icon: Star,
  },
];

function getAvatarTheme(name: string) {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_THEMES[hash % AVATAR_THEMES.length];
}

interface Comment {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

interface BlogCommentsProps {
  postId: string;
}

export function BlogComments({ postId }: BlogCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const loadComments = async () => {
      const { data } = await supabase
        .from("blog_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (data) {
        setComments(data);
      }
    };

    loadComments();

    // Subscribe to new comments
    const channel = supabase
      .channel(`comments_${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "blog_comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          const newComment = payload.new as Comment;
          setComments((prev) => {
            // Check if we have an optimistic comment matching this one
            const optimisticIndex = prev.findIndex(
              (c) =>
                c.id.startsWith("temp-") &&
                c.content === newComment.content &&
                c.name === newComment.name,
            );

            if (optimisticIndex !== -1) {
              const next = [...prev];
              next[optimisticIndex] = newComment;
              return next;
            }

            if (prev.some((c) => c.id === newComment.id)) return prev;

            return [newComment, ...prev];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim() || submitting) return;

    const trimmedName = name.trim();
    const trimmedContent = content.trim();
    const tempId = `temp-${Date.now()}`;

    // Optimistic Update
    const tempComment: Comment = {
      id: tempId,
      name: trimmedName,
      content: trimmedContent,
      created_at: new Date().toISOString(),
    };

    setComments((prev) => [tempComment, ...prev]);
    setContent("");
    setSubmitting(true);

    const { error } = await supabase.from("blog_comments").insert([
      {
        post_id: postId,
        name: trimmedName,
        content: trimmedContent,
      },
    ]);

    if (error) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setContent(trimmedContent);
      alert("Failed to post comment. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <div className="space-y-10 mt-16 pt-16">
      <div className="space-x-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold tracking-tight">
            Comments ({comments.length})
          </h3>
        </div>

        <div className="space-y-4 mt-6">
          <AnimatePresence initial={false}>
            {comments.map((comment) => {
              const theme = getAvatarTheme(comment.name);
              const Icon = theme.icon;

              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 sm:gap-5 group"
                >
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                      <div className="shrink-0 pt-1 flex items-center gap-2">
                        <div
                          className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-gradient-to-br flex items-center justify-center border shadow-sm group-hover:scale-110 transition-all duration-500 ${theme.bg} ${theme.border} ${theme.text}`}
                        >
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <span className="font-bold text-sm tracking-tight truncate group-hover:text-primary transition-colors">
                          {comment.name}
                        </span>
                      </div>
                      <span className="text-[10px] flex items-center font-bold text-muted-foreground/40 uppercase tracking-widest whitespace-nowrap">
                        {format(new Date(comment.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="text-sm leading-relaxed text-muted-foreground/80 bg-muted/10 p-4 sm:p-5 rounded-3xl rounded-tl-none border border-border/10 group-hover:bg-muted/15 group-hover:border-border/20 transition-all shadow-sm">
                      {comment.content}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {comments.length === 0 && (
            <div className="text-center py-12 bg-muted/10 rounded-3xl border border-dashed border-border/40">
              <p className="text-sm text-muted-foreground italic">
                No comments yet. Be the first to start the conversation!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">
            Leave a comment
          </h3>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-muted/20 p-6 rounded-3xl border border-border/40 shadow-sm transition-all focus-within:bg-muted/40 focus-within:border-primary/20"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">
              Your Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Michael Smith"
              required
              className="bg-background border-border/40 focus:ring-primary/10 rounded-2xl h-11"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-2">
              Your Thoughts
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="I love the first principles approach here..."
              required
              rows={4}
              className="bg-background border-border/40 focus:ring-primary/10 rounded-2xl resize-none p-4 shadow-inner"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              disabled={submitting}
              type="submit"
              className="group px-8 h-11 rounded-full bg-primary hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20"
            >
              {submitting ? (
                "Posting..."
              ) : (
                <>
                  Post Comment
                  <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
