import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/data';
import { getAuthFromRequest, successResponse, errorResponse, badRequestResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const governorate = searchParams.get('governorate') || undefined;
    const search = searchParams.get('search') || undefined;
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const result = await getProjects({
      category,
      governorate,
      search,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('GET /api/projects error:', err);
    return errorResponse('Failed to fetch projects');
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.title || !body.title.ar || !body.title.en) {
      return badRequestResponse('Title (ar, en) is required');
    }
    if (!body.category) {
      return badRequestResponse('Category is required');
    }

    const project = await createProject({
      title: body.title || { ar: '', kurd: '', en: '' },
      description: body.description || { ar: '', kurd: '', en: '' },
      shortDescription: body.shortDescription || { ar: '', kurd: '', en: '' },
      governorate: body.governorate || '',
      city: body.city || '',
      category: body.category,
      completionYear: body.completionYear || new Date().getFullYear(),
      coverImage: body.coverImage || '',
      images: body.images || [],
      videos: body.videos || [],
      beforeImages: body.beforeImages || [],
      afterImages: body.afterImages || [],
      materials: body.materials || [],
      highlights: body.highlights || [],
      challenges: body.challenges || { ar: '', kurd: '', en: '' },
      designProcess: body.designProcess || { ar: '', kurd: '', en: '' },
      executionProcess: body.executionProcess || { ar: '', kurd: '', en: '' },
      clientTestimonial: body.clientTestimonial || undefined,
      featured: body.featured || false,
      order: body.order || 0,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error('POST /api/projects error:', err);
    return errorResponse('Failed to create project');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
