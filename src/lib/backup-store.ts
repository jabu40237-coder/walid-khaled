// Backup file storage module
// Handles saving, listing, reading, and deleting backup files.
// Uses Node.js APIs — only imported by API routes.

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { BackupData, BackupListItem } from '@/types';

const BACKUPS_DIR = path.join(process.cwd(), 'data', 'backups');

function sanitizeFilename(input: string): string {
  return input.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 128);
}

/**
 * Save a backup to disk as gzipped JSON, with checksum.
 * Returns the filename (without path).
 */
export async function saveBackup(
  data: BackupData,
  label?: string
): Promise<string> {
  await fs.mkdir(BACKUPS_DIR, { recursive: true });

  // Compute checksum
  const { checksum: _, ...manifestWithoutChecksum } = data.manifest;
  const payload = JSON.stringify({ ...data, manifest: manifestWithoutChecksum });
  data.manifest.checksum = crypto.createHash('sha256').update(payload).digest('hex');

  const ts = data.manifest.createdAt.replace(/[:.]/g, '-');
  const tag = label ? sanitizeFilename(label) : 'manual';
  const filename = `backup-${ts}-${tag}.json.gz`;
  const filepath = path.join(BACKUPS_DIR, filename);

  // Compress with gzip
  const { gzipSync } = await import('zlib');
  const json = JSON.stringify(data, null, 2);
  const compressed = gzipSync(json);

  await fs.writeFile(filepath, compressed, { mode: 0o600 });

  return filename;
}

/**
 * Read and decompress a backup file.
 */
export async function readBackup(filename: string): Promise<BackupData> {
  const safeName = sanitizeFilename(filename);
  const filepath = path.join(BACKUPS_DIR, safeName);

  const compressed = await fs.readFile(filepath);
  const { gunzipSync } = await import('zlib');
  const json = gunzipSync(compressed).toString('utf-8');
  return JSON.parse(json) as BackupData;
}

/**
 * List all available backups with metadata.
 * Sorted newest first.
 */
export async function listBackups(): Promise<BackupListItem[]> {
  try {
    await fs.mkdir(BACKUPS_DIR, { recursive: true });
    const files = await fs.readdir(BACKUPS_DIR);

    const backups: BackupListItem[] = [];

    for (const file of files) {
      if (!file.startsWith('backup-') || !file.endsWith('.json.gz')) continue;

      try {
        const filepath = path.join(BACKUPS_DIR, file);
        const stat = await fs.stat(filepath);
        const compressed = await fs.readFile(filepath);
        const { gunzipSync } = await import('zlib');
        const json = gunzipSync(compressed).toString('utf-8');
        const data = JSON.parse(json) as BackupData;

        backups.push({
          id: file.replace('.json.gz', ''),
          filename: file,
          manifest: data.manifest,
          sizeBytes: stat.size,
        });
      } catch {
        // Skip corrupted backup files
        console.warn(`[backup-store] Skipping corrupted backup: ${file}`);
      }
    }

    return backups.sort(
      (a, b) =>
        new Date(b.manifest.createdAt).getTime() -
        new Date(a.manifest.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Delete a backup file.
 */
export async function deleteBackup(filename: string): Promise<boolean> {
  try {
    const safeName = sanitizeFilename(filename);
    const filepath = path.join(BACKUPS_DIR, safeName);
    await fs.unlink(filepath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the raw compressed buffer of a backup for download.
 */
export async function getBackupBuffer(filename: string): Promise<Buffer | null> {
  try {
    const safeName = sanitizeFilename(filename);
    const filepath = path.join(BACKUPS_DIR, safeName);
    return await fs.readFile(filepath);
  } catch {
    return null;
  }
}
