import { NextRequest, NextResponse } from 'next/server';
import { getRequests, createRequest, markRequestRead, deleteRequest } from '@/lib/data';
import { getAuthFromRequest, badRequestResponse, errorResponse, notFoundResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await getRequests();
    return NextResponse.json(requests);
  } catch (err) {
    console.error('GET /api/requests error:', err);
    return errorResponse('Failed to fetch requests');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.fullName || !body.phone || !body.governorate || !body.projectType) {
      return badRequestResponse('fullName, phone, governorate, and projectType are required');
    }

    const request = await createRequest({
      fullName: body.fullName,
      phone: body.phone,
      email: body.email || '',
      governorate: body.governorate,
      city: body.city || '',
      projectType: body.projectType,
      estimatedArea: body.estimatedArea || '',
      description: body.description || '',
      images: body.images || [],
      videos: body.videos || [],
      preferredContactMethod: body.preferredContactMethod || 'whatsapp',
      preferredContactTime: body.preferredContactTime || '',
    });

    return NextResponse.json(request, { status: 201 });
  } catch (err) {
    console.error('POST /api/requests error:', err);
    return errorResponse('Failed to create request');
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id) return badRequestResponse('id parameter is required');

    if (action === 'read') {
      await markRequestRead(id);
      return NextResponse.json({ success: true });
    }

    return badRequestResponse('Invalid action');
  } catch (err) {
    console.error('PATCH /api/requests error:', err);
    return errorResponse('Failed to update request');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return badRequestResponse('id parameter is required');

    const deleted = await deleteRequest(id);
    if (!deleted) return notFoundResponse('Request not found');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/requests error:', err);
    return errorResponse('Failed to delete request');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
