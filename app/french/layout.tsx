import type { Metadata, Viewport } from "next";
import { PwaRegistrar } from "@/components/PwaRegistrar";

export const metadata: Metadata = {
  title: "French Daily",
  description: "Your personal French language practice tracker. Daily challenges, vocabulary log, and streak tracking.",
  robots: { index: false, follow: false }, // Private tool — keep out of search engines
  manifest: "/manifests/french.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "French Daily",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function FrenchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PwaRegistrar toolId="french" />
    </>
  );
}
