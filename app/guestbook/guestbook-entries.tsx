"use client";

import { useState, useEffect, useCallback } from "react";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
      setName("");
      setMessage("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Sign form */}
      <form onSubmit={handleSubmit} className="v3-guest-form">
        <div className="form-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
            required
          />
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave a message…"
            maxLength={500}
            required
          />
        </div>
        {error && (
          <p style={{ fontSize: 13, color: "var(--v3-accent)", marginBottom: 12 }}>{error}</p>
        )}
        <button
          type="submit"
          className="v3-btn v3-btn-accent v3-btn-sm"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <><Send size={13} style={{ marginRight: 6 }} />Sign guestbook</>
          )}
        </button>
      </form>

      {/* Entries */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--ink-3)" }} />
        </div>
      ) : entries.length === 0 ? (
        <p style={{ fontSize: 15, color: "var(--ink-3)", textAlign: "center", padding: "48px 0" }}>
          No entries yet. Be the first to sign the guestbook!
        </p>
      ) : (
        <div className="v3-guest-list">
          {entries.map((entry) => (
            <div key={entry.id} className="v3-guest-msg">
              <div className="who">
                <span>
                  <b>{entry.name}</b>
                </span>
                <span className="dt">
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="msg">{entry.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
