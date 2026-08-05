"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LogOut, ExternalLink, Menu, ChevronDown } from "lucide-react";

// Checked daily / time-sensitive — always visible. Everything else is one
// tap away behind "More" (desktop) or the hamburger sheet (mobile), instead
// of a wall of nav items competing for attention.
const primaryLinks = [
  { name: "Dashboard", href: "/admin" },
  { name: "Jobs", href: "/admin/jobs" },
  { name: "Rust", href: "/admin/rust-challenge" },
  { name: "Messages", href: "/admin/messages" },
];

const moreLinks = [
  { name: "Blog", href: "/admin/blog" },
  { name: "Projects", href: "/admin/projects" },
  { name: "Videos", href: "/admin/videos" },
  { name: "Now", href: "/admin/now" },
  { name: "Newsletter", href: "/admin/newsletter" },
];

const allLinks = [...primaryLinks, ...moreLinks];

export function AdminNav({ userEmail, unreadMessageCount = 0 }: { userEmail: string; unreadMessageCount?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSignOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const linkClass = (href: string, active = pathname === href) =>
    cn(
      "px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap",
      active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
    );

  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-4 min-w-0">
          {/* Mobile: hamburger opens the full nav in a side sheet — no inline links compete for the narrow width. */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 flex flex-col p-0">
              <SheetHeader className="p-4 border-b border-border text-left">
                <SheetTitle className="text-sm">Portfolio Admin</SheetTitle>
              </SheetHeader>
              <nav className="flex-1 overflow-y-auto p-2">
                {allLinks.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 text-sm rounded-md transition-colors",
                        pathname === link.href ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}
                    >
                      {link.name}
                      {link.name === "Messages" && unreadMessageCount > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-foreground text-background">
                          {unreadMessageCount}
                        </span>
                      )}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="p-2 border-t border-border space-y-1">
                <SheetClose asChild>
                  <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                    View site
                  </Link>
                </SheetClose>
                <button
                  onClick={() => void handleSignOut()}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/admin" className="text-sm font-semibold tracking-tight shrink-0">
            Portfolio Admin
          </Link>

          {/* Desktop: primary items inline, everything else behind "More". */}
          <nav className="hidden md:flex items-center gap-1">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                {link.name}
                {link.name === "Messages" && unreadMessageCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-medium bg-foreground text-background align-middle">
                    {unreadMessageCount}
                  </span>
                )}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    linkClass("__more__", moreLinks.some((l) => l.href === pathname)),
                    "flex items-center gap-1"
                  )}
                >
                  More
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {moreLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className={pathname === link.href ? "font-medium" : undefined}>
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">View Site</span>
          </Link>
          <span className="text-xs text-muted-foreground hidden lg:block mx-2 truncate max-w-40">{userEmail}</span>
          <Button variant="ghost" size="icon" onClick={() => void handleSignOut()} className="h-8 w-8 hidden md:inline-flex">
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
