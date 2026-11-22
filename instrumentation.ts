import type { Instrumentation } from "next";
import { scrubBreadcrumbData, scrubEvent } from "@/lib/sentry-scrub";

/**
 * Server error monitoring (Sentry). Inactive until SENTRY_DSN (or
 * NEXT_PUBLIC_SENTRY_DSN) is set; then unhandled route/render errors are reported.
 */
export async function register(): Promise<void> {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || process.env.NEXT_RUNTIME !== "nodejs") return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
    beforeBreadcrumb(breadcrumb) {
      scrubBreadcrumbData(breadcrumb.data);
      return breadcrumb;
    },
    beforeSend: (event) => scrubEvent(event),
  });
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(error, { path: request.path.split("?")[0], method: request.method, headers: {} }, context);
};
