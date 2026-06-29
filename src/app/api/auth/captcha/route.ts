import { NextRequest, NextResponse } from 'next/server';
import { generateCaptcha, generateCsrfToken } from '@/lib/auth';

/**
 * GET /api/auth/captcha
 * Returns a math CAPTCHA challenge and CSRF token.
 * Called when the client needs a fresh CAPTCHA (after 3 failed attempts).
 */
export async function GET(_req: NextRequest) {
  const { question, token: captchaToken } = generateCaptcha();
  const { signedToken: csrfToken } = generateCsrfToken();

  const response = NextResponse.json({
    question,
    captchaToken,
    csrfToken,
  });

  // Set CSRF cookie for this session
  response.cookies.set('__Host-wk_csrf', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 3600,
  });

  return response;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
