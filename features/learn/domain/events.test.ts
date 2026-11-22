import { describe, expect, it } from "vitest";
import { EventSchema } from "./events";

describe("EventSchema (what the public endpoint accepts)", () => {
  it("accepts a client event with small flat props", () => {
    expect(EventSchema.safeParse({ name: "session_started", language: "fr", props: { first: true, minutes: 8 } }).success).toBe(true);
  });

  it("refuses names outside the list", () => {
    expect(EventSchema.safeParse({ name: "drop_table" }).success).toBe(false);
  });

  it("refuses events only the server's jobs may write", () => {
    for (const name of ["reminder_run", "weekly_summary_run", "group_nudge_run"]) expect(EventSchema.safeParse({ name }).success, name).toBe(false);
  });

  it("refuses long free text and too many properties", () => {
    expect(EventSchema.safeParse({ name: "session_started", props: { note: "x".repeat(61) } }).success).toBe(false);
    const many = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`k${i}`, i]));
    expect(EventSchema.safeParse({ name: "session_started", props: many }).success).toBe(false);
  });

  it("refuses odd property names and nested values", () => {
    expect(EventSchema.safeParse({ name: "session_started", props: { "Bad Key": 1 } }).success).toBe(false);
    expect(EventSchema.safeParse({ name: "session_started", props: { a: { b: 1 } } }).success).toBe(false);
  });
});
