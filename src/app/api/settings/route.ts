import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/data';
import { getAuthFromRequest, errorResponse } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (err) {
    console.error('GET /api/settings error:', err);
    return errorResponse('Failed to fetch settings');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updateSettings(body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/settings error:', err);
    return errorResponse('Failed to update settings');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
