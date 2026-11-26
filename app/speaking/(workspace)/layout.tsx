import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSpeakingWorkspaceData } from "@/lib/speaking/queries";
import { SpeakingShell } from "@/components/speaking/SpeakingShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "The Speaking Ledger — 90 Days of Speaking",
    template: "%s | The Speaking Ledger",
  },
  description:
    "Private speaking-development workspace and learning journal by Michael Ojekunle.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SpeakingLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const data = await getSpeakingWorkspaceData();

  if (!data.isOwner) {
    redirect("/speaking/unlock");
  }

  const completedCount = Object.values(data.sessions).filter(
    (s) => s.status === "completed"
  ).length;

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <SpeakingShell
        isOwner={data.isOwner}
        schemaReady={data.schemaReady}
        activeDayNumber={data.activeDayNumber}
        todayDateStr={data.todayDateStr}
        completedCount={completedCount}
      >
        {children}
      </SpeakingShell>
    </main>
  );
}
