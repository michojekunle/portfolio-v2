"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

export function GuestbookEntries(): React.ReactElement {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/guestbook");
      if (res.ok) {
        const data = (await res.json()) as GuestbookEntry[];
        setEntries(data);
      }
    } catch {
      // Silently fail — entries will be empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error: string };
        setError(data.error);
        return;
      }

      const entry = (await res.json()) as GuestbookEntry;
      setEntries((prev) => [entry, ...prev]);
      setMessage("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Sign form */}
      <form onSubmit={handleSubmit} className="content-card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
            required
            className="sm:col-span-1"
          />
          <div className="sm:col-span-2 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message..."
              maxLength={500}
              required
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </form>

      {/* Entries */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No entries yet. Be the first to sign the guestbook!
        </p>
      ) : (
        <div className="space-y-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-baseline gap-3 py-3 border-b border-border/60 last:border-0"
            >
              <span className="text-sm font-medium shrink-0">
                {entry.name}
              </span>
              <span className="text-sm text-muted-foreground flex-1 min-w-0">
                {entry.message}
              </span>
              <span className="text-xs text-muted-foreground/50 shrink-0">
                {formatDistanceToNow(new Date(entry.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
