"use client";

import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

interface Props {
  visible: boolean;
  message?: string;
  onDismiss: () => void;
}

export function SaveToast({
  visible,
  message = "Entry saved",
  onDismiss,
}: Props): React.ReactElement {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, 2500);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-7 right-7 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-[14px] shadow-[0_8px_40px_rgba(0,0,0,0.22)]"
      style={{
        background: "linear-gradient(135deg, #16A34A 0%, #15803d 100%)",
        color: "#fff",
        transform: visible ? "translateY(0) scale(1)" : "translateY(80px) scale(0.92)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "transform 0.32s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease",
        willChange: "transform, opacity",
      }}
    >
      <CheckCircle size={16} strokeWidth={2.5} />
      <span className="font-mono text-[11px] tracking-[0.12em] font-semibold uppercase">
        {message}
      </span>
    </div>
  );
}
