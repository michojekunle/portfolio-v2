"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart, MessageCircle, X } from "lucide-react";
import { MagneticWrapper } from "./magnetic-wrapper";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  name: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  likes_count?: number;
}

interface BlogCommentsProps {
  postId: string;
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  isLiked: boolean;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  onLike: (id: string) => void;
  onSubmitReply: (parentId: string, name: string, content: string) => Promise<boolean>;
}

const CommentItem = ({ 
  comment, 
  isReply = false, 
  isLiked, 
  replyingTo, 
  setReplyingTo, 
  onLike, 
  onSubmitReply 
}: CommentItemProps) => {
  const [replyName, setReplyName] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReplySubmitting(true);
    const success = await onSubmitReply(comment.id, replyName, replyContent);
    if (success) {
      setReplyName("");
      setReplyContent("");
    }
    setReplySubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("v3-comment", isReply && "ml-8 md:ml-12 border-l border-(--rule) pl-4 relative before:absolute before:content-[''] before:w-4 before:h-px before:bg-(--rule) before:left-[-1px] before:top-6")}
    >
      <div className="v3-comment-avatar shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-(--bg-2) border border-(--rule)">
        <span className="font-display fvs-text text-[14px] text-(--v3-accent)">
          {getInitial(comment.name)}
        </span>
      </div>
      <div className="v3-comment-body flex-1 min-w-0">
        <div className="v3-comment-meta flex items-center justify-between mb-1">
          <span className="name font-medium text-[13px] text-(--ink)">{comment.name}</span>
          <span className="dt text-[11px] text-muted-foreground">{format(new Date(comment.created_at), "MMM d, yyyy")}</span>
        </div>
        <p className="v3-comment-text text-[14px] leading-relaxed text-secondary-foreground mb-3">{comment.content}</p>
        
        <div className="flex items-center gap-4 text-muted-foreground">
          <button 
            onClick={() => onLike(comment.id)}
            disabled={isLiked}
            className={cn("flex items-center gap-1.5 text-[11px] transition-colors duration-200", isLiked ? "text-red-500" : "hover:text-(--v3-accent)")}
          >
            <Heart size={14} className={cn(isLiked && "fill-current")} />
            {comment.likes_count || 0}
          </button>
          {!isReply && (
            <button 
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className={cn("flex items-center gap-1.5 text-[11px] transition-colors duration-200", replyingTo === comment.id ? "text-(--ink)" : "hover:text-(--ink)")}
            >
              <MessageCircle size={14} />
              Reply
            </button>
          )}
        </div>

        <AnimatePresence>
          {replyingTo === comment.id && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="v3-comment-form relative rounded-xl border border-(--rule) bg-(--bg-2) p-3">
                <button type="button" onClick={() => setReplyingTo(null)} className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-(--ink)">
                  <X size={14} />
                </button>
                <input
                  value={replyName}
                  onChange={(e) => setReplyName(e.target.value)}
                  placeholder="Your name"
                  required
                  maxLength={80}
                  className="w-full bg-transparent border-none outline-none text-[13px] text-(--ink) placeholder:text-muted-foreground mb-2"
                />
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  required
                  maxLength={2000}
                  className="w-full bg-transparent border-none outline-none text-[14px] text-(--ink) placeholder:text-muted-foreground resize-none h-16"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    className="v3-btn v3-btn-accent v3-btn-sm !py-1.5 !px-3"
                    disabled={replySubmitting}
                  >
                    <Send size={12} style={{ marginRight: 6 }} />
                    {replySubmitting ? "Replying…" : "Reply"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export function BlogComments({ postId }: BlogCommentsProps): React.ReactElement {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // Load liked comments from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("liked_comments");
      if (stored) {
        setLikedComments(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.error("Could not read from localStorage");
    }
  }, []);

  useEffect(() => {
    const loadComments = async (): Promise<void> => {
      const { data } = await supabase
        .from("blog_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true }); // Ascending so replies appear below chronologically
      if (data) setComments(data);
    };

    void loadComments();

    const channel = supabase
      .channel(`comments_${postId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blog_comments", filter: `post_id=eq.${postId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newComment = payload.new as Comment;
            setComments((prev) => {
              const optimisticIdx = prev.findIndex((c) => c.id.startsWith("temp-") && c.content === newComment.content && c.name === newComment.name);
              if (optimisticIdx !== -1) {
                const next = [...prev];
                next[optimisticIdx] = newComment;
                return next;
              }
              if (prev.some((c) => c.id === newComment.id)) return prev;
              return [...prev, newComment]; // Append for chronological order
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Comment;
            setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          }
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [postId, supabase]);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null): Promise<void> => {
    e.preventDefault();
    if (!name.trim() || !content.trim() || submitting) return;

    const trimmedName = name.trim();
    const trimmedContent = content.trim();
    const tempId = `temp-${Date.now()}`;

    setComments((prev) => [
      ...prev,
      { id: tempId, name: trimmedName, content: trimmedContent, created_at: new Date().toISOString(), parent_id: parentId, likes_count: 0 }
    ]);
    setContent("");
    setSubmitting(true);

    const { error } = await supabase.from("blog_comments").insert([{ 
      post_id: postId, 
      name: trimmedName, 
      content: trimmedContent,
      parent_id: parentId
    }]);

    if (error) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setContent(trimmedContent);
    } else {
      if (parentId) setReplyingTo(null);
    }

    setSubmitting(false);
  };

  const handleLike = async (commentId: string) => {
    if (likedComments.has(commentId)) return;

    // Optimistic update
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes_count: (c.likes_count || 0) + 1 } : c));
    
    const newLiked = new Set(likedComments);
    newLiked.add(commentId);
    setLikedComments(newLiked);
    try {
      localStorage.setItem("liked_comments", JSON.stringify(Array.from(newLiked)));
    } catch (e) {}

    await supabase.rpc("increment_comment_like", { comment_id: commentId });
  };


  const handleReplySubmit = async (parentId: string, replyName: string, replyContent: string): Promise<boolean> => {
    if (!replyName.trim() || !replyContent.trim()) return false;

    const trimmedName = replyName.trim();
    const trimmedContent = replyContent.trim();
    const tempId = `temp-${Date.now()}`;

    setComments((prev) => [
      ...prev,
      { id: tempId, name: trimmedName, content: trimmedContent, created_at: new Date().toISOString(), parent_id: parentId, likes_count: 0 }
    ]);

    const { error } = await supabase.from("blog_comments").insert([{ 
      post_id: postId, 
      name: trimmedName, 
      content: trimmedContent,
      parent_id: parentId
    }]);

    if (error) {
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      return false;
    } else {
      setReplyingTo(null);
      return true;
    }
  };

  const topLevelComments = comments.filter(c => !c.parent_id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="v3-comments mt-16 pt-8 border-t border-(--rule)">
      <h3 className="comments-head font-display text-[24px] text-(--ink) mb-8">Comments ({comments.length})</h3>

      {/* Main Comment Form */}
      <form onSubmit={(e) => void handleSubmit(e)} className="v3-comment-form mb-12">
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
        <div className="v3-comments-empty py-12 text-center text-[14px] text-muted-foreground border border-dashed border-(--rule) rounded-2xl">
          No comments yet. Be the first to start the conversation!
        </div>
      ) : (
        <div className="v3-comment-list space-y-8">
          <AnimatePresence initial={false}>
            {topLevelComments.map((comment) => (
              <div key={comment.id} className="flex flex-col gap-4">
                <CommentItem 
                  comment={comment} 
                  isLiked={likedComments.has(comment.id)}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  onLike={handleLike}
                  onSubmitReply={handleReplySubmit}
                />
                {comments.filter(c => c.parent_id === comment.id).map(reply => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply} 
                    isReply 
                    isLiked={likedComments.has(reply.id)}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    onLike={handleLike}
                    onSubmitReply={handleReplySubmit}
                  />
                ))}
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
