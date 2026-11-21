import type { Metadata, Viewport } from "next";
import type { ReactElement, ReactNode } from "react";
import { PwaRegistrar } from "@/components/PwaRegistrar";

const DESCRIPTION =
  "One Spanish page a day, about ten minutes: review what you're about to forget, hear a short scene, speak out loud, write one sentence and get it corrected.";

export const metadata: Metadata = {
  // Absolute: an installed app's window title is just its name, without the portfolio suffix.
  title: { absolute: "Spanish Daily" },
  applicationName: "Spanish Daily",
  description: DESCRIPTION,
  robots: { index: false, follow: false }, // Private tool — keep out of search engines
  manifest: "/manifests/spanish.json",
  icons: {
    icon: [
      { url: "/icons/spanish/icon.svg", type: "image/svg+xml" },
      { url: "/icons/spanish/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icons/spanish/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    // "default" keeps dark status-bar text over the light paper; translucent would draw white text on cream.
    statusBarStyle: "default",
    title: "Español",
  },
  formatDetection: { telephone: false },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Matches the cuaderno paper; FrenchApp updates it live for the chosen style and mode.
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f1624" },
    { media: "(prefers-color-scheme: light)", color: "#fdfdfb" },
  ],
};

export default function SpanishLayout({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <>
      {children}
      {/* The Spanish app shows its own install prompt at the right moment (after a session). */}
      <PwaRegistrar toolId="spanish" showPrompt={false} />
    </>
  );
}
