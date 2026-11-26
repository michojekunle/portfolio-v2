import { describe, expect, it } from "vitest";
import { safeMediaOrExternalUrl } from "./url";

describe("safeMediaOrExternalUrl", () => {
  it("allows https, http, and private upload proxy paths", () => {
    expect(safeMediaOrExternalUrl("https://youtube.com/watch?v=abc123")).toBe(
      "https://youtube.com/watch?v=abc123",
    );
    expect(safeMediaOrExternalUrl("  http://example.com/talk  ")).toBe(
      "http://example.com/talk",
    );
    expect(
      safeMediaOrExternalUrl("/api/speaking/upload?path=day-01/recording.mp4"),
    ).toBe("/api/speaking/upload?path=day-01/recording.mp4");
  });

  it("rejects unsafe protocols, protocol-relative URLs, and invalid or empty inputs", () => {
    expect(safeMediaOrExternalUrl(null)).toBeNull();
    expect(safeMediaOrExternalUrl(undefined)).toBeNull();
    expect(safeMediaOrExternalUrl("   ")).toBeNull();
    expect(safeMediaOrExternalUrl("javascript:alert(1)")).toBeNull();
    expect(safeMediaOrExternalUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(safeMediaOrExternalUrl("vbscript:msgbox(1)")).toBeNull();
    expect(safeMediaOrExternalUrl("//evil.example/payload")).toBeNull();
    expect(safeMediaOrExternalUrl("/other/local/path")).toBeNull();
    expect(safeMediaOrExternalUrl("not a valid url")).toBeNull();
  });
});
