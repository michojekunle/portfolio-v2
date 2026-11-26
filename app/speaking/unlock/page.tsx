"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { safeNextPath } from "@/lib/auth-redirect";

function SpeakingUnlockForm(): React.ReactElement {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawNext = searchParams.get("next");
  const destination =
    rawNext && rawNext.startsWith("/speaking")
      ? safeNextPath(rawNext)
      : "/speaking";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/speaking/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Incorrect password.");
        setLoading(false);
        return;
      }

      router.push(destination);
      router.refresh();
    } catch {
      setError("Could not verify password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-(--bg) text-(--ink) flex flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-16 outline-none"
    >
      <div className="w-full max-w-[420px] space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-(--ink-2) hover:text-(--ink) no-underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          michaelojekunle.dev
        </Link>

        <div className="rounded-[6px] border border-(--rule) bg-(--paper) p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-(--ink-2)">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Private Workspace
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-[-0.02em] text-(--ink) m-0">
              The Speaking Ledger
            </h1>
            <p className="text-sm text-(--ink-2) leading-relaxed m-0">
              90 days of ideas, recordings, and personal reflections. Enter your workspace password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="speaking-password"
                className="block font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="speaking-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter workspace password"
                  autoComplete="current-password"
                  autoFocus
                  required
                  disabled={loading}
                  className="w-full rounded-[4px] border border-(--rule) bg-(--bg) pl-3.5 pr-11 py-2.5 text-base sm:text-sm text-(--ink) placeholder:text-(--ink-3) focus:border-(--ink) focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-[4px] text-(--ink-2) hover:text-(--ink) cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-[4px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-[4px] bg-(--ink) text-(--bg) px-4 py-3 min-h-[44px] text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <>
                  Unlock Speaking Ledger
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-(--rule-2) flex items-center justify-between gap-2 text-xs text-(--ink-2)">
            <span>Already have an admin account?</span>
            <Link
              href={`/admin/login?next=${encodeURIComponent(destination)}`}
              className="text-(--ink) underline shrink-0"
            >
              Admin Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SpeakingUnlockPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="min-h-screen bg-(--bg)" />}>
      <SpeakingUnlockForm />
    </Suspense>
  );
}
