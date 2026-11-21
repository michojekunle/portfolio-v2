/**
 * "Plus" entitlement rules and Stripe webhook signature verification.
 * Pure (crypto is injected via Web Crypto, available in Node 20 and browsers).
 */

export interface Entitlement {
  readonly status: string;
  readonly currentPeriodEnd: string | null;
}

const ACTIVE = new Set(["active", "trialing", "past_due"]);
/** Keep access briefly past the period end so a renewal webhook arriving late never locks a paying learner out. */
const GRACE_MS = 3 * 86_400_000;

export function isPlusActive(entitlement: Entitlement | null, now: Date): boolean {
  if (!entitlement || !ACTIVE.has(entitlement.status)) return false;
  if (!entitlement.currentPeriodEnd) return true;
  return new Date(entitlement.currentPeriodEnd).getTime() + GRACE_MS > now.getTime();
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time comparison of two hex strings. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Verifies a Stripe-Signature header (scheme v1: HMAC-SHA256 of "<t>.<payload>").
 * Rejects stale timestamps to stop replayed events. No SDK needed.
 */
export async function verifyStripeSignature(payload: string, header: string | null, secret: string, now: Date, toleranceSeconds = 300): Promise<boolean> {
  if (!header) return false;
  const parts = header.split(",").map((part) => part.trim().split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value ?? "");
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(now.getTime() / 1000 - Number(timestamp)) > toleranceSeconds) return false;

  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`)));
  return signatures.some((signature) => safeEqual(signature, expected));
}
