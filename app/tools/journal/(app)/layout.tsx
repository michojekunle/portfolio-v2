import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JournalSidebarNav } from "@/components/journal/SidebarNav";

export default async function JournalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tools/journal/login");
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--ink)]">
      <JournalSidebarNav userEmail={user.email ?? ""} />
      <div className="flex-1 min-w-0 max-[1024px]:ml-0 ml-[240px] flex flex-col relative">
        <main className="flex-1 min-h-screen max-[1024px]:pt-[52px]">{children}</main>
      </div>
    </div>
  );
}
