"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

import { Home, BookOpen, Sparkles, LayoutTemplate, Settings, LogOut, Menu, X, ArrowLeft } from "lucide-react";

const NAV_LINKS = [
  { href: "/tools/bookbreaks", label: "Dashboard", icon: <Home size={16} /> },
  { href: "/tools/bookbreaks/books", label: "My Books", icon: <BookOpen size={16} /> },
  { href: "/tools/bookbreaks/generate", label: "Generate", icon: <Sparkles size={16} /> },
  { href: "/tools/bookbreaks/content", label: "Content Hub", icon: <LayoutTemplate size={16} /> },
  { href: "/tools/bookbreaks/settings", label: "Settings", icon: <Settings size={16} /> },
];

interface Props {
  userEmail: string;
}

export function BBSidebarNav({ userEmail }: Props): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async (): Promise<void> => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/tools/bookbreaks/login");
    router.refresh();
  };

  const isActive = (href: string): boolean => {
    if (href === "/tools/bookbreaks") return pathname === href;
    return pathname.startsWith(href);
  };

  const shortEmail =
    userEmail.length > 22 ? `${userEmail.slice(0, 22)}…` : userEmail;

  const SidebarContent = (): React.ReactElement => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div
        className="px-[24px] py-[28px] border-b border-[var(--rule)]"
      >
        <Link
          href="/tools"
          className="block no-underline group mb-[20px]"
          onClick={() => setMobileOpen(false)}
        >
          <span
            className="font-mono text-[9px] tracking-[0.16em] uppercase transition-colors text-[var(--ink-3)]"
          >
            ← Creator Suite
          </span>
        </Link>
        <div className="flex items-center gap-[10px]">
          <div
            className="w-[32px] h-[32px] rounded-[6px] flex items-center justify-center flex-shrink-0 bg-[var(--bg-2)] text-[var(--v3-accent)]"
          >
            <BookOpen size={18} />
          </div>
          <div>
            <div
              className="font-display text-[16px] font-normal tracking-[-0.01em] fvs-text leading-[1.1] text-[var(--ink)]"
            >
              BookBreaks
            </div>
            <div
              className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)]"
            >
              AI Book Platform
            </div>
          </div>
        </div>
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
                  ? "bg-[var(--bg-2)] text-[var(--v3-accent)] font-semibold" 
                  : "bg-transparent text-[var(--ink-2)] hover:bg-[var(--bg-2)] font-normal"
              }`}
            >
              <span
                className="text-[14px] w-[20px] text-center select-none flex-shrink-0"
                aria-hidden="true"
              >
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div
        className="px-[16px] py-[20px] border-t border-[var(--rule)]"
      >
        <div className="px-[12px] mb-[12px]">
          <div
            className="font-mono text-[10px] tracking-[0.08em] truncate text-[var(--ink-3)]"
          >
            {shortEmail}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-[10px] h-[36px] px-[12px] rounded-[8px] w-full font-mono text-[10px] tracking-[0.1em] uppercase transition-all duration-150 disabled:opacity-50 cursor-pointer bg-transparent text-[var(--ink-3)] border-none hover:bg-[var(--bg-2)] hover:text-[var(--v3-accent)]"
        >
          {signingOut ? "Signing out…" : <><LogOut size={14} /> Sign out</>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen w-[260px] max-[1024px]:hidden z-50 bg-[var(--bg-2)] border-r border-[var(--rule)]"
      >
        <SidebarContent />
      </aside>

      {/* Mobile topbar */}
      <div
        className="hidden max-[1024px]:flex fixed top-0 left-0 right-0 h-[60px] items-center justify-between px-[20px] z-50 bg-[var(--bg-2)] border-b border-[var(--rule)]"
      >
        <div className="flex items-center gap-[8px] text-[var(--v3-accent)]">
          <BookOpen size={20} />
          <span
            className="font-display text-[16px] fvs-text text-[var(--ink)]"
          >
            BookBreaks
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-[6px] border-none bg-transparent cursor-pointer text-[var(--ink-2)] hover:text-[var(--v3-accent)]"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="fixed top-0 left-0 h-screen w-[280px] max-[360px]:w-full z-50 bg-[var(--bg-2)] border-r border-[var(--rule)] shadow-2xl"
          >
            <SidebarContent />
          </aside>
        </>
      )}

    </>
  );
}
