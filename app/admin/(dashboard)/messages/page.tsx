import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import { MessageItem } from "./message-item";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/page-header";
import { GlassCard } from "@/components/admin/ui/glass-card";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default async function AdminMessagesPage(): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.CONTACT_TO_EMAIL || "info@michaelojekunle.dev";

  if (!user || user.email !== adminEmail) {
    redirect("/admin/login");
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  const all = (messages ?? []) as Message[];
  const unreadCount = all.filter((m) => !m.read).length;

  return (
    <div>
      <PageHeader
        title="Messages"
        description={`${all.length} total`}
        action={
          unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-foreground text-background">
              {unreadCount} unread
            </span>
          )
        }
      />

      {!all.length ? (
        <GlassCard className="text-center py-16" hoverEffect={false}>
          <p className="text-sm font-medium text-muted-foreground">No messages yet.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {all.map((msg) => (
            <MessageItem
              key={msg.id}
              id={msg.id}
              name={msg.name}
              email={msg.email}
              subject={msg.subject}
              message={msg.message}
              read={msg.read}
              timeAgo={formatDistanceToNow(new Date(msg.created_at), {
                addSuffix: true,
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
