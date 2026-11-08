"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePrivacy, Amount } from "@/components/flowise/PrivacyProvider";
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
  Eye,
  EyeOff,
} from "lucide-react";

const ACCENT = "#16A34A";
const ACCENT_BG = "rgba(22,163,74,0.10)";

function SidebarNetWorth({ netWorth, symbol }: { netWorth: number; symbol: string }): React.ReactElement {
  const { hidden, toggle } = usePrivacy();
  return (
    <div className="mt-3.5 flex items-center justify-between">
      <div>
        <div className="font-mono text-[9px] tracking-widest uppercase text-(--ink-4) mb-0.5">
          Net Worth
        </div>
        <div
          className="font-display text-[20px] font-normal tracking-[-0.02em] fvs-text"
          style={{ color: netWorth >= 0 ? ACCENT : "#DC2626" }}
        >
          <Amount value={netWorth} currency="NGN" />
        </div>
      </div>
      <button
        onClick={toggle}
        className="w-7 h-7 rounded-md border border-(--rule) bg-transparent flex items-center justify-center cursor-pointer text-muted-foreground hover:text-(--ink) transition-colors"
        title={hidden ? "Show amounts" : "Hide amounts"}
        aria-label={hidden ? "Show financial amounts" : "Hide financial amounts"}
      >
        {hidden ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
    </div>
  );
}

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
      <div className="px-6 py-7 border-b border-(--rule)">
        <Link
          href="/tools"
          className="block no-underline mb-5"
          onClick={onNavClick}
        >
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-muted-foreground">
            ← Creator Suite
          </span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: ACCENT_BG }}
          >
            <Wallet size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="font-display text-[16px] font-normal tracking-[-0.01em] fvs-text leading-[1.1] text-(--ink)">
              Flowise
            </div>
            <div className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">
              Finance OS
            </div>
          </div>
        </div>

        {netWorth !== undefined && (
          <SidebarNetWorth netWorth={netWorth} symbol={symbol} />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        {NAV_LINKS.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavClick}
              className={`flex items-center gap-2.5 h-10 px-3 rounded-lg no-underline transition-all duration-150 text-[14px] ${
                active
                  ? "font-semibold"
                  : "bg-transparent text-secondary-foreground hover:bg-(--bg-2) font-normal"
              }`}
              style={active ? { background: ACCENT_BG, color: ACCENT } : undefined}
            >
              <span className="w-5 text-center shrink-0" aria-hidden="true">
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-5 border-t border-(--rule)">
        <div className="px-3 mb-3">
          <div className="font-mono text-[10px] tracking-[0.08em] truncate text-muted-foreground">
            {shortEmail}
          </div>
        </div>
        <button
          onClick={onSignOut}
          disabled={signingOut}
          className="flex items-center gap-2.5 h-9 px-3 rounded-lg w-full font-mono text-[10px] tracking-widest uppercase transition-all duration-150 disabled:opacity-50 cursor-pointer bg-transparent border-none text-muted-foreground hover:bg-(--bg-2)"
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
      <aside className="fixed left-0 top-0 h-screen w-[260px] max-[1024px]:hidden z-50 bg-(--bg-2) border-r border-(--rule)">
        <SidebarContent {...contentProps} />
      </aside>

      {/* Mobile topbar */}
      <div className="hidden max-[1024px]:flex fixed top-0 left-0 right-0 h-15 items-center justify-between px-5 z-50 bg-(--bg-2) border-b border-(--rule)">
        <div className="flex items-center gap-2">
          <Wallet size={20} style={{ color: ACCENT }} />
          <span className="font-display text-[16px] fvs-text text-(--ink)">Flowise</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-md border-none bg-transparent cursor-pointer text-secondary-foreground"
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
          <aside className="fixed top-0 left-0 h-screen w-[280px] max-[360px]:w-full z-50 bg-(--bg-2) border-r border-(--rule) shadow-2xl">
            <SidebarContent {...contentProps} />
          </aside>
        </>
      )}
    </>
  );
}
