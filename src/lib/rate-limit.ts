/**
 * Server-side Rate Limiting Middleware
 * Uses in-memory storage for serverless environments
 * For production, use Redis or a proper rate limiting service
 */

import type { APIRoute } from 'astro';

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 30; // Max requests per window per IP

// In-memory store (resets on cold start in serverless)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  lastCleanup = now;
}

function getClientIP(request: Request): string {
  // Check common headers for proxy/load balancer scenarios
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback
  return 'unknown';
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  cleanupExpiredEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // No entry or window expired
  if (!entry || now > entry.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(ip, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime,
    };
  }

  // Increment count
  entry.count++;
  entry.resetTime = now + RATE_LIMIT_WINDOW_MS;

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime,
  };
}

export function rateLimitMiddleware(getResponse: (request: Request) => Response | Promise<Response>): APIRoute {
  return async ({ request }) => {
    const ip = getClientIP(request);
    const rateLimitResult = checkRateLimit(ip);

    // Add rate limit headers to response
    const response = await getResponse(request);

    if (response instanceof Response) {
      const headers = new Headers(response.headers);
      headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
      headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      headers.set('X-RateLimit-Reset', Math.floor(rateLimitResult.resetTime / 1000).toString());

      if (!rateLimitResult.allowed) {
        headers.set('Retry-After', (rateLimitResult.retryAfter || 60).toString());
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  };
}

// Specific rate limit for sensitive endpoints
export const SENSITIVE_ENDPOINTS = {
  CONTACT: 'contact',
  COMMENT: 'comment',
  POST: 'post',
};

const SENSITIVE_LIMITS: Record<string, { windowMs: number; maxRequests: number }> = {
  [SENSITIVE_ENDPOINTS.CONTACT]: { windowMs: 60 * 1000, maxRequests: 3 }, // 3 per minute
  [SENSITIVE_ENDPOINTS.COMMENT]: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
  [SENSITIVE_ENDPOINTS.POST]: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 per minute
};

// Per-endpoint rate limiter
const sensitiveRateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkSensitiveEndpoint(endpoint: string, identifier: string): RateLimitResult {
  const config = SENSITIVE_LIMITS[endpoint];
  if (!config) {
    return { allowed: true, remaining: 999, resetTime: Date.now() };
  }

  const key = `${endpoint}:${identifier}`;
  const now = Date.now();
  const entry = sensitiveRateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    sensitiveRateLimitStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  entry.count++;
  entry.resetTime = now + config.windowMs;

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}
