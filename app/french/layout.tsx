import type { Metadata, Viewport } from "next";
import type { ReactElement, ReactNode } from "react";
import { PwaRegistrar } from "@/components/PwaRegistrar";

const DESCRIPTION =
  "One French page a day, about ten minutes: review what you're about to forget, hear a short scene, speak out loud, write one sentence and get it corrected.";

export const metadata: Metadata = {
  // Absolute: an installed app's window title is just its name, without the portfolio suffix.
  title: { absolute: "French Daily" },
  applicationName: "French Daily",
  description: DESCRIPTION,
  robots: { index: false, follow: false }, // Private tool — keep out of search engines
  manifest: "/manifests/french.json",
  icons: {
    icon: [
      { url: "/icons/french/icon.svg", type: "image/svg+xml" },
      { url: "/icons/french/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/icons/french/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    // "default" keeps dark status-bar text over the light paper; translucent would draw white text on cream.
    statusBarStyle: "default",
    title: "Français",
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
  // Matches the Cahier paper; FrenchApp updates it live for the chosen style and mode.
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#16131f" },
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
  ],
};

export default function FrenchLayout({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <>
      {children}
      {/* The French app shows its own install prompt at the right moment (after a session). */}
      <PwaRegistrar toolId="french" showPrompt={false} />
    </>
  );
}
