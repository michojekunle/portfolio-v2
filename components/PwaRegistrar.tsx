"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TOOL_COLORS } from "@/lib/tool-colors";

interface Props {
  toolId: string;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const TOOL_NAMES: Record<string, string> = {
  bookbreaks: "BookBreaks",
  "carousel-lab": "Carousel Lab",
  chapterly: "Chapterly",
  flowise: "Flowise",
  journal: "Journal",
  "thread-studio": "Thread Studio",
  french: "French Daily",
};

export function PwaRegistrar({ toolId }: Props): React.ReactElement | null {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Tools under /tools/<id> use a sub-scope; french lives at /french directly
    const scope = toolId === "french" ? "/french" : `/tools/${toolId}/`;

    void navigator.serviceWorker
      .register("/sw.js", { scope })
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.info(`[pwa] ${toolId} update available`);
            }
          });
        });
      })
      .catch((err) => {
        console.warn("[pwa] SW registration failed:", err);
      });
  }, [toolId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Suppress prompt if dismissed in this session
    try {
      if (sessionStorage.getItem(`pwa_dismissed_${toolId}`)) {
        return;
      }
    } catch {}

    const handleBeforeInstall = (e: Event): void => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [toolId]);

  const handleInstallClick = async (): Promise<void> => {
    if (!deferredPrompt) return;
    void deferredPrompt.prompt();
    try {
      const { outcome } = await deferredPrompt.userChoice;
      console.info(`[pwa] User prompt outcome: ${outcome}`);
    } catch (err) {
      console.warn("[pwa] Install failed:", err);
    }
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const handleDismiss = (): void => {
    try {
      sessionStorage.setItem(`pwa_dismissed_${toolId}`, "true");
    } catch {}
    setShowInstall(false);
  };

  const colorKey = toolId === "journal" ? "vela" : toolId;
  const brandColors = TOOL_COLORS[colorKey as keyof typeof TOOL_COLORS] || {
    accent: "var(--ink)",
    accentSoft: "var(--bg-2)",
    accentBorder: "var(--rule)",
  };

  return (
    <AnimatePresence>
      {showInstall && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 p-3 pl-4 rounded-2xl border shadow-lg max-w-85 max-[480px]:left-4 max-[480px]:right-4 max-[480px]:bottom-4 overflow-hidden"
          style={{
            background: "var(--bg-2)",
            borderColor: brandColors.accentBorder,
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Subtle colored glow background */}
          <div
            className="absolute -top-7.5 -right-7.5 w-[90px] h-[90px] rounded-full opacity-[0.08] blur-[15px] -z-40"
            style={{ background: brandColors.accent }}
            aria-hidden="true"
          />

          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
            style={{
              background: brandColors.accentSoft,
              color: brandColors.accent,
            }}
          >
            <Smartphone size={18} />
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <div className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-0.5">
              App Available
            </div>
            <div className="text-[13px] font-medium text-(--ink) truncate">
              Install {TOOL_NAMES[toolId] || toolId}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="h-7 px-3 rounded-lg border-none font-mono text-[9px] tracking-[0.08em] uppercase font-semibold cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: brandColors.accent,
                color: "#ffffff",
              }}
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="relative z-20 h-7 px-3 tracking-[0.08em] font-semibold cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.97]"
              aria-label="Dismiss install prompt"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
