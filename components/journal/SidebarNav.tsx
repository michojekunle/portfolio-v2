"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Home, Target, BookOpen, LogOut, Menu, X, Compass, CalendarDays } from "lucide-react";
import { VELA_ACCENT, VELA_ACCENT_SOFT } from "@/lib/journal/types";

const NAV_LINKS = [
  { href: "/tools/journal",             label: "Dashboard",   icon: <Home size={16} /> },
  { href: "/tools/journal/canvas",      label: "Canvas",      icon: <CalendarDays size={16} /> },
  { href: "/tools/journal/log",         label: "Today's Log", icon: <BookOpen size={16} /> },
  { href: "/tools/journal/log/history", label: "History",     icon: <CalendarDays size={16} /> },
  { href: "/tools/journal/objectives",  label: "Objectives",  icon: <Target size={16} /> },
];

const TAGLINES = [
  "Navigate with intention.",
  "Every day is a data point.",
  "Small steps, big arc.",
  "Clarity before action.",
  "Reflect. Adjust. Sail on.",
  "Stay on course.",
  "Plot your trajectory.",
];

interface Props {
  userEmail: string;
  streakCount?: number;
}

interface SidebarContentProps {
  shortEmail: string;
  signingOut: boolean;
  streakCount: number;
  tagline: string;
  isActive: (href: string) => boolean;
  onNavClick: () => void;
  onSignOut: () => void;
}

function SidebarContent({
  shortEmail,
  signingOut,
  streakCount,
  tagline,
  isActive,
  onNavClick,
  onSignOut,
}: SidebarContentProps): React.ReactElement {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-7 border-b border-(--rule)">
        <Link href="/tools" className="block no-underline mb-5" onClick={onNavClick}>
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:text-(--ink)">
            ← Creator Suite
          </span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8.5 h-8.5 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: VELA_ACCENT_SOFT }}
          >
            <Compass size={18} style={{ color: VELA_ACCENT }} />
          </div>
          <div>
            <div className="font-display text-[16px] font-normal tracking-[-0.01em] fvs-text leading-[1.1] text-(--ink)">
              Vela
            </div>
            <div className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">
              Life Journal
            </div>
          </div>
        </div>
        <p
          className="font-mono text-[9px] tracking-[0.08em] leading-normal mt-3.5 mb-0 italic"
          style={{ color: VELA_ACCENT, opacity: 0.75 }}
        >
          {tagline}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5 flex flex-col gap-1 overflow-y-auto">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavClick}
              className="flex items-center gap-2.5 px-3 py-2.25 rounded-lg no-underline transition-all duration-150 text-[13px] font-medium relative"
              style={{
                background: active ? VELA_ACCENT_SOFT : "transparent",
                color: active ? VELA_ACCENT : "var(--ink-2)",
              }}
            >
              <span style={{ color: active ? VELA_ACCENT : "var(--ink-3)" }}>{link.icon}</span>
              {link.label}
              {active && (
                <span
                  className="absolute right-0 top-[50%] -translate-y-[50%] w-0.75 h-[60%] rounded-l-full"
                  style={{ background: VELA_ACCENT }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-6 border-t border-(--rule) pt-4 space-y-2.5">
        {streakCount > 0 && (
          <div
            className="px-3 py-2.5 rounded-[10px] flex items-center gap-2.5"
            style={{ background: VELA_ACCENT_SOFT }}
          >
            <span className="text-[20px] leading-none select-none" aria-hidden="true">🔥</span>
            <div>
              <div
                className="font-display text-[20px] font-normal tracking-[-0.02em] fvs-text leading-none"
                style={{ color: VELA_ACCENT }}
              >
                {streakCount}
              </div>
              <div
                className="font-mono text-[8px] tracking-widest uppercase"
                style={{ color: VELA_ACCENT, opacity: 0.65 }}
              >
                day streak
              </div>
            </div>
          </div>
        )}

        <div className="px-3 py-2">
          <div className="font-mono text-[10px] tracking-[0.08em] truncate text-muted-foreground">
            {shortEmail}
          </div>
        </div>

        <button
          onClick={onSignOut}
          disabled={signingOut}
          className="flex items-center gap-2.5 w-full px-3 py-2.25 rounded-lg text-[13px] font-medium transition-all duration-150 bg-transparent border-none cursor-pointer disabled:opacity-50"
          style={{ color: "var(--ink-3)" }}
        >
          <LogOut size={15} />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

export function JournalSidebarNav({ userEmail, streakCount = 0 }: Props): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const tagline = TAGLINES[new Date().getDay() % TAGLINES.length];

  const isActive = (href: string): boolean =>
    href === "/tools/journal" ? pathname === href : pathname.startsWith(href);

  const shortEmail = userEmail.length > 26 ? userEmail.slice(0, 24) + "…" : userEmail;

  const handleSignOut = async (): Promise<void> => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/tools/journal/login");
      router.refresh();
    } catch (err) {
      console.error("[journal/sidebar] signOut error:", err);
      setSigningOut(false);
    }
  };

  const sharedProps = {
    shortEmail,
    signingOut,
    streakCount,
    tagline,
    isActive,
    onNavClick: () => setMobileOpen(false),
    onSignOut: () => void handleSignOut(),
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="fixed top-0 left-0 h-screen w-60 z-30 border-r border-(--rule) max-[1024px]:hidden"
        style={{ background: "var(--bg)" }}
      >
        <SidebarContent {...sharedProps} />
      </aside>

      {/* Mobile top bar */}
      <header
        className="hidden max-[1024px]:flex fixed top-0 left-0 right-0 h-13 z-30 items-center justify-between px-5 border-b border-(--rule)"
        style={{ background: "var(--bg)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6.5 h-6.5 rounded-[5px] flex items-center justify-center"
            style={{ background: VELA_ACCENT_SOFT }}
          >
            <Compass size={14} style={{ color: VELA_ACCENT }} />
          </div>
          <span className="font-display text-[15px] font-normal tracking-[-0.01em] fvs-text text-(--ink)">
            Vela
          </span>
          {streakCount > 0 && (
            <span
              className="font-mono text-[9px] tracking-[0.08em] uppercase px-1.75 py-0.5 rounded-full ml-1"
              style={{ background: VELA_ACCENT_SOFT, color: VELA_ACCENT }}
            >
              🔥 {streakCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-transparent border-none cursor-pointer"
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
          <div className="absolute inset-0 bg-black/40" style={{ top: "52px" }} aria-hidden="true" />
          <aside
            className="absolute top-13 left-0 h-[calc(100vh-52px)] w-60 border-r border-(--rule)"
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
