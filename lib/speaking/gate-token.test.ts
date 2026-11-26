import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  signSpeakingGateToken,
  verifySpeakingGateToken,
  verifySpeakingPassword,
} from "./gate-token";

describe("Speaking Ledger Password Gate Tokens", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "test-speaking-secret-pw";
    process.env.ADMIN_COOKIE_SECRET = "test-cookie-signing-secret-12345";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("verifies matching password and rejects wrong or empty passwords", () => {
    expect(verifySpeakingPassword("test-speaking-secret-pw")).toBe(true);
    expect(verifySpeakingPassword("wrong-password")).toBe(false);
    expect(verifySpeakingPassword("")).toBe(false);

    delete process.env.ADMIN_PASSWORD;
    expect(verifySpeakingPassword("test-speaking-secret-pw")).toBe(false);
  });

  it("signs and verifies HMAC tokens, rejecting tampered or expired tokens", async () => {
    const now = 1_800_000_000_000;
    const token = await signSpeakingGateToken(now);
    expect(token).toBeTruthy();

    expect(await verifySpeakingGateToken(token, now + 1000)).toBe(true);
    expect(await verifySpeakingGateToken(`${token}tampered`, now + 1000)).toBe(false);
    expect(await verifySpeakingGateToken("bad.token", now + 1000)).toBe(false);
    expect(await verifySpeakingGateToken(undefined, now + 1000)).toBe(false);

    // 31 days later -> expired
    const after31Days = now + 1000 * 60 * 60 * 24 * 31;
    expect(await verifySpeakingGateToken(token, after31Days)).toBe(false);
  });
});
