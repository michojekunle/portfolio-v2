/**
 * Browser error monitoring (Sentry). Does nothing, and loads nothing, until
 * NEXT_PUBLIC_SENTRY_DSN is set. Privacy-first: no replay, no tracing, no
 * personal data attached.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

/** Invite codes and learner-chosen values travel in query strings and fragments: keep only origin + path. */
function stripQuery(url: string): string {
  return url.split(/[?#]/)[0] ?? url;
}

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
          const data = breadcrumb.data;
          if (data) {
            for (const key of ["url", "from", "to"] as const) {
              const value = data[key];
              if (typeof value === "string") data[key] = stripQuery(value);
            }
          }
          return breadcrumb;
        },
        beforeSend(event) {
          if (event.request) {
            if (event.request.url) event.request.url = stripQuery(event.request.url);
            delete event.request.cookies;
            delete event.request.query_string;
            // The Referer can carry the previous page's query string too.
            if (event.request.headers) {
              for (const key of Object.keys(event.request.headers)) if (key.toLowerCase() === "referer") delete event.request.headers[key];
            }
          }
          if (event.transaction) event.transaction = stripQuery(event.transaction);
          return event;
        },
      });
    })
    .catch((error: unknown) => console.warn("[monitoring] could not start error reporting", error));
}

export {};
