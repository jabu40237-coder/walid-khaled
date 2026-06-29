import { NextRequest, NextResponse } from 'next/server';
import { getServices, createService } from '@/lib/data';
import { getAuthFromRequest, badRequestResponse, errorResponse } from '@/lib/auth';
export async function GET() {
  try {
    const services = await getServices();
    return NextResponse.json(services);
  } catch (err) {
    console.error('GET /api/services error:', err);
    return errorResponse('Failed to fetch services');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.title || !body.title.ar || !body.title.en) {
      return badRequestResponse('Title (ar, en) is required');
    }

    const service = await createService({
      title: body.title || { ar: '', kurd: '', en: '' },
      description: body.description || { ar: '', kurd: '', en: '' },
      longDescription: body.longDescription || { ar: '', kurd: '', en: '' },
      icon: body.icon || 'Sparkles',
      image: body.image || '',
      order: body.order || 0,
      features: body.features || [],
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    console.error('POST /api/services error:', err);
    return errorResponse('Failed to create service');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
