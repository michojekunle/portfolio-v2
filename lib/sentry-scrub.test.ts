import { describe, expect, it } from "vitest";
import { scrubEvent, stripQuery } from "./sentry-scrub";

describe("stripQuery", () => {
  it("keeps origin and path only", () => {
    expect(stripQuery("https://michaelojekunle.dev/french?join=ABCD2345#x")).toBe("https://michaelojekunle.dev/french");
    expect(stripQuery("/spanish?start=1")).toBe("/spanish");
    expect(stripQuery("/plain")).toBe("/plain");
  });
});

describe("scrubEvent", () => {
  it("removes invite codes and cookies from every place they can appear", () => {
    const event = scrubEvent({
      request: { url: "https://x.dev/french?join=ABCD2345", query_string: "join=ABCD2345", cookies: { a: "b" }, headers: { Referer: "https://x.dev/french?join=ABCD2345", Cookie: "sb=1", Accept: "*/*" } },
      transaction: "/french?join=ABCD2345",
      breadcrumbs: [{ data: { url: "/api/french/group?code=ZZZZ", from: "/a?x=1", to: "/b?y=2", other: "keep" } }],
    });
    expect(JSON.stringify(event)).not.toMatch(/ABCD2345|ZZZZ|sb=1|x=1|y=2/);
    expect(event.request?.headers).toEqual({ Accept: "*/*" });
    expect(event.breadcrumbs?.[0]?.data?.other).toBe("keep");
  });

  it("tolerates events without a request", () => {
    expect(scrubEvent({})).toEqual({});
  });
});
