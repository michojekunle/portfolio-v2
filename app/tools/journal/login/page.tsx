"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, ArrowLeft, Compass } from "lucide-react";
import { VELA_ACCENT, VELA_ACCENT_SOFT } from "@/lib/journal/types";

type Mode = "signin" | "signup";

function GoogleIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function LoginContent(): React.ReactElement {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) setError(decodeURIComponent(oauthError));
  }, [searchParams]);

  const handleGoogleSignIn = async (): Promise<void> => {
    setGoogleLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/tools/journal`,
      },
    });
    if (authError) {
      setError(authError.message);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "signin") {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      router.push("/tools/journal");
      router.refresh();
    } else {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/tools/journal`,
        },
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      setSuccess("Check your email for a confirmation link, then come back to sign in.");
      setLoading(false);
    }
  };

  const isDisabled = loading || googleLoading;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-20"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-105">
        <div className="mb-10">
          <Link href="/tools" className="inline-flex items-center gap-2 no-underline mb-8">
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground transition-colors hover:text-(--ink)">
              <ArrowLeft className="w-3 h-3 mr-1 inline-block" /> Creator Suite
            </span>
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: VELA_ACCENT_SOFT }}
            >
              <Compass className="w-5 h-5" style={{ color: VELA_ACCENT }} />
            </div>
            <div>
              <div className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text leading-none text-(--ink)">
                Vela
              </div>
              <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
                Life Journal
              </div>
            </div>
          </div>

          <h1 className="font-display font-normal text-[32px] leading-[1.1] tracking-[-0.02em] fvs-text m-0 text-(--ink)">
            {mode === "signin" ? "Welcome back." : "Start sailing toward your goals."}
          </h1>
          <p className="text-[14px] leading-[1.6] mt-2 m-0 text-muted-foreground">
            {mode === "signin"
              ? "Sign in to access your objectives, daily logs, and progress."
              : "Set clear objectives, track daily progress, and stay aligned with what matters."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleGoogleSignIn()}
          disabled={isDisabled}
          className="w-full h-13 rounded-lg flex items-center justify-center gap-3 text-[13px] font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:-translate-y-0.25"
          style={{ background: "#FFFFFF", color: "#2C2C2C", border: "1.5px solid #CBD5DC", fontFamily: "inherit" }}
        >
          {googleLoading ? (
            <span className="w-4.5 h-4.5 rounded-full border-0.5 animate-spin" style={{ borderColor: "#CBD5DC", borderTopColor: "transparent" }} aria-hidden="true" />
          ) : (
            <GoogleIcon />
          )}
          {googleLoading ? "Redirecting…" : mode === "signin" ? "Continue with Google" : "Sign up with Google"}
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-0.25" style={{ background: "var(--rule)" }} />
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase shrink-0 text-muted-foreground">or</span>
          <div className="flex-1 h-0.25" style={{ background: "var(--rule)" }} />
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-mono text-[10px] tracking-[0.12em] uppercase mb-2 text-muted-foreground">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isDisabled}
              autoComplete="email"
              className="w-full h-12 px-4 rounded-lg text-[14px] outline-none transition-all duration-200 bg-(--bg-2) border-[1.5px] border-(--rule) text-(--ink)"
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-mono text-[10px] tracking-[0.12em] uppercase mb-2 text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isDisabled}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={6}
              className="w-full h-12 px-4 rounded-lg text-[14px] outline-none transition-all duration-200 bg-(--bg-2) border-[1.5px] border-(--rule) text-(--ink)"
            />
          </div>

          {error && (
            <div className="rounded-lg px-4 py-3 text-[13px] font-mono" style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}>
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg px-4 py-3 text-[13px] leading-normal" style={{ background: VELA_ACCENT_SOFT, color: VELA_ACCENT, border: `1px solid ${VELA_ACCENT}40`, fontFamily: "inherit" }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isDisabled}
            className="w-full h-13 rounded-lg font-mono text-[11px] tracking-[0.14em] uppercase font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 border-none cursor-pointer flex items-center justify-center gap-1.5"
            style={{ background: VELA_ACCENT }}
          >
            {loading ? "Please wait…" : mode === "signin" ? <>Sign In <ArrowRight className="w-3 h-3" /></> : <>Create Account <ArrowRight className="w-3 h-3" /></>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-[13px] text-secondary-foreground">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setSuccess(null); }}
            className="text-[13px] font-semibold underline bg-transparent border-none cursor-pointer p-0"
            style={{ color: VELA_ACCENT, fontFamily: "inherit" }}
          >
            {mode === "signin" ? "Sign up free" : "Sign in"}
          </button>
        </div>

        <div className="mt-12 pt-6 border-t border-(--rule)">
          <p className="text-center text-[12px] leading-[1.6] m-0 text-muted-foreground">
            Part of{" "}
            <Link href="/tools" className="underline" style={{ color: VELA_ACCENT }}>
              michaelojekunle.dev/tools
            </Link>{" "}
            — building in public.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function JournalLoginPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-(--bg) text-muted-foreground">Loading…</div>}>
      <LoginContent />
    </Suspense>
  );
}
