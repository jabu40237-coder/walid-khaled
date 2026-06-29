import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getAdminUser, isAdminConfigured } from '@/lib/admin-store';

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

let _jwtSecret: string | null = null;

function getJwtSecret(): string {
  if (_jwtSecret) return _jwtSecret;

  const secret = process.env.JWT_SECRET;
  if (secret) {
    _jwtSecret = secret;
    return _jwtSecret;
  }

  // In production, JWT_SECRET is mandatory (checked at runtime, not build time)
  if (process.env.NODE_ENV === 'production') {
    // During 'next build', don't throw — the secret must be set at runtime.
    // At request time, if still unset, jwt signing will throw a clear error.
    // We check here to provide a helpful console warning.
    if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
      console.error(
        '[auth] ❌ JWT_SECRET environment variable is required in production. ' +
        'Generate one with: openssl rand -base64 64'
      );
    }
    // Use a placeholder that will cause jwt to fail with a clear message
    _jwtSecret = '';
    return _jwtSecret;
  }

  // Development only: generate a random secret for the session
  // This changes on each restart — sessions will be invalidated
  _jwtSecret = crypto.randomBytes(64).toString('base64');
  console.warn(
    '[auth] ⚠️  JWT_SECRET not set. Using a random development secret. ' +
    'Sessions will be invalidated on restart. Set JWT_SECRET in .env.local for persistent sessions.'
  );
  return _jwtSecret;
}

// ── JWT secret accessor (throws at runtime if empty in production)
function requireJwtSecret(): string {
  const secret = getJwtSecret();
  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is required in production. ' +
      'Generate one with: openssl rand -base64 64'
    );
  }
  return secret;
}
const SESSION_DURATION_SEC = 24 * 60 * 60; // 24 hours absolute max
const INACTIVITY_TIMEOUT_SEC = 30 * 60; // 30 minutes of inactivity
const DEVICE_TOKEN_DURATION_SEC = 90 * 24 * 60 * 60; // 90 days for trusted devices

const COOKIE_SESSION = '__Host-wk_session';
const COOKIE_DEVICE = 'wk_device_id';
const COOKIE_CSRF = '__Host-wk_csrf';

// ──────────────────────────────────────────────
// Progressive Rate Limiting (in-memory)
// Replace with Redis in production
// ──────────────────────────────────────────────

interface RateEntry {
  failures: number;
  firstFailure: number;
  blockedUntil: number | null;
}

const rateLimitStore = new Map<string, RateEntry>();

