import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { CommandPalette } from "@/components/command-palette";
import { PortfolioChrome } from "@/components/portfolio-chrome";
import { CustomCursor } from "@/components/custom-cursor";
import { SmoothScroll } from "@/components/smooth-scroll";
import { NoiseOverlay } from "@/components/noise-overlay";
import { Preloader } from "@/components/preloader";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: "variable",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

// ── Viewport / theme-color ────────────────────────────────────────────────────

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

// ── Root metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL("https://michaelojekunle.dev"),
  title: {
    default: "Michael Ojekunle | Software Engineer & Builder",
    template: "%s | Michael Ojekunle",
  },
  description:
    "Software engineer and builder in Lagos, Nigeria. Four years building full-stack products — now going deeper into Rust systems and Flutter mobile, and building products of my own. Heading toward zkML.",
  keywords: [
    "Michael Ojekunle",
    "devvmichael",
    "Software Engineer",
    "Builder",
    "Flutter Developer",
    "Dart",
    "Mobile Development",
    "Rust",
    "Full-Stack Developer",
    "Next.js",
    "TypeScript",
    "React",
    "Web3 Developer",
    "Solidity",
    "StarkNet",
    "Lagos Nigeria",
    "zkML",
  ],
  authors: [{ name: "Michael Ojekunle", url: "https://michaelojekunle.dev" }],
  creator: "Michael Ojekunle",
  category: "technology",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://michaelojekunle.dev",
    siteName: "Michael Ojekunle",
    title: "Michael Ojekunle — Software Engineer & Builder",
    description:
      "Software engineer and builder. Full-stack foundation, now going deep on Rust systems and Flutter mobile — building products of my own, heading toward zkML.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Michael Ojekunle — Software Engineer & Builder",
    description:
      "Software engineer and builder. Full-stack foundation, now going deep on Rust systems and Flutter mobile — building products of my own, heading toward zkML.",
    creator: "@devvmichael",
    site: "@devvmichael",
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
  // icon.tsx + apple-icon.tsx in app/ are auto-detected — no manual paths needed.
  alternates: {
    canonical: "https://michaelojekunle.dev",
    types: {
      "application/rss+xml": "https://michaelojekunle.dev/feed.xml",
    },
  },
};

// ── JSON-LD structured data ───────────────────────────────────────────────────

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://michaelojekunle.dev/#person",
      name: "Michael Ojekunle",
      url: "https://michaelojekunle.dev",
      image: {
        "@type": "ImageObject",
        url: "https://michaelojekunle.dev/opengraph-image",
        width: 1200,
        height: 630,
      },
      jobTitle: "Software Engineer & Builder",
      description:
        "Software engineer and builder in Lagos, Nigeria. Four years building full-stack products — now going deeper into Rust systems and Flutter mobile, and building products of my own. Heading toward zkML.",
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
        "Software Engineering",
        "Flutter",
        "Dart",
        "Mobile Development",
        "Rust",
        "Systems Programming",
        "TypeScript",
        "JavaScript",
        "React",
        "Next.js",
        "Web3",
        "Solidity",
        "StarkNet",
        "Smart Contracts",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://michaelojekunle.dev/#website",
      url: "https://michaelojekunle.dev",
      name: "Michael Ojekunle",
      description:
        "Portfolio and blog of Michael Ojekunle — Software Engineer & Builder",
      author: { "@id": "https://michaelojekunle.dev/#person" },
    },
  ],
};

// ── Root layout ───────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD structured data — in <head> avoids React 19 script-in-body warning */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {/* Skip navigation — visible on focus for keyboard/screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <SmoothScroll>
            <Preloader />
            <NoiseOverlay />
            <CustomCursor />
            <PortfolioChrome children={children} />
            <CommandPalette />
            <Toaster />
          </SmoothScroll>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
