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
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCopy}
        className={`inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none ${
          copied ? "bg-green-500/10 text-green-600" : "bg-[var(--bg-2)] text-[var(--ink-2)] hover:bg-[color-mix(in_oklab,var(--bg-2)_80%,var(--ink))]"
        }`}
      >
        {copied ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleStatus}
        disabled={toggling}
        className={`inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none disabled:opacity-50 ${
          status === "published"
            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
            : "bg-[var(--v3-accent)]/10 text-[var(--v3-accent)] hover:bg-[var(--v3-accent)]/20"
        }`}
      >
        {toggling
          ? "…"
          : status === "published"
          ? <><RotateCcw size={12} /> Unpublish</>
          : <><CheckSquare size={12} /> Mark Published</>}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none hover:opacity-80 disabled:opacity-50 bg-red-500/10 text-red-600"
      >
        {deleting ? "…" : <><Trash2 size={12} /> Delete</>}
      </motion.button>
    </div>
  );
}
