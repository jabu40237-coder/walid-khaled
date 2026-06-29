import { NextRequest, NextResponse } from 'next/server';
import { getReviews, createReview, approveReview, deleteReview } from '@/lib/data';
import { getAuthFromRequest, badRequestResponse, errorResponse, notFoundResponse } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const reviews = await getReviews(!all);
    return NextResponse.json(reviews);
  } catch (err) {
    console.error('GET /api/reviews error:', err);
    return errorResponse('Failed to fetch reviews');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.customerName || !body.text || !body.rating) {
      return badRequestResponse('customerName, text, and rating are required');
    }

    if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      return badRequestResponse('Rating must be a number between 1 and 5');
    }

    const review = await createReview({
      customerName: body.customerName,
      customerRole: body.customerRole || '',
      customerPhoto: body.customerPhoto || '',
      projectPhoto: body.projectPhoto || '',
      rating: body.rating,
      text: body.text || { ar: '', kurd: '', en: '' },
      verified: body.verified || false,
      projectId: body.projectId || undefined,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error('POST /api/reviews error:', err);
    return errorResponse('Failed to create review');
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

    if (action === 'approve') {
      const updated = await approveReview(id);
      if (!updated) return notFoundResponse('Review not found');
      return NextResponse.json(updated);
    }

    if (action === 'reject') {
      const deleted = await deleteReview(id);
      if (!deleted) return notFoundResponse('Review not found');
      return NextResponse.json({ success: true });
    }

    return badRequestResponse('Invalid action');
  } catch (err) {
    console.error('PATCH /api/reviews error:', err);
    return errorResponse('Failed to update review');
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

    const deleted = await deleteReview(id);
    if (!deleted) return notFoundResponse('Review not found');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/reviews error:', err);
    return errorResponse('Failed to delete review');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
