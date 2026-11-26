export const SPEAKING_GATE_COOKIE = "speaking_gate_token";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqualStr(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < maxLen; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    diff |= ca ^ cb;
  }
  return diff === 0;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toHex(new Uint8Array(sig));
}

export function getSpeakingGateSecret(): string | null {
  const secret = process.env.ADMIN_COOKIE_SECRET || process.env.ADMIN_PASSWORD;
  return secret && secret.length >= 8 ? secret : null;
}

export async function signSpeakingGateToken(
  nowMs: number = Date.now()
): Promise<string | null> {
  const secret = getSpeakingGateSecret();
  if (!secret) return null;
  const exp = String(nowMs + TOKEN_TTL_MS);
  const sig = await hmacSha256Hex(secret, `speaking:${exp}`);
  return `${exp}.${sig}`;
}

export async function verifySpeakingGateToken(
  token: string | undefined | null,
  nowMs: number = Date.now()
): Promise<boolean> {
  if (!token) return false;
  const secret = getSpeakingGateSecret();
  if (!secret) return false;

  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0) return false;
  const expStr = token.slice(0, dotIdx);
  const providedSig = token.slice(dotIdx + 1);
  if (!/^\d+$/.test(expStr) || !providedSig) return false;

  const expMs = Number(expStr);
  if (!Number.isFinite(expMs) || expMs <= nowMs) return false;

  const expectedSig = await hmacSha256Hex(secret, `speaking:${expStr}`);
  return constantTimeEqualStr(providedSig, expectedSig);
}

export function verifySpeakingPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !input) return false;
  return constantTimeEqualStr(input, expected);
}
