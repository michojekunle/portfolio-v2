"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { PortfolioFooter } from "@/components/portfolio-footer";
import { GlobalContactCTA } from "@/components/global-contact-cta";
import { isToolAppPath } from "@/lib/tool-app-paths";

export function PortfolioChrome({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement | null {
  const pathname = usePathname();
  const isToolApp = isToolAppPath(pathname);

  if (isToolApp) return <>{children}</>;

  return (
    <>
      <Navbar />
      {children}
      <GlobalContactCTA />
      <PortfolioFooter />
    </>
  );
}
