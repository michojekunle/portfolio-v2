import { describe, expect, it } from "vitest";
import { failurePath, safeNextPath } from "./auth-redirect";

describe("safeNextPath", () => {
  it("keeps same-site relative paths", () => {
    expect(safeNextPath("/spanish")).toBe("/spanish");
    expect(safeNextPath("/tools/flowise?tab=1")).toBe("/tools/flowise?tab=1");
  });

  it("rejects anything that could leave the site", () => {
    for (const evil of ["https://evil.com", "//evil.com", "/\\evil.com", "/%0d//evil.com".replace("%0d", "\r"), "evil.com"]) {
      expect(safeNextPath(evil)).toBe("/tools/bookbreaks");
    }
  });

  it("falls back when missing", () => {
    expect(safeNextPath(null)).toBe("/tools/bookbreaks");
  });
});

describe("failurePath", () => {
  it("sends the language apps back to themselves with an error flag", () => {
    expect(failurePath("/french")).toBe("/french?auth_error=1");
    expect(failurePath("/spanish")).toBe("/spanish?auth_error=1");
  });

  it("keeps the existing tool login pages", () => {
    expect(failurePath("/tools/flowise")).toBe("/tools/flowise/login?error=Could+not+complete+sign+in");
    expect(failurePath("/somewhere")).toBe("/tools/bookbreaks/login?error=Could+not+complete+sign+in");
  });

  it("does not mistake a lookalike path for a language app", () => {
    expect(failurePath("/frenchfries")).toBe("/tools/bookbreaks/login?error=Could+not+complete+sign+in");
  });
});
