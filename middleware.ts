import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareSupabase, isDemoMode, type UserRole } from '@/lib/supabase';
import { apiLimiter } from '@/lib/rate-limit';

const PROTECTED_PREFIXES: { prefix: string; role: UserRole }[] = [
  { prefix: '/student', role: 'student' },
  { prefix: '/professor', role: 'professor' },
  { prefix: '/admin', role: 'admin' },
];

const PUBLIC_PATHS = new Set(['/', '/login', '/signup']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.[a-zA-Z0-9]+$/)
  ) {
    return NextResponse.next();
  }

  // Single global rate-limit pass. Applies to every page request
  // and API call that flows through middleware. We do this first
  // so even unauthenticated requests are counted — a brute-force
  // login attempt should never get past this point.
  //
  // Identifier is IP because we may not have a user id yet at the
  // middleware layer (the cookie-based session is read below for
  // route protection, not here for rate limiting).
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'anonymous';

  let rateMeta: {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  } | null = null;

  if (apiLimiter) {
    try {
      rateMeta = await apiLimiter.limit(ip);
    } catch (err) {
      // A Redis hiccup shouldn't take down the site — log and
      // proceed without rate limiting for this request.
      console.error('[middleware] rate-limit check failed:', err);
    }

    if (rateMeta && !rateMeta.success) {
      const retryAfter = Math.ceil((rateMeta.reset - Date.now()) / 1000);
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests', retryAfter }),
        {
          status: 429,
          headers: {
            'content-type': 'application/json',
            'X-RateLimit-Limit': rateMeta.limit.toString(),
            'X-RateLimit-Remaining': rateMeta.remaining.toString(),
            'X-RateLimit-Reset': rateMeta.reset.toString(),
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }
  }

  // Helper to stamp the rate-limit headers onto any response.
  // Frontend can read these and show a "slow down" banner before
  // a user actually trips the 429.
  function withRateHeaders(res: NextResponse): NextResponse {
    if (rateMeta) {
      res.headers.set('X-RateLimit-Limit', rateMeta.limit.toString());
      res.headers.set('X-RateLimit-Remaining', rateMeta.remaining.toString());
      res.headers.set('X-RateLimit-Reset', rateMeta.reset.toString());
    }
    return res;
  }

  // API routes skip auth in the middleware — each route handler
  // owns its own auth check. Just stamp the headers and proceed.
  if (pathname.startsWith('/api')) {
    return withRateHeaders(NextResponse.next());
  }

  // Demo mode bypass: with placeholder Supabase env, let pages
  // handle auth via localStorage instead of calling the
  // (non-existent) backend.
  if (isDemoMode()) {
    return withRateHeaders(NextResponse.next());
  }

  const response = NextResponse.next();
  const supabase = createMiddlewareSupabase(request, response);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const required = PROTECTED_PREFIXES.find(({ prefix }) =>
    pathname.startsWith(prefix)
  );

  if (!required) {
    if (session && (pathname === '/login' || pathname === '/signup')) {
      const profileQuery = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      const loginProfile = profileQuery.data as { role: UserRole } | null;
      const role = loginProfile?.role ?? 'student';
      const target = `/${role}/dashboard`;
      return withRateHeaders(NextResponse.redirect(new URL(target, request.url)));
    }
    return withRateHeaders(response);
  }

  if (!session) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return withRateHeaders(NextResponse.redirect(redirectUrl));
  }

  const profileQuery = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  const profile = profileQuery.data as { role: UserRole } | null;

  if (profileQuery.error || !profile?.role) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('error', 'missing_profile');
    return withRateHeaders(NextResponse.redirect(redirectUrl));
  }

  const role = profile.role;

  if (role !== required.role) {
    return withRateHeaders(
      NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
    );
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return withRateHeaders(response);
  }

  return withRateHeaders(response);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
