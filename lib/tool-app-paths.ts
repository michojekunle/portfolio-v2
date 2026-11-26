/**
 * Routes that are self-contained apps with their own navigation. The portfolio
 * navbar/footer and the site intro preloader are suppressed on these paths.
 */
export const TOOL_APP_PREFIXES = [
  "/tools/bookbreaks",
  "/tools/chapterly",
  "/tools/flowise",
  "/tools/journal",
  "/speaking",
  "/admin",
  "/french",
  "/spanish",
] as const;

export function isToolAppPath(pathname: string): boolean {
  return TOOL_APP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
