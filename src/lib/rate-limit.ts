/**
 * Rate Limiting Utility
 *
 * Simple in-memory rate limiter for protecting API endpoints.
 * Suitable for single-instance deployments.
 *
 * For multi-instance deployments, upgrade to Upstash Redis.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed per window */
  max: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Remaining requests in current window */
  remaining: number;
  /** Timestamp when the window resets */
  reset: number;
}

/**
 * Default configurations for common use cases
 */
export const RATE_LIMITS = {
  /** Standard API endpoint: 60 requests per minute */
  standard: { windowMs: 60_000, max: 60 },
  /** Checkout/payment: 10 requests per minute */
  checkout: { windowMs: 60_000, max: 10 },
  /** Auth endpoints: 5 requests per minute (stricter) */
  auth: { windowMs: 60_000, max: 5 },
  /** Admin endpoints: 30 requests per minute */
  admin: { windowMs: 60_000, max: 30 },
} as const;

/**
 * Check if a request should be rate limited.
 *
 * @param identifier - Unique identifier (e.g., user ID, IP address)
 * @param config - Rate limit configuration
 * @returns Result indicating if request is allowed
 *
 * @example
 * const result = rateLimit(userId, RATE_LIMITS.checkout);
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     { status: 429, headers: { 'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)) } }
 *   );
 * }
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.standard
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // No existing record or window has expired - start fresh
  if (!record || now > record.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return {
      success: true,
      remaining: config.max - 1,
      reset: resetTime,
    };
  }

  // Window is still active - check if limit exceeded
  if (record.count >= config.max) {
    return {
      success: false,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  // Increment counter
  record.count++;
  return {
    success: true,
    remaining: config.max - record.count,
    reset: record.resetTime,
  };
}

/**
 * Create a rate limit key from request headers.
 * Uses user ID if authenticated, otherwise IP address.
 *
 * @param userId - Authenticated user ID (optional)
 * @param ip - Client IP address
 * @param endpoint - API endpoint for namespacing
 */
export function createRateLimitKey(
  userId: string | null,
  ip: string | null,
  endpoint: string
): string {
  const identifier = userId || ip || 'anonymous';
  return `${endpoint}:${identifier}`;
}

/**
 * Get client IP from request headers.
 * Handles common proxy headers.
 */
export function getClientIp(headers: Headers): string | null {
  // Check common proxy headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take first IP if there are multiple
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return null;
}

// Cleanup expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
