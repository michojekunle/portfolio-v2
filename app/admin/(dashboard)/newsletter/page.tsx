import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow, format } from "date-fns";
import { ComposeForm } from "./compose-form";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/admin/ui/page-header";
import { GlassCard } from "@/components/admin/ui/glass-card";

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
    <div className="space-y-12">
      <PageHeader
        title="Newsletter"
        description={`${subscriberCount ?? 0} subscriber${subscriberCount !== 1 ? "s" : ""}`}
      />

      {/* Compose */}
      <section>
        <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">Send an update</h2>
        <GlassCard className="p-6">
          <ComposeForm
            subscriberCount={subscriberCount ?? 0}
            publishedPosts={posts}
          />
        </GlassCard>
      </section>

      {/* Send history */}
      {sends.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">Send history</h2>
          <GlassCard className="p-0 overflow-hidden" hoverEffect={false}>
            <div className="divide-y divide-border/40">
              {sends.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-4 py-4 px-5 hover:bg-secondary/20 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tracking-tight text-foreground/90 truncate">{s.subject}</p>
                    <p className="text-[11px] font-medium text-muted-foreground/80 mt-1 uppercase tracking-wide">
                      {s.recipient_count} recipients <span className="mx-1.5 opacity-50">·</span>{" "}
                      {formatDistanceToNow(new Date(s.sent_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-medium bg-secondary/50 text-foreground/70 border-border/50">
                      {s.type.replace("_", " ")}
                    </Badge>
                    <span className="text-[11px] font-medium text-muted-foreground/60 hidden sm:block uppercase tracking-wide">
                      {format(new Date(s.sent_at), "MMM d")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      )}
    </div>
  );
}
