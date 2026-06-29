import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';
import { exportAllData } from '@/lib/data';
import { listBackups, saveBackup } from '@/lib/backup-store';

/**
 * GET /api/admin/backup
 *
 * List all available backups with metadata.
 */
export async function GET(req: NextRequest) {
  const auth = await getAuthFromRequest();
  if (!auth) return unauthorizedResponse();

  try {
    const backups = await listBackups();
    return NextResponse.json({ backups });
  } catch (err) {
    console.error('[admin/backup] List error:', err);
    return NextResponse.json(
      { error: 'Failed to list backups.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/backup
 *
 * Create a new backup of all website data.
 * Body (optional): { label: string } — custom label for the backup.
 */
export async function POST(req: NextRequest) {
  const auth = await getAuthFromRequest();
  if (!auth) return unauthorizedResponse();

  try {
    let label: string | undefined;
    try {
      const body = await req.json().catch(() => ({}));
      label = body.label;
    } catch {
      // no body
    }

    const data = await exportAllData();
    const filename = await saveBackup(data, label);

    return NextResponse.json(
      {
        success: true,
        filename,
        manifest: data.manifest,
        message: 'Backup created successfully.',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[admin/backup] Create error:', err);
    return NextResponse.json(
      { error: 'Failed to create backup.' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