// Clean up stale entries every 10 minutes
const CLEANUP_INTERVAL = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupRateStore() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore) {
    if (entry.blockedUntil && entry.blockedUntil < now) {
      rateLimitStore.delete(key);
    } else if (now - entry.firstFailure > 3600_000) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Returns whether the IP is currently blocked and how many attempts remain
 * before CAPTCHA is required. Progressive tiers:
 *   0-3 failures → normal login
 *   3+ failures  → CAPTCHA required
 *   5 failures   → 1 min lockout
 *   10 failures  → 15 min lockout
 *   20 failures  → 1 hour lockout
 */
export function checkRateLimit(ip: string): {
  limited: boolean;
  remaining: number;
  requireCaptcha: boolean;
  retryAfterSec: number | null;
} {
  cleanupRateStore();
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // Fresh IP
  if (!entry || now - entry.firstFailure > 3600_000) {
    rateLimitStore.set(ip, {
      failures: 0,
      firstFailure: now,
      blockedUntil: null,
    });
    return {
      limited: false,
      remaining: 20,
      requireCaptcha: false,
      retryAfterSec: null,
    };
  }

  // Currently in lockout
  if (entry.blockedUntil && entry.blockedUntil > now) {
    const retrySec = Math.ceil((entry.blockedUntil - now) / 1000);
    return {
      limited: true,
      remaining: 0,
      requireCaptcha: true,
      retryAfterSec: retrySec,
    };
  }

  // Determine lockout tier
  if (entry.failures >= 20) {
    entry.blockedUntil = now + 3600_000; // 1 hour
    return {
      limited: true,
      remaining: 0,
      requireCaptcha: true,
      retryAfterSec: 3600,
    };
  }
  if (entry.failures >= 10) {
    entry.blockedUntil = now + 900_000; // 15 minutes
    return {
      limited: true,
      remaining: 0,
      requireCaptcha: true,
      retryAfterSec: 900,
    };
  }
  if (entry.failures >= 5) {
    entry.blockedUntil = now + 60_000; // 1 minute
    return {
      limited: true,
      remaining: 0,
      requireCaptcha: true,
      retryAfterSec: 60,
    };
  }

  const requireCaptcha = entry.failures >= 3;
  const remaining = Math.max(0, 20 - entry.failures);

  return {
    limited: false,
    remaining,
    requireCaptcha,
    retryAfterSec: null,
  };
}

/**
 * Record a failed login attempt. Returns updated state.
 */
export function recordFailedAttempt(ip: string): {
  requireCaptcha: boolean;
  remaining: number;
} {
  cleanupRateStore();
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.firstFailure > 3600_000) {
    rateLimitStore.set(ip, {
      failures: 1,
      firstFailure: now,
      blockedUntil: null,
    });
    return { requireCaptcha: false, remaining: 19 };
  }

  entry.failures++;
  return {
    requireCaptcha: entry.failures >= 3,
    remaining: Math.max(0, 20 - entry.failures),
  };
}

/**
 * Reset rate limit for an IP after successful login.
 */
export function resetRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}

// ──────────────────────────────────────────────
// Password Hashing
// ──────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ──────────────────────────────────────────────
// JWT — Session + Device tokens
// ──────────────────────────────────────────────

