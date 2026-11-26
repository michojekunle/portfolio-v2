// Pure helpers — safe to import from client components (no server-only deps).

/** Extracts a YouTube video ID from watch, shorts, live, embed, or youtu.be URL forms. */
export function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

export function getYoutubeThumbnail(url: string): string | null {
  const id = extractYoutubeId(url);
  // hqdefault is consistently available across standard videos and Shorts
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function isYoutubeShort(url: string): boolean {
  return url.includes("/shorts/");
}
