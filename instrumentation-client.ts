import { scrubBreadcrumbData, scrubEvent } from "@/lib/sentry-scrub";

/**
 * Browser error monitoring (Sentry). Does nothing, and loads nothing, until
 * NEXT_PUBLIC_SENTRY_DSN is set. Privacy-first: no replay, no tracing, no
 * personal data attached, URLs reduced to origin + path (see lib/sentry-scrub).
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  void import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
        tracesSampleRate: 0,
        // Ignore noise that isn't a bug in this app.
        ignoreErrors: ["ResizeObserver loop", "Non-Error promise rejection captured", "AbortError", "NotAllowedError"],
        beforeBreadcrumb(breadcrumb) {
          scrubBreadcrumbData(breadcrumb.data);
          return breadcrumb;
        },
        beforeSend: (event) => scrubEvent(event),
      });
    })
    .catch((error: unknown) => console.warn("[monitoring] could not start error reporting", error));
}

export {};