export interface JWTPayload {
  id: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface SessionPayload extends JWTPayload {
  type: 'session';
  lastActivity: number; // unix timestamp
}

interface DevicePayload {
  type: 'device';
  deviceId: string;
  username: string;
}

interface CsrfPayload {
  type: 'csrf';
  token: string;
}

interface CaptchaPayload {
  type: 'captcha';
  answer: number;
}

type SignedPayload = SessionPayload | DevicePayload | CsrfPayload | CaptchaPayload;

function signPayload(payload: SignedPayload, expiresInSec: number): string {
  return jwt.sign(payload as object, requireJwtSecret(), {
    expiresIn: expiresInSec,
  });
}

function verifyTypedToken<T extends SignedPayload>(
  token: string
): T | null {
  try {
    return jwt.verify(token, requireJwtSecret()) as T;
  } catch {
    return null;
  }
}

export function createSessionToken(
  user: { id: string; username: string }
): string {
  const payload: SessionPayload = {
    type: 'session',
    id: user.id,
    username: user.username,
    lastActivity: Math.floor(Date.now() / 1000),
  };
  return signPayload(payload, SESSION_DURATION_SEC);
}

export function verifySessionToken(token: string): SessionPayload | null {
  return verifyTypedToken<SessionPayload>(token);
}

/**
 * Create a device-trust token for "Remember this device".
 * This is stored in a persistent (non-httpOnly) cookie so the client
 * can check its presence. The actual trust decision happens server-side.
 */
export function createDeviceToken(
  username: string,
  deviceId: string
): string {
  const payload: DevicePayload = {
    type: 'device',
    deviceId,
    username,
  };
  return signPayload(payload, DEVICE_TOKEN_DURATION_SEC);
}

export function verifyDeviceToken(
  token: string
): DevicePayload | null {
  return verifyTypedToken<DevicePayload>(token);
}

// ──────────────────────────────────────────────
// CSRF Protection
// ──────────────────────────────────────────────

export function generateCsrfToken(): { token: string; signedToken: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const payload: CsrfPayload = { type: 'csrf', token };
  const signedToken = signPayload(payload, 3600); // 1 hour
  return { token, signedToken };
}

export function verifyCsrfToken(signedToken: string): string | null {
  const payload = verifyTypedToken<CsrfPayload>(signedToken);
  if (!payload || payload.type !== 'csrf') return null;
  return payload.token;
}

// ──────────────────────────────────────────────
// CAPTCHA — Simple Math Challenge
// ──────────────────────────────────────────────

/**
 * Generate a simple math CAPTCHA challenge.
 * Returns a question string and a signed answer token.
 */
export function generateCaptcha(): {
  question: string;
  token: string;
} {
  const ops = [
    { symbol: '+', fn: (a: number, b: number) => a + b },
    { symbol: '-', fn: (a: number, b: number) => a - b },
    { symbol: '×', fn: (a: number, b: number) => a * b },
  ];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number;

  if (op.symbol === '×') {
    a = Math.floor(Math.random() * 9) + 2; // 2-10
    b = Math.floor(Math.random() * 9) + 2; // 2-10
  } else if (op.symbol === '-') {
    a = Math.floor(Math.random() * 20) + 5; // 5-24
    b = Math.floor(Math.random() * a); // 0 to a-1
  } else {
    a = Math.floor(Math.random() * 20) + 1; // 1-20
    b = Math.floor(Math.random() * 20) + 1; // 1-20
  }

  const answer = op.fn(a, b);
  const question = `What is ${a} ${op.symbol} ${b}?`;

  const payload: CaptchaPayload = { type: 'captcha', answer };
  const token = signPayload(payload, 300); // 5 minutes

  return { question, token };
}

/**
 * Verify a CAPTCHA answer against the signed token.
 */
export function verifyCaptcha(token: string, answer: number): boolean {
  const payload = verifyTypedToken<CaptchaPayload>(token);
  if (!payload || payload.type !== 'captcha') return false;
  return payload.answer === answer;
}

// ──────────────────────────────────────────────
// Cookie Helpers
// ──────────────────────────────────────────────

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS_BASE = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'lax' as const,
  path: '/',
};

export function setSessionCookie(token: string): void {
  const store = cookies();
  store.set(COOKIE_SESSION, token, {
    ...COOKIE_OPTIONS_BASE,
    maxAge: SESSION_DURATION_SEC,
  });
}

export function clearSessionCookie(): void {
  const store = cookies();
  store.set(COOKIE_SESSION, '', {
    ...COOKIE_OPTIONS_BASE,
    maxAge: 0,
  });
}

export function setCsrfCookie(signedToken: string): void {
  const store = cookies();
  store.set(COOKIE_CSRF, signedToken, {
    ...COOKIE_OPTIONS_BASE,
    maxAge: 3600,
  });
}

export function clearCsrfCookie(): void {
  const store = cookies();
  store.set(COOKIE_CSRF, '', {
    ...COOKIE_OPTIONS_BASE,
    maxAge: 0,
  });
}

/**
 * Device cookie — non-httpOnly so the client can read its presence
 * to determine if this is a "remembered" device.
 */
export function setDeviceCookie(token: string): void {
  const store = cookies();
  store.set(COOKIE_DEVICE, token, {
    httpOnly: false, // client reads this
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
    maxAge: DEVICE_TOKEN_DURATION_SEC,
  });
}

