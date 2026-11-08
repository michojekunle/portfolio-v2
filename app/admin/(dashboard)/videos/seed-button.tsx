"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

export function SeedVideosButton(): React.ReactElement {
  const [seeding, setSeeding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSeed = async (): Promise<void> => {
    setSeeding(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/seed-videos", { method: "POST" });
      const data = await res.json().catch(() => ({})) as { error?: string; success?: boolean };

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `Response returned status ${res.status}`);
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      console.error("[seed-button] failed:", err);
      setError(err instanceof Error ? err.message : "Seeding failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => void handleSeed()}
          disabled={seeding}
          variant="outline"
          size="sm"
          className="border-primary/20 hover:border-primary/50 text-foreground"
        >
          {seeding ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              Seeding...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Seed placeholders
            </>
          )}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      {success && <p className="text-xs text-green-500 mt-1">Successfully seeded placeholder videos!</p>}
    </div>
  );
}
