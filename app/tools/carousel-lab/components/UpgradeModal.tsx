"use client";

import { useState } from "react";
import { Sparkles, Check, X, ShieldCheck, Zap, Layers, FileText, ArrowRight } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onTogglePro: (pro: boolean) => void;
  accent: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  isPro,
  onTogglePro,
  accent,
}: Props): React.ReactElement | null {
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "success" | "error">("idle");
  const [checkoutMode, setCheckoutMode] = useState<"lifetime" | "monthly">("lifetime");

  if (!isOpen) return null;

  const handleApplyCode = (e: React.FormEvent): void => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === "EARLYBIRD" || clean === "FOUNDER" || clean === "LAUNCH50" || clean === "PRO") {
      setPromoStatus("success");
      onTogglePro(true);
    } else {
      setPromoStatus("error");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl border p-7 sm:p-9 shadow-2xl bg-(--bg) border-(--rule) text-(--ink) overflow-hidden"
        style={{ borderColor: "var(--rule)" }}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: accent }}
        />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full border border-(--rule) bg-(--bg-2) text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="space-y-2 mb-6">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] tracking-widest uppercase font-semibold"
            style={{ background: accent + "18", color: accent }}
          >
            <Sparkles size={12} />
            <span>Early-Bird Founder Access</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-normal m-0 tracking-tight text-balance">
            Publish without <em className="italic" style={{ color: accent }}>watermarks.</em>
          </h2>

          <p className="text-sm text-secondary-foreground leading-relaxed m-0">
            Export pristine, agency-grade carousels directly for your LinkedIn and Instagram audience.
          </p>
        </div>

        {/* Plan Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl border border-(--rule) bg-(--bg-2) mb-6">
          <button
            type="button"
            onClick={() => setCheckoutMode("lifetime")}
            className="py-2.5 px-3 rounded-lg text-xs font-mono font-semibold transition-all flex flex-col items-center justify-center gap-0.5"
            style={
              checkoutMode === "lifetime"
                ? { background: "var(--bg)", color: "var(--ink)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }
                : { color: "var(--ink-3)" }
            }
          >
            <span>LIFETIME DEAL · $49</span>
            <span className="text-[10px] text-emerald-500 font-sans font-bold">Pay once, own forever</span>
          </button>
          <button
            type="button"
            onClick={() => setCheckoutMode("monthly")}
            className="py-2.5 px-3 rounded-lg text-xs font-mono font-semibold transition-all flex flex-col items-center justify-center gap-0.5"
            style={
              checkoutMode === "monthly"
                ? { background: "var(--bg)", color: "var(--ink)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }
                : { color: "var(--ink-3)" }
            }
          >
            <span>MONTHLY PRO · $9/mo</span>
            <span className="text-[10px] text-muted-foreground font-sans">Cancel anytime</span>
          </button>
        </div>

        {/* Feature Matrix */}
        <div className="space-y-3 mb-6 p-4 rounded-2xl bg-(--bg-2) border border-(--rule)">
          <div className="flex items-start gap-3 text-xs leading-normal">
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: accent + "20", color: accent }}>
              <Check size={12} strokeWidth={3} />
            </div>
            <div>
              <strong className="text-(--ink)">Zero Watermarks:</strong> Pristine, unbranded exports with your exact brand handle on every slide.
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs leading-normal">
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: accent + "20", color: accent }}>
              <Layers size={12} strokeWidth={2.5} />
            </div>
            <div>
              <strong className="text-(--ink)">Custom Brand Kits:</strong> Upload custom logos, custom typography & save unlimited brand color palettes.
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs leading-normal">
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: accent + "20", color: accent }}>
              <FileText size={12} strokeWidth={2.5} />
            </div>
            <div>
              <strong className="text-(--ink)">Multi-Page LinkedIn PDFs &amp; 2x Retina PNGs:</strong> Ready for instant publishing without slicing or resizing.
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs leading-normal">
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: accent + "20", color: accent }}>
              <Zap size={12} strokeWidth={2.5} />
            </div>
            <div>
              <strong className="text-(--ink)">No Credit Anxiety:</strong> Unlimited deck generation. Never count AI tokens or monthly reset limits.
            </div>
          </div>
        </div>

        {/* Status / Purchase Action */}
        <div className="space-y-3">
          {isPro ? (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <ShieldCheck size={18} />
                <span>Pro is Active! All watermarks removed.</span>
              </div>
              <button
                type="button"
                onClick={() => onTogglePro(false)}
                className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer font-mono"
              >
                Reset to Free
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  const paymentUrl =
                    checkoutMode === "lifetime"
                      ? process.env.NEXT_PUBLIC_CAROUSEL_LAB_LIFETIME_URL
                      : process.env.NEXT_PUBLIC_CAROUSEL_LAB_MONTHLY_URL;

                  if (paymentUrl) {
                    window.location.href = paymentUrl;
                  } else {
                    // Instant test activation when payment gateway URL is unset
                    onTogglePro(true);
                  }
                }}
                className="w-full py-3.5 px-4 rounded-xl font-mono text-xs uppercase tracking-widest font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-lg"
                style={{ background: accent }}
              >
                <span>{checkoutMode === "lifetime" ? "Claim Early-Bird Deal ($49 Lifetime)" : "Subscribe to Pro ($9/mo)"}</span>
                <ArrowRight size={14} />
              </button>

              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
                <span>⚡ Only 43 / 100 spots remaining</span>
                <span className="text-emerald-500 font-semibold">Instant Access</span>
              </div>
            </>
          )}

          {/* Promo code unlock */}
          {!isPro && (
            <form onSubmit={handleApplyCode} className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="License or promo code (e.g. EARLYBIRD)"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromoStatus("idle");
                }}
                className="flex-1 h-9 px-3 rounded-lg border border-(--rule) bg-(--bg-2) text-(--ink) text-xs font-mono uppercase outline-none focus:border-(--ink)"
              />
              <button
                type="submit"
                className="h-9 px-3 rounded-lg border border-(--rule) bg-(--bg-2) text-xs font-mono uppercase font-semibold hover:border-foreground/40 cursor-pointer transition-colors"
              >
                Unlock
              </button>
            </form>
          )}

          {promoStatus === "error" && (
            <p className="text-[11px] text-red-500 font-mono m-0">
              Invalid code. Try using &quot;EARLYBIRD&quot; for early tester access.
            </p>
          )}
          {promoStatus === "success" && (
            <p className="text-[11px] text-emerald-500 font-mono m-0">
              ✨ Code validated! Pro unlocked.
            </p>
          )}

          <div className="pt-3 border-t border-(--rule) text-center">
            <p className="font-mono text-[10px] text-muted-foreground m-0">
              Carousel Lab · Built by Michael Ojekunle on{" "}
              <a href="/tools/carousel-lab" className="underline text-(--ink)">
                michaelojekunle.dev/tools/carousel-lab
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
