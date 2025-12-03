/**
 * Admin Inquiry API - Individual CRUD Operations
 *
 * GET    /api/admin/inquiries/[id]     - Get a specific inquiry
 * PUT    /api/admin/inquiries/[id]     - Update an inquiry
 * DELETE /api/admin/inquiries/[id]     - Delete an inquiry (only closed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createInquiryService } from '@/lib/services';
import { validate, updateInquirySchema } from '@/lib/validation';
import { verifyAdmin, isAdminAuthError } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const inquiryService = createInquiryService(auth.supabase);
    const inquiry = await inquiryService.getInquiry(id);

    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ data: inquiry });
  } catch (error) {
    console.error('Failed to fetch inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiry' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    // Validate request body
    const validation = validate(updateInquirySchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const inquiryService = createInquiryService(auth.supabase);
    const inquiry = await inquiryService.updateInquiry(id, validation.data!);

    return NextResponse.json({ data: inquiry });
  } catch (error) {
    console.error('Failed to update inquiry:', error);
    const message = error instanceof Error ? error.message : '';
    // Only expose expected business logic messages, not internal errors
    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    if (message.includes('Cannot transition')) {
      return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const inquiryService = createInquiryService(auth.supabase);
    await inquiryService.deleteInquiry(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete inquiry:', error);
    const message = error instanceof Error ? error.message : '';
    // Only expose expected business logic messages, not internal errors
    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }
    if (message.includes('Only closed')) {
      return NextResponse.json({ error: 'Only closed inquiries can be deleted' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
