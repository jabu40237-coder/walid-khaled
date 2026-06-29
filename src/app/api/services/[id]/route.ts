import { NextRequest, NextResponse } from 'next/server';
import { getService, updateService, deleteService } from '@/lib/data';
import { getAuthFromRequest, notFoundResponse, errorResponse } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await getService(params.id);
    if (!service) return notFoundResponse('Service not found');
    return NextResponse.json(service);
  } catch (err) {
    console.error('GET /api/services/[id] error:', err);
    return errorResponse('Failed to fetch service');
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthFromRequest();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await getService(params.id);
    if (!existing) return notFoundResponse('Service not found');

    const body = await req.json();
    const updated = await updateService(params.id, body);

    if (!updated) return notFoundResponse('Service not found');
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/services/[id] error:', err);
    return errorResponse('Failed to update service');
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthFromRequest();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deleted = await deleteService(params.id);
    if (!deleted) return notFoundResponse('Service not found');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/services/[id] error:', err);
    return errorResponse('Failed to delete service');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
