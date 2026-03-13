/**
 * Simple in-memory sliding-window rate limiter.
 *
 * NOTE: This works for single-process deployments (dev, single container).
 * For multi-instance production environments, replace with a Redis-backed
 * solution (e.g. @upstash/ratelimit or ioredis).
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param identifier - Unique key (e.g. `"POST:/api/blogs:192.168.1.1"`)
 * @param limit      - Max requests allowed in the window (default 60)
 * @param windowMs   - Window size in milliseconds (default 60 000 = 1 min)
 */
export function rateLimit(
  identifier: string,
  limit = 60,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    success: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
