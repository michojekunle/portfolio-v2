import type { Metadata } from "next";
import { getSpeakingWorkspaceData } from "@/lib/speaking/queries";
import { CurriculumView } from "@/components/speaking/CurriculumView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "90-Day Curriculum",
};

export default async function SpeakingCurriculumPage(): Promise<React.ReactElement> {
  const data = await getSpeakingWorkspaceData();
  return <CurriculumView data={data} />;
}
