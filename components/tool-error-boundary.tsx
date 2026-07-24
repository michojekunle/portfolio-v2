"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
  toolName: string;
  accentColor: string;
}

export function ToolErrorBoundary({
  error,
  reset,
  toolName,
  accentColor,
}: Props): React.ReactElement {
  useEffect(() => {
    console.error(`[${toolName} error]`, error);
  }, [error, toolName]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-10 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: `${accentColor}12`, color: accentColor }}
      >
        <AlertTriangle size={26} />
      </div>
      
      <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-2">
        {toolName} Error
      </div>
      
      <h2 className="font-display text-[26px] max-[640px]:text-[22px] font-normal tracking-[-0.02em] text-(--ink) m-0 mb-2.5 leading-[1.2] fvs-text">
        Something went wrong
      </h2>
      
      <p className="text-[13px] leading-[1.6] text-muted-foreground max-w-105 m-0 mb-7">
        {error.message || "An unexpected error occurred while running this tool. Please reset the tool to continue."}
      </p>
      
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 h-9.5 px-5 rounded-full font-mono text-[9px] uppercase tracking-[0.14em] font-semibold border-none cursor-pointer transition-opacity hover:opacity-90"
        style={{ background: accentColor, color: "#fff" }}
      >
        <RefreshCw size={11} /> Reset Tool
      </button>
    </div>
  );
}
