"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import {
  Home,
  List,
  Target,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
  TrendingUp,
  Landmark,
} from "lucide-react";

const ACCENT = "#16A34A";
const ACCENT_BG = "rgba(22,163,74,0.10)";

const NAV_LINKS = [
  { href: "/tools/flowise",              label: "Dashboard",    icon: <Home size={16} /> },
  { href: "/tools/flowise/transactions", label: "Transactions", icon: <List size={16} /> },
  { href: "/tools/flowise/budgets",      label: "Budgets",      icon: <TrendingUp size={16} /> },
  { href: "/tools/flowise/goals",        label: "Goals",        icon: <Target size={16} /> },
  { href: "/tools/flowise/analytics",    label: "Analytics",    icon: <BarChart2 size={16} /> },
  { href: "/tools/flowise/accounts",     label: "Accounts",     icon: <Landmark size={16} /> },
  { href: "/tools/flowise/settings",     label: "Settings",     icon: <Settings size={16} /> },
];

interface SidebarContentProps {
  shortEmail: string;
  symbol: string;
  netWorth?: number;
  signingOut: boolean;
  isActive: (href: string) => boolean;
  onNavClick: () => void;
  onSignOut: () => void;
}

// Module-level component so React never remounts it on parent re-renders.
function SidebarContent({
  shortEmail,
  symbol,
  netWorth,
  signingOut,
  isActive,
  onNavClick,
  onSignOut,
}: SidebarContentProps): React.ReactElement {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-[24px] py-[28px] border-b border-[var(--rule)]">
        <Link
          href="/tools"
          className="block no-underline mb-[20px]"
          onClick={onNavClick}
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
            <Wallet size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="font-display text-[16px] font-normal tracking-[-0.01em] fvs-text leading-[1.1] text-[var(--ink)]">
              Flowise
            </div>
            <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
              Finance OS
            </div>
          </div>
        </div>

        {netWorth !== undefined && (
          <div className="mt-[14px]">
            <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-4)] mb-[2px]">
              Net Worth
            </div>
            <div
              className="font-display text-[20px] font-normal tracking-[-0.02em] fvs-text"
              style={{ color: netWorth >= 0 ? ACCENT : "#DC2626" }}
            >
              {symbol}{Math.abs(netWorth).toLocaleString("en-NG")}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-[16px] py-[20px] space-y-[4px] overflow-y-auto">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavClick}
              className={`flex items-center gap-[10px] h-[40px] px-[12px] rounded-[8px] no-underline transition-all duration-150 text-[14px] ${
                active
                  ? "font-semibold"
                  : "bg-transparent text-[var(--ink-2)] hover:bg-[var(--bg-2)] font-normal"
              }`}
              style={active ? { background: ACCENT_BG, color: ACCENT } : undefined}
            >
              <span className="w-[20px] text-center shrink-0" aria-hidden="true">
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-[16px] py-[20px] border-t border-[var(--rule)]">
        <div className="px-[12px] mb-[12px]">
          <div className="font-mono text-[10px] tracking-[0.08em] truncate text-[var(--ink-3)]">
            {shortEmail}
          </div>
        </div>
        <button
          onClick={onSignOut}
          disabled={signingOut}
          className="flex items-center gap-[10px] h-[36px] px-[12px] rounded-[8px] w-full font-mono text-[10px] tracking-[0.1em] uppercase transition-all duration-150 disabled:opacity-50 cursor-pointer bg-transparent border-none text-[var(--ink-3)] hover:bg-[var(--bg-2)]"
        >
          {signingOut ? "Signing out…" : <><LogOut size={14} /> Sign out</>}
        </button>
      </div>
    </div>
  );
}

interface Props {
  userEmail: string;
  netWorth?: number;
  currency?: string;
}

export function FwSidebarNav({ userEmail, netWorth, currency = "NGN" }: Props): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async (): Promise<void> => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/tools/flowise/login");
      router.refresh();
    } catch (err) {
      console.error("[flowise/sidebar] signOut error:", err);
      setSigningOut(false);
    }
  };

  const isActive = (href: string): boolean => {
    if (href === "/tools/flowise") return pathname === href;
    return pathname.startsWith(href);
  };

  const shortEmail = userEmail.length > 22 ? `${userEmail.slice(0, 22)}…` : userEmail;

  const currencySymbols: Record<string, string> = {
    NGN: "₦", USD: "$", GBP: "£", EUR: "€", GHS: "₵", KES: "KSh",
  };
  const symbol = currencySymbols[currency] ?? currency;

  const contentProps: SidebarContentProps = {
    shortEmail,
    symbol,
    netWorth,
    signingOut,
    isActive,
    onNavClick: () => setMobileOpen(false),
    onSignOut: () => void handleSignOut(),
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[260px] max-[1024px]:hidden z-50 bg-[var(--bg-2)] border-r border-[var(--rule)]">
        <SidebarContent {...contentProps} />
      </aside>

      {/* Mobile topbar */}
      <div className="hidden max-[1024px]:flex fixed top-0 left-0 right-0 h-[60px] items-center justify-between px-[20px] z-50 bg-[var(--bg-2)] border-b border-[var(--rule)]">
        <div className="flex items-center gap-[8px]">
          <Wallet size={20} style={{ color: ACCENT }} />
          <span className="font-display text-[16px] fvs-text text-[var(--ink)]">Flowise</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-[6px] border-none bg-transparent cursor-pointer text-[var(--ink-2)]"
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
          <aside className="fixed top-0 left-0 h-screen w-[280px] max-[360px]:w-full z-50 bg-[var(--bg-2)] border-r border-[var(--rule)] shadow-2xl">
            <SidebarContent {...contentProps} />
          </aside>
        </>
      )}
    </>
  );
}
