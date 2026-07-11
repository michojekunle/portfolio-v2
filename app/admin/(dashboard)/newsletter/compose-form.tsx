"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type SendType = "blog_post" | "digest" | "custom";

interface PublishedPost {
  id: string;
  title: string;
  category: string | null;
  published_at: string | null;
}

interface ComposeFormProps {
  subscriberCount: number;
  publishedPosts: PublishedPost[];
}

interface SendResult {
  success: boolean;
  sent?: number;
  error?: string | Record<string, string[]>;
}

const TYPE_CONFIG: Record<
  SendType,
  { label: string; description: string }
> = {
  blog_post: {
    label: "New Blog Post",
    description: "Notify subscribers about a specific published post.",
  },
  digest: {
    label: "What's New Digest",
    description:
      "Auto-generated snapshot of your current reading, building, and learning — plus your latest posts.",
  },
  custom: {
    label: "Custom Message",
    description: "Write a free-form update to your subscribers.",
  },
};

export function ComposeForm({
  subscriberCount,
  publishedPosts,
}: ComposeFormProps): React.ReactElement {
  const [type, setType] = useState<SendType>("digest");
  const [postId, setPostId] = useState<string>(publishedPosts[0]?.id ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<SendResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canSend = (): boolean => {
    if (subscriberCount === 0) return false;
    if (type === "blog_post") return !!postId;
    if (type === "custom") return subject.trim().length > 0 && body.trim().length > 0;
    return true; // digest
  };

  const handleSend = (): void => {
    if (
      !confirm(
        `Send to ${subscriberCount} subscriber${subscriberCount !== 1 ? "s" : ""}? This cannot be undone.`
      )
    )
      return;

    setResult(null);

    startTransition(async () => {
      try {
        const payload =
          type === "blog_post"
            ? { type, postId }
            : type === "digest"
              ? { type }
              : { type, subject: subject.trim(), body: body.trim() };

        const res = await fetch("/api/admin/send-newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = (await res.json()) as SendResult;
        setResult(data);

        if (data.success) {
          router.refresh();
          // Reset form
          setSubject("");
          setBody("");
        }
      } catch (err: unknown) {
        setResult({
          success: false,
          error:
            err instanceof Error ? err.message : "Network error. Try again.",
        });
      }
    });
  };

  return (
    <div className="content-card space-y-6">
      {/* No subscribers warning */}
      {subscriberCount === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-muted text-sm text-muted-foreground">
          <Users className="h-4 w-4 shrink-0" />
          No subscribers yet — share your site&apos;s newsletter section to grow your list.
        </div>
      )}

      {/* Type selector */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Type
        </p>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(TYPE_CONFIG) as SendType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                type === t
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {TYPE_CONFIG[type].description}
        </p>
      </div>

      {/* Blog post selector */}
      {type === "blog_post" && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Post
          </p>
          {publishedPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No published posts yet.
            </p>
          ) : (
            <select
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              className="w-full h-9 bg-muted border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {publishedPosts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title}
                  {post.category ? ` — ${post.category}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Digest — no input needed */}
      {type === "digest" && (
        <div className="rounded-md bg-muted/60 border border-border/60 p-4 space-y-1.5">
          <p className="text-xs font-medium">Auto-generated content:</p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Last 3 published blog posts</li>
            <li>Books currently reading (with latest quote)</li>
            <li>Active builds with status</li>
            <li>In-progress learning items</li>
          </ul>
        </div>
      )}

      {/* Custom form */}
      {type === "custom" && (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Subject
            </p>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. A quick update from me"
              maxLength={200}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Body
            </p>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="Write your message here. Blank lines create paragraphs."
              className="w-full bg-muted/60 border border-border rounded-md p-3 text-sm font-mono resize-y focus:outline-none focus:ring-1 focus:ring-ring"
              maxLength={20000}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {body.length} / 20,000
            </p>
          </div>
        </div>
      )}

      {/* Result banner */}
      {result && (
        <div
          className={cn(
            "p-3 rounded-md text-sm",
            result.success
              ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {result.success
            ? `✓ Sent successfully to ${result.sent} subscriber${result.sent !== 1 ? "s" : ""}.`
            : `Error: ${typeof result.error === "string" ? result.error : JSON.stringify(result.error)}`}
        </div>
      )}

      {/* Send button */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {subscriberCount} subscriber{subscriberCount !== 1 ? "s" : ""}
        </p>
        <Button
          onClick={handleSend}
          disabled={!canSend() || isPending}
          size="sm"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          {isPending ? "Sending…" : `Send to ${subscriberCount}`}
        </Button>
      </div>
    </div>
  );
}
