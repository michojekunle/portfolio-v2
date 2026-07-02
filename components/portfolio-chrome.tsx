"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { PortfolioFooter } from "@/components/portfolio-footer";
import { GlobalContactCTA } from "@/components/global-contact-cta";

// Routes that are self-contained apps with their own nav/footer.
// The portfolio navbar and footer are suppressed on these paths.
const TOOL_APP_PREFIXES = [
  "/tools/bookbreaks",
  "/tools/chapterly",
  "/tools/flowise",
  "/tools/journal",
];

export function PortfolioChrome({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement | null {
  const pathname = usePathname();
  const isToolApp = TOOL_APP_PREFIXES.some((prefix) => pathname.startsWith(prefix));

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
