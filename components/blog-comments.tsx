"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { MagneticWrapper } from "./magnetic-wrapper";

interface Comment {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

interface BlogCommentsProps {
  postId: string;
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

export function BlogComments({ postId }: BlogCommentsProps): React.ReactElement {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Stable client ref — never changes between renders, safe as a useEffect dep
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  useEffect(() => {
    const loadComments = async (): Promise<void> => {
      const { data } = await supabase
        .from("blog_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });
      if (data) setComments(data);
    };

    void loadComments();

    const channel = supabase
      .channel(`comments_${postId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "blog_comments", filter: `post_id=eq.${postId}` }, (payload) => {
        const newComment = payload.new as Comment;
        setComments((prev) => {
          const optimisticIdx = prev.findIndex((c) => c.id.startsWith("temp-") && c.content === newComment.content && c.name === newComment.name);
          if (optimisticIdx !== -1) {
            const next = [...prev];
            next[optimisticIdx] = newComment;
            return next;
          }
          if (prev.some((c) => c.id === newComment.id)) return prev;
          return [newComment, ...prev];
        });
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [postId, supabase]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name.trim() || !content.trim() || submitting) return;

    const trimmedName = name.trim();
    const trimmedContent = content.trim();
    const tempId = `temp-${Date.now()}`;

    setComments((prev) => [{ id: tempId, name: trimmedName, content: trimmedContent, created_at: new Date().toISOString() }, ...prev]);
    setContent("");
    setSubmitting(true);

    const { error } = await supabase.from("blog_comments").insert([{ post_id: postId, name: trimmedName, content: trimmedContent }]);

    if (error) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setContent(trimmedContent);
    }

    setSubmitting(false);
  };

  return (
    <div className="v3-comments">
      <h3 className="comments-head">Comments ({comments.length})</h3>

      {/* Form */}
      <form onSubmit={(e) => void handleSubmit(e)} className="v3-comment-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          maxLength={80}
          style={{ marginBottom: 10 }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Your thoughts…"
          required
          maxLength={2000}
        />
        <MagneticWrapper strength={15}>
          <button
            type="submit"
            className="v3-btn v3-btn-accent v3-btn-sm"
            disabled={submitting}
          >
            <Send size={13} style={{ marginRight: 6 }} />
            {submitting ? "Posting…" : "Post Comment"}
          </button>
        </MagneticWrapper>
      </form>

      {/* List */}
      {comments.length === 0 ? (
        <div className="v3-comments-empty">No comments yet. Be the first to start the conversation!</div>
      ) : (
        <div className="v3-comment-list">
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="v3-comment"
              >
                <div className="v3-comment-avatar">
                  <span className="font-display fvs-text text-[18px] text-(--v3-accent)">
                    {getInitial(comment.name)}
                  </span>
                </div>
                <div className="v3-comment-body">
                  <div className="v3-comment-meta">
                    <span className="name">{comment.name}</span>
                    <span className="dt">{format(new Date(comment.created_at), "MMM d, yyyy")}</span>
                  </div>
                  <p className="v3-comment-text">{comment.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
