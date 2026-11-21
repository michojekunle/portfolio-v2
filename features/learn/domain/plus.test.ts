import { describe, expect, it } from "vitest";
import { isPlusActive, verifyStripeSignature } from "./plus";

const now = new Date("2026-11-21T12:00:00Z");

describe("isPlusActive", () => {
  it("unlocks active and trialing subscriptions in their period", () => {
    expect(isPlusActive({ status: "active", currentPeriodEnd: "2026-12-21T12:00:00Z" }, now)).toBe(true);
    expect(isPlusActive({ status: "trialing", currentPeriodEnd: null }, now)).toBe(true);
  });

  it("keeps a short grace period after the period ends", () => {
    expect(isPlusActive({ status: "active", currentPeriodEnd: "2026-11-20T12:00:00Z" }, now)).toBe(true);
    expect(isPlusActive({ status: "active", currentPeriodEnd: "2026-11-10T12:00:00Z" }, now)).toBe(false);
  });

  it("locks cancelled, unpaid or missing subscriptions", () => {
    expect(isPlusActive({ status: "canceled", currentPeriodEnd: "2026-12-21T12:00:00Z" }, now)).toBe(false);
    expect(isPlusActive({ status: "unpaid", currentPeriodEnd: null }, now)).toBe(false);
    expect(isPlusActive(null, now)).toBe(false);
  });
});

async function sign(payload: string, secret: string, t: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

describe("verifyStripeSignature", () => {
  const secret = "whsec_test";
  const payload = '{"id":"evt_1","type":"customer.subscription.updated"}';
  const t = Math.floor(now.getTime() / 1000);

  it("accepts a correctly signed, fresh event", async () => {
    expect(await verifyStripeSignature(payload, `t=${t},v1=${await sign(payload, secret, t)}`, secret, now)).toBe(true);
  });

  it("rejects a tampered payload, a wrong secret, a stale timestamp, or no header", async () => {
    const good = await sign(payload, secret, t);
    expect(await verifyStripeSignature(`${payload} `, `t=${t},v1=${good}`, secret, now)).toBe(false);
    expect(await verifyStripeSignature(payload, `t=${t},v1=${await sign(payload, "whsec_other", t)}`, secret, now)).toBe(false);
    const old = t - 3600;
    expect(await verifyStripeSignature(payload, `t=${old},v1=${await sign(payload, secret, old)}`, secret, now)).toBe(false);
    expect(await verifyStripeSignature(payload, null, secret, now)).toBe(false);
  });
});
