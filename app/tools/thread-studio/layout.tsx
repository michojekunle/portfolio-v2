import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Thread Studio — Craft viral Twitter threads with AI",
  description:
    "Generate, edit, and schedule professional Twitter/X thread content using AI. Drag to reorder, export as images, and publish directly.",
  openGraph: {
    title: "Thread Studio — Craft viral Twitter threads with AI",
    description:
      "Generate, edit, and schedule professional Twitter/X thread content using AI.",
    type: "website",
  },
};

export default function ThreadStudioLayout({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
