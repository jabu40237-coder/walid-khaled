import { NextRequest, NextResponse } from 'next/server';
import { isAdminConfigured, initializeAdmin } from '@/lib/admin-store';
import { hashPassword, getClientIP } from '@/lib/auth';

// ──────────────────────────────────────────────
// Rate limiter for setup endpoint
// ──────────────────────────────────────────────
const setupAttempts = new Map<string, { count: number; firstAttempt: number }>();

function checkSetupRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = setupAttempts.get(ip);

  // Clean entries older than 1 hour
  if (entry && now - entry.firstAttempt > 3600_000) {
    setupAttempts.delete(ip);
    return true;
  }

  if (!entry) {
    setupAttempts.set(ip, { count: 1, firstAttempt: now });
    return true;
  }

  entry.count++;

  // Max 3 setup attempts per IP per hour
  if (entry.count > 3) {
    return false;
  }

  return true;
}

/**
 * POST /api/auth/setup
 *
 * First-run administrator account creation.
 * Only works when no admin credentials exist yet.
 * Once an admin is created, this endpoint returns 403.
 *
 * Body:
 *   username: string (3–64 chars)
 *   password: string (8–128 chars)
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);

    // ── Rate limit ───────────────────────────
    if (!checkSetupRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many setup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // ── Guard: Only allow if no admin exists ──
    const configured = await isAdminConfigured();
    if (configured) {
      return NextResponse.json(
        { error: 'Administrator account already exists.' },
        { status: 403 }
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

    const { username, password } = body as {
      username?: string;
      password?: string;
    };

    // ── Validate username ─────────────────────
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required.' },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 64) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 64 characters.' },
        { status: 400 }
      );
    }

    // Only allow letters, numbers, dots, underscores, hyphens
    if (!/^[a-zA-Z0-9._@-]+$/.test(trimmedUsername)) {
      return NextResponse.json(
        { error: 'Username contains invalid characters.' },
        { status: 400 }
      );
    }

    // ── Validate password ─────────────────────
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required.' },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: 'Password must be between 8 and 128 characters.' },
        { status: 400 }
      );
    }

    // Require at least one uppercase, one lowercase, one digit
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return NextResponse.json(
        {
          error:
            'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
        },
        { status: 400 }
      );
    }

    // ── Hash and store ────────────────────────
    const passwordHash = await hashPassword(password.slice(0, 72));

    const admin = await initializeAdmin(trimmedUsername, passwordHash);

    return NextResponse.json(
      {
        success: true,
        message:
          'Administrator account created successfully. You can now sign in.',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[auth/setup] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/setup
 *
 * Check whether the system needs first-run setup.
 * Returns { configured: boolean }
 */
export async function GET() {
  try {
    const configured = await isAdminConfigured();
    return NextResponse.json({ configured });
  } catch (err) {
    console.error('[auth/setup] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
