"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
  toolName: string;
  accent: string;
  homeHref: string;
}

export function ToolErrorBoundary({ error, reset, toolName, accent, homeHref }: Props): React.ReactElement {
  useEffect(() => {
    console.error(`[${toolName}] unhandled error:`, error);
  }, [error, toolName]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-[24px]"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-[420px] text-center">
        <div
          className="w-[56px] h-[56px] rounded-[16px] flex items-center justify-center mx-auto mb-[24px]"
          style={{ background: `${accent}14` }}
        >
          <AlertTriangle size={24} style={{ color: accent }} />
        </div>

        <h1 className="font-display text-[24px] font-normal tracking-[-0.02em] text-[var(--ink)] m-0 mb-[10px]">
          {toolName} hit a snag
        </h1>
        <p className="text-[14px] leading-[1.6] text-[var(--ink-3)] mb-[32px]">
          Something went wrong loading this page. Your data is safe — try
          again, or head back and pick up where you left off.
        </p>

        <div className="flex items-center justify-center gap-[10px]">
          <button
            onClick={reset}
            className="inline-flex items-center gap-[8px] h-[42px] px-[20px] rounded-full font-mono text-[11px] tracking-[0.1em] uppercase font-semibold text-white border-none cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: accent }}
          >
            <RefreshCw size={13} aria-hidden="true" />
            Try again
          </button>
          <Link
            href={homeHref}
            className="inline-flex items-center gap-[8px] h-[42px] px-[20px] rounded-full font-mono text-[11px] tracking-[0.1em] uppercase font-medium no-underline text-[var(--ink-2)] border border-[var(--rule)] transition-colors hover:border-[var(--ink-3)]"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            Go back
          </Link>
        </div>
      </div>
    </div>
  );
}
