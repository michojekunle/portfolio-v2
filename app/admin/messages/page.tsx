import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import { MessageItem } from "./message-item";

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

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  const all = (messages ?? []) as Message[];
  const unreadCount = all.filter((m) => !m.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {all.length} total
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-foreground text-background">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
      </div>

      {!all.length ? (
        <div className="content-card text-center py-16">
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
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
