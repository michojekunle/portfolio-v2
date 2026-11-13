import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE = "https://michaelojekunle.dev";

export const metadata: Metadata = {
  title: "Brand Guidelines & Marks — Michael Ojekunle",
  description: "Official marks, signature typography, and download assets for Michael Ojekunle.",
  alternates: { canonical: `${SITE}/brand` },
  openGraph: {
    title: "Brand Guidelines & Marks — Michael Ojekunle",
    description: "Official marks, signature typography, and download assets for Michael Ojekunle.",
    url: `${SITE}/brand`,
    type: "website",
    siteName: "Michael Ojekunle",
    images: [
      {
        url: `${SITE}/brand/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Brand Guidelines — Michael Ojekunle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brand Guidelines & Marks — Michael Ojekunle",
    description: "Official marks, signature typography, and download assets for Michael Ojekunle.",
    images: [`${SITE}/brand/opengraph-image`],
    creator: "@devvmichael",
  },
};

export default function BrandLayout({ children }: { children: ReactNode }) {
  return children;
}
