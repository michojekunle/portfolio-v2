"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function BookBreaksLoginPage(): React.ReactElement {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "signin") {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      router.push("/tools/bookbreaks");
      router.refresh();
    } else {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/tools/bookbreaks`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setSuccess(
        "Check your email for a confirmation link, then come back to sign in."
      );
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-[24px] py-[80px]"
      style={{ background: "#F5E6D3" }}
    >
      <div className="w-full max-w-[420px]">
        {/* Logo mark */}
        <div className="mb-[40px]">
          <Link
            href="/tools"
            className="inline-flex items-center gap-[8px] no-underline mb-[32px] group"
          >
            <span
              className="font-mono text-[10px] tracking-[0.14em] uppercase transition-colors"
              style={{ color: "#8B6F47" }}
            >
              ← Creator Suite
            </span>
          </Link>

          <div className="flex items-center gap-[12px] mb-[12px]">
            <div
              className="w-[40px] h-[40px] rounded-[8px] flex items-center justify-center text-[20px]"
              style={{ background: "rgba(200,90,44,0.15)" }}
            >
              📚
            </div>
            <div>
              <div
                className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text leading-[1]"
                style={{ color: "#2C2C2C" }}
              >
                BookBreaks
              </div>
              <div
                className="font-mono text-[10px] tracking-[0.12em] uppercase"
                style={{ color: "#8B6F47" }}
              >
                AI-Powered Book Insights
              </div>
            </div>
          </div>

          <h1
            className="font-display font-normal text-[32px] leading-[1.1] tracking-[-0.02em] fvs-text m-0"
            style={{ color: "#2C2C2C" }}
          >
            {mode === "signin" ? "Welcome back." : "Start your journey."}
          </h1>
          <p
            className="text-[14px] leading-[1.6] mt-[8px] m-0"
            style={{ color: "#8B6F47" }}
          >
            {mode === "signin"
              ? "Sign in to access your books and generated content."
              : "Create an account to start turning books into content."}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-[16px]">
          <div>
            <label
              htmlFor="email"
              className="block font-mono text-[10px] tracking-[0.12em] uppercase mb-[8px]"
              style={{ color: "#8B6F47" }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              autoComplete="email"
              className="w-full h-[48px] px-[16px] rounded-[8px] text-[14px] outline-none transition-all duration-200"
              style={{
                background: "#FAF5EC",
                border: "1.5px solid #D4B896",
                color: "#2C2C2C",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#C85A2C";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#D4B896";
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-mono text-[10px] tracking-[0.12em] uppercase mb-[8px]"
              style={{ color: "#8B6F47" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              minLength={6}
              className="w-full h-[48px] px-[16px] rounded-[8px] text-[14px] outline-none transition-all duration-200"
              style={{
                background: "#FAF5EC",
                border: "1.5px solid #D4B896",
                color: "#2C2C2C",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#C85A2C";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#D4B896";
              }}
            />
          </div>

          {error && (
            <div
              className="rounded-[8px] px-[16px] py-[12px] text-[13px] font-mono"
              style={{
                background: "rgba(220,38,38,0.08)",
                color: "#DC2626",
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="rounded-[8px] px-[16px] py-[12px] text-[13px] leading-[1.5]"
              style={{
                background: "rgba(45,80,22,0.1)",
                color: "#2D5016",
                border: "1px solid rgba(45,80,22,0.25)",
                fontFamily: "inherit",
              }}
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] rounded-[8px] font-mono text-[11px] tracking-[0.14em] uppercase font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 hover:scale-[1.01]"
            style={{ background: "#C85A2C" }}
          >
            {loading
              ? "Please wait…"
              : mode === "signin"
              ? "Sign In →"
              : "Create Account →"}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-[24px] text-center">
          <span
            className="text-[13px]"
            style={{ color: "#8B6F47", fontFamily: "inherit" }}
          >
            {mode === "signin"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setSuccess(null);
            }}
            className="text-[13px] font-semibold underline bg-transparent border-none cursor-pointer p-0"
            style={{ color: "#C85A2C", fontFamily: "inherit" }}
          >
            {mode === "signin" ? "Sign up free" : "Sign in"}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-[48px] pt-[24px]" style={{ borderTop: "1px solid #D4B896" }}>
          <p
            className="text-center text-[12px] leading-[1.6] m-0"
            style={{ color: "#8B6F47", fontFamily: "inherit" }}
          >
            Part of{" "}
            <Link
              href="/tools"
              className="underline"
              style={{ color: "#2D5016" }}
            >
              michaelojekunle.dev/tools
            </Link>{" "}
            — learning in public.
          </p>
        </div>
      </div>
    </div>
  );
}
