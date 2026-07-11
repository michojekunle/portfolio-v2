/**
 * Redis-backed rate limiter for AI/write-heavy endpoints.
 * Sliding-window counter via Upstash — survives deploys and works across
 * serverless instances, unlike an in-memory Map.
 */
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

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

let redis: Redis | null = null;
let redisInitialized = false;

function getRedis(): Redis | null {
  if (redisInitialized) return redis;
  redisInitialized = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redis = new Redis({ url, token });
  }
  return redis;
}

// One Ratelimit instance per distinct (limit, windowMs) pair — Upstash's
// Ratelimit class binds the window/limit at construction time.
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(config: RateLimitConfig): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  const cacheKey = `${config.limit}:${config.windowMs}`;
  let limiter = limiterCache.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(config.limit, `${config.windowMs} ms`),
      analytics: false,
      prefix: "ratelimit",
    });
    limiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

// In-memory fallback so local dev without Upstash env vars still works —
// not distributed, but keeps the same interface and behavior shape.
interface Window {
  count: number;
  resetAt: number;
}
const fallbackStore = new Map<string, Window>();

function checkRateLimitFallback(key: string, config: RateLimitConfig): RateLimitResult {
  // Lazy prune of fallback store (10% chance on fallback requests)
  if (Math.random() < 0.1) {
    const nowTime = Date.now();
    for (const [k, win] of fallbackStore) {
      if (nowTime >= win.resetAt) fallbackStore.delete(k);
    }
  }

  const now = Date.now();
  const existing = fallbackStore.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + config.windowMs;
    fallbackStore.set(key, { count: 1, resetAt });
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

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const limiter = getLimiter(config);
  if (!limiter) {
    console.warn("[rate-limit] UPSTASH_REDIS_REST_URL/_TOKEN not set — using in-memory fallback");
    return checkRateLimitFallback(key, config);
  }

  try {
    const { success, remaining, reset } = await limiter.limit(key);
    return { allowed: success, remaining, resetAt: reset };
  } catch (err) {
    // Redis unreachable — fail open rather than blocking every request.
    console.error("[rate-limit] Redis error, failing open:", err);
    return { allowed: true, remaining: config.limit, resetAt: Date.now() + config.windowMs };
  }
}
