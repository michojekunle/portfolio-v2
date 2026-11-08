import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JournalSidebarNav } from "@/components/journal/SidebarNav";
import { AssistantWidget } from "@/components/journal/AssistantWidget";
import { SyncBootstrap } from "@/components/journal/SyncBootstrap";
import { getRecentEntries, getObjectivesWithMilestones } from "@/lib/journal/queries";
import { PwaRegistrar } from "@/components/PwaRegistrar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/manifests/vela.json",
  appleWebApp: {
    capable: true,
    title: "Vela Journal",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

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

  // Compute current streak for sidebar widget
  const [recentEntries, objectives] = await Promise.all([
    getRecentEntries(90),
    getObjectivesWithMilestones(),
  ]);
  const streakCount = (() => {
    let count = 0;
    const cursor = new Date();
    const doneSet = new Set(recentEntries.map((e) => e.date));
    while (true) {
      const d = cursor.toLocaleDateString("en-CA");
      if (!doneSet.has(d)) break;
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  return (
    <div className="min-h-screen flex bg-(--bg) text-(--ink)">
      <JournalSidebarNav userEmail={user.email ?? ""} streakCount={streakCount} />
      <div className="flex-1 min-w-0 max-[1024px]:ml-0 ml-60 flex flex-col relative">
        <main className="flex-1 min-h-screen max-[1024px]:pt-13">{children}</main>
      </div>
      <AssistantWidget hasObjectives={objectives.length > 0} />
      <SyncBootstrap />
      <PwaRegistrar toolId="journal" />
    </div>
  );
}
