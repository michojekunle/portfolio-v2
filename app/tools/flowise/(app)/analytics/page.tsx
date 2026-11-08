import type { Metadata } from "next";
import { AnalyticsClient } from "@/components/flowise/AnalyticsClient";

export const metadata: Metadata = { title: "Flowise — Analytics" };

export default function AnalyticsPage(): React.ReactElement {
  return <AnalyticsClient />;
}
