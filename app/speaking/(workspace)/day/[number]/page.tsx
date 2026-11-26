import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurriculumDay } from "@/lib/speaking/curriculum";
import { getSpeakingWorkspaceData } from "@/lib/speaking/queries";
import { DailyWorkspace } from "@/components/speaking/DailyWorkspace";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ number: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { number } = await params;
  const dayNumber = Number(number);
  const day = Number.isInteger(dayNumber) ? getCurriculumDay(dayNumber) : undefined;
  if (!day) {
    return { title: "Day Not Found" };
  }
  return {
    title: `Day ${day.dayNumber}: ${day.topic}`,
    description: day.description,
  };
}

export default async function SpeakingDayPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { number } = await params;
  const dayNumber = Number(number);
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 90) {
    notFound();
  }
  const day = getCurriculumDay(dayNumber);
  if (!day) notFound();

  const data = await getSpeakingWorkspaceData();
  return <DailyWorkspace day={day} data={data} />;
}
