/**
 * Admin Inquiry Status API
 *
 * PUT /api/admin/inquiries/[id]/status - Update inquiry status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createInquiryService } from '@/lib/services';
import { inquiryStatusSchema } from '@/lib/validation';
import { verifyAdmin, isAdminAuthError } from '@/lib/auth';
import type { InquiryStatus } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    // Validate status
    const result = inquiryStatusSchema.safeParse(body.status);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid status', details: result.error.errors },
        { status: 400 }
      );
    }

    const inquiryService = createInquiryService(auth.supabase);
    const inquiry = await inquiryService.updateStatus(id, result.data as InquiryStatus);

    return NextResponse.json({ data: inquiry });
  } catch (error) {
    console.error('Failed to update inquiry status:', error);
    const message = error instanceof Error ? error.message : '';
    // Only expose expected business logic messages, not internal errors
    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    if (message.includes('Cannot transition')) {
      return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update inquiry status' }, { status: 500 });
  }
}
