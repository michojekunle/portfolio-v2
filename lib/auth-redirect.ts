/**
 * Where to send someone after the OAuth callback, and where to send them if it fails.
 * Pure, so the open-redirect rules are unit-tested.
 */

const DEFAULT_NEXT = "/tools/bookbreaks";

/** Self-contained apps that handle their own sign-in (no /login page): errors go back to the app itself. */
const SELF_CONTAINED_APPS = ["/french", "/spanish"] as const;

/**
 * Only same-site relative paths. Rejects "//host" and "/\host" (browsers treat a
 * backslash like a slash, so "/\evil.com" is a protocol-relative URL), and any
 * control characters that could be used to smuggle one in.
 */
export function safeNextPath(raw: string | null): string {
  if (!raw) return DEFAULT_NEXT;
  // eslint-disable-next-line no-control-regex
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\") || /[\u0000-\u001f\u007f]/.test(raw)) return DEFAULT_NEXT;
  return raw;
}

/** Where a failed sign-in lands: the tool's login page, or the app itself with a flag it can show. */
export function failurePath(next: string): string {
  const app = SELF_CONTAINED_APPS.find((prefix) => next === prefix || next.startsWith(`${prefix}?`) || next.startsWith(`${prefix}/`));
  if (app) return `${app}?auth_error=1`;
  const parts = next.split("/").filter(Boolean);
  return parts.length >= 2 && parts[0] === "tools" ? `/${parts[0]}/${parts[1]}/login?error=Could+not+complete+sign+in` : "/tools/bookbreaks/login?error=Could+not+complete+sign+in";
}
