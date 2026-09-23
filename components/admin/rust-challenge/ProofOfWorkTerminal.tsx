"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, ExternalLink, Loader2, Save, Send } from "lucide-react";
import type { RustChallengeDay, UpdateFn } from "./types";
import { generateDayTweet } from "./types";

interface ProofOfWorkTerminalProps {
  day: RustChallengeDay;
  totalDays?: number;
  onUpdate: UpdateFn;
}

export function ProofOfWorkTerminal({
  day,
  totalDays = 188,
  onUpdate,
}: ProofOfWorkTerminalProps): React.ReactElement {
  const [notes, setNotes] = useState(day.notes ?? "");
  const [xPostUrl, setXPostUrl] = useState(day.x_post_url ?? "");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNotes(day.notes ?? "");
    setXPostUrl(day.x_post_url ?? "");
  }, [day.day_number, day.notes, day.x_post_url]);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      await onUpdate(day.day_number, {
        notes: notes.trim() || null,
        x_post_url: xPostUrl.trim() || null,
      });
      toast.success("Log saved");
    } catch {
      toast.error("Failed to save log");
    } finally {
      setSaving(false);
    }
  };

  const tweetText = generateDayTweet(day, totalDays);

  const handleCopyTweet = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(tweetText);
      setCopied(true);
      toast.success("Broadcast text copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy — select manually");
    }
  };

  const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  return (
    <div className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-xl p-5 sm:p-6 space-y-5 shadow-xs">
      {/* Titlebar */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Engineering Log & Proof of Work · Day {day.day_number}
        </h3>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="h-8 px-3 text-xs font-mono font-medium gap-1.5 bg-foreground text-background hover:bg-foreground/90 rounded-lg cursor-pointer"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          <span>Save Log</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Architectural Notes & Findings */}
        <div className="space-y-2">
          <label className="block font-mono text-xs text-muted-foreground font-medium">
            Daily Findings & Architecture Notes
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record flamegraph metrics, cache misses, algorithm invariants, or implementation notes..."
            className="min-h-[130px] font-mono text-xs leading-relaxed bg-background/80 border-border/80 rounded-xl focus:border-foreground resize-y text-foreground"
          />
        </div>

        {/* Right Column: Social Broadcast & Artifact Link */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <label className="block font-mono text-xs text-muted-foreground font-medium">
              Artifact Link (PR, Commit, or X Post URL)
            </label>
            <div className="relative">
              <Input
                value={xPostUrl}
                onChange={(e) => setXPostUrl(e.target.value)}
                placeholder="https://github.com/... or https://x.com/..."
                className="font-mono text-xs bg-background/80 border-border/80 rounded-xl focus:border-foreground pr-8 text-foreground"
              />
              {xPostUrl && (
                <a
                  href={xPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Social Broadcast Block */}
          <div className="rounded-xl border border-border/60 bg-background/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground font-medium">
                Draft Social Update
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyTweet}
                  className="h-6 text-xs px-2 font-mono gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
                <a
                  href={intentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 h-6 px-2.5 rounded-md bg-foreground/10 hover:bg-foreground/20 text-xs font-mono font-medium text-foreground transition-colors"
                >
                  <Send className="h-3 w-3" />
                  <span>Post to X</span>
                </a>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-mono line-clamp-2 leading-relaxed">
              {tweetText.replace(/\n\n/g, " · ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
