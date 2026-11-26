import type { Metadata } from "next";
import { getSpeakingWorkspaceData } from "@/lib/speaking/queries";
import { JournalHubView } from "@/components/speaking/JournalHubView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal, Idea Bank & Weekly Reviews",
};

interface PageProps {
  searchParams: Promise<{ tab?: string; week?: string }>;
}

export default async function SpeakingJournalPage({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const [{ tab, week }, data] = await Promise.all([
    searchParams,
    getSpeakingWorkspaceData(),
  ]);
  const parsedWeek = week ? Number(week) : undefined;
  return (
    <JournalHubView
      data={data}
      initialTab={tab}
      initialWeek={parsedWeek && !Number.isNaN(parsedWeek) ? parsedWeek : undefined}
    />
  );
}
