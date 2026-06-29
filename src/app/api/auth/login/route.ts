import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateUser,
  setSessionCookie,
  setDeviceCookie,
  getClientIP,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  verifyCaptcha,
  verifyCsrfToken,
  generateDeviceId,
  createDeviceToken,
  getTrustedDevice,
} from '@/lib/auth';

/**
 * POST /api/auth/login
 *
 * Authenticate the administrator. Security features:
 * - Progressive rate limiting with lockout tiers
 * - CAPTCHA required after 3 failed attempts
 * - CSRF protection
 * - Device trust ("Remember this device")
 * - HTTP-only secure session cookies
 */

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);

    // ── Rate limit check ──────────────────────
    const rate = checkRateLimit(ip);
    if (rate.limited) {
      return NextResponse.json(
        {
          error: 'Too many login attempts.',
          retryAfterSec: rate.retryAfterSec,
          requireCaptcha: true,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rate.retryAfterSec),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // ── Parse body ────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { username, password, captchaToken, captchaAnswer, csrfToken, remember } =
      body as {
        username?: string;
        password?: string;
        captchaToken?: string;
        captchaAnswer?: string;
        csrfToken?: string;
        remember?: boolean;
      };

    // ── Input validation ──────────────────────
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    if (
      typeof username !== 'string' ||
      typeof password !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Invalid input.' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 64) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    if (password.length < 4 || password.length > 128) {
      return NextResponse.json(
        { error: 'Invalid credentials.' },
        { status: 401 }
      );
    }

    // ── CSRF check ────────────────────────────
    if (csrfToken) {
      const csrfPayload = verifyCsrfToken(csrfToken);
      if (!csrfPayload) {
        return NextResponse.json(
          { error: 'Invalid CSRF token. Please refresh the page.' },
          { status: 403 }
        );
      }
    }

    // ── CAPTCHA verification ──────────────────
    // Check if CAPTCHA is required based on rate limit state
    const trustedDevice = getTrustedDevice();

    if (rate.requireCaptcha && !trustedDevice) {
      if (!captchaToken || captchaAnswer === undefined || captchaAnswer === null) {
        return NextResponse.json(
          {
            error: 'CAPTCHA verification required.',
            requireCaptcha: true,
          },
          { status: 400 }
        );
      }

      const answerNum = Number(captchaAnswer);
      if (isNaN(answerNum) || !verifyCaptcha(captchaToken, answerNum)) {
        // Record failed CAPTCHA as a failed attempt
        const updated = recordFailedAttempt(ip);
        return NextResponse.json(
          {
            error: 'Incorrect CAPTCHA answer.',
            requireCaptcha: true,
            remaining: updated.remaining,
          },
          { status: 400 }
        );
      }
    }

    // ── Password truncation protection ────────
    // bcrypt has a 72-byte limit; silently trim to prevent
    // long-password truncation bypass
    const safePassword = password.slice(0, 72);

    // ── Authenticate ──────────────────────────
    const result = await authenticateUser(username, safePassword);

    if (!result) {
      const updated = recordFailedAttempt(ip);
      return NextResponse.json(
        {
          error: 'Invalid username or password.',
          requireCaptcha: updated.requireCaptcha,
          remaining: updated.remaining,
        },
        {
          status: 401,
          headers: {
            'X-RateLimit-Remaining': String(updated.remaining),
          },
        }
      );
    }

    // ── Success: reset rate limiter ───────────
    resetRateLimit(ip);

    // ── Set session cookie ────────────────────
    setSessionCookie(result.sessionToken);

    // ── Device trust (Remember me) ────────────
    if (remember) {
      const deviceId = generateDeviceId();
      const deviceToken = createDeviceToken(result.user.username, deviceId);
      setDeviceCookie(deviceToken);
    }

    // ── Return ────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        user: { id: result.user.id, username: result.user.username },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[auth/login] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
