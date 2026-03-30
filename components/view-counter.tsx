"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface ViewCounterProps {
  slug: string;
  increment?: boolean;
}

export function ViewCounter({
  slug,
  increment = false,
}: ViewCounterProps): React.ReactElement {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const run = async (): Promise<void> => {
      try {
        if (increment) {
          const res = await fetch("/api/posts/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          });
          if (res.ok) {
            const data = (await res.json()) as { views: number };
            setViews(data.views);
          }
        } else {
          const res = await fetch(`/api/posts/views?slug=${slug}`);
          if (res.ok) {
            const data = (await res.json()) as { views: number };
            setViews(data.views);
          }
        }
      } catch {
        // View counter is non-critical
      }
    };
    void run();
  }, [slug, increment]);

  if (views === null) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Eye className="h-3 w-3" />
      {views.toLocaleString()} views
    </span>
  );
}
