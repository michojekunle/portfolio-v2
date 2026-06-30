"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Copy, CheckCircle, RotateCcw, CheckSquare, Trash2 } from "lucide-react";

interface Props {
  contentId: string;
  content: string;
  status: string;
}

export function BBContentActions({ contentId, content, status }: Props): React.ReactElement {
  const router = useRouter();
  const supabase = createClient();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStatus = async (): Promise<void> => {
    setToggling(true);
    const newStatus = status === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("bb_generated_content")
      .update({ status: newStatus })
      .eq("id", contentId);

    if (error) console.error("[toggleStatus]", error.message);
    setToggling(false);
    router.refresh();
  };

  const handleDelete = async (): Promise<void> => {
    if (!confirm("Delete this content? This cannot be undone.")) return;
    setDeleting(true);
    const { error } = await supabase
      .from("bb_generated_content")
      .delete()
      .eq("id", contentId);

    if (error) console.error("[delete]", error.message);
    setDeleting(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-[8px] flex-wrap">
      {/* Copy */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleCopy}
        className="inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none"
        style={
          copied
            ? {
                background: "color-mix(in oklab, var(--v3-accent) 12%, transparent)",
                color: "var(--v3-accent)",
              }
            : {
                background: "var(--bg)",
                border: "1px solid var(--rule)",
                color: "var(--ink-3)",
              }
        }
      >
        {copied ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
      </motion.button>

      {/* Publish toggle */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleToggleStatus}
        disabled={toggling}
        className="inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none disabled:opacity-50"
        style={
          status === "published"
            ? {
                background: "color-mix(in oklab, #22c55e 10%, transparent)",
                color: "color-mix(in oklab, #16a34a 100%, transparent)",
              }
            : {
                background: "color-mix(in oklab, var(--v3-accent) 10%, transparent)",
                color: "var(--v3-accent)",
              }
        }
      >
        {toggling
          ? "…"
          : status === "published"
          ? <><RotateCcw size={12} /> Unpublish</>
          : <><CheckSquare size={12} /> Publish</>}
      </motion.button>

      {/* Delete */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none disabled:opacity-50"
        style={{
          background: "color-mix(in oklab, #ef4444 10%, transparent)",
          color: "color-mix(in oklab, #dc2626 100%, transparent)",
        }}
      >
        {deleting ? "…" : <><Trash2 size={12} /> Delete</>}
      </motion.button>
    </div>
  );
}
