"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Mic,
  CalendarDays,
  BookOpen,
  NotebookPen,
  BarChart3,
  Compass,
  Lock,
  AlertTriangle,
  ArrowUpRight,
  ArrowLeft,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/speaking", label: "Home", fullLabel: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/speaking/today", label: "Today", fullLabel: "Today's Session", icon: Mic, exact: false },
  { href: "/speaking/calendar", label: "Calendar", fullLabel: "Calendar", icon: CalendarDays, exact: false },
  { href: "/speaking/journal", label: "Journal", fullLabel: "Journal & Ideas", icon: NotebookPen, exact: false },
  { href: "/speaking/curriculum", label: "Curriculum", fullLabel: "Curriculum", icon: BookOpen, exact: false },
  { href: "/speaking/progress", label: "Progress", fullLabel: "Progress & Archive", icon: BarChart3, exact: false },
  { href: "/speaking/methodology", label: "Method", fullLabel: "Methodology", icon: Compass, exact: false },
];

const MOBILE_PRIMARY_TABS = NAV_ITEMS.slice(0, 4);
const MOBILE_MORE_TABS = NAV_ITEMS.slice(4);

interface SpeakingShellProps {
  children: React.ReactNode;
  isOwner: boolean;
  schemaReady: boolean;
  activeDayNumber: number;
  todayDateStr: string;
  completedCount: number;
}

