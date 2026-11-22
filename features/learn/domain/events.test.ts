import { describe, expect, it } from "vitest";
import { EventSchema } from "./events";

describe("EventSchema (what the public endpoint accepts)", () => {
  it("accepts a client event with its own small props", () => {
    expect(EventSchema.safeParse({ name: "session_started", language: "fr", props: { first: true, guest: false } }).success).toBe(true);
    expect(EventSchema.safeParse({ name: "session_finished", props: { new_words: 5, reviews: 12 } }).success).toBe(true);
    expect(EventSchema.safeParse({ name: "voice_enabled" }).success).toBe(true);
  });

  it("refuses names outside the list", () => {
    expect(EventSchema.safeParse({ name: "drop_table" }).success).toBe(false);
  });

  it("refuses events only the server's jobs may write", () => {
    for (const name of ["reminder_run", "weekly_summary_run", "group_nudge_run"]) expect(EventSchema.safeParse({ name }).success, name).toBe(false);
  });

  it("refuses properties an event doesn't define, so no free text can be stored", () => {
    expect(EventSchema.safeParse({ name: "session_started", props: { note: "hello" } }).success).toBe(false);
    expect(EventSchema.safeParse({ name: "voice_enabled", props: { first: true } }).success).toBe(false);
  });

  it("refuses wrong types and out-of-range counts that would fake a trend", () => {
    expect(EventSchema.safeParse({ name: "session_started", props: { first: "yes" } }).success).toBe(false);
    expect(EventSchema.safeParse({ name: "session_finished", props: { reviews: 999999 } }).success).toBe(false);
    expect(EventSchema.safeParse({ name: "session_finished", props: { reviews: -1 } }).success).toBe(false);
    expect(EventSchema.safeParse({ name: "session_finished", props: { reviews: 1.5 } }).success).toBe(false);
  });

  it("only accepts the two supported languages", () => {
    expect(EventSchema.safeParse({ name: "voice_enabled", language: "de" }).success).toBe(false);
  });
});
