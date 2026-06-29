import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

// i18n middleware handles locale routing for public pages
const intlMiddleware = createIntlMiddleware({
  locales: ['ar', 'kurd', 'en'],
  defaultLocale: 'ar',
  localeDetection: false,
  localePrefix: 'always',
});

const COOKIE_SESSION = '__Host-wk_session';

/**
 * Lightweight cookie check for middleware routing.
 * No JWT verification here — actual auth is enforced by API routes.
 * This just checks cookie presence to decide redirect behavior.
 */
function hasSessionCookie(req: NextRequest): boolean {
  const cookie = req.cookies.get(COOKIE_SESSION);
  return !!(cookie && cookie.value && cookie.value.length > 0);
}

/**
 * Quick admin-configured check using only env vars.
 * We can't import from admin-store because it uses Node.js APIs
 * (fs/path) not available in Edge Runtime.
 * The setup page performs a full check via the API.
 */
function envAdminConfigured(): boolean {
  return !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH);
}

/**
 * Combined middleware:
 * - i18n for public pages
 * - Auth protection for /admin routes
 * - First-run setup redirection
 */
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin route protection ──────────────────
  if (pathname.startsWith('/admin')) {
    // Allow setup page and API routes (they handle their own auth)
    if (
      pathname === '/admin/setup' ||
      pathname === '/admin/login' ||
      pathname.startsWith('/api/auth/')
    ) {
      // If already has session cookie and visiting login page, redirect to dashboard
      if (pathname === '/admin/login') {
        if (hasSessionCookie(req)) {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
      }

      return NextResponse.next();
    }

    // ── First-run: redirect to setup if no env-based admin exists ──
    // This is a lightweight check; the setup page does a full check via API
    if (!envAdminConfigured()) {
      return NextResponse.redirect(new URL('/admin/setup', req.url));
    }

    // All other /admin routes require authentication
    if (!hasSessionCookie(req)) {
      // Clear the invalid cookie and redirect to login
      const response = NextResponse.redirect(
        new URL('/admin/login', req.url)
      );
      response.cookies.set(COOKIE_SESSION, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    return NextResponse.next();
  }

  // ── Public pages → i18n middleware ──────────
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next|_vercel|favicon\\.ico|images|videos|uploads|.*\\..*).*)',
  ],
};