export function SpeakingShell({
  children,
  isOwner,
  schemaReady,
  activeDayNumber,
  todayDateStr,
  completedCount,
}: SpeakingShellProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [locking, setLocking] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const isActive = (href: string, exact: boolean): boolean => {
    if (exact) return pathname === href;
    if (href === "/speaking/today" && pathname.startsWith("/speaking/day/")) {
      return true;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isMoreTabActive = MOBILE_MORE_TABS.some((item) =>
    isActive(item.href, item.exact)
  );

  const handleLock = async (): Promise<void> => {
    setLocking(true);
    try {
      await fetch("/api/speaking/unlock", { method: "DELETE" });
      router.push("/speaking/unlock");
      router.refresh();
    } finally {
      setLocking(false);
    }
  };

  const toggleTheme = (): void => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      {/* Mobile App Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 h-14 border-b border-(--rule) bg-[color-mix(in_oklab,var(--bg)_94%,transparent)] backdrop-blur-md">
        <div className="max-w-(--maxw) mx-auto h-full px-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              aria-label="Back to michaelojekunle.dev"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-(--rule) bg-(--paper) text-(--ink-2) hover:text-(--ink) shrink-0 no-underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="min-w-0">
              <div className="font-display text-base leading-tight text-(--ink) truncate">
                Speaking Ledger
              </div>
              <div className="font-mono text-[11px] text-(--ink-2) tabular-nums leading-tight">
                Day {activeDayNumber}/90 · {completedCount} done
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {mounted && (
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  resolvedTheme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-(--rule) bg-(--paper) text-(--ink-2) hover:text-(--ink) cursor-pointer"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleLock()}
              disabled={locking}
              aria-label="Lock Speaking Ledger"
              className="inline-flex items-center gap-1.5 rounded-[4px] border border-(--rule) bg-(--paper) px-2.5 h-9 font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2) hover:text-(--ink) cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Lock
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-(--maxw) mx-auto px-4 sm:px-(--gutter) pt-4 pb-24 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[232px_1fr] gap-6 lg:gap-10 items-start">
          {/* Desktop sticky sidebar */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-6">
            <div className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2) hover:text-(--ink) no-underline"
                >
                  <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                  Portfolio
                </Link>
                <span className="font-mono text-[11px] tabular-nums text-(--ink-2)">
                  {todayDateStr}
                </span>
              </div>
              <div>
                <p className="font-display text-lg font-normal text-(--ink) leading-tight m-0">
                  The Speaking Ledger
                </p>
                <p className="text-xs text-(--ink-2) mt-0.5 mb-0">
                  90 Days of Speaking · Africa/Lagos
                </p>
              </div>
              <div className="pt-2 border-t border-(--rule-2) flex items-center justify-between font-mono text-[11px] tabular-nums">
                <span className="text-(--ink-2)">Day {activeDayNumber}</span>
                <span className="text-(--ink)">{completedCount}/90 done</span>
              </div>
            </div>

            <nav aria-label="Speaking Ledger navigation" className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[4px] border px-3 py-2 text-sm font-medium no-underline transition-colors",
                      active
                        ? "border-(--rule) bg-(--paper) text-(--ink)"
                        : "border-transparent text-(--ink-2) hover:text-(--ink) hover:bg-(--paper)/60"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                    <span>{item.fullLabel}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--good)">
                  Unlocked
                </span>
                <div className="flex items-center gap-2">
                  {mounted && (
                    <button
                      type="button"
                      onClick={toggleTheme}
                      aria-label={
                        resolvedTheme === "dark"
                          ? "Switch to light mode"
                          : "Switch to dark mode"
                      }
                      className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] border border-(--rule) text-(--ink-2) hover:text-(--ink) cursor-pointer"
                    >
                      {resolvedTheme === "dark" ? (
                        <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleLock()}
                    disabled={locking}
                    className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2) hover:text-(--ink) cursor-pointer"
                  >
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    Lock
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 pt-1">
                <Link
                  href="/tools/carousel-lab"
                  className="inline-flex items-center justify-between text-xs text-(--ink-2) hover:text-(--ink) no-underline"
                >
                  <span>Carousel Lab</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/admin/blog"
                  className="inline-flex items-center justify-between text-xs text-(--ink-2) hover:text-(--ink) no-underline"
                >
                  <span>Blog Drafts</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Workspace Content */}
          <div className="min-w-0 space-y-5">
            {isOwner && !schemaReady && (
              <div
                role="alert"
                className="rounded-[6px] border border-amber-600/40 bg-amber-500/10 px-4 py-3 flex items-start gap-3"
              >
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs text-(--ink) leading-relaxed">
                  <strong className="font-medium">Database setup required:</strong>{" "}
                  Run{" "}
                  <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-(--paper) border border-(--rule)">
                    supabase/migrations/20261126_speaking_ledger.sql
                  </code>{" "}
                  in your Supabase SQL Editor to enable cross-device persistence.
                </div>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>

      {/* Mobile "More" Bottom Sheet */}
      {moreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="More Speaking Ledger navigation"
        >
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMoreOpen(false)}
            className="flex-1 bg-black/55 cursor-pointer"
          />
          <div className="border-t border-(--rule) bg-(--paper) rounded-t-[12px] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-3 shadow-xl">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-(--rule-2)">
              <div>
                <div className="font-display text-base text-(--ink)">
                  More Tools & Reference
                </div>
                <div className="font-mono text-[11px] text-(--ink-2)">
                  {todayDateStr} · Africa/Lagos
                </div>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMoreOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-(--rule) text-(--ink-2) hover:text-(--ink) cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="divide-y divide-(--rule-2)">
              {MOBILE_MORE_TABS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between py-3 px-2 rounded-[4px] text-sm font-medium no-underline",
                      active ? "text-(--good)" : "text-(--ink)"
                    )}
                  >
                    <span className="inline-flex items-center gap-3">
                      <Icon className="h-4 w-4 text-(--ink-2)" aria-hidden="true" />
                      {item.fullLabel}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-(--ink-3)" aria-hidden="true" />
                  </Link>
                );
              })}
              <Link
                href="/tools/carousel-lab"
                className="flex items-center justify-between py-3 px-2 text-sm text-(--ink) no-underline"
              >
                <span>Carousel Lab</span>
                <ArrowUpRight className="h-4 w-4 text-(--ink-3)" aria-hidden="true" />
              </Link>
              <Link
                href="/admin/blog"
                className="flex items-center justify-between py-3 px-2 text-sm text-(--ink) no-underline"
              >
                <span>Blog Drafts</span>
                <ArrowUpRight className="h-4 w-4 text-(--ink-3)" aria-hidden="true" />
              </Link>
              <Link
                href="/"
                className="flex items-center justify-between py-3 px-2 text-sm text-(--ink-2) no-underline"
              >
                <span>Back to michaelojekunle.dev</span>
                <ArrowUpRight className="h-4 w-4 text-(--ink-3)" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* OPay-style Mobile Fixed Bottom Tab Bar */}
      <nav
        aria-label="Speaking Ledger bottom navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-(--rule) bg-[color-mix(in_oklab,var(--paper)_96%,transparent)] backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-16">
          {MOBILE_PRIMARY_TABS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact) && !moreOpen;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-[11px] font-medium no-underline transition-colors",
                  active ? "text-(--ink)" : "text-(--ink-2)"
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-3 py-1 transition-colors",
                    active ? "bg-(--ink) text-(--bg)" : "bg-transparent"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="leading-none">{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[11px] font-medium cursor-pointer transition-colors",
              moreOpen || isMoreTabActive ? "text-(--ink)" : "text-(--ink-2)"
            )}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full px-3 py-1 transition-colors",
                moreOpen || isMoreTabActive
                  ? "bg-(--ink) text-(--bg)"
                  : "bg-transparent"
              )}
            >
              <Menu className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="leading-none">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
