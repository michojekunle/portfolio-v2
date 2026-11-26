import { extractYoutubeId } from "./youtube";
import type { VideoPlatform } from "./types";

export type EmbedOrSocialPlatform =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "x"
  | "website";

export function isVideoEmbedPlatform(
  platform: string
): platform is VideoPlatform {
  return platform === "youtube" || platform === "instagram" || platform === "tiktok";
}

function hostMatches(hostname: string, domains: string[]): boolean {
  const lower = hostname.toLowerCase();
  return domains.some((d) => lower === d || lower.endsWith(`.${d}`));
}

/**
 * Validates that a URL is valid AND directly embeddable on /videos when the
 * platform is youtube, instagram, or tiktok.
 */
export function validatePlatformUrl(
  platform: EmbedOrSocialPlatform,
  rawUrl: string
): { ok: true; normalizedUrl: string } | { ok: false; error: string } {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { ok: false, error: "URL is required." };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      error: "Enter a complete URL starting with https://",
    };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, error: "URL must use http:// or https://" };
  }

  const normalizedUrl = parsed.toString();

  if (platform === "youtube") {
    if (!hostMatches(parsed.hostname, ["youtube.com", "youtu.be"])) {
      return {
        ok: false,
        error: "YouTube URL must be a youtube.com or youtu.be link.",
      };
    }
    if (!extractYoutubeId(normalizedUrl)) {
      return {
        ok: false,
        error:
          "Use a valid video link (e.g. youtube.com/watch?v=..., /shorts/..., or youtu.be/...) so it can embed on /videos.",
      };
    }
    return { ok: true, normalizedUrl };
  }

  if (platform === "tiktok") {
    if (!hostMatches(parsed.hostname, ["tiktok.com"])) {
      return {
        ok: false,
        error: "TikTok URL must be a tiktok.com link.",
      };
    }
    const videoMatch = parsed.pathname.match(/\/(?:video|photo)\/(\d+)/);
    if (!videoMatch) {
      return {
        ok: false,
        error:
          "Use a full TikTok post URL (https://www.tiktok.com/@user/video/1234567890) so it embeds directly on /videos.",
      };
    }
    return { ok: true, normalizedUrl };
  }

  if (platform === "instagram") {
    if (!hostMatches(parsed.hostname, ["instagram.com"])) {
      return {
        ok: false,
        error: "Instagram URL must be an instagram.com link.",
      };
    }
    const igMatch = parsed.pathname.match(
      /\/(?:p|reel|reels|tv)\/[A-Za-z0-9_-]+/
    );
    if (!igMatch) {
      return {
        ok: false,
        error:
          "Use a direct Reel or Post URL (https://www.instagram.com/reel/...) so it embeds directly on /videos.",
      };
    }
    return { ok: true, normalizedUrl };
  }

  if (platform === "x") {
    if (!hostMatches(parsed.hostname, ["x.com", "twitter.com"])) {
      return {
        ok: false,
        error: "X URL must be an x.com or twitter.com link.",
      };
    }
    return { ok: true, normalizedUrl };
  }

  return { ok: true, normalizedUrl };
}
