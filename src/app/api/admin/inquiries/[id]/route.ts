/**
 * Admin Inquiry API - Individual CRUD Operations
 *
 * GET    /api/admin/inquiries/[id]     - Get a specific inquiry
 * PUT    /api/admin/inquiries/[id]     - Update an inquiry
 * DELETE /api/admin/inquiries/[id]     - Delete an inquiry (only closed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createInquiryService } from '@/lib/services';
import { validate, updateInquirySchema } from '@/lib/validation';

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: 'Forbidden', status: 403 };
  }

  return { user, supabase };
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if ('error' in auth) {
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
      { error: error instanceof Error ? error.message : 'Failed to fetch inquiry' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if ('error' in auth) {
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
    const message = error instanceof Error ? error.message : 'Failed to update inquiry';
    const status = message.includes('not found') ? 404 : message.includes('Cannot transition') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const inquiryService = createInquiryService(auth.supabase);
    await inquiryService.deleteInquiry(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete inquiry:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete inquiry';
    const status = message.includes('not found') ? 404 : message.includes('Only closed') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
