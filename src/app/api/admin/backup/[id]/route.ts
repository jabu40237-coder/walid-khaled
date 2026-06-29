import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse, notFoundResponse } from '@/lib/auth';
import { getBackupBuffer, readBackup, deleteBackup } from '@/lib/backup-store';

/**
 * GET /api/admin/backup/[id]
 *
 * Download a specific backup as a .json.gz file.
 * The id is the filename without the .json.gz extension.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthFromRequest();
  if (!auth) return unauthorizedResponse();

  try {
    const filename = `${params.id}.json.gz`;
    const buffer = await getBackupBuffer(filename);

    if (!buffer) {
      return notFoundResponse('Backup not found.');
    }

    // Get the original data for the filename timestamp
    const data = await readBackup(filename);
    const ts = data.manifest.createdAt.replace(/[:.]/g, '-');
    const downloadName = `walid-khaled-backup-${ts}.json.gz`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[admin/backup/download] Error:', err);
    return NextResponse.json(
      { error: 'Failed to download backup.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/backup/[id]
 *
 * Delete a specific backup.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthFromRequest();
  if (!auth) return unauthorizedResponse();

  try {
    const filename = `${params.id}.json.gz`;
    const deleted = await deleteBackup(filename);

    if (!deleted) {
      return notFoundResponse('Backup not found.');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/backup/delete] Error:', err);
    return NextResponse.json(
      { error: 'Failed to delete backup.' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
