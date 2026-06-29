"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/tools/bookbreaks", label: "Dashboard", icon: "⌂" },
  { href: "/tools/bookbreaks/books", label: "My Books", icon: "📚" },
  { href: "/tools/bookbreaks/generate", label: "Generate", icon: "✦" },
  { href: "/tools/bookbreaks/content", label: "Content Hub", icon: "◈" },
  { href: "/tools/bookbreaks/settings", label: "Settings", icon: "⚙" },
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
        className="px-[24px] py-[28px]"
        style={{ borderBottom: "1px solid #D4B896" }}
      >
        <Link
          href="/tools"
          className="block no-underline group mb-[20px]"
          onClick={() => setMobileOpen(false)}
        >
          <span
            className="font-mono text-[9px] tracking-[0.16em] uppercase transition-colors"
            style={{ color: "#8B6F47" }}
          >
            ← Creator Suite
          </span>
        </Link>
        <div className="flex items-center gap-[10px]">
          <div
            className="w-[32px] h-[32px] rounded-[6px] flex items-center justify-center text-[16px] flex-shrink-0"
            style={{ background: "rgba(200,90,44,0.15)" }}
          >
            📚
          </div>
          <div>
            <div
              className="font-display text-[16px] font-normal tracking-[-0.01em] fvs-text leading-[1.1]"
              style={{ color: "#2C2C2C" }}
            >
              BookBreaks
            </div>
            <div
              className="font-mono text-[9px] tracking-[0.1em] uppercase"
              style={{ color: "#8B6F47" }}
            >
              AI Book Platform
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-[16px] py-[20px] space-y-[4px]">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-[10px] h-[40px] px-[12px] rounded-[8px] no-underline transition-all duration-150 text-[14px]"
              style={{
                background: active ? "rgba(200,90,44,0.12)" : "transparent",
                color: active ? "#C85A2C" : "#4A3728",
                fontWeight: active ? 600 : 400,
              }}
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
        className="px-[16px] py-[20px]"
        style={{ borderTop: "1px solid #D4B896" }}
      >
        <div className="px-[12px] mb-[12px]">
          <div
            className="font-mono text-[10px] tracking-[0.08em] truncate"
            style={{ color: "#8B6F47" }}
          >
            {shortEmail}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-[10px] h-[36px] px-[12px] rounded-[8px] w-full font-mono text-[10px] tracking-[0.1em] uppercase transition-all duration-150 disabled:opacity-50 cursor-pointer"
          style={{
            background: "transparent",
            color: "#8B6F47",
            border: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(200,90,44,0.08)";
            e.currentTarget.style.color = "#C85A2C";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#8B6F47";
          }}
        >
          {signingOut ? "Signing out…" : "↩ Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen w-[260px] max-[1024px]:hidden z-50"
        style={{
          background: "#EDD9BA",
          borderRight: "1px solid #D4B896",
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile topbar */}
      <div
        className="hidden max-[1024px]:flex fixed top-0 left-0 right-0 h-[60px] items-center justify-between px-[20px] z-50"
        style={{
          background: "#EDD9BA",
          borderBottom: "1px solid #D4B896",
        }}
      >
        <div className="flex items-center gap-[8px]">
          <span className="text-[18px]">📚</span>
          <span
            className="font-display text-[16px] fvs-text"
            style={{ color: "#2C2C2C" }}
          >
            BookBreaks
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-[6px] border-none bg-transparent cursor-pointer"
          style={{ color: "#4A3728" }}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="hidden max-[1024px]:block fixed inset-0 z-40"
            style={{ background: "rgba(44,44,44,0.4)" }}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="hidden max-[1024px]:block fixed top-0 left-0 h-screen w-[260px] z-50"
            style={{
              background: "#EDD9BA",
              borderRight: "1px solid #D4B896",
            }}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Mobile top padding spacer */}
      <div className="hidden max-[1024px]:block h-[60px] w-full flex-shrink-0" />
    </>
  );
}
