import { NextResponse } from 'next/server';
import { getAuthFromRequest, getTrustedDevice } from '@/lib/auth';

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated admin user.
 * Also refreshes session activity (sliding expiry).
 */
export async function GET() {
  const auth = await getAuthFromRequest();

  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if device is trusted
  const trusted = getTrustedDevice();

  return NextResponse.json({
    user: {
      id: auth.id,
      username: auth.username,
    },
    trustedDevice: trusted?.username === auth.username,
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
