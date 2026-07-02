/**
 * Simple in-memory rate limiter for AI endpoints.
 * Per-user, per-endpoint sliding window. Resets on process restart.
 * For multi-instance deployments, replace with Redis/Upstash.
 */

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.limit - 1, resetAt };
  }

  if (existing.count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: config.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

// Prune expired entries every 10 minutes to avoid unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, win] of store) {
    if (now >= win.resetAt) store.delete(key);
  }
}, 10 * 60 * 1000);
