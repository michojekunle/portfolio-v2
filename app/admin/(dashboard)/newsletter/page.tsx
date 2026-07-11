import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow, format } from "date-fns";
import { ComposeForm } from "./compose-form";
import { Badge } from "@/components/ui/badge";

interface NewsletterSend {
  id: string;
  subject: string;
  type: string;
  recipient_count: number;
  sent_at: string;
}

interface PublishedPost {
  id: string;
  title: string;
  category: string | null;
  published_at: string | null;
}

export default async function AdminNewsletterPage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  const [
    { count: subscriberCount },
    { data: recentSends },
    { data: publishedPosts },
  ] = await Promise.all([
    supabase
      .from("email_subscribers")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("newsletter_sends")
      .select("id, subject, type, recipient_count, sent_at")
      .order("sent_at", { ascending: false })
      .limit(8),
    supabase
      .from("blog_posts")
      .select("id, title, category, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(20),
  ]);

  const sends = (recentSends ?? []) as NewsletterSend[];
  const posts = (publishedPosts ?? []) as PublishedPost[];

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Newsletter</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {subscriberCount ?? 0} subscriber{subscriberCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Compose */}
      <section>
        <h2 className="text-sm font-medium mb-4">Send an update</h2>
        <ComposeForm
          subscriberCount={subscriberCount ?? 0}
          publishedPosts={posts}
        />
      </section>

      {/* Send history */}
      {sends.length > 0 && (
        <section>
          <h2 className="text-sm font-medium mb-4">Send history</h2>
          <div className="content-card divide-y divide-border">
            {sends.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{s.subject}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.recipient_count} recipients ·{" "}
                    {formatDistanceToNow(new Date(s.sent_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {s.type.replace("_", " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {format(new Date(s.sent_at), "MMM d")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
