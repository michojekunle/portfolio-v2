"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, EyeOff, Eye, Trash2 } from "lucide-react";

const CATEGORIES = ["featured", "web3", "frontend", "experiments"] as const;
type Category = (typeof CATEGORIES)[number];

interface ProjectActionsProps {
  projectId: string;
  isHidden: boolean;
  category: string;
}

export function ProjectActions({
  projectId,
  isHidden,
  category,
}: ProjectActionsProps): React.ReactElement {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const toggleHidden = async (): Promise<void> => {
    setLoading("hide");
    await supabase
      .from("projects")
      .update({ is_hidden: !isHidden })
      .eq("id", projectId);
    setLoading(null);
    router.refresh();
  };

  const changeCategory = async (cat: Category): Promise<void> => {
    if (cat === category) return;
    setLoading("cat");
    await supabase
      .from("projects")
      .update({ category: cat })
      .eq("id", projectId);
    setLoading(null);
    router.refresh();
  };

  const deleteProject = async (): Promise<void> => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setLoading("delete");
    await supabase.from("projects").delete().eq("id", projectId);
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      <select
        value={category}
        onChange={(e) => changeCategory(e.target.value as Category)}
        disabled={loading !== null}
        className="text-xs bg-muted border border-border rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={toggleHidden}
        disabled={loading !== null}
        title={isHidden ? "Show" : "Hide"}
      >
        {loading === "hide" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isHidden ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={deleteProject}
        disabled={loading !== null}
      >
        {loading === "delete" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
