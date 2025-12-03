/**
 * Rate Limiting Module
 *
 * Uses Upstash Redis for production rate limiting.
 * Falls back to in-memory storage for development/testing.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import { RateLimitError, createErrorResponse } from '@/lib/errors';

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  // Checkout - prevent abuse
  checkout: {
    requests: 10,
    window: '1 h',
  },
  // Admin APIs - higher limit for authenticated admins
  admin: {
    requests: 100,
    window: '1 m',
  },
  // Auth endpoints - prevent brute force
  auth: {
    requests: 5,
    window: '1 m',
  },
  // General API - default rate limit
  api: {
    requests: 60,
    window: '1 m',
  },
} as const;

type RateLimitType = keyof typeof RATE_LIMITS;

// Create Redis client if environment variables are set
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    return new Redis({ url, token });
  }

  return null;
}

// Create rate limiter instances
const redis = createRedisClient();

// Map to store rate limiters for each type
const rateLimiters = new Map<RateLimitType, Ratelimit>();

/**
 * Get or create a rate limiter for the specified type
 */
function getRateLimiter(type: RateLimitType): Ratelimit | null {
  if (!redis) {
    // No Redis configured - skip rate limiting in development
    console.warn('Rate limiting disabled: UPSTASH_REDIS_REST_URL not configured');
    return null;
  }

  if (!rateLimiters.has(type)) {
    const config = RATE_LIMITS[type];
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      analytics: true,
      prefix: `ratelimit:${type}`,
    });
    rateLimiters.set(type, limiter);
  }

  return rateLimiters.get(type)!;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean;
  remaining: number;
  limit: number;
  reset: number;
}

/**
 * Check rate limit for a given identifier
 */
export async function checkRateLimit(
  type: RateLimitType,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = getRateLimiter(type);

  if (!limiter) {
    // Rate limiting disabled - allow all requests
    return {
      success: true,
      remaining: 999,
      limit: 999,
      reset: Date.now() + 60000,
    };
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    remaining: result.remaining,
    limit: result.limit,
    reset: result.reset,
  };
}

/**
 * Rate limit middleware helper for API routes
 * Returns null if rate limit is not exceeded, otherwise returns error response
 */
export async function withRateLimit(
  type: RateLimitType,
  identifier: string
): Promise<NextResponse | null> {
  const result = await checkRateLimit(type, identifier);

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    const response = createErrorResponse(new RateLimitError(retryAfter));

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', result.reset.toString());
    response.headers.set('Retry-After', retryAfter.toString());

    return response;
  }

  return null;
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());
  return response;
}

/**
 * Get identifier for rate limiting
 * Uses user ID if authenticated, otherwise uses IP address
 */
export function getRateLimitIdentifier(
  userId?: string | null,
  ip?: string | null
): string {
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${ip || 'unknown'}`;
}
