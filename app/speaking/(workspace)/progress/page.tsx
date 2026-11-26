import type { Metadata } from "next";
import { getSpeakingWorkspaceData } from "@/lib/speaking/queries";
import { ProgressAnalyticsView } from "@/components/speaking/ProgressAnalyticsView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Progress & Recording Archive",
};

export default async function SpeakingProgressPage(): Promise<React.ReactElement> {
  const data = await getSpeakingWorkspaceData();
  return <ProgressAnalyticsView data={data} />;
}
