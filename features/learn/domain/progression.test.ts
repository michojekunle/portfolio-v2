import { describe, expect, it } from "vitest";
import { practiceStage, sessionsToNextStage } from "./progression";

describe("practiceStage", () => {
  it("starts a complete beginner fully guided", () => {
    expect(practiceStage("A1", 0)).toBe(1);
  });

  it("gives higher levels a head start", () => {
    expect(practiceStage("A2", 0)).toBe(2);
    expect(practiceStage("B1", 0)).toBe(3);
    expect(practiceStage("B2", 0)).toBe(3);
  });

  it("removes support as sessions are completed", () => {
    expect(practiceStage("A1", 2)).toBe(1);
    expect(practiceStage("A1", 3)).toBe(2);
    expect(practiceStage("A1", 10)).toBe(3);
    expect(practiceStage("A2", 3)).toBe(3);
  });

  it("never goes past the top stage", () => {
    expect(practiceStage("B2", 500)).toBe(3);
  });
});

describe("sessionsToNextStage", () => {
  it("counts down to the next threshold", () => {
    expect(sessionsToNextStage("A1", 0)).toBe(3);
    expect(sessionsToNextStage("A1", 4)).toBe(6);
    expect(sessionsToNextStage("A2", 1)).toBe(2);
  });

  it("is null once there's nothing left to unlock", () => {
    expect(sessionsToNextStage("B1", 0)).toBeNull();
    expect(sessionsToNextStage("A1", 10)).toBeNull();
  });
});
