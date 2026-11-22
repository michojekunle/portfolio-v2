"use client";

import { useEffect, type ReactElement } from "react";

/** Last-resort screen for a crash in the root layout. Reports it (when monitoring is on) and offers a retry. */
export default function GlobalError({ error, reset }: { readonly error: Error & { digest?: string }; readonly reset: () => void }): ReactElement {
  useEffect(() => {
    console.error("[app] unhandled error", error);
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      void import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error)).catch((reportError: unknown) => console.warn("[monitoring] could not report error", reportError));
    }
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, background: "#0a0a0a", color: "#fff" }}>
        <main style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>Something went wrong.</h1>
          <p style={{ opacity: 0.7, margin: "0 0 20px" }}>It's been noted. Try again, and if it keeps happening, reload the page.</p>
          <button type="button" onClick={reset} style={{ padding: "10px 20px", borderRadius: 999, border: "1px solid #fff", background: "transparent", color: "#fff", fontSize: 16, cursor: "pointer" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
