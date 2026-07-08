"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import {
  Home,
  Library,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  Flame,
  BookMarked,
  BookOpen,
  Brain,
  Compass,
  Trophy,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/tools/chapterly",             label: "Home",       icon: <Home size={16} /> },
  { href: "/tools/chapterly/library",     label: "Library",    icon: <Library size={16} /> },
  { href: "/tools/chapterly/discover",    label: "Discover",    icon: <Compass size={16} /> },
  { href: "/tools/chapterly/flashcards",  label: "Flashcards",  icon: <Brain size={16} /> },
  { href: "/tools/chapterly/challenges",  label: "Challenges",  icon: <Trophy size={16} /> },
  { href: "/tools/chapterly/stats",       label: "Stats",       icon: <BarChart2 size={16} /> },
  { href: "/tools/chapterly/settings",    label: "Settings",    icon: <Settings size={16} /> },
];

interface Props {
  userEmail: string;
  streak?: number;
}

export function ChSidebarNav({ userEmail, streak = 0 }: Props): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async (): Promise<void> => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/tools/chapterly/login");
      router.refresh();
    } catch (err) {
      console.error("[chapterly/sidebar] signOut error:", err);
      setSigningOut(false);
    }
  };

  const isActive = (href: string): boolean => {
    if (href === "/tools/chapterly") return pathname === href;
    return pathname.startsWith(href);
  };

  const shortEmail = userEmail.length > 22 ? `${userEmail.slice(0, 22)}…` : userEmail;

  const ACCENT = "var(--ch-accent)";
  const ACCENT_BG = "color-mix(in oklab, var(--ch-accent) 12%, transparent)";

  const SidebarContent = (): React.ReactElement => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-[24px] py-[28px] border-b border-[var(--rule)]">
        <Link
          href="/tools"
          className="block no-underline mb-[20px]"
          onClick={() => setMobileOpen(false)}
        >
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--ink-3)]">
            ← Creator Suite
          </span>
        </Link>
        <div className="flex items-center gap-[10px]">
          <div
            className="w-[32px] h-[32px] rounded-[6px] flex items-center justify-center flex-shrink-0"
            style={{ background: ACCENT_BG }}
          >
            <BookMarked size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="font-display text-[16px] font-normal tracking-[-0.01em] fvs-text leading-[1.1] text-[var(--ink)]">
              Chapterly
            </div>
            <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
              Reading OS
            </div>
          </div>
        </div>

        {/* Streak badge */}
        {streak > 0 && (
          <div
            className="mt-[14px] inline-flex items-center gap-[6px] px-[10px] py-[5px] rounded-full font-mono text-[10px] font-semibold tracking-[0.08em]"
            style={{ background: "rgba(234,88,12,0.12)", color: "#EA580C" }}
          >
            <Flame size={12} />
            {streak} day streak
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-[16px] py-[20px] space-y-[4px] overflow-y-auto">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-[10px] h-[40px] px-[12px] rounded-[8px] no-underline transition-all duration-150 text-[14px] ${
                active
                  ? "font-semibold"
                  : "bg-transparent text-[var(--ink-2)] hover:bg-[var(--bg-2)] font-normal"
              }`}
              style={
                active
                  ? { background: ACCENT_BG, color: ACCENT }
                  : undefined
              }
            >
              <span className="w-[20px] text-center shrink-0" aria-hidden="true">
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}

        {/* BookBreaks bridge link */}
        <div className="pt-[20px] mt-[20px] border-t border-[var(--rule)]">
          <Link
            href="/tools/bookbreaks"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-[10px] h-[40px] px-[12px] rounded-[8px] no-underline transition-all duration-150 text-[13px] text-[var(--ink-3)] hover:bg-[var(--bg-2)] hover:text-[#C85A2C]"
          >
            <BookOpen size={15} className="shrink-0" />
            <span>
              BookBreaks{" "}
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] opacity-60 ml-1">
                bridge
              </span>
            </span>
          </Link>
        </div>
      </nav>

      {/* User footer */}
      <div className="px-[16px] py-[20px] border-t border-[var(--rule)]">
        <div className="px-[12px] mb-[12px]">
          <div className="font-mono text-[10px] tracking-[0.08em] truncate text-[var(--ink-3)]">
            {shortEmail}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-[10px] h-[36px] px-[12px] rounded-[8px] w-full font-mono text-[10px] tracking-[0.1em] uppercase transition-all duration-150 disabled:opacity-50 cursor-pointer bg-transparent border-none text-[var(--ink-3)] hover:bg-[var(--bg-2)]"
        >
          {signingOut ? "Signing out…" : <><LogOut size={14} /> Sign out</>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[260px] max-[1024px]:hidden z-50 bg-[var(--bg-2)] border-r border-[var(--rule)]">
        <SidebarContent />
      </aside>

      {/* Mobile topbar */}
      <div className="hidden max-[1024px]:flex fixed top-0 left-0 right-0 h-[60px] items-center justify-between px-[20px] z-50 bg-[var(--bg-2)] border-b border-[var(--rule)]">
        <div className="flex items-center gap-[8px]">
          <BookMarked size={20} style={{ color: ACCENT }} />
          <span className="font-display text-[16px] fvs-text text-[var(--ink)]">Chapterly</span>
        </div>
        <div className="flex items-center gap-[12px]">
          {streak > 0 && (
            <span className="font-mono text-[11px] font-semibold" style={{ color: "#EA580C" }}>
              <Flame size={12} className="inline mr-1" />{streak}
            </span>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-[36px] h-[36px] flex items-center justify-center rounded-[6px] border-none bg-transparent cursor-pointer text-[var(--ink-2)]"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed top-0 left-0 h-screen w-[280px] max-[360px]:w-full z-50 bg-[var(--bg-2)] border-r border-[var(--rule)] shadow-2xl">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Mobile top padding spacer – intentionally removed.
          Each page container applies pt-[80px] on ≤1024px viewports
          to clear the fixed 60px topbar without double-padding. */}
    </>
  );
}
