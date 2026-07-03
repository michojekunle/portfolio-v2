"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  CheckCircle,
  RotateCcw,
  CheckSquare,
  Trash2,
  BookOpen,
  Share2,
  ImageIcon,
  Twitter,
  MessageCircle,
  Link2,
  X,
  AlertTriangle,
} from "lucide-react";

interface Props {
  contentId: string;
  content: string;
  status: string;
  bookTitle?: string;
  bookAuthor?: string;
  highlightQuote?: string;
  highlightColor?: string;
}

export function BBContentActions({
  contentId,
  content,
  status,
  bookTitle,
  bookAuthor,
  highlightQuote,
  highlightColor = "yellow",
}: Props): React.ReactElement {
  const router = useRouter();
  const supabase = createClient();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [sending, setSending] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [sharingImage, setSharingImage] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const handleSendToChapterly = async (): Promise<void> => {
    setSending(true);
    try {
      const dataUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(content)}`;
      const res = await fetch("/api/chapterly/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Summary: ${bookTitle ?? "Generated Summary"}`,
          author: bookAuthor ?? null,
          cover_url: null,
          file_url: dataUrl,
          file_format: "md",
          file_size_bytes: content.length,
        }),
      });

      if (!res.ok) throw new Error("Failed to send to Chapterly");

      const data = (await res.json()) as { book_id: string };
      router.push(`/tools/chapterly/read/${data.book_id}`);
    } catch (err) {
      console.error("[sendToChapterly] error:", err);
      setShareError("Failed to export to Chapterly. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError("Could not copy to clipboard.");
    }
  };

  const handleToggleStatus = async (): Promise<void> => {
    setToggling(true);
    try {
      const newStatus = status === "published" ? "draft" : "published";
      const { error } = await supabase
        .from("bb_generated_content")
        .update({ status: newStatus })
        .eq("id", contentId);

      if (error) throw new Error(error.message);
      router.refresh();
    } catch (err) {
      console.error("[toggleStatus]", err);
      setShareError("Failed to update status. Please try again.");
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    setDeleting(true);
    setShowDeleteConfirm(false);
    try {
      const { error } = await supabase
        .from("bb_generated_content")
        .delete()
        .eq("id", contentId);

      if (error) throw new Error(error.message);
      router.refresh();
    } catch (err) {
      console.error("[delete]", err);
      setShareError("Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Build share card URL for the highlight quote
  const shareCardUrl = highlightQuote
    ? `/api/chapterly/share-card?quote=${encodeURIComponent(highlightQuote.slice(0, 280))}&book=${encodeURIComponent(bookTitle ?? "")}&author=${encodeURIComponent(bookAuthor ?? "")}&color=${highlightColor}`
    : null;

  const shareText = highlightQuote
    ? `"${highlightQuote.slice(0, 220)}" — ${bookTitle ?? "BookBreaks"} via BookBreaks`
    : `Check out this summary of "${bookTitle ?? "a great book"}" via BookBreaks`;

  const handleShareToX = (): void => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowShareMenu(false);
  };

  const handleShareToWhatsApp = (): void => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowShareMenu(false);
  };

  const handleCopyShareLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowShareMenu(false);
    } catch {
      setShareError("Could not copy link.");
    }
  };

  const handleNativeShare = async (): Promise<void> => {
    if (!navigator.share) {
      handleCopyShareLink();
      return;
    }
    try {
      await navigator.share({ text: shareText, title: bookTitle ?? "BookBreaks" });
      setShowShareMenu(false);
    } catch {
      // User cancelled
    }
  };

  const handleDownloadShareImage = async (): Promise<void> => {
    if (!shareCardUrl) return;
    setSharingImage(true);
    try {
      const res = await fetch(shareCardUrl);
      if (!res.ok) throw new Error("Image generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookbreaks-${(bookTitle ?? "share").replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setShowShareMenu(false);
    } catch (err) {
      console.error("[download-share-image]", err);
      setShareError("Failed to generate share image. Try again.");
    } finally {
      setSharingImage(false);
    }
  };

  return (
    <div className="flex items-center gap-[8px] flex-wrap relative">
      {/* Error strip */}
      <AnimatePresence>
        {shareError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute -top-[36px] left-0 right-0 flex items-center gap-[6px] px-[10px] py-[6px] rounded-[6px] text-[11px] font-mono"
            style={{ background: "rgba(239,68,68,0.12)", color: "#dc2626" }}
          >
            <AlertTriangle size={11} />
            {shareError}
            <button
              onClick={() => setShareError(null)}
              className="ml-auto border-none bg-transparent cursor-pointer"
              style={{ color: "#dc2626" }}
            >
              <X size={11} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy content */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleCopy}
        className="inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none"
        style={
          copied
            ? { background: "color-mix(in oklab, var(--v3-accent) 12%, transparent)", color: "var(--v3-accent)" }
            : { background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink-3)" }
        }
      >
        {copied ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
      </motion.button>

      {/* Share button with dropdown */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowShareMenu((v) => !v)}
          className="inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none"
          style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink-3)" }}
        >
          <Share2 size={12} />
          Share
        </motion.button>

        <AnimatePresence>
          {showShareMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowShareMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full left-0 mt-[6px] w-[200px] rounded-[10px] border shadow-xl overflow-hidden z-50"
                style={{ background: "var(--bg-2)", borderColor: "var(--rule)" }}
              >
                {shareCardUrl && (
                  <button
                    onClick={handleDownloadShareImage}
                    disabled={sharingImage}
                    className="w-full flex items-center gap-[10px] px-[14px] py-[10px] font-mono text-[10px] tracking-[0.06em] uppercase border-none cursor-pointer transition-colors text-left disabled:opacity-50"
                    style={{ background: "transparent", color: "var(--ink-2)" }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <ImageIcon size={13} />
                    {sharingImage ? "Generating…" : "Download Image"}
                  </button>
                )}
                <button
                  onClick={handleShareToX}
                  className="w-full flex items-center gap-[10px] px-[14px] py-[10px] font-mono text-[10px] tracking-[0.06em] uppercase border-none cursor-pointer transition-colors text-left"
                  style={{ background: "transparent", color: "var(--ink-2)" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Twitter size={13} />
                  Share on X
                </button>
                <button
                  onClick={handleShareToWhatsApp}
                  className="w-full flex items-center gap-[10px] px-[14px] py-[10px] font-mono text-[10px] tracking-[0.06em] uppercase border-none cursor-pointer transition-colors text-left"
                  style={{ background: "transparent", color: "var(--ink-2)" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <MessageCircle size={13} />
                  Send to WhatsApp
                </button>
                <button
                  onClick={"share" in navigator ? handleNativeShare : handleCopyShareLink}
                  className="w-full flex items-center gap-[10px] px-[14px] py-[10px] font-mono text-[10px] tracking-[0.06em] uppercase border-none cursor-pointer transition-colors text-left"
                  style={{ background: "transparent", color: "var(--ink-2)" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "var(--bg)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Link2 size={13} />
                  Copy Link
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Publish toggle */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleToggleStatus}
        disabled={toggling}
        className="inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none disabled:opacity-50"
        style={
          status === "published"
            ? { background: "color-mix(in oklab, #22c55e 10%, transparent)", color: "#15803d" }
            : { background: "color-mix(in oklab, var(--v3-accent) 10%, transparent)", color: "var(--v3-accent)" }
        }
      >
        {toggling
          ? "…"
          : status === "published"
          ? <><RotateCcw size={12} /> Unpublish</>
          : <><CheckSquare size={12} /> Publish</>}
      </motion.button>

      {/* Send to Chapterly */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleSendToChapterly}
        disabled={sending}
        className="inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none disabled:opacity-50 text-white"
        style={{ background: "color-mix(in oklab, #4F6D7A 100%, transparent)" }}
      >
        {sending ? "Sending…" : <><BookOpen size={12} /> Read in Chapterly</>}
      </motion.button>

      {/* Delete — shows inline confirmation instead of window.confirm */}
      <div className="relative">
        {showDeleteConfirm ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-[6px]"
          >
            <span className="font-mono text-[9px] tracking-[0.06em] uppercase" style={{ color: "var(--ink-3)" }}>
              Sure?
            </span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="h-[28px] px-[10px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] border-none cursor-pointer disabled:opacity-50"
              style={{ background: "rgba(239,68,68,0.15)", color: "#dc2626" }}
            >
              {deleting ? "…" : "Delete"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="h-[28px] px-[10px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] border-none cursor-pointer"
              style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink-3)" }}
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none disabled:opacity-50"
            style={{ background: "color-mix(in oklab, #ef4444 10%, transparent)", color: "#dc2626" }}
          >
            <Trash2 size={12} /> Delete
          </motion.button>
        )}
      </div>
    </div>
  );
}
