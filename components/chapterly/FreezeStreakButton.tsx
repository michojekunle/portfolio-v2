"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Snowflake, Loader2 } from "lucide-react";

interface Props {
  frozenUntil: string | null;
  freezesUsed: number;
  freezesMax: number;
}

export function FreezeStreakButton({ frozenUntil, freezesUsed, freezesMax }: Props): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const isFrozen = frozenUntil !== null && frozenUntil.slice(0, 10) >= today;
  const freezesLeft = Math.max(0, freezesMax - freezesUsed);

  const toggleFreeze = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chapterly/goals/freeze", {
        method: isFrozen ? "DELETE" : "POST",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Failed to update streak freeze");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => void toggleFreeze()}
        disabled={loading || (!isFrozen && freezesLeft === 0)}
        className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-full border cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={
          isFrozen
            ? { background: "#0EA5E915", color: "#0EA5E9", borderColor: "#0EA5E950" }
            : { background: "transparent", color: "var(--ink-3)", borderColor: "var(--rule)" }
        }
        title={
          isFrozen
            ? "Your streak is protected — click to unfreeze"
            : "Protect your streak for a rest day"
        }
      >
        {loading ? <Loader2 size={11} className="animate-spin" /> : <Snowflake size={11} />}
        {isFrozen ? "Streak frozen · Unfreeze" : `Freeze streak (${freezesLeft} left)`}
      </button>
      {error && (
        <span className="text-[10px] text-red-500">{error}</span>
      )}
    </div>
  );
}
