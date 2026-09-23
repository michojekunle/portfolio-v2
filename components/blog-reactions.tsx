"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Flame, Rocket, Lightbulb, ThumbsUp } from "lucide-react";

interface Reaction {
  emoji: string;
  count: number;
}

interface BlogReactionsProps {
  postId: string;
}

const REACTIONS = [
  { id: "heart", label: "Heart", icon: Heart, aliases: ["heart", "\u2764\ufe0f", "\u2764"] },
  { id: "fire", label: "Fire", icon: Flame, aliases: ["fire", "\ud83d\udd25"] },
  { id: "rocket", label: "Rocket", icon: Rocket, aliases: ["rocket", "\ud83d\ude80"] },
  { id: "bulb", label: "Insight", icon: Lightbulb, aliases: ["bulb", "\ud83d\udca1"] },
  { id: "cheers", label: "Cheers", icon: ThumbsUp, aliases: ["cheers", "clap", "\ud83d\ude4c"] },
];

export function BlogReactions({ postId }: BlogReactionsProps): React.ReactElement {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [userReacted, setUserReacted] = useState<string[]>([]);
  // Stable client ref — never changes between renders, so it's safe as a useEffect dep
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    const loadReactions = async (): Promise<void> => {
      const { data } = await supabase
        .from("blog_reactions")
        .select("emoji, count")
        .eq("post_id", postId);
      if (data) setReactions(data);
    };

    const saved = localStorage.getItem(`reactions_${postId}`);
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
          setUserReacted(parsed);
        }
      } catch {
        // Corrupted localStorage value — ignore and start fresh
      }
    }

    void loadReactions();

    const channel = supabase
      .channel(`reactions_${postId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_reactions", filter: `post_id=eq.${postId}` }, () => {
        void loadReactions();
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [postId, supabase]);

  const handleReact = async (id: string, aliases: string[]): Promise<void> => {
    const alreadyReacted = userReacted.some((item) => aliases.includes(item));
    if (alreadyReacted) return;

    // Optimistic UI update
    setReactions((prev) => {
      const existing = prev.find((r) => aliases.includes(r.emoji));
      if (existing) return prev.map((r) => aliases.includes(r.emoji) ? { ...r, count: r.count + 1 } : r);
      return [...prev, { emoji: id, count: 1 }];
    });

    const newUserReacted = [...userReacted, id];
    setUserReacted(newUserReacted);
    localStorage.setItem(`reactions_${postId}`, JSON.stringify(newUserReacted));

    // Check DB for existing row using primary key post_id and any alias
    const { data: current } = await supabase
      .from("blog_reactions")
      .select("emoji, count")
      .eq("post_id", postId)
      .in("emoji", aliases)
      .limit(1)
      .maybeSingle();

    if (current) {
      await supabase
        .from("blog_reactions")
        .update({ count: (current.count as number) + 1 })
        .eq("post_id", postId)
        .eq("emoji", current.emoji);
    } else {
      await supabase
        .from("blog_reactions")
        .insert([{ post_id: postId, emoji: id, count: 1 }]);
    }
  };

  return (
    <div className="v3-reactions">
      <div className="lbl">Reactions</div>
      {REACTIONS.map((r) => {
        const count = reactions
          .filter((item) => r.aliases.includes(item.emoji))
          .reduce((sum, item) => sum + (item.count || 0), 0);
        const hasReacted = userReacted.some((item) => r.aliases.includes(item));
        const Icon = r.icon;

        return (
          <button
            key={r.id}
            className={`v3-reaction-btn${hasReacted ? " reacted" : ""}`}
            onClick={() => void handleReact(r.id, r.aliases)}
            disabled={hasReacted}
            aria-label={`React with ${r.label}`}
          >
            <span className="flex items-center justify-center">
              <Icon size={15} />
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={count}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
