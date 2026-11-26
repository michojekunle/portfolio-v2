import { getSpeakingWorkspaceData } from "@/lib/speaking/queries";
import { DashboardView } from "@/components/speaking/DashboardView";

export const dynamic = "force-dynamic";

export default async function SpeakingDashboardPage(): Promise<React.ReactElement> {
  const data = await getSpeakingWorkspaceData();
  return <DashboardView data={data} />;
}
