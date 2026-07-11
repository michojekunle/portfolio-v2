"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Mail, MailOpen, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div
      className={cn(
        "content-card transition-all",
        !read && "border-l-2 border-l-foreground"
      )}
    >
      {/* Header row — always visible */}
      <button
        onClick={handleExpand}
        className="w-full flex items-start justify-between gap-4 text-left"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="shrink-0 mt-0.5 text-muted-foreground">
            {read ? (
              <MailOpen className="h-4 w-4" />
            ) : (
              <Mail className="h-4 w-4 text-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-sm",
                  !read ? "font-semibold" : "font-medium"
                )}
              >
                {name}
              </span>
              <span className="text-xs text-muted-foreground">{email}</span>
            </div>
            <p
              className={cn(
                "text-sm mt-0.5 truncate",
                !read ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {subject}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {timeAgo}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {message}
          </p>

          <div className="flex items-center justify-between pt-2">
            <a
              href={`mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`}
              className="text-sm text-foreground underline underline-offset-4 hover:no-underline"
            >
              Reply via email
            </a>

            <div className="flex items-center gap-2">
              {!read && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markRead}
                  className="h-7 text-xs"
                >
                  Mark as read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
