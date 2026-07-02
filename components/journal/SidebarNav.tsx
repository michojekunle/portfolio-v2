"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Home, Target, BookOpen, LogOut, Menu, X, Compass } from "lucide-react";
import { VELA_ACCENT, VELA_ACCENT_SOFT } from "@/lib/journal/types";

const NAV_LINKS = [
  { href: "/tools/journal",            label: "Dashboard",  icon: <Home size={16} /> },
  { href: "/tools/journal/log",        label: "Today's Log", icon: <BookOpen size={16} /> },
  { href: "/tools/journal/objectives", label: "Objectives", icon: <Target size={16} /> },
];

interface Props {
  userEmail: string;
}

interface SidebarContentProps {
  shortEmail: string;
  signingOut: boolean;
  isActive: (href: string) => boolean;
  onNavClick: () => void;
  onSignOut: () => void;
}

function SidebarContent({
  shortEmail,
  signingOut,
  isActive,
  onNavClick,
  onSignOut,
}: SidebarContentProps): React.ReactElement {
  return (
    <div className="flex flex-col h-full">
      <div className="px-[24px] py-[28px] border-b border-[var(--rule)]">
        <Link href="/tools" className="block no-underline mb-[20px]" onClick={onNavClick}>
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--ink-3)]">
            ← Creator Suite
          </span>
        </Link>
        <div className="flex items-center gap-[10px]">
          <div
            className="w-[32px] h-[32px] rounded-[6px] flex items-center justify-center flex-shrink-0"
            style={{ background: VELA_ACCENT_SOFT }}
          >
            <Compass size={18} style={{ color: VELA_ACCENT }} />
          </div>
          <div>
            <div className="font-display text-[16px] font-normal tracking-[-0.01em] fvs-text leading-[1.1] text-[var(--ink)]">
              Vela
            </div>
            <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
              Life Journal
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-[16px] py-[20px] flex flex-col gap-[4px] overflow-y-auto">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavClick}
              className="flex items-center gap-[10px] px-[12px] py-[9px] rounded-[8px] no-underline transition-all duration-150 text-[13px] font-medium"
              style={{
                background: active ? VELA_ACCENT_SOFT : "transparent",
                color: active ? VELA_ACCENT : "var(--ink-2)",
              }}
            >
              <span style={{ color: active ? VELA_ACCENT : "var(--ink-3)" }}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-[16px] pb-[24px] border-t border-[var(--rule)] pt-[16px] space-y-[8px]">
        <div className="px-[12px] py-[8px]">
          <div className="font-mono text-[10px] tracking-[0.08em] truncate text-[var(--ink-3)]">
            {shortEmail}
          </div>
        </div>
        <button
          onClick={onSignOut}
          disabled={signingOut}
          className="flex items-center gap-[10px] w-full px-[12px] py-[9px] rounded-[8px] text-[13px] font-medium transition-all duration-150 bg-transparent border-none cursor-pointer disabled:opacity-50"
          style={{ color: "var(--ink-3)" }}
        >
          <LogOut size={15} />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

export function JournalSidebarNav({ userEmail }: Props): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string): boolean =>
    href === "/tools/journal" ? pathname === href : pathname.startsWith(href);

  const shortEmail = userEmail.length > 26 ? userEmail.slice(0, 24) + "…" : userEmail;

  const handleSignOut = async (): Promise<void> => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/tools/journal/login");
    router.refresh();
  };

  const sharedProps = {
    shortEmail,
    signingOut,
    isActive,
    onNavClick: () => setMobileOpen(false),
    onSignOut: () => void handleSignOut(),
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="fixed top-0 left-0 h-screen w-[240px] z-30 border-r border-[var(--rule)] max-[1024px]:hidden"
        style={{ background: "var(--bg)" }}
      >
        <SidebarContent {...sharedProps} />
      </aside>

      {/* Mobile top bar */}
      <header
        className="hidden max-[1024px]:flex fixed top-0 left-0 right-0 h-[52px] z-30 items-center justify-between px-[20px] border-b border-[var(--rule)]"
        style={{ background: "var(--bg)" }}
      >
        <div className="flex items-center gap-[8px]">
          <div
            className="w-[26px] h-[26px] rounded-[5px] flex items-center justify-center"
            style={{ background: VELA_ACCENT_SOFT }}
          >
            <Compass size={14} style={{ color: VELA_ACCENT }} />
          </div>
          <span className="font-display text-[15px] font-normal tracking-[-0.01em] fvs-text text-[var(--ink)]">
            Vela
          </span>
        </div>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] bg-transparent border-none cursor-pointer"
          style={{ color: "var(--ink-2)" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="hidden max-[1024px]:block fixed inset-0 z-40"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/40"
            aria-hidden="true"
          />
          <aside
            className="absolute top-0 left-0 h-full w-[240px] border-r border-[var(--rule)]"
            style={{ background: "var(--bg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent {...sharedProps} />
          </aside>
        </div>
      )}
    </>
  );
}
