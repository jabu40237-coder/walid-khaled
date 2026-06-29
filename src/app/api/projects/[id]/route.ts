import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject, deleteProject } from '@/lib/data';
import { getAuthFromRequest, notFoundResponse, errorResponse, successResponse } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await getProject(params.id);
    if (!project) return notFoundResponse('Project not found');
    return NextResponse.json(project);
  } catch (err) {
    console.error('GET /api/projects/[id] error:', err);
    return errorResponse('Failed to fetch project');
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

    const project = await getProject(params.id);
    if (!project) return notFoundResponse('Project not found');

    const body = await req.json();
    const updated = await updateProject(params.id, body);

    if (!updated) return notFoundResponse('Project not found');
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/projects/[id] error:', err);
    return errorResponse('Failed to update project');
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

    const deleted = await deleteProject(params.id);
    if (!deleted) return notFoundResponse('Project not found');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/projects/[id] error:', err);
    return errorResponse('Failed to delete project');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
