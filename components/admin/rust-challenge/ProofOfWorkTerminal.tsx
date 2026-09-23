"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, ExternalLink, Loader2, Save, Send, Terminal } from "lucide-react";
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
      toast.success("Telemetry log saved");
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
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-[#0d0d12]/90 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-5 sm:p-6 space-y-5">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider text-muted-foreground uppercase font-medium">
            <Terminal className="h-3.5 w-3.5 text-orange-400" />
            Proof of Work & Telemetry Log · Day {day.day_number}
          </span>
        </div>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="h-7 px-2.5 text-xs font-mono font-medium gap-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg cursor-pointer"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          <span>Save Log</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Architectural Notes & Findings */}
        <div className="space-y-2">
          <label className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Architectural Learnings / Benchmarks / Notes
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document cache miss metrics, flamegraph findings, or design trade-offs here..."
            className="min-h-[120px] font-mono text-xs leading-relaxed bg-black/40 border-white/10 rounded-xl focus:border-orange-500/50 resize-y"
          />
        </div>

        {/* Right Column: Social Broadcast & Artifact Link */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <label className="block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Public Proof URL (X Tweet / GitHub Commit / Blog Post)
            </label>
            <div className="relative">
              <Input
                value={xPostUrl}
                onChange={(e) => setXPostUrl(e.target.value)}
                placeholder="https://x.com/username/status/..."
                className="font-mono text-xs bg-black/40 border-white/10 rounded-xl focus:border-orange-500/50 pr-8"
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

          {/* Suggested Tweet Card */}
          <div className="rounded-xl border border-white/5 bg-black/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                One-Click Social Broadcast
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyTweet}
                  className="h-6 text-[11px] px-2 font-mono gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
                <a
                  href={intentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-white/10 hover:bg-white/20 text-[11px] font-mono font-medium text-foreground transition-colors"
                >
                  <Send className="h-3 w-3" />
                  <span>Broadcast</span>
                </a>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/90 font-mono line-clamp-2 leading-relaxed">
              {tweetText.replace(/\n\n/g, " · ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
