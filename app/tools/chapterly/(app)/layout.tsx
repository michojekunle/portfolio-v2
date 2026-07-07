import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChSidebarNav } from "@/components/chapterly/SidebarNav";
import { getOrCreateGoal } from "@/lib/chapterly/queries";
import { PwaRegistrar } from "@/components/PwaRegistrar";
import { BadgeUnlockToast } from "@/components/chapterly/BadgeUnlockToast";
import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/manifests/chapterly.json",
  appleWebApp: {
    capable: true,
    title: "Chapterly",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default async function ChapterlyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tools/chapterly/login");
  }

  const goal = await getOrCreateGoal();

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--ink)]">
      <ChSidebarNav
        userEmail={user.email ?? ""}
        streak={goal?.streak_count ?? 0}
      />
      <div className="flex-1 min-w-0 max-[1024px]:ml-0 ml-[260px] flex flex-col relative">
        <main className="flex-1 min-h-screen">{children}</main>
      </div>
      <PwaRegistrar toolId="chapterly" />
      <BadgeUnlockToast />
    </div>
  );
}
