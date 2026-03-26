import type React from "react";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://michaelojekunle.dev"),
  title: {
    default: "Michael Ojekunle — Full-Stack & Web3 Developer",
    template: "%s | Michael Ojekunle",
  },
  description:
    "Full-stack and Web3 developer based in Lagos, Nigeria. Specializing in Next.js, TypeScript, Solidity, and Cairo. Building at the intersection of frontend elegance and blockchain innovation.",
  keywords: [
    "Michael Ojekunle",
    "Full-Stack Developer",
    "Web3 Developer",
    "Solidity",
    "Next.js",
    "TypeScript",
    "React",
    "Cairo",
    "StarkNet",
    "Lagos Nigeria",
    "Blockchain Developer",
  ],
  authors: [{ name: "Michael Ojekunle", url: "https://michaelojekunle.dev" }],
  creator: "Michael Ojekunle",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://michaelojekunle.dev",
    siteName: "Michael Ojekunle",
    title: "Michael Ojekunle — Full-Stack & Web3 Developer",
    description:
      "Full-stack and Web3 developer building at the intersection of frontend elegance and blockchain innovation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Michael Ojekunle — Full-Stack & Web3 Developer",
    description:
      "Full-stack and Web3 developer building at the intersection of frontend elegance and blockchain innovation.",
    creator: "@devvmichael",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // icon.tsx + apple-icon.tsx in app/ are auto-detected by Next.js
  // and injected into <head> automatically — no manual paths needed.
  alternates: {
    canonical: "https://michaelojekunle.dev",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://michaelojekunle.dev/#person",
      name: "Michael Ojekunle",
      url: "https://michaelojekunle.dev",
      image: "https://michaelojekunle.dev/opengraph-image",
      jobTitle: "Full-Stack & Web3 Developer",
      description:
        "Full-stack and Web3 developer based in Lagos, Nigeria. Specializing in Next.js, TypeScript, Solidity, and Cairo.",
      sameAs: [
        "https://github.com/michojekunle",
        "https://x.com/devvmichael",
        "https://linkedin.com/in/michael-ojekunle",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lagos",
        addressCountry: "NG",
      },
      knowsAbout: [
        "JavaScript",
        "TypeScript",
        "React",
        "Next.js",
        "Solidity",
        "Cairo",
        "Rust",
        "Web3",
        "Blockchain",
        "Smart Contracts",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://michaelojekunle.dev/#website",
      url: "https://michaelojekunle.dev",
      name: "Michael Ojekunle",
      description:
        "Portfolio of Michael Ojekunle — Full-Stack & Web3 Developer",
      author: { "@id": "https://michaelojekunle.dev/#person" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
