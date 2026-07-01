import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BBSidebarNav } from "@/components/bookbreaks/SidebarNav";
import { ThemeTweaker } from "@/components/bookbreaks/ThemeTweaker";

export default async function BookBreaksLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tools/bookbreaks/login");
  }

  return (
    <div
      className="min-h-screen flex bg-[var(--bg)] text-[var(--ink)]"
    >
      <BBSidebarNav userEmail={user.email ?? ""} />
      <div className="flex-1 min-w-0 ml-[260px] max-[1024px]:ml-0 flex flex-col relative">
        <main className="flex-1 min-h-screen">{children}</main>
        <ThemeTweaker />
      </div>
    </div>
  );
}
