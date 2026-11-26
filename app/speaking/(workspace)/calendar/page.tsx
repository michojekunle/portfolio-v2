import type { Metadata } from "next";
import { getSpeakingWorkspaceData } from "@/lib/speaking/queries";
import { CalendarView } from "@/components/speaking/CalendarView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendar",
};

export default async function SpeakingCalendarPage(): Promise<React.ReactElement> {
  const data = await getSpeakingWorkspaceData();
  return <CalendarView data={data} />;
}
