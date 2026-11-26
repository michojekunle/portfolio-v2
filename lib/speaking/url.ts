/**
 * Allows only safe http(s) URLs or our authenticated private recording proxy path.
 * Blocks javascript:, data:, vbscript:, or protocol-relative URLs in href attributes.
 */
export function safeMediaOrExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/api/speaking/upload?path=")) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}
