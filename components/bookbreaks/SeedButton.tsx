"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function BBSeedButton(): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSeed = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/bookbreaks/seed", { method: "POST" });
    const data: unknown = await res.json();

    if (!res.ok) {
      const msg =
        data && typeof data === "object" && "error" in data
          ? String((data as { error: unknown }).error)
          : "Failed to seed";
      setError(msg);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    setTimeout(() => router.refresh(), 500);
  };

  if (done) {
    return (
      <div
        className="inline-flex items-center gap-[8px] font-mono text-[11px] tracking-[0.1em] uppercase text-green-600 dark:text-green-400"
      >
        <CheckCircle size={14} /> 4 books loaded — refreshing…
      </div>
    );
  }

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSeed}
        disabled={loading}
        className="inline-flex items-center gap-[8px] h-[44px] px-[20px] rounded-[8px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-(--bg) transition-all duration-150 disabled:opacity-60 cursor-pointer bg-[var(--v3-accent)] border-none hover:opacity-90"
      >
        {loading ? "Loading books…" : <><BookOpen size={14} /> Load 4 starter books</>}
      </motion.button>
      {error && (
        <p
          className="font-mono text-[11px] mt-[8px] m-0 text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}
