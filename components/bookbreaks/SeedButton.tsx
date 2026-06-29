"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        className="inline-flex items-center gap-[8px] font-mono text-[11px] tracking-[0.1em] uppercase"
        style={{ color: "#2D5016" }}
      >
        ✓ 4 books loaded — refreshing…
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleSeed}
        disabled={loading}
        className="inline-flex items-center gap-[8px] h-[44px] px-[20px] rounded-[8px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-white transition-all duration-150 disabled:opacity-60 cursor-pointer hover:opacity-90 border-none"
        style={{ background: "#C85A2C" }}
      >
        {loading ? "Loading books…" : "📚 Load 4 starter books"}
      </button>
      {error && (
        <p
          className="font-mono text-[11px] mt-[8px] m-0"
          style={{ color: "#DC2626" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
