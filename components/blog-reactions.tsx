"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Reaction {
  emoji: string;
  count: number;
}

interface BlogReactionsProps {
  postId: string;
}

const EMOJIS = ["❤️", "🔥", "🚀", "💡", "🙌"];

export function BlogReactions({ postId }: BlogReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [userReacted, setUserReacted] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Load existing reactions
    const loadReactions = async () => {
      const { data } = await supabase
        .from("blog_reactions")
        .select("emoji, count")
        .eq("post_id", postId);

      if (data) {
        setReactions(data);
      }
    };

    // Load user reactions from localStorage
    const saved = localStorage.getItem(`reactions_${postId}`);
    if (saved) {
      setUserReacted(JSON.parse(saved));
    }

    loadReactions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`reactions_${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blog_reactions",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          loadReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, supabase]);

  const handleReact = async (emoji: string) => {
    if (userReacted.includes(emoji)) return;

    // Optimistic UI
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);
      if (existing) {
        return prev.map((r) =>
          r.emoji === emoji ? { ...r, count: r.count + 1 } : r
        );
      }
      return [...prev, { emoji, count: 1 }];
    });

    const newUserReacted = [...userReacted, emoji];
    setUserReacted(newUserReacted);
    localStorage.setItem(`reactions_${postId}`, JSON.stringify(newUserReacted));

    // Persist to DB
    const existing = reactions.find((r) => r.emoji === emoji);
    if (existing) {
      await supabase
        .from("blog_reactions")
        .update({ count: existing.count + 1 })
        .eq("post_id", postId)
        .eq("emoji", emoji);
    } else {
      await supabase.from("blog_reactions").insert([
        { post_id: postId, emoji, count: 1 },
      ]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 py-8 border-t border-b border-border/40 my-12">
      <div className="w-full text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
        Reactions
      </div>
      {EMOJIS.map((emoji) => {
        const reaction = reactions.find((r) => r.emoji === emoji);
        const hasReacted = userReacted.includes(emoji);

        return (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            onClick={() => handleReact(emoji)}
            className={`
              h-10 px-4 rounded-full border border-border/40 transition-all
              ${hasReacted ? "bg-primary/10 border-primary/30 text-primary scale-105" : "hover:bg-muted/50"}
            `}
            disabled={hasReacted}
          >
            <span className="text-lg mr-2">{emoji}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={reaction?.count ?? 0}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs font-mono font-bold"
              >
                {reaction?.count ?? 0}
              </motion.span>
            </AnimatePresence>
          </Button>
        );
      })}
    </div>
  );
}
