"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

const navLinks = [
  { name: "Dashboard", href: "/admin" },
  { name: "Blog", href: "/admin/blog" },
  { name: "Projects", href: "/admin/projects" },
  { name: "Now", href: "/admin/now" },
  { name: "Messages", href: "/admin/messages" },
  { name: "Newsletter", href: "/admin/newsletter" },
];

export function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-sm font-semibold tracking-tight">
            Portfolio Admin
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  pathname === link.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block">{userEmail}</span>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8">
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
