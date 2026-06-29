// Admin credential persistence layer
//
// Credentials are stored in a JSON file that survives restarts.
// Priority: Environment variables > File > none (setup required)
//
// In production (serverless/Vercel), use environment variables:
//   ADMIN_USERNAME=your-username
//   ADMIN_PASSWORD_HASH=$(node -e "const bcrypt=require('bcryptjs');bcrypt.hash('your-password',12).then(h=>console.log(h))")
//
// This module uses Node.js APIs (fs, path) and is ONLY imported
// by API routes — never by middleware or public pages.

import { promises as fs } from 'fs';
import path from 'path';
import { AdminUser } from '@/types';

const ADMIN_FILE = path.join(process.cwd(), 'data', 'admin.json');

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function getEnvAdmin(): { username: string; passwordHash: string } | null {
  const username = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (username && passwordHash) {
    // Validate that it looks like a real bcrypt hash
    if (!passwordHash.startsWith('$2')) {
      console.error(
        '[admin-store] ADMIN_PASSWORD_HASH does not look like a valid bcrypt hash. ' +
        'Generate one with: node -e "const bcrypt=require(\'bcryptjs\');bcrypt.hash(\'your-password\',12).then(h=>console.log(h))"'
      );
      return null;
    }
    return { username, passwordHash };
  }
  return null;
}

async function getFileAdmin(): Promise<{ username: string; passwordHash: string } | null> {
  try {
    const raw = await fs.readFile(ADMIN_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (data.username && data.passwordHash) {
      return { username: data.username, passwordHash: data.passwordHash };
    }
  } catch {
    // File doesn't exist or is invalid — admin not configured
  }
  return null;
}

async function saveFileAdmin(username: string, passwordHash: string): Promise<void> {
  const dir = path.dirname(ADMIN_FILE);
  await fs.mkdir(dir, { recursive: true });

  // Verify the file doesn't already exist (belt-and-suspenders)
  try {
    const existing = await fs.readFile(ADMIN_FILE, 'utf-8');
    const data = JSON.parse(existing);
    if (data.username && data.passwordHash) {
      throw new Error('Administrator account already exists on disk.');
    }
  } catch (err: any) {
    if (err?.message === 'Administrator account already exists on disk.') {
      throw err;
    }
    // File doesn't exist — proceed
  }

  await fs.writeFile(
    ADMIN_FILE,
    JSON.stringify({ username, passwordHash }, null, 2),
    { mode: 0o600, flag: 'wx' } // wx = exclusive write, fails if file exists
  );
}

// ──────────────────────────────────────────────
// In-memory cache
// ──────────────────────────────────────────────

let adminUser: AdminUser | null = null;

async function loadAdminUser(): Promise<AdminUser | null> {
  // If already loaded in memory, return cached
  if (adminUser) return adminUser;

  // 1. Try environment variables first (production)
  const envAdmin = getEnvAdmin();
  if (envAdmin) {
    adminUser = {
      id: 'admin_1',
      username: envAdmin.username,
      passwordHash: envAdmin.passwordHash,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    };
    return adminUser;
  }

  // 2. Try file-based storage (development / persistent deployment)
  const fileAdmin = await getFileAdmin();
  if (fileAdmin) {
    adminUser = {
      id: 'admin_1',
      username: fileAdmin.username,
      passwordHash: fileAdmin.passwordHash,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    };
    return adminUser;
  }

  // 3. No admin configured — first-run setup required
  return null;
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

/**
 * Check whether the administrator account has been configured.
 * Returns false when no credentials exist at all (first-run state).
 */
export async function isAdminConfigured(): Promise<boolean> {
  const admin = await loadAdminUser();
  return admin !== null;
}

/**
 * Get the configured administrator user.
 * Returns null if no admin has been configured yet.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  return loadAdminUser();
}

/**
 * Initialize the administrator account on first run.
 * Password must be pre-hashed with bcrypt.
 * Only works when no admin exists yet.
 */
export async function initializeAdmin(
  username: string,
  passwordHash: string
): Promise<AdminUser> {
  const existing = await loadAdminUser();
  if (existing) {
    throw new Error('Administrator account already exists.');
  }

  // Persist to file
  await saveFileAdmin(username, passwordHash);

  // Set in memory
  adminUser = {
    id: 'admin_1',
    username,
    passwordHash,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
  };

  return adminUser;
}

export async function updateAdminLogin(): Promise<void> {
  if (adminUser) {
    adminUser.lastLogin = new Date().toISOString();
  }
}
