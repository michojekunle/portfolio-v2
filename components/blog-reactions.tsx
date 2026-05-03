"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Reaction {
  emoji: string;
  count: number;
}

interface BlogReactionsProps {
  postId: string;
}

const EMOJIS = ["❤️", "🔥", "🚀", "💡", "🙌"];

export function BlogReactions({ postId }: BlogReactionsProps): React.ReactElement {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [userReacted, setUserReacted] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const loadReactions = async (): Promise<void> => {
      const { data } = await supabase
        .from("blog_reactions")
        .select("emoji, count")
        .eq("post_id", postId);
      if (data) setReactions(data);
    };

    const saved = localStorage.getItem(`reactions_${postId}`);
    if (saved) setUserReacted(JSON.parse(saved) as string[]);

    void loadReactions();

    const channel = supabase
      .channel(`reactions_${postId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_reactions", filter: `post_id=eq.${postId}` }, () => {
        void loadReactions();
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [postId, supabase]);

  const handleReact = async (emoji: string): Promise<void> => {
    if (userReacted.includes(emoji)) return;

    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);
      if (existing) return prev.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1 } : r);
      return [...prev, { emoji, count: 1 }];
    });

    const newUserReacted = [...userReacted, emoji];
    setUserReacted(newUserReacted);
    localStorage.setItem(`reactions_${postId}`, JSON.stringify(newUserReacted));

    const existing = reactions.find((r) => r.emoji === emoji);
    if (existing) {
      await supabase.from("blog_reactions").update({ count: existing.count + 1 }).eq("post_id", postId).eq("emoji", emoji);
    } else {
      await supabase.from("blog_reactions").insert([{ post_id: postId, emoji, count: 1 }]);
    }
  };

  return (
    <div className="v3-reactions">
      <div className="lbl">Reactions</div>
      {EMOJIS.map((emoji) => {
        const reaction = reactions.find((r) => r.emoji === emoji);
        const hasReacted = userReacted.includes(emoji);
        return (
          <button
            key={emoji}
            className={`v3-reaction-btn${hasReacted ? " reacted" : ""}`}
            onClick={() => void handleReact(emoji)}
            disabled={hasReacted}
            aria-label={`React with ${emoji}`}
          >
            <span className="emoji">{emoji}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={reaction?.count ?? 0}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {reaction?.count ?? 0}
              </motion.span>
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
