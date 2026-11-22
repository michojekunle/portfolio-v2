/**
 * Browser error monitoring (Sentry). Does nothing, and loads nothing, until
 * NEXT_PUBLIC_SENTRY_DSN is set. Privacy-first: no replay, no tracing, no
 * personal data attached.
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
        beforeSend(event) {
          // Learners' own words can appear in URLs/breadcrumbs; keep only the path.
          if (event.request?.url) event.request.url = event.request.url.split("?")[0];
          if (event.request) delete event.request.cookies;
          return event;
        },
      });
    })
    .catch((error: unknown) => console.warn("[monitoring] could not start error reporting", error));
}

export {};
