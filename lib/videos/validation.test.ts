import { describe, expect, it } from "vitest";
import { isVideoEmbedPlatform, validatePlatformUrl } from "./validation";

describe("validatePlatformUrl & isVideoEmbedPlatform", () => {
  it("identifies video embed platforms correctly", () => {
    expect(isVideoEmbedPlatform("youtube")).toBe(true);
    expect(isVideoEmbedPlatform("tiktok")).toBe(true);
    expect(isVideoEmbedPlatform("instagram")).toBe(true);
    expect(isVideoEmbedPlatform("x")).toBe(false);
    expect(isVideoEmbedPlatform("website")).toBe(false);
  });

  it("validates YouTube watch, shorts, and youtu.be URLs and rejects channels", () => {
    expect(
      validatePlatformUrl("youtube", "https://www.youtube.com/watch?v=dQw4w9WgXcQ").ok
    ).toBe(true);
    expect(
      validatePlatformUrl("youtube", "https://youtube.com/shorts/abc12345678").ok
    ).toBe(true);
    expect(
      validatePlatformUrl("youtube", "https://youtu.be/abc12345678").ok
    ).toBe(true);
    expect(
      validatePlatformUrl("youtube", "https://www.youtube.com/live/abc12345678?feature=share").ok
    ).toBe(true);
    expect(
      validatePlatformUrl("youtube", "https://www.youtube.com/watch?app=desktop&v=dQw4w9WgXcQ").ok
    ).toBe(true);

    expect(
      validatePlatformUrl("youtube", "https://www.youtube.com/@devvmichael").ok
    ).toBe(false);
    expect(
      validatePlatformUrl("youtube", "https://vimeo.com/123456").ok
    ).toBe(false);
  });

  it("validates TikTok video/photo URLs directly embeddable on /videos", () => {
    expect(
      validatePlatformUrl(
        "tiktok",
        "https://www.tiktok.com/@devvvmichaell/video/7412345678901234567"
      ).ok
    ).toBe(true);
    expect(
      validatePlatformUrl(
        "tiktok",
        "https://tiktok.com/@user/photo/7412345678901234567"
      ).ok
    ).toBe(true);

    expect(
      validatePlatformUrl("tiktok", "https://www.tiktok.com/@devvvmichaell").ok
    ).toBe(false);
    expect(
      validatePlatformUrl("tiktok", "https://vm.tiktok.com/ZM8xyz/").ok
    ).toBe(false);
  });

  it("validates Instagram reels/posts and rejects profile URLs", () => {
    expect(
      validatePlatformUrl("instagram", "https://www.instagram.com/reel/C8xYz123Abc/").ok
    ).toBe(true);
    expect(
      validatePlatformUrl("instagram", "https://instagram.com/p/ABC_123/").ok
    ).toBe(true);

    expect(
      validatePlatformUrl("instagram", "https://www.instagram.com/devvmichaell/").ok
    ).toBe(false);
  });

  it("validates X and Website URLs cleanly", () => {
    expect(
      validatePlatformUrl("x", "https://x.com/devvmichael/status/123456789").ok
    ).toBe(true);
    expect(
      validatePlatformUrl("x", "https://instagram.com/reel/abc").ok
    ).toBe(false);
    expect(
      validatePlatformUrl("website", "https://michaelojekunle.dev/blog/day-1").ok
    ).toBe(true);
    expect(
      validatePlatformUrl("website", "javascript:alert(1)").ok
    ).toBe(false);
  });
});
