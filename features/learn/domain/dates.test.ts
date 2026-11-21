import { describe, expect, it } from "vitest";
import { daysBetween, endOfLocalDay, isValidTimeZone, localDateString, resolveTimeZone } from "./dates";

describe("localDateString", () => {
  it("rolls Lagos (UTC+1) to the next day an hour before UTC does", () => {
    const instant = new Date("2026-11-20T23:30:00.000Z");
    expect(localDateString("UTC", instant)).toBe("2026-11-20");
    expect(localDateString("Africa/Lagos", instant)).toBe("2026-11-21");
  });

  it("keeps Los Angeles on the previous day for a UTC-morning instant", () => {
    expect(localDateString("America/Los_Angeles", new Date("2026-11-20T05:00:00.000Z"))).toBe("2026-11-19");
  });

  it("falls back to UTC for an invalid timezone instead of throwing", () => {
    expect(localDateString("Not/AZone", new Date("2026-11-20T12:00:00.000Z"))).toBe("2026-11-20");
  });
});

describe("endOfLocalDay", () => {
  it("is 23:00Z for Lagos on a UTC-morning instant", () => {
    expect(endOfLocalDay("Africa/Lagos", new Date("2026-11-20T10:00:00.000Z")).toISOString()).toBe(
      "2026-11-20T23:00:00.000Z"
    );
  });

  it("is 08:00Z the next UTC day for Los Angeles in winter (UTC-8)", () => {
    expect(endOfLocalDay("America/Los_Angeles", new Date("2026-11-20T10:00:00.000Z")).toISOString()).toBe(
      "2026-11-21T08:00:00.000Z"
    );
  });

  it("is 07:00Z the next UTC day for Los Angeles in summer (UTC-7, DST)", () => {
    expect(endOfLocalDay("America/Los_Angeles", new Date("2026-07-20T10:00:00.000Z")).toISOString()).toBe(
      "2026-07-21T07:00:00.000Z"
    );
  });

  it("is strictly after the instant it was computed from", () => {
    const now = new Date("2026-11-20T23:59:59.000Z");
    expect(endOfLocalDay("Africa/Lagos", now).getTime()).toBeGreaterThan(now.getTime());
  });
});

describe("daysBetween", () => {
  it("counts whole calendar days", () => {
    expect(daysBetween("2026-11-18", "2026-11-20")).toBe(2);
    expect(daysBetween("2026-11-20", "2026-11-20")).toBe(0);
  });

  it("crosses month and year boundaries", () => {
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
    expect(daysBetween("2026-02-28", "2026-03-01")).toBe(1);
  });

  it("returns a negative number when the dates are reversed", () => {
    expect(daysBetween("2026-11-20", "2026-11-18")).toBe(-2);
  });
});

describe("timezone validation", () => {
  it("accepts real IANA zones and rejects junk", () => {
    expect(isValidTimeZone("Africa/Lagos")).toBe(true);
    expect(isValidTimeZone("Mars/Olympus")).toBe(false);
    expect(resolveTimeZone(null)).toBe("UTC");
  });
});
