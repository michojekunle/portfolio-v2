"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

export function PortfolioFooter(): React.ReactElement | null {
  const pathname = usePathname();
  if (pathname?.startsWith("/tools/bookbreaks")) return null;
  return <Footer />;
}
