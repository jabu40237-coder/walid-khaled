import { NextRequest, NextResponse } from 'next/server';
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '@/lib/data';
import { getAuthFromRequest, badRequestResponse, errorResponse, notFoundResponse } from '@/lib/auth';

export async function GET() {
  try {
    const faqs = await getFAQs();
    return NextResponse.json(faqs);
  } catch (err) {
    console.error('GET /api/faqs error:', err);
    return errorResponse('Failed to fetch FAQs');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (!body.question || !body.question.ar || !body.question.en) {
      return badRequestResponse('Question (ar, en) is required');
    }

    if (!body.answer || !body.answer.ar || !body.answer.en) {
      return badRequestResponse('Answer (ar, en) is required');
    }

    const faq = await createFAQ({
      question: body.question,
      answer: body.answer,
      order: body.order || 0,
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (err) {
    console.error('POST /api/faqs error:', err);
    return errorResponse('Failed to create FAQ');
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

    if (!id) return badRequestResponse('id parameter is required');

    const body = await req.json();
    const updated = await updateFAQ(id, body);

    if (!updated) return notFoundResponse('FAQ not found');
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/faqs error:', err);
    return errorResponse('Failed to update FAQ');
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

    const deleted = await deleteFAQ(id);
    if (!deleted) return notFoundResponse('FAQ not found');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/faqs error:', err);
    return errorResponse('Failed to delete FAQ');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
