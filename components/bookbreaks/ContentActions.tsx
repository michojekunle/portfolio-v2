"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none hover:opacity-80"
        style={{
          background: copied ? "rgba(45,80,22,0.12)" : "rgba(44,44,44,0.08)",
          color: copied ? "#2D5016" : "#4A3728",
        }}
      >
        {copied ? "✓ Copied" : "⎘ Copy"}
      </button>

      <button
        onClick={handleToggleStatus}
        disabled={toggling}
        className="inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none hover:opacity-80 disabled:opacity-50"
        style={{
          background:
            status === "published"
              ? "rgba(45,80,22,0.12)"
              : "rgba(200,90,44,0.1)",
          color: status === "published" ? "#2D5016" : "#C85A2C",
        }}
      >
        {toggling
          ? "…"
          : status === "published"
          ? "↩ Unpublish"
          : "✓ Mark Published"}
      </button>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-[5px] h-[32px] px-[12px] rounded-[6px] font-mono text-[9px] uppercase tracking-[0.1em] transition-all cursor-pointer border-none hover:opacity-80 disabled:opacity-50"
        style={{
          background: "rgba(220,38,38,0.06)",
          color: "#DC2626",
        }}
      >
        {deleting ? "…" : "✕ Delete"}
      </button>
    </div>
  );
}
