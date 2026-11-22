/**
 * Privacy scrubbing shared by the browser and server error reporters.
 * Invite codes and other learner-chosen values travel in query strings and
 * fragments, and Referer headers can carry the previous page's: none of that
 * should reach a third party, so only origin + path are kept.
 */

export function stripQuery(url: string): string {
  return url.split(/[?#]/)[0] ?? url;
}

interface Scrubbable {
  request?: { url?: string; query_string?: unknown; cookies?: unknown; headers?: Record<string, string> };
  transaction?: string;
  breadcrumbs?: { data?: Record<string, unknown> }[];
}

export function scrubBreadcrumbData(data: Record<string, unknown> | undefined): void {
  if (!data) return;
  for (const key of ["url", "from", "to"]) {
    const value = data[key];
    if (typeof value === "string") data[key] = stripQuery(value);
  }
}

export function scrubEvent<T extends Scrubbable>(event: T): T {
  if (event.request) {
    if (event.request.url) event.request.url = stripQuery(event.request.url);
    delete event.request.cookies;
    delete event.request.query_string;
    const headers = event.request.headers;
    if (headers) for (const key of Object.keys(headers)) if (key.toLowerCase() === "referer" || key.toLowerCase() === "cookie") delete headers[key];
  }
  if (event.transaction) event.transaction = stripQuery(event.transaction);
  for (const crumb of event.breadcrumbs ?? []) scrubBreadcrumbData(crumb.data);
  return event;
}
