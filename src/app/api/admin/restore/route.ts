import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';
import { exportAllData, _importAll } from '@/lib/data';
import { saveBackup } from '@/lib/backup-store';
import { BackupData } from '@/types';
import { gunzipSync } from 'zlib';
import crypto from 'crypto';

// ──────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────

function validateBackupData(data: BackupData): void {
  if (!data.manifest || !data.manifest.version || !data.manifest.checksum) {
    throw new Error('Invalid backup: missing manifest.');
  }

  if (
    !Array.isArray(data.projects) ||
    !Array.isArray(data.services) ||
    !Array.isArray(data.reviews) ||
    !Array.isArray(data.requests) ||
    !Array.isArray(data.faqs) ||
    !Array.isArray(data.mediaFiles)
  ) {
    throw new Error('Invalid backup: missing or corrupt data arrays.');
  }

  if (!data.settings || typeof data.settings !== 'object') {
    throw new Error('Invalid backup: missing settings.');
  }

  // Verify checksum
  const { checksum, ...manifestWithoutChecksum } = data.manifest;
  const payload = JSON.stringify({ ...data, manifest: manifestWithoutChecksum });
  const computed = crypto.createHash('sha256').update(payload).digest('hex');
  if (computed !== checksum) {
    throw new Error('Invalid backup: checksum mismatch. The backup file may be corrupted.');
  }
}

// Rate limiter for restores (max 3 per IP per hour)
const restoreAttempts = new Map<string, { count: number; firstAttempt: number }>();

function checkRestoreRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = restoreAttempts.get(ip);
  if (entry && now - entry.firstAttempt > 3600_000) {
    restoreAttempts.delete(ip);
    return true;
  }
  if (!entry) {
    restoreAttempts.set(ip, { count: 1, firstAttempt: now });
    return true;
  }
  entry.count++;
  if (entry.count > 5) return false;
  return true;
}

/**
 * POST /api/admin/restore
 *
 * Restore website data from a backup file.
 * Creates an automatic safety backup before restoring.
 *
 * Accepts:
 * - Multipart file upload (FormData with 'file' field)
 * - JSON body with { filename: string } for server-side backups
 */
export async function POST(req: NextRequest) {
  const auth = await getAuthFromRequest();
  if (!auth) return unauthorizedResponse();

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  // Rate limit
  if (!checkRestoreRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many restore attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    let backupData: BackupData;

    // Check content type — file upload or JSON
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // ── File upload restore ──────────────────
      const formData = await req.formData();
      const file = formData.get('file');

      if (!file || !(file instanceof File)) {
        return NextResponse.json(
          { error: 'No backup file provided.' },
          { status: 400 }
        );
      }

      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Backup file too large. Maximum size is 100 MB.' },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Try to decompress
      let json: string;
      try {
        json = gunzipSync(buffer).toString('utf-8');
      } catch {
        // Try as plain JSON
        try {
          json = buffer.toString('utf-8');
        } catch {
          return NextResponse.json(
            { error: 'Invalid backup file. The file is not a valid backup.' },
            { status: 400 }
          );
        }
      }

      try {
        backupData = JSON.parse(json) as BackupData;
      } catch {
        return NextResponse.json(
          { error: 'Invalid backup file. Could not parse JSON.' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          error:
            'Please upload a backup file (.json.gz). Use multipart/form-data with a file field.',
        },
        { status: 400 }
      );
    }

    // ── Create safety backup before restoring ──
    let safetyBackup: string | null = null;
    try {
      const currentData = await exportAllData();
      safetyBackup = await saveBackup(currentData, 'pre-restore');
    } catch (err) {
      console.error('[admin/restore] Safety backup failed:', err);
      return NextResponse.json(
        { error: 'Failed to create safety backup. Restore aborted.' },
        { status: 500 }
      );
    }

    // ── Validate backup structure ─────────────
    validateBackupData(backupData);

    // ── Import the backup data ────────────────
    try {
      _importAll(backupData);
    } catch (err: any) {
      console.error('[admin/restore] Import failed:', err);
      return NextResponse.json(
        {
          error: `Restore failed: ${err.message || 'Unknown error'}. Your data was not modified.`,
          safetyBackup,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Backup restored successfully.',
      manifest: backupData.manifest,
      safetyBackup,
    });
  } catch (err) {
    console.error('[admin/restore] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error during restore.' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
