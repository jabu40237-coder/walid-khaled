import { NextResponse } from 'next/server';
import { refreshSessionActivity } from '@/lib/auth';

/**
 * POST /api/auth/ping
 *
 * Keeps the session alive. Called periodically by the admin dashboard.
 * If the session is expired/invalid, returns 401 — client redirects to login.
 */
export async function POST() {
  const alive = await refreshSessionActivity();

  if (!alive) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
