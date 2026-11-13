import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PwaRegistrar } from "@/components/PwaRegistrar";

const SITE = "https://michaelojekunle.dev";

export const metadata: Metadata = {
  title: "Carousel Lab — Design stunning social media carousels",
  description:
    "Create beautiful multi-slide carousels for LinkedIn, Instagram, and more. Customize branding, aesthetics, and export as images.",
  alternates: { canonical: `${SITE}/tools/carousel-lab` },
  openGraph: {
    title: "Carousel Lab — Design stunning social media carousels",
    description:
      "Create beautiful multi-slide carousels for LinkedIn, Instagram, and more.",
    url: `${SITE}/tools/carousel-lab`,
    type: "website",
    siteName: "Michael Ojekunle",
    images: [
      {
        url: `${SITE}/tools/carousel-lab/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Carousel Lab — Michael Ojekunle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Carousel Lab — Design stunning social media carousels",
    description:
      "Create beautiful multi-slide carousels for LinkedIn, Instagram, and more.",
    images: [`${SITE}/tools/carousel-lab/opengraph-image`],
    creator: "@devvmichael",
  },
  manifest: "/manifests/carousel-lab.json",
  appleWebApp: {
    capable: true,
    title: "Carousel Lab",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function CarouselLabLayout({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return (
    <>
      {children}
      <PwaRegistrar toolId="carousel-lab" />
    </>
  );
}
