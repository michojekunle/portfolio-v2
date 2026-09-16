"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Mail, MailOpen, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/admin/ui/glass-card";

interface MessageItemProps {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  timeAgo: string;
}

export function MessageItem({
  id,
  name,
  email,
  subject,
  message,
  read: initialRead,
  timeAgo,
}: MessageItemProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const [read, setRead] = useState(initialRead);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  const markRead = async (): Promise<void> => {
    if (read) return;
    setRead(true);
    await supabase.from("messages").update({ read: true }).eq("id", id);
    router.refresh();
  };

  const handleExpand = (): void => {
    setExpanded((v) => !v);
    // auto-mark as read when opened
    if (!read && !expanded) {
      void markRead();
    }
  };

  const handleDelete = (): void => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    startTransition(async () => {
      await supabase.from("messages").delete().eq("id", id);
      router.refresh();
    });
  };

  return (
    <GlassCard
      className={cn(
        "transition-all duration-300 p-0",
        !read ? "border-l-2 border-l-foreground bg-secondary/10" : ""
      )}
      hoverEffect={false}
    >
      {/* Header row — always visible */}
      <button
        onClick={handleExpand}
        className="w-full flex items-start justify-between gap-4 text-left p-4 sm:p-5 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="shrink-0 mt-0.5 text-muted-foreground">
            {read ? (
              <MailOpen className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Mail className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={cn(
                  "text-sm tracking-tight",
                  !read ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                )}
              >
                {name}
              </span>
              <span className="text-xs font-medium text-muted-foreground/80">{email}</span>
            </div>
            <p
              className={cn(
                "text-[13px] truncate",
                !read ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {subject}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-medium text-muted-foreground/60 hidden sm:block uppercase tracking-wide">
            {timeAgo}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground/60" strokeWidth={1.5} />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground/60" strokeWidth={1.5} />
          )}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 pb-5 pt-3 border-t border-border/40 space-y-4 bg-background/20">
          <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {message}
          </p>

          <div className="flex items-center justify-between pt-3">
            <a
              href={`mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`}
              className="text-xs font-medium text-foreground underline underline-offset-4 hover:no-underline"
            >
              Reply via email
            </a>

            <div className="flex items-center gap-2">
              {!read && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markRead}
                  className="h-7 text-xs bg-transparent border-border/40 hover:bg-secondary/40"
                >
                  Mark as read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
