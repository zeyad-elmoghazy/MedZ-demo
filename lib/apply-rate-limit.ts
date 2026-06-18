import { NextRequest, NextResponse } from 'next/server';
import type { Ratelimit } from '@upstash/ratelimit';

/**
 * Apply a rate limiter to an incoming request.
 *
 * Returns:
 *   - `NextResponse` (429) when the caller is over the limit;
 *     route handlers should `return` this value verbatim.
 *   - `null` when the request may proceed.
 *
 * When `limiter` is null (no Upstash credentials configured),
 * every call returns null — rate limiting degrades to a no-op
 * in dev/demo so the routes keep working.
 */
export async function applyRateLimit(
  request: NextRequest,
  limiter: Ratelimit | null,
  identifier?: string // if not provided, uses IP
): Promise<NextResponse | null> {
  // Limiter not configured — proceed.
  if (!limiter) return null;

  // Use user ID if provided, else fall back to IP.
  // IP-based limiting is the last line of defense — every
  // authenticated route should pass a user ID so a shared IP
  // (university lab, corporate NAT) doesn't get one student
  // throttled by another.
  const id = identifier || getClientIp(request) || 'anonymous';

  const { success, limit, remaining, reset } = await limiter.limit(id);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'Too many requests',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  return null; // null means not rate limited, proceed
}

/**
 * Extract the client IP from forwarding headers.
 *
 * `x-forwarded-for` can be a comma-separated list of hops
 * (`client, proxy1, proxy2`); the leftmost entry is the original
 * client. `x-real-ip` is a single value set by Nginx-style
 * reverse proxies.
 */
function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip');
}
