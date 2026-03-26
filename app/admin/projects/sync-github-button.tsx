"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

export function SyncGitHubButton(): React.ReactElement {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSync = async (): Promise<void> => {
    setSyncing(true);
    setMessage(null);

    const res = await fetch("/api/admin/sync-github", { method: "POST" });
    const json = (await res.json()) as { message?: string; error?: string };

    if (!res.ok) {
      setMessage(json.error ?? "Sync failed");
    } else {
      setMessage(json.message ?? "Synced");
      router.refresh();
    }

    setSyncing(false);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="flex items-center gap-3">
      {message && (
        <p className="text-xs text-muted-foreground">{message}</p>
      )}
      <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing}>
        {syncing ? (
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
        )}
        Sync GitHub
      </Button>
    </div>
  );
}
