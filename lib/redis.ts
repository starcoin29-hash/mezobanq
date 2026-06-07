// lib/redis.ts
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Create Redis client
// Upstash Redis uses HTTP (not TCP) -- works in Edge Runtime and serverless
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiter: 10 requests per 10 seconds per identifier (usually IP address)
// This uses a "sliding window" algorithm -- the fairest rate limiting approach
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true, // Track rate limit analytics in Upstash dashboard
  prefix: "mezobanq:ratelimit",
});

// Cache key constants -- centralized so we never have typos
export const CACHE_KEYS = {
  btcPrice: "btc:price:usd",
  totalMusd: "musd:total_supply",
  userPosition: (userId: string) => `user:${userId}:positions`,
  giftCard: (code: string) => `gift:${code}`,
  passportLevel: (address: string) => `passport:${address.toLowerCase()}`,
} as const;

// Generic cache helper: get from Redis, or call fetcher if not cached
// ttlSeconds: how long to cache the result (in seconds)
export async function getOrCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60
): Promise<T> {
  // Try to get the cached value first
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached; // Cache hit -- return immediately
    }
  } catch {
    // Redis failure should not break the app -- fall through to fetcher
    console.warn("[Redis] Cache read failed for key:", key);
  }

  // Cache miss -- fetch fresh data
  const fresh = await fetcher();

  // Store in cache (don't await -- fire and forget for speed)
  redis.setex(key, ttlSeconds, JSON.stringify(fresh)).catch(() => {});

  return fresh;
}
