import { getCurriculumDay, CURRICULUM_DAYS } from "@/lib/speaking/curriculum";
import { getSpeakingWorkspaceData } from "@/lib/speaking/queries";
import { DailyWorkspace } from "@/components/speaking/DailyWorkspace";

export const dynamic = "force-dynamic";

export default async function SpeakingTodayPage(): Promise<React.ReactElement> {
  const data = await getSpeakingWorkspaceData();
  const day = getCurriculumDay(data.activeDayNumber) ?? CURRICULUM_DAYS[0];
  return <DailyWorkspace day={day} data={data} />;
}