export function clearDeviceCookie(): void {
  const store = cookies();
  store.set(COOKIE_DEVICE, '', {
    httpOnly: false,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// ──────────────────────────────────────────────
// Request Helpers
// ──────────────────────────────────────────────

export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

/**
 * Extract and verify the session from cookies.
 * Also checks inactivity timeout.
 */
export async function getAuthFromCookies(
  cookieStore: ReturnType<typeof cookies>
): Promise<JWTPayload | null> {
  try {
    const token = cookieStore.get(COOKIE_SESSION)?.value;
    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload || payload.type !== 'session') return null;

    // Check inactivity timeout
    const now = Math.floor(Date.now() / 1000);
    const inactiveSec = now - payload.lastActivity;
    if (inactiveSec > INACTIVITY_TIMEOUT_SEC) {
      return null; // session expired due to inactivity
    }

    // Update last activity time (sliding session)
    const updatedPayload: SessionPayload = {
      ...payload,
      lastActivity: now,
    };
    const newToken = signPayload(updatedPayload, SESSION_DURATION_SEC);
    cookieStore.set(COOKIE_SESSION, newToken, {
      ...COOKIE_OPTIONS_BASE,
      maxAge: SESSION_DURATION_SEC,
    });

    return { id: payload.id, username: payload.username };
  } catch {
    return null;
  }
}

/**
 * Convenience wrapper that reads cookies() for use in route handlers.
 */
export async function getAuthFromRequest(): Promise<JWTPayload | null> {
  return getAuthFromCookies(cookies());
}

// ──────────────────────────────────────────────
// Device Trust
// ──────────────────────────────────────────────

/**
 * Check if the request comes from a trusted (remembered) device.
 */
export function getTrustedDevice(): { deviceId: string; username: string } | null {
  try {
    const store = cookies();
    const token = store.get(COOKIE_DEVICE)?.value;
    if (!token) return null;

    const payload = verifyDeviceToken(token);
    if (!payload || payload.type !== 'device') return null;

    return { deviceId: payload.deviceId, username: payload.username };
  } catch {
    return null;
  }
}

/**
 * Generate a random device ID for new device trust registration.
 */
export function generateDeviceId(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ──────────────────────────────────────────────
// Authentication
// ──────────────────────────────────────────────

export async function authenticateUser(
  username: string,
  password: string
): Promise<{ user: JWTPayload; sessionToken: string } | null> {
  const admin = await getAdminUser();

  if (!admin) return null;

  // Constant-time username comparison to prevent timing attacks
  const usernameMatch = safeCompare(username, admin.username);

  if (!usernameMatch) {
    // Still hash to prevent timing difference
    await bcrypt.compare(password, admin.passwordHash);
    return null;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;

  const payload: JWTPayload = { id: admin.id, username: admin.username };
  const sessionToken = createSessionToken(payload);

  return { user: payload, sessionToken };
}

/**
 * Constant-time string comparison for username validation.
 */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────
// Route Helpers
// ──────────────────────────────────────────────

export function requireAuth(
  handler: (req: Request, ...args: any[]) => Promise<Response>
) {
  return async (req: Request, ...args: any[]): Promise<Response> => {
    const auth = await getAuthFromRequest();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const headers = new Headers(req.headers);
    headers.set('x-user-id', auth.id);
    headers.set('x-username', auth.username);
    const modifiedReq = new Request(req.url, {
      method: req.method,
      headers,
      body: req.body,
    });
    return handler(modifiedReq, ...args);
  };
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function notFoundResponse(message = 'Not found'): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function badRequestResponse(message = 'Bad request'): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function successResponse(data: any, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

// ──────────────────────────────────────────────
// Session Activity Ping
// (called by the dashboard to keep session alive)
// ──────────────────────────────────────────────

export async function refreshSessionActivity(): Promise<boolean> {
  try {
    const store = cookies();
    const token = store.get(COOKIE_SESSION)?.value;
    if (!token) return false;

    const payload = verifySessionToken(token);
    if (!payload) return false;

    const updated: SessionPayload = {
      ...payload,
      lastActivity: Math.floor(Date.now() / 1000),
    };
    const newToken = signPayload(updated, SESSION_DURATION_SEC);
    store.set(COOKIE_SESSION, newToken, {
      ...COOKIE_OPTIONS_BASE,
      maxAge: SESSION_DURATION_SEC,
    });

    return true;
  } catch {
    return false;
  }
}
