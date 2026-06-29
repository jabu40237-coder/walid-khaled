import { NextResponse } from 'next/server';
import { clearSessionCookie, clearDeviceCookie } from '@/lib/auth';

/**
 * POST /api/auth/logout
 *
 * Clears session and device trust cookies.
 */
export async function POST() {
  clearSessionCookie();
  clearDeviceCookie();

  return NextResponse.json({ success: true });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
