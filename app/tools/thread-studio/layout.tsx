import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PwaRegistrar } from "@/components/PwaRegistrar";

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
  manifest: "/manifests/thread-studio.json",
  appleWebApp: {
    capable: true,
    title: "Thread Studio",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function ThreadStudioLayout({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return (
    <>
      {children}
      <PwaRegistrar toolId="thread-studio" />
    </>
  );
}
