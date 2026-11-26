import type { Metadata } from "next";
import { MethodologyView } from "@/components/speaking/MethodologyView";

export const metadata: Metadata = {
  title: "Speaking Methodology",
};

export default function SpeakingMethodologyPage(): React.ReactElement {
  return <MethodologyView />;
}
