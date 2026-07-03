import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Carousel Lab — Design stunning social media carousels",
  description:
    "Create beautiful multi-slide carousels for LinkedIn, Instagram, and more. Customize branding, aesthetics, and export as images.",
  openGraph: {
    title: "Carousel Lab — Design stunning social media carousels",
    description:
      "Create beautiful multi-slide carousels for LinkedIn, Instagram, and more.",
    type: "website",
  },
};

export default function CarouselLabLayout({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
